# Spec 001 — Validação de qualidade de dados em vendas CSV

## Objetivo
Detectar e explicar anomalias por linha e coluna, sem modificar CSV fornecido.

## Origem
`dq-projeto-alunos`: `README.md`, `data/vendas.csv`, `pyproject.toml`. Os checks adicionais são propostas de MVP para o dataset, não regras fornecidas no ZIP.

## Comportamento
- Ao receber CSV válido com as 9 colunas, listar problema, linha física, coluna, valor e mensagem.
- Se valor obrigatório estiver vazio ou `N/A`, registrar `ausente`.
- Se linha for repetida, registrar `duplicata`; ID de venda duplicado registra `id_duplicado`.
- Se quantidade não for inteiro positivo, registrar tipo/valor inválido.
- Se preço não for número positivo em formato decimal com ponto, registrar tipo/valor inválido.
- Datas devem obedecer `YYYY-MM-DD`; categorias devem seguir vocabulário padronizado.
- Preço 3x acima/abaixo da mediana do mesmo produto gera **aviso**, nunca falha automática.
- Cada check tem `.ok=True` quando não existem problemas.
- CSV é recebido em memória; não há salvamento ou correção automática.
- CSV vazio, cabeçalho inválido, arquivo maior que 2 MB ou mais de 10 mil linhas retornam erro claro.

## Critérios
- `dq data/vendas.csv` imprime erros detectados.
- `dq arquivo.csv --json` imprime o mesmo relatório legível por máquina.
- `GET /api/health` responde 200.
- `POST /api/analyze` responde JSON 200 com problemas por linha/coluna ou 422 para CSV inválido.
- `pytest -q` passa sem ler `data/vendas.csv` nos testes unitários.
