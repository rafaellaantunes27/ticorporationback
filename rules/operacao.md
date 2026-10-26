# Operação e publicação

- `main` está conectada à Vercel: push é release de produção.
- Agente principal só publica sob instrução humana explícita, após checks e revisão do diff.
- Subagente verificador não faz commit, push, deploy, correção ou alteração de dados.
- API atual é stateless; adotar banco/migration ou autenticação é uma decisão separada, fora do escopo da Aula 11.
