/** Entrypoint reconhecido pela Vercel para NestJS (sem alterar o bootstrap local). */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './main';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');
}
void bootstrap();
