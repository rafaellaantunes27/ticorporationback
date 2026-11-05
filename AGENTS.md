# Orientações do backend

O backend deste repositório é o pacote NestJS em `backend/`. A stack e os limites arquiteturais permanecem definidos em [`../docs/adr/001-stack.md`](../docs/adr/001-stack.md) e [`../docs/adr/002-estrutura.md`](../docs/adr/002-estrutura.md). As regras transversais estão em [`../docs/rules/`](../docs/rules/).

## Regras locais

- Para mudanças em controllers, services, módulos ou contratos HTTP, consulte [`rules/backend.md`](rules/backend.md).
- Para mudanças no schema ou migrations Prisma, siga também [`../docs/rules/migrations.md`](../docs/rules/migrations.md).
- Para ambiente, banco ou credenciais, siga [`../docs/rules/SECRETS.md`](../docs/rules/SECRETS.md).

## Skills

- Use [`skills/service-review/SKILL.md`](skills/service-review/SKILL.md) ao revisar um service NestJS ou seu comportamento de domínio.

Skills e regras locais deste pacote tratam apenas do backend. Não configure MCP aqui sem uma integração backend concreta que o utilize.
