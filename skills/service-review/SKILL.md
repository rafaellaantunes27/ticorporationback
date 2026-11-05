---
name: service-review
description: Review a NestJS service for behavior, boundaries, persistence use, and error handling when reviewing backend service code.
---

# Revisão de service NestJS

Use esta skill para revisar um service NestJS e suas interações diretas com controllers, módulos e persistência. Ela produz achados priorizados com arquivo, linha, impacto e condição para reproduzir; se não houver achados, informe o escopo analisado e as limitações.

## Revisão

- Leia `backend/AGENTS.md`, `backend/rules/backend.md` e, conforme o escopo, os ADRs e regras citados por eles.
- Siga o fluxo pedido pelo usuário: revisão estática não deve alterar arquivos.
- Verifique se o service respeita os limites do módulo, valida entradas conforme o contrato e trata erros sem ocultar falhas da fonte real.
- Se acessar Prisma, compare o uso com `backend/prisma/schema.prisma` e considere efeitos de constraints e relações. Mudanças em persistência seguem `docs/rules/migrations.md`.
- Não assuma autorização com base em papel ou estado fornecido pelo cliente. Aponte ausência de evidência de controle no servidor como achado quando relevante.
- Diferencie defeitos comprovados de riscos condicionais; não invente requisitos ausentes do PRD.

## Conclusão

Apresente primeiro problemas concretos com evidência precisa. Depois informe áreas verificadas e limitações. Não declare que testes passaram sem executá-los; use as validações autorizadas para o escopo.
