"""Validação de CSV: sem estado, sem I/O e com resultados explicáveis por linha.

Convenção do curso: CheckResult.ok=True significa que o check não achou problemas.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from io import BytesIO
from math import isfinite
from pathlib import Path
import re
import unicodedata

import pandas as pd

COLUNAS = (
    'id_venda', 'data_venda', 'cliente', 'produto', 'categoria',
    'quantidade', 'preco_unitario', 'regiao', 'vendedor'
)
CATEGORIAS = ('Eletrônicos', 'Móveis', 'Acessórios')
MAX_BYTES = 2_000_000
MAX_ROWS = 10_000
TIPOS = {
    'ausente': 'Valor ausente',
    'duplicata': 'Linha duplicada',
    'id_duplicado': 'ID duplicado',
    'tipo_invalido': 'Tipo inválido',
    'data_invalida': 'Data fora do padrão',
    'valor_invalido': 'Valor inválido',
    'categoria_inconsistente': 'Categoria inconsistente',
    'preco_suspeito': 'Preço suspeito',
}


@dataclass(frozen=True)
class Problema:
    linha: int
    coluna: str
    tipo: str
    severidade: str
    mensagem: str
    valor: str = ''

    def to_dict(self):
        return asdict(self)


@dataclass(frozen=True)
class CheckResult:
    nome: str
    ok: bool
    problemas: tuple[Problema, ...]


def _sem_acentos(value: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFKD', value) if not unicodedata.combining(c))


def _celula(row, column) -> str:
    return str(row.get(column, '')).strip()


def _problema(linha: int, coluna: str, tipo: str, mensagem: str, valor: str = '', severidade: str = 'erro') -> Problema:
    return Problema(linha, coluna, tipo, severidade, mensagem, valor[:160])


def check_ausentes(rows: list[dict]) -> CheckResult:
    problemas = []
    for idx, row in enumerate(rows, start=2):
        for col in COLUNAS:
            val = _celula(row, col)
            if not val or val.upper() in {'N/A', 'NULL', 'NAN', 'NA'}:
                problemas.append(_problema(idx, col, 'ausente', f'Campo obrigatório "{col}" não preenchido.', val))
    return CheckResult('ausentes', not problemas, tuple(problemas))


def check_duplicatas(rows: list[dict]) -> CheckResult:
    problemas = []
    seen_lines = {}
    seen_ids = {}
    for idx, row in enumerate(rows, start=2):
        key = tuple(_celula(row, col) for col in COLUNAS)
        venda_id = _celula(row, 'id_venda')
        if key in seen_lines:
            problemas.append(_problema(idx, 'id_venda', 'duplicata', f'Linha idêntica à linha {seen_lines[key]}.', venda_id))
        else:
            seen_lines[key] = idx
        if venda_id and venda_id in seen_ids:
            problemas.append(_problema(idx, 'id_venda', 'id_duplicado', f'ID também presente na linha {seen_ids[venda_id]}.', venda_id))
        elif venda_id:
            seen_ids[venda_id] = idx
    return CheckResult('duplicatas', not problemas, tuple(problemas))


def check_tipos(rows: list[dict]) -> CheckResult:
    problemas = []
    for idx, row in enumerate(rows, start=2):
        date = _celula(row, 'data_venda')
        if date:
            try:
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date):
                    raise ValueError('formato não ISO')
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                problemas.append(_problema(idx, 'data_venda', 'data_invalida', 'Esperado YYYY-MM-DD.', date))
        quantity = _celula(row, 'quantidade')
        if quantity:
            if not re.fullmatch(r'[+-]?\d+', quantity):
                problemas.append(_problema(idx, 'quantidade', 'tipo_invalido', 'Quantidade deve ser número inteiro.', quantity))
            elif int(quantity) <= 0:
                problemas.append(_problema(idx, 'quantidade', 'valor_invalido', 'Quantidade deve ser maior que zero.', quantity))
        price = _celula(row, 'preco_unitario')
        if price and price.upper() not in {'N/A', 'NULL', 'NAN', 'NA'}:
            try:
                if not re.fullmatch(r'[+-]?\d+(?:\.\d{1,2})?', price):
                    raise ValueError('formato incorreto')
                amount = float(price)
                if not isfinite(amount) or amount <= 0:
                    problemas.append(_problema(idx, 'preco_unitario', 'valor_invalido', 'Preço deve ser positivo e finito.', price))
            except ValueError:
                problemas.append(_problema(idx, 'preco_unitario', 'tipo_invalido', 'Esperado decimal com ponto (ex.: 129.90), sem R$.', price))
    return CheckResult('tipos', not problemas, tuple(problemas))


def check_categorias(rows: list[dict]) -> CheckResult:
    problemas = []
    norm = {_sem_acentos(c).lower(): c for c in CATEGORIAS}
    for idx, row in enumerate(rows, start=2):
        value = str(row.get('categoria', ''))
        if not value.strip():
            continue
        ideal = norm.get(_sem_acentos(value.strip()).lower())
        if ideal and value != ideal:
            problemas.append(_problema(idx, 'categoria', 'categoria_inconsistente', f'Usar grafia padronizada: {ideal}.', value))
        elif not ideal:
            problemas.append(_problema(idx, 'categoria', 'categoria_inconsistente', 'Categoria fora do vocabulário conhecido.', value))
    return CheckResult('categorias', not problemas, tuple(problemas))


def check_precos_suspeitos(rows: list[dict]) -> CheckResult:
    """Heurística informativa; pode sinalizar promoções legítimas (não corrige)."""
    from statistics import median
    by_product = defaultdict(list)
    for row in rows:
        p = _celula(row, 'preco_unitario')
        if re.fullmatch(r'\d+(?:\.\d{1,2})?', p) and float(p) > 0:
            by_product[_celula(row, 'produto')].append(float(p))
    meds = {name: median(values) for name, values in by_product.items() if len(values) >= 3}
    problems = []
    for i, row in enumerate(rows, 2):
        name = _celula(row, 'produto')
        price = _celula(row, 'preco_unitario')
        if name not in meds or not re.fullmatch(r'\d+(?:\.\d{1,2})?', price):
            continue
        p, med = float(price), meds[name]
        if p > 3 * med or (p < med / 3 and p > 0):
            problems.append(_problema(i, 'preco_unitario', 'preco_suspeito', f'Preço atípico para {name} (mediana R$ {med:,.2f}).', price, severidade='aviso'))
    return CheckResult('precos_suspeitos', not problems, tuple(problems))


CHECKS = (check_ausentes, check_duplicatas, check_tipos, check_categorias, check_precos_suspeitos)


def analisar_csv(content: bytes, filename: str = 'arquivo.csv') -> dict:
    """Entrada binária CSV UTF-8/UTF-8-BOM. Não grava nem modifica dados."""
    if len(content) > MAX_BYTES:
        raise ValueError('Arquivo excede 2 MB; escolha um CSV menor.')
    if not content:
        raise ValueError('O arquivo CSV está vazio.')
    try:
        frame = pd.read_csv(BytesIO(content), dtype=str, keep_default_na=False, encoding='utf-8-sig', on_bad_lines='error')
    except (UnicodeDecodeError, pd.errors.ParserError, pd.errors.EmptyDataError) as e:
        raise ValueError('CSV inválido: use UTF-8, separador vírgula e cabeçalho.') from e
    if len(frame) > MAX_ROWS:
        raise ValueError('Limite de 10 mil linhas por análise excedido.')
    frame.columns = [str(c).strip() for c in frame.columns]
    if len(frame.columns) != len(set(frame.columns)):
        raise ValueError('Cabeçalho possui colunas duplicadas.')
    missing_columns = [x for x in COLUNAS if x not in frame.columns]
    if missing_columns:
        raise ValueError('Colunas obrigatórias ausentes: ' + ', '.join(missing_columns))
    if frame.empty:
        raise ValueError('O CSV precisa ter ao menos uma linha de dados.')
    rows = frame.fillna('').to_dict(orient='records')
    rows = [{k: '' if v is None else str(v) for k, v in r.items()} for r in rows]
    checks = [fn(rows) for fn in CHECKS]
    issues = [p.to_dict() for ch in checks for p in ch.problemas]
    issues.sort(key=lambda p: (p['linha'], p['coluna'], p['tipo']))
    counter = Counter(p['tipo'] for p in issues)
    affected = {p['linha'] for p in issues}
    errors = {p['linha'] for p in issues if p['severidade'] == 'erro'}
    total = len(rows)
    return {
        'arquivo': Path(filename).name[:160], 'total_linhas': total, 'total_colunas': len(frame.columns),
        'total_problemas': len(issues), 'linhas_afetadas': len(affected), 'linhas_com_erro': len(errors),
        'qualidade': round(100 * (total-len(errors)) / total, 1),
        'resumo_por_tipo': [{'tipo': k, 'rotulo': TIPOS[k], 'quantidade': counter[k]} for k in TIPOS if counter[k]],
        'colunas': list(frame.columns), 'linhas': [{'numero': i+2, 'valores': row} for i, row in enumerate(rows)],
        'problemas': issues, 'checks': [{'nome': c.nome, 'ok': c.ok, 'quantidade': len(c.problemas)} for c in checks],
        'gerado_em': datetime.now(timezone.utc).isoformat(),
    }
