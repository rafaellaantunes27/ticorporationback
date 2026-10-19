"""Ponto de entrada `dq` para uso local e em pipelines de dados."""
import argparse
import json
import sys
from pathlib import Path
from .core import analisar_csv


def main(argv=None):
    parser = argparse.ArgumentParser(prog='dq', description='Relatório de qualidade de CSV de vendas')
    parser.add_argument('arquivo', type=Path, help='CSV de vendas a analisar')
    parser.add_argument('--json', action='store_true', help='Imprime JSON em vez do relatório humano')
    parser.add_argument('--fail-on-issues', action='store_true', help='Retorna código 1 se houver erros de qualidade')
    args = parser.parse_args(argv)
    try:
        report = analisar_csv(args.arquivo.read_bytes(), args.arquivo.name)
    except (ValueError, OSError) as exc:
        print(f'Erro: {exc}', file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f'\nDQ · QUALIDADE DE DADOS — {report["arquivo"]}')
        print('─' * 68)
        print(f'{report["total_linhas"]} linhas · {report["total_problemas"]} problemas · {report["qualidade"]}% de qualidade')
        print('─' * 68)
        for p in report['problemas']:
            print(f'  L{p["linha"]:03d} │ {p["severidade"].upper():5s} │ {p["coluna"]:17s} │ {p["mensagem"]}')
        print('─' * 68)
        print('O relatório é somente leitura; o CSV original não foi modificado.')
    return int(args.fail_on_issues and report['linhas_com_erro'] > 0)


if __name__ == '__main__':
    raise SystemExit(main())
