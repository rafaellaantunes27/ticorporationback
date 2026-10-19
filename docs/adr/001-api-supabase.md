# ADR-001 — API serverless com persistência opcional no Supabase

**Status:** proposta implementada; precisa de validação para uso real.

## Contexto

Front e back separados na Vercel, sem credenciais de banco disponíveis no projeto. Precisa existir modo demonstrativo seguro e caminho de migração para banco auditável.

## Decisão

Node.js sem dependências de produção, API JSON em `api/index.js`, acesso ao Supabase REST somente pelo servidor, SQL versionado e RPC transacional para operações de empréstimo/devolução. Sem banco, leituras de demonstração e escritas bloqueadas.

## Alternativas

API FastAPI com SQLAlchemy/Postgres poderia oferecer validação tipada robusta, mas adiciona dependências e operação Python em serverless. Front acessando Supabase diretamente simplifica API, mas exige RLS e auth por usuário já resolvidos — não fornecidos neste pedido.

## Consequências

Sem segredos expostos no JS distribuído; transações críticas ficam no Postgres. Em troca, a autenticação inicial por chave compartilhada não escala para muitos operadores. É MVP administrativo, não solução final de identidade.
