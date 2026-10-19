# ADR-001 — CLI Python original com API stateless

**Status:** aceito para MVP, 2026-10-19.

## Contexto
O ZIP inicial exige Python, pandas, comando `dq` e o CSV de vendas. O pedido também requer front e back separados com deploy na Vercel.

## Decisão
Manter o pacote Python instalável em `src/dq`, execução via `dq data/vendas.csv`, e expor o mesmo domínio pelo FastAPI sem banco e sem salvar uploads. A interface estática acessa a API pelo navegador.

## Alternativa considerada
Uma aplicação full stack Node com banco seria simples de hospedar, mas descaracterizaria o projeto e reescreveria o algoritmo em outra linguagem. Outro caminho seria Streamlit único, porém impediria os repositórios front e back separados.

## Consequências
Duas interfaces para um mesmo validador, testes puros e sem dados persistidos. Python/pandas têm build mais pesado na Vercel; configurações de CORS e rede exigem atenção. Análises recebem somente arquivos CSV pequenos. Sem autenticação: **não enviar dados sensíveis reais a um serviço público**.
