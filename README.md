# TI Corporation EquipHub · Backend

API Node.js (serverless Vercel) e schema PostgreSQL/Supabase. Sem ORM, sem dependências NPM de produção. HTTP JSON + função SQL transacional para check-out/devolução.

## Endpoints

| Método | Caminho | Sem banco | Com banco |
|---|---|---|---|
| GET | `/api/health` | Status `demo` | Status `database` |
| GET | `/api/state` | Dados fictícios | Dados persistidos, exige `X-Admin-Key` |
| POST | `/api/equipment` | 503 | Cadastro, exige `X-Admin-Key` |
| POST | `/api/people` | 503 | Cadastro, exige `X-Admin-Key` |
| POST | `/api/loans` | 503 | Empresta com limite de 3 e lock transacional |
| POST | `/api/loans/:id/return` | 503 | Devolução com trilha de auditoria |

## Instalar infraestrutura

1. Criar Supabase/PostgreSQL.
2. Aplicar `migrations/001_initial.sql` pelo SQL Editor do projeto. Não modifique tabelas manualmente depois; faça migration nova.
3. Configurar na Vercel do **backend** (nunca no frontend) `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`, `CORS_ORIGIN` (veja `.env.example`).
4. Redeploy e verificar `/api/health`: `database: connected`. **Nota:** esse status comprova configuração, não é teste de conexão SQL; valide `/api/state` com chave.
5. Testar fluxos e revisar autenticação corporativa antes de uso real.

A migration usa RLS sem políticas de acesso público. O backend exige uma chave administrativa aleatória para acessar dados e compara em tempo constante. CORS por origem permite restringir os navegadores permitidos; não é substituto de autenticação. `service_role` deve permanecer apenas em variáveis privadas da Vercel.

## Rodar testes

```bash
npm test
npm run check
```

Sem `SUPABASE_*`, `/api/health` e `GET /api/state` (amostra pública) funcionam em modo demo, e todas as escritas são bloqueadas.

## Limitações

Não há login por pessoa, SSO, rastreio de manutenção, importação de inventário, reservas, notificações nem integração com diretórios corporativos. A operação persistente é um MVP administrativo com chave compartilhada e requer avaliação de segurança e governança antes de lidar com dados pessoais de verdade.
