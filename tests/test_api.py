from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)


def test_health():
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['mode'] == 'stateless'


def test_analyze_requires_csv():
    assert client.post('/api/analyze', json={}).status_code == 415


def test_analyze_csv():
    text = ('id_venda,data_venda,cliente,produto,categoria,quantidade,preco_unitario,regiao,vendedor\n'
            'A,2025-01-01,Jo,Produto,Eletrônicos,1,15.00,Sul,Ana\n')
    r = client.post('/api/analyze', content=text.encode(), headers={'content-type': 'text/csv'})
    assert r.status_code == 200
    assert r.json()['qualidade'] == 100


def test_invalid_columns_422():
    r = client.post('/api/analyze', content=b'a,b\n1,2', headers={'content-type': 'text/csv'})
    assert r.status_code == 422
