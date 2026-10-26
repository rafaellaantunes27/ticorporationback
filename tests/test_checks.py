from io import StringIO
from dq.core import analisar_csv, check_ausentes, check_duplicatas, check_tipos, check_categorias

HEADER = 'id_venda,data_venda,cliente,produto,categoria,quantidade,preco_unitario,regiao,vendedor'
GOOD = 'V0001,2025-01-01,Ana,Mouse,Eletrônicos,1,99.90,Sul,Bia'


def analisar(*rows):
    return analisar_csv((HEADER + '\n' + '\n'.join(rows) + '\n').encode(), 'teste.csv')


def test_ca_b01_csv_valido_sem_problemas():
    r = analisar(GOOD)
    assert r['total_linhas'] == 1
    assert r['total_problemas'] == 0
    assert r['qualidade'] == 100


def test_ca_b01_check_ok_true_significa_nenhum_problema():
    r = check_ausentes([dict(zip(HEADER.split(','), GOOD.split(',')))])
    assert r.ok is True
    assert not r.problemas


def test_ca_b02_ausentes_campo_vazio():
    r = analisar(GOOD.replace(',Ana,', ',,'))
    assert any(p['tipo'] == 'ausente' and p['coluna'] == 'cliente' for p in r['problemas'])


def test_ca_b02_ausentes_na_nao_e_valor():
    r = analisar(GOOD.replace(',99.90,', ',N/A,'))
    assert any(p['tipo'] == 'ausente' and p['coluna'] == 'preco_unitario' for p in r['problemas'])


def test_ca_b03_duplicata_exata_e_id():
    r = analisar(GOOD, GOOD)
    types = [p['tipo'] for p in r['problemas']]
    assert types.count('duplicata') == 1
    assert types.count('id_duplicado') == 1


def test_ca_b03_id_duplicado_mesmo_se_linhas_diferentes():
    r = analisar(GOOD, GOOD.replace('Mouse', 'Monitor'))
    types = [p['tipo'] for p in r['problemas']]
    assert 'id_duplicado' in types
    assert 'duplicata' not in types


def test_ca_b04_tipo_quantidade_literal():
    r = analisar(GOOD.replace(',1,99.90,', ',dois,99.90,'))
    assert any(p['tipo'] == 'tipo_invalido' and p['coluna'] == 'quantidade' for p in r['problemas'])


def test_ca_b04_quantidade_negativa():
    r = analisar(GOOD.replace(',1,99.90,', ',-2,99.90,'))
    assert any(p['tipo'] == 'valor_invalido' for p in r['problemas'])


def test_ca_b04_preco_formatado_moeda_invalido():
    r = analisar(GOOD.replace('99.90', '"R$ 99,90"'))
    assert any(p['tipo'] == 'tipo_invalido' and p['coluna'] == 'preco_unitario' for p in r['problemas'])


def test_ca_b05_data_outro_formato():
    r = analisar(GOOD.replace('2025-01-01', '01/01/2025'))
    assert any(p['tipo'] == 'data_invalida' for p in r['problemas'])


def test_ca_b05_categoria_caixa_e_acentos():
    r = analisar(GOOD.replace('Eletrônicos', 'eletronicos'))
    assert any(p['tipo'] == 'categoria_inconsistente' for p in r['problemas'])


def test_ca_b06_preco_outlier_apenas_aviso():
    rows = [GOOD.replace('V0001', f'V{i:04d}') for i in range(1,4)]
    rows[-1] = rows[-1].replace('99.90', '999.00')
    r = analisar(*rows)
    p = next(p for p in r['problemas'] if p['tipo'] == 'preco_suspeito')
    assert p['severidade'] == 'aviso'
    assert r['qualidade'] == 100


def test_ca_b08_coluna_obrigatoria_ausente():
    try:
        analisar_csv('a,b\n1,2'.encode())
    except ValueError as exc:
        assert 'Colunas obrigatórias' in str(exc)
    else:
        assert False


def test_ca_b07_csv_nao_muda_os_bytes():
    data = (HEADER+'\n'+GOOD+'\n').encode()
    old = data[:]
    analisar_csv(data)
    assert data == old


def test_ca_b08_limite_tamanho():
    try:
        analisar_csv(b'x'*2_000_001)
    except ValueError as e:
        assert '2 MB' in str(e)
    else:
        assert False
