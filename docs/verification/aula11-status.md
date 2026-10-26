# Aula 11 — evidência e pendências do backend

**O que foi configurado:** agente de verificação, restrições, fluxo SDD, CAs `CA-B01...CA-B10`, testes nomeados e adaptadores Claude/Cursor/Codex.

**Prova automatizada:** `PYTHONDONTWRITEBYTECODE=1 pytest -q -p no:cacheprovider && python scripts/check_ca_evidence.py && python scripts/sync_agent_adapters.py --check`.

**O que não pode ser presumido:** cobertura por ID não é aprovação da spec. Falta uma rodada real e independente do verificador, reunida com a rodada do frontend. O verificador não deve fazer nenhuma correção.

**Entrada sugerida:** `Spec: docs/specs/001-validacao-csv/spec.md; o que verificar: tudo que implementa esta spec`.
