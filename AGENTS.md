# TI Corporation DQ — guia do agente

Validador de CSV criado a partir de `dq-projeto-alunos`. Objetivo principal: `dq data/vendas.csv` diagnosticar qualidade de dados sem modificar entradas.

- Leia `README.md` e `docs/specs/001-validacao-csv/spec.md` antes de alterar comportamento.
- Domínio `src/dq/core.py` é independente da API; `api/index.py` apenas adapta HTTP.
- Não altere `data/vendas.csv`: é o fixture original do curso.
- CheckResult.ok=True indica **nenhum** problema; não inverta esse contrato.
- Não crie abstrações genéricas sem uso; testes unitários usam CSV inline, não o fixture real.
- Antes de editar regras do Cursor, leia `.cursor/rules/checks.mdc`.
- Respeite `docs/adr/README.md` e `docs/adr/001-validacao-estatica.md`.
- Teste com `pytest -q`, CLI com `python -m dq.cli data/vendas.csv` após `pip install -e .`.
- Leia `docs/handoff.md.example` ao retomar sessão. Atualize `docs/handoff.md` (ignorado pelo git) no fim.
- Nunca faça upload de dados privados reais para repositórios, logs ou issues.
