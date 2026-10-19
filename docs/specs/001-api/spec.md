# Spec-001 — Contrato da API

- CA-API-01: GET `/api/health` responde 200 com modo de ambiente, sem expor credenciais.
- CA-API-02: sem credenciais completas, GET `/api/state` devolve demo e todos os POST devolvem 503.
- CA-API-03: quando banco está configurado, GET `/api/state` e todas as escritas exigem `X-Admin-Key`.
- CA-API-04: cadastro de equipamento valida campos e código único no banco.
- CA-API-05: empréstimos observam unicidade de equipamento ativo, máximo de três por pessoa e datas válidas.
- CA-API-06: devolução registra data e evento; histórico permanece.
- CA-API-07: toda alteração estrutural via migration versionada e RLS com deny-by-default.

A validação real de CA-API-03 a 07 depende de um ambiente Supabase provisionado; não declarar esse passo concluído sem testes de integração.
