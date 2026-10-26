# Plano da spec 001

1. Preservar o scaffold do curso e o CSV original.
2. Implementar funções puras de checks por linha, com testes de comportamento.
3. Implementar CLI sobre os mesmos checks.
4. Adicionar adaptador FastAPI sem persistência e testar.
5. Adicionar interface front separada e testar integração com a API.
6. Publicar GitHub e Vercel; verificar `/api/health` e arquivo real do repositório.

## Etapas de validação da Aula 11

7. Associar identificadores estáveis `CA-Bxx` aos testes e `CA-Fxx` às provas do frontend.
8. Adicionar subagente `verificador-spec` nos dois repositórios e integrar o gatilho em `rules/spec-flow.md`.
9. Rodar verificações com ambiente sem banco de produção; unificar as tabelas back/front e exigir aprovação humana antes de publicar.
