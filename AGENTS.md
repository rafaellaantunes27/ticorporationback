# TI Corporation EquipHub · Backend

API administrativa Node.js compatível com Vercel, com PostgreSQL/Supabase opcional e migrado via SQL. `docs/PRD.md` define proposta, não política aprovada do negócio.

## Estado atual

API demonstrativa (leitura) funciona sem banco; escritas são bloqueadas até configuração de `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`. Testes executam sem banco real. Migration versionada existe, mas não se assume que foi aplicada.

## Comandos verificados

- `npm test`
- `npm run check`

## Onde olhar

- `rules/restrictions.md`: leia antes de qualquer alteração.
- `rules/migration.md`: leia antes de mexer no schema.
- `docs/adr/README.md`: leia antes de mudança estrutural.
- `docs/specs/001-api/spec.md`: contrato de API.

## Precedência

A spec prevalece sobre implementação. ADR registra motivo e custo, não licença para executar migração sem aprovação. Em caso de lacuna, peça validação em vez de presumir.
