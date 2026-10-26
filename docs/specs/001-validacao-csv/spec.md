# Spec 001 — Validação de qualidade de dados em vendas CSV

## Objetivo e origem

Detectar anomalias por linha e coluna sem modificar o CSV fornecido. Origem: `dq-projeto-alunos` e `data/vendas.csv`; checks adicionais são propostas documentadas do MVP e não requisitos originais do ZIP do curso. A Aula 11 acrescentou CAs rastreáveis e verificação independente, sem alterar as regras de negócio.

## Critérios de aceite

- **CA-B01 [back]**: CSV válido com as nove colunas gera relatório com contagens e `.ok=True` quando não há problema.
- **CA-B02 [back]**: valor obrigatório ausente, vazio ou `N/A` é apontado por linha e coluna.
- **CA-B03 [back]**: linha duplicada e ID de venda duplicado são detectados independentemente.
- **CA-B04 [back]**: quantidade não inteira/positiva e preço fora do formato decimal positivo geram erro claro.
- **CA-B05 [back]**: datas fora de `YYYY-MM-DD` e categorias não padronizadas são marcadas.
- **CA-B06 [back]**: preço discrepante do mesmo produto é apenas aviso e não reduz métrica de erros.
- **CA-B07 [back]**: análise é somente leitura, não altera bytes recebidos nem grava arquivo.
- **CA-B08 [back]**: CSV vazio, colunas inválidas e arquivo acima de 2 MB são rejeitados claramente.
- **CA-B09 [back]**: CLI `dq <arquivo> --json` produz relatório JSON consumível por scripts.
- **CA-B10 [back]**: `/api/health` responde e `/api/analyze` retorna JSON 200 em arquivo válido ou 4xx em arquivo inválido.
- **CA-F01 [front]**: o login azul é a tela inicial (prova em `ticorporationfront`).
- **CA-F04 [front]**: o painel exibe diagnóstico do CSV (prova em `ticorporationfront`).

## Fora de escopo

Persistência em banco, escrita ou reparação automática do CSV, login real, cadastros de equipamentos e upload de dados privados reais.

## Protocolo de aceite

Todos os CAs precisam de teste citando o ID, checks locais aprovados e duas rodadas independentes do verificador (`front` + `back`) com relatório unificado antes de declarar a spec PRONTA. `OUTRO REPOSITÓRIO` não equivale a ATENDIDO no relatório consolidado.
