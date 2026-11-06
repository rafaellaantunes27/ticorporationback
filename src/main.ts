import 'reflect-metadata';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  Body, CanActivate, Controller, ExecutionContext, Get, HttpException, HttpStatus,
  Injectable, Module, Param, Post, Req, UseGuards,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { borrowingEligibility, dueDateFrom, isOverdue } from './loan-policy';

/** A API verifica cada token com o Supabase Auth e nunca confia no papel enviado pelo navegador. */
type Identity = { id: string; email: string };
type AuthenticatedRequest = { headers: Record<string, string | undefined>; identity: Identity };

const config = {
  supabaseUrl: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  publicKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  databaseConfigured: Boolean(process.env.DATABASE_URL),
};

function ensureConfigured() {
  if (!config.supabaseUrl || !config.publicKey || !config.databaseConfigured) {
    throw new HttpException('Servidor sem configuração Supabase/PostgreSQL. Consulte backend/.env.example.', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

@Injectable()
class DatabaseService {
  private client: PrismaClient | undefined;

  get db(): PrismaClient {
    ensureConfigured();
    if (!this.client) this.client = new PrismaClient();
    return this.client;
  }
}

@Injectable()
class SupabaseTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    ensureConfigured();
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = req.headers.authorization || '';
    if (!/^Bearer [^\s]+$/i.test(authorization)) {
      throw new HttpException('Autenticação obrigatória.', HttpStatus.UNAUTHORIZED);
    }
    let response: Response;
    try {
      response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
        headers: { apikey: config.publicKey, Authorization: authorization },
        signal: AbortSignal.timeout(6000),
      });
    } catch {
      throw new HttpException('Não foi possível verificar a sessão.', HttpStatus.SERVICE_UNAVAILABLE);
    }
    if (!response.ok) {
      throw new HttpException('Sessão inválida ou expirada.', HttpStatus.UNAUTHORIZED);
    }
    const identity = await response.json() as { id?: string; email?: string };
    if (!identity.id || !identity.email) {
      throw new HttpException('Sessão sem usuário identificado.', HttpStatus.UNAUTHORIZED);
    }
    req.identity = { id: identity.id, email: identity.email.toLowerCase() };
    return true;
  }
}

function badRequest(message: string): never {
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
}

const createEquipmentSchema = z.object({
  name: z.string().trim().min(3).max(140),
  category: z.string().trim().min(2).max(80),
  asset: z.string().trim().min(2).max(60),
  status: z.enum(['AVAILABLE', 'MAINTENANCE']),
  observations: z.string().max(1000).optional().nullable(),
}).strict();
const newLoanSchema = z.object({ equipmentId: z.string().uuid() }).strict();

function loanStatus(loan: { returnedAt: Date | null; dueDate: Date }, now = new Date()) {
  if (loan.returnedAt) return 'returned';
  return isOverdue(loan, now) ? 'overdue' : 'borrowed';
}

