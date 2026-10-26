# TI Corporation DQ — Backend Python

Baseado **diretamente** no ZIP `dq-projeto-alunos`: foram preservados `src/dq/`, `data/vendas.csv`, `pyproject.toml` e o objetivo do comando `dq data/vendas.csv` das aulas 2 e 3.

## Rodar localmente

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
dq data/vendas.csv
pytest -q
uvicorn api.index:app --reload --port 8000
```

## API

`GET /api/health` retorna status. `POST /api/analyze` recebe **bytes CSV UTF-8** no corpo, com `Content-Type: text/csv` e cabeçalho opcional `X-Filename`. Resposta JSON contém `problemas`, `resumo_por_tipo`, `linhas` e métricas. Limites: 2 MB e 10 mil linhas. Não há banco, usuários nem armazenamento dos dados enviados.

```bash
curl -X POST http://localhost:8000/api/analyze -H 'Content-Type: text/csv' --data-binary @data/vendas.csv
```

## Tipos de check

Campos ausentes, linhas/id duplicados, quantidade/preço com tipo ou valores inválidos, datas fora de ISO, categorias inconsistentes e preço atípico (apenas aviso, heurística). Cada problema informa linha **física** contando cabeçalho como linha 1. Nenhuma correção é automática.

## Deploy

`vercel.json` publica a API Python na Vercel. Integração Git → Vercel atualiza a produção quando a branch `main` é publicada. O dashboard frontend fica em `ticorporationfront`.

## Governança

`AGENTS.md`, `.cursor/rules/`, `docs/adr/`, `docs/specs/` e `docs/handoff.md.example` descrevem decisões, testes e estado do projeto.

## Aula 11 — subagente verificador independente

A verificação de aceite do SDD usa **`agents/verificador-spec.md`** nos dois repositórios. O verificador lê a spec, procura o teste de cada CA e devolve tabela + checks + veredito. **Ele não edita nem corrige código.** Em arquitetura REST são duas verificações e uma tabela consolidada; `OUTRO REPOSITÓRIO` não encerra a validação.

- `AGENTS.md` orienta o agente principal e mostra onde ficam os papéis.
- `rules/spec-flow.md` exige a delegação antes do `PRONTA`.
- `rules/restrictions.md` impede modificações, banco de produção, credenciais e publicação pelo verificador.
- `rules/tests.md` define CAs e rastreabilidade; `rules/checks.md` lista comandos seguros.
- `.claude/agents/`, `.cursor/agents/` e `.codex/agents/` são adaptadores gerados. Fonte única: `agents/verificador-spec.md`.

```bash
python scripts/sync_agent_adapters.py --check
```

Se sua ferramenta não oferecer subagentes, abra uma **sessão nova limpa** com `Aja conforme agents/verificador-spec.md`; forneça o caminho da spec e o escopo dos commits. **Não há delegação automática garantida apenas pela presença do arquivo**. A integração foi preparada; a aprovação final exige execução do verificador no harness e decisão humana.

**Contrato compartilhado:** `docs/specs/002-integracao-dq/spec.md` e `docs/verification/roteiro-aula11.md` orientam a verificação front + back.
