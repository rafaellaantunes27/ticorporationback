# Procedimento de migrations

**Gatilho:** qualquer mudança de tabela, função, índice, política ou permissão no banco.

1. Descrever DDL e impacto antes da alteração.
2. Criar arquivo SQL numerado em `migrations/`.
3. Revisar segurança, RLS, rollback e compatibilidade com a API.
4. Executar primeiro num banco de teste com autorização.
5. Só aplicar em produção após aprovação explícita do operador.
6. Nunca editar a estrutura via UI fora de migration nem incluir chaves em repositório.