@Controller()
class HealthController {
  constructor(private readonly database: DatabaseService) {}
  @Get('health')
  async health() {
    if (!config.databaseConfigured) {
      throw new HttpException({ status: 'error', database: 'not_configured' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    try {
      await this.database.db.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new HttpException({ status: 'error', database: 'unavailable' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

@Controller('api')
@UseGuards(SupabaseTokenGuard)
class ApiController {
  constructor(private readonly database: DatabaseService) {}

  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.database.db.user.findUnique({ where: { email: req.identity.email } });
    if (!user) throw new HttpException('Perfil não cadastrado em users.', 403);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private async requireOperations(req: AuthenticatedRequest) {
    const operator = await this.database.db.user.findUnique({ where: { email: req.identity.email } });
    if (!operator || operator.role !== 'OPERATIONS') throw new HttpException('Acesso restrito a Operações.', 403);
  }

  @Get('equipment')
  async equipment(@Req() req: AuthenticatedRequest) {
    const profile = await this.database.db.user.findUnique({ where: { email: req.identity.email } });
    const showLoanOwner = profile?.role === 'OPERATIONS';
    const rows = await this.database.db.equipment.findMany({
      include: { loans: { where: { returnedAt: null }, include: { user: true }, orderBy: { borrowedAt: 'desc' }, take: 1 } },
      orderBy: { name: 'asc' },
    });
    const now = new Date();
    return rows.map((item) => {
      const loan = item.loans[0];
      return {
        id: item.id, name: item.name, category: item.category, asset: item.assetTag,
        photoUrl: item.photoUrl, photoSourceUrl: item.photoSourceUrl,
        photoAuthor: item.photoAuthor, photoLicense: item.photoLicense,
        status: loan ? loanStatus(loan, now) : item.status.toLowerCase(),
        note: item.observations || '', owner: showLoanOwner ? loan?.user.name || null : null,
        dueDate: loan?.dueDate?.toISOString() || null,
      };
    });
  }

  @Get('loans/me')
  async myLoans(@Req() req: AuthenticatedRequest) {
    const user = await this.database.db.user.findUnique({ where: { email: req.identity.email } });
    if (!user) return []; // Não cria perfil silenciosamente; preserva decisão da spec 001.
    const loans = await this.database.db.loan.findMany({
      where: { userId: user.id, returnedAt: null }, include: { equipment: true }, orderBy: { borrowedAt: 'desc' },
    });
    return loans.map((loan) => ({
      id: loan.id, equipmentId: loan.equipmentId, name: loan.equipment.name,
      asset: loan.equipment.assetTag, borrowedAt: loan.borrowedAt.toISOString(),
      dueDate: loan.dueDate.toISOString(), status: loanStatus(loan),
    }));
  }

  @Get('loans/open')
  async openLoans(@Req() req: AuthenticatedRequest) {
    await this.requireOperations(req);
    const loans = await this.database.db.loan.findMany({
      where: { returnedAt: null }, include: { equipment: true, user: true }, orderBy: { borrowedAt: 'desc' },
    });
    return loans.map((loan) => ({
      id: loan.id, equipmentId: loan.equipmentId, userId: loan.userId,
      owner: loan.user.name, name: loan.equipment.name, asset: loan.equipment.assetTag,
      borrowedAt: loan.borrowedAt.toISOString(), dueDate: loan.dueDate.toISOString(),
      status: loanStatus(loan),
    }));
  }

  @Post('loans')
  async requestLoan(@Req() req: AuthenticatedRequest, @Body() body: { equipmentId?: unknown }) {
    const validated = newLoanSchema.safeParse(body);
    if (!validated.success) badRequest('Equipamento inválido.');
    const equipmentId = validated.data.equipmentId;
    try {
      return await this.database.db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { email: req.identity.email } });
        if (!user) throw new HttpException('Seu perfil ainda não está cadastrado em users. Contate Operações.', 403);
        const equipment = await tx.equipment.findUnique({ where: { id: equipmentId } });
        if (!equipment) throw new HttpException('Equipamento não encontrado.', 404);
        const loans = await tx.loan.findMany({ where: { userId: user.id, returnedAt: null }, select: { dueDate: true, returnedAt: true } });
        const eligibility = borrowingEligibility(loans, equipment.status, new Date());
        if (!eligibility.allowed) throw new HttpException(eligibility.reason, HttpStatus.CONFLICT);
        const reserved = await tx.equipment.updateMany({ where: { id: equipmentId, status: 'AVAILABLE' }, data: { status: 'BORROWED' } });
        if (reserved.count !== 1) throw new HttpException('Equipamento já foi reservado.', HttpStatus.CONFLICT);
        const now = new Date();
        const loan = await tx.loan.create({ data: { userId: user.id, equipmentId, borrowedAt: now, dueDate: dueDateFrom(now) } });
        return { id: loan.id, status: 'borrowed', dueDate: loan.dueDate.toISOString() };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if ((error as { code?: string }).code === 'P2034') throw new HttpException('Conflito de concorrência. Tente novamente.', 409);
      throw error;
    }
  }

  @Post('loans/:id/return')
  async returnLoan(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.requireOperations(req);
    if (!/^[a-f0-9-]{36}$/i.test(id)) badRequest('Empréstimo inválido.');
    return this.database.db.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } });
      if (!loan) throw new HttpException('Empréstimo não encontrado.', 404);
      if (loan.returnedAt) throw new HttpException('O item já foi devolvido.', 409);
      const updated = await tx.loan.updateMany({ where: { id, returnedAt: null }, data: { returnedAt: new Date(), status: 'RETURNED' } });
      if (updated.count !== 1) throw new HttpException('Devolução já registrada.', 409);
      await tx.equipment.update({ where: { id: loan.equipmentId }, data: { status: 'AVAILABLE' } });
      return { id, status: 'returned' };
    });
  }

  @Post('equipment')
  async registerEquipment(@Req() req: AuthenticatedRequest, @Body() body: { name?: unknown; category?: unknown; asset?: unknown; observations?: unknown; status?: unknown }) {
    await this.requireOperations(req);
    const parsed = createEquipmentSchema.safeParse(body);
    if (!parsed.success) badRequest('Dados inválidos. Verifique nome, categoria, patrimônio e situação.');
    const input = parsed.data;
    const equipment = await this.database.db.equipment.create({ data: {
      name: input.name, category: input.category, assetTag: input.asset, status: input.status,
      observations: input.observations?.trim() || null,
    } });
    return { id: equipment.id, name: equipment.name, status: equipment.status.toLowerCase() };
  }
}

@Module({ controllers: [HealthController, ApiController], providers: [DatabaseService, SupabaseTokenGuard] })
class AppModule {}

/** Habilita CORS nas duas formas de execução: CLI local e Vercel Functions. */
function configureCors(app: Awaited<ReturnType<typeof NestFactory.create>>): void {
  const origins = new Set((process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',').map((value) => value.trim()).filter(Boolean));
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origins.has(origin)) return callback(null, true);
      return callback(new Error('Origem não autorizada.'), false);
    },
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Authorization,Content-Type',
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureCors(app);
  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');
}

/**
 * Vercel importa a entrada como função (req, res). Inicializamos o Nest uma única vez,
 * sem abrir porta, e reutilizamos a instância Express entre chamadas da função.
 */
let serverPromise: Promise<(req: IncomingMessage, res: ServerResponse) => void> | undefined;
async function createServerHandler(): Promise<(req: IncomingMessage, res: ServerResponse) => void> {
  const app = await NestFactory.create(AppModule);
  configureCors(app);
  await app.init();
  return app.getHttpAdapter().getInstance() as (req: IncomingMessage, res: ServerResponse) => void;
}
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const server = await (serverPromise ??= createServerHandler());
  server(req, res);
}

if (require.main === module) void bootstrap();
export { AppModule, SupabaseTokenGuard, HealthController, ApiController };
