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

## Aula 11 — subagentes e governança

- Fonte de requisitos: `docs/specs/001-validacao-csv/spec.md`; rastreie cada critério de aceite pelo ID e sua marcação `[front]` ou `[back]`.
- Leia `rules/restrictions.md` antes de modificar ou executar qualquer coisa; leia `rules/tests.md` antes de escrever testes.
- Checks seguros em `rules/checks.md`; procedimento completo de ciclo SDD em `rules/spec-flow.md`; publicação em `rules/operacao.md`.
- Subagentes moram em `agents/<nome>.md`. O `description` diz quando delegar; o corpo tem instruções completas. **Nunca** presuma que o subagente herdou a conversa: informe explicitamente a spec e os commits/arquivos do escopo.
- Antes de declarar uma spec pronta, **delegue** ao `verificador-spec` (`agents/verificador-spec.md`), sem permitir edição. Quem corrige é o principal e a aprovação final é humana.
- Se o harness não suportar subagentes, abra sessão nova limpa com `Aja conforme agents/verificador-spec.md` e passe as entradas obrigatórias.
- Para a arquitetura REST separada, rode o verificador em front e back e consolide as duas tabelas; `OUTRO REPOSITÓRIO` não dispensa prova.
- Os arquivos em `.claude/agents`, `.cursor/agents` e `.codex/agents` são **derivados** de `agents/`. Atualize-os executando `python scripts/sync_agent_adapters.py`; nunca edite as cópias diretamente.
- Checagem local atual: `PYTHONDONTWRITEBYTECODE=1 pytest -q -p no:cacheprovider && python scripts/check_ca_evidence.py`. Verificação automática de IDs **não equivale** à revisão independente.
