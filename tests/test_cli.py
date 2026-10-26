"""Provas adicionais de CA da spec backend, com CSV criado em memória."""
import json
from pathlib import Path
from dq.cli import main
from dq.core import analisar_csv

def test_ca_b09_cli_json_report(tmp_path, capsys):
    # CA-B09: a CLI fornece resposta JSON para CSV válido sem tocar no fixture original.
    arquivo = tmp_path / 'teste.csv'
    arquivo.write_text('id_venda,data_venda,cliente,produto,categoria,quantidade,preco_unitario,regiao,vendedor\nV1,2025-01-01,Ana,Mouse,Eletrônicos,1,10.00,Sul,Bia\n', encoding='utf8')
    assert main([str(arquivo), '--json']) == 0
    report = json.loads(capsys.readouterr().out)
    assert report['total_linhas'] == 1
    assert report['total_problemas'] == 0

def test_ca_b08_rejeita_csv_vazio():
    try:
        analisar_csv(b'')
    except ValueError:
        pass
    else:
        raise AssertionError('CSV vazio deveria falhar')
