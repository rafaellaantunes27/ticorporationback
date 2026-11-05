# Regras do backend

## Quando aplicar

Ao alterar controllers, services, módulos, validação de entrada ou contratos HTTP em `backend/src/`.

## Orientações

- Preserve as responsabilidades REST/MVC registradas no ADR 001 e a separação de pacote do ADR 002.
- Mantenha regras de negócio no backend; não trate estado de interface como autorização.
- Antes de alterar persistência, leia o schema Prisma e siga `../../docs/rules/migrations.md`.
- Ao alterar configuração ou acesso a dados, siga `../../docs/rules/SECRETS.md`.
- Não introduza fallback fictício quando a fonte real falhar.
- Registre evidências e limitações no handoff conforme `../../docs/rules/spec-flow.md`.
