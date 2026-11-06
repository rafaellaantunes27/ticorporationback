# Backend EMPREST.AI

Backend NestJS/TypeScript com Prisma para Supabase/PostgreSQL e validação Zod. A documentação transversal está em `../README.md`, `../AGENTS.md`, `../docs/PRD.md`, `../docs/rules/` e `../docs/adr/`.

Para executar: `npm install`, preencha `.env` a partir de `.env.example`, gere o Prisma Client com `npm run prisma:generate` e inicie com `npm run start:dev`. Confira `GET /health`. Os tokens são validados pelo endpoint público de Supabase Auth (sem chave de serviço).
