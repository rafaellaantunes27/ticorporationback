"""Checagem local de rastreabilidade: AST real evita aceitar testes comentados.

Não substitui revisão independente CA a CA por um subagente.
"""
from pathlib import Path
import ast
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / 'docs/specs/001-validacao-csv/spec.md'


def check():
    spec = SPEC.read_text(encoding='utf8')
    ids = re.findall(r'\*\*?(CA-[BF]\d{2})\s+\[(front|back)\]', spec)
    if not ids:
        raise ValueError('Nenhum CA listado na spec')
    local = {ca for ca, owner in ids if owner == 'back'}
    if len(local) != len([ca for ca, owner in ids if owner == 'back']):
        raise ValueError('CA duplicado na spec')
    found = {}
    for path in sorted((ROOT / 'tests').glob('test_*.py')):
        tree = ast.parse(path.read_text(encoding='utf8'), filename=str(path))
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith('test_') and not any(isinstance(d, ast.Attribute) and d.attr.startswith('skip') or isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and d.func.attr.startswith('skip') for d in node.decorator_list):
                for ca in local:
                    if f'ca_{ca.split("-")[1].lower()}' in node.name.lower():
                        found.setdefault(ca, []).append(f'{path.relative_to(ROOT)}:{node.lineno}')
    missing = sorted(local - found.keys())
    for ca in sorted(local):
        print(f'{ca}: {", ".join(found.get(ca, [])) if ca in found else "SEM TESTE"}')
    if missing:
        raise ValueError(f'Faltam testes executáveis para: {", ".join(missing)}')
    print(f'CA rastreáveis: {len(local)} / {len(local)} (não é veredito independente)')


if __name__ == '__main__':
    try:
        check()
    except (ValueError, SyntaxError) as exc:
        print(f'ERRO: {exc}', file=sys.stderr)
        sys.exit(1)
