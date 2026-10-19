# Limites do agente

- Nunca publicar `SUPABASE_SERVICE_ROLE_KEY` ou `ADMIN_API_KEY` no repositório, cliente web ou logs.
- Nunca executar migrations remotamente sem autorização específica para o ambiente identificado.
- Nunca tratar deploy da API como prova de que o banco foi migrado.
- Não escrever ADR como se tivesse sido aprovado pelo dono do produto.
- Uma tarefa por vez; spec vence implementação e sucesso parcial não é sucesso.
