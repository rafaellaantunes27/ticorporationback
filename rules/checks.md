# Checks locais e seguros · backend

A API FastAPI é stateless e não usa banco. Confirme que nenhuma variável de banco aponta para produção antes de executar. Testes Python usam entradas inline e arquivo temporário isolado para validar a CLI; não modificam `data/vendas.csv`.

```bash
PYTHONDONTWRITEBYTECODE=1 pytest -q -p no:cacheprovider
python scripts/check_ca_evidence.py
PYTHONDONTWRITEBYTECODE=1 python -m dq.cli data/vendas.csv --json
```

Último comando imprime relatório somente leitura; falhas esperadas de qualidade no CSV não são falha do programa. Não execute rede, upload de CSV privados, migrations, reset ou deploy como parte da revisão.

A checagem de ID é **somente** um pré-requisito de evidência; não substitui o subagente independente.
