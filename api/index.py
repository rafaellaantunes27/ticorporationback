"""API serverless para a interface web; sem banco, sem armazenamento de CSV."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dq.core import analisar_csv

app = FastAPI(title='TI Corporation DQ API', version='1.0.0', docs_url='/api/docs', openapi_url='/api/openapi.json')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'X-Filename'])


@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'ticorporation-dq', 'mode': 'stateless', 'storage': 'none'}


@app.post('/api/analyze')
async def analyze(request: Request):
    content_type = request.headers.get('content-type', '')
    if 'text/csv' not in content_type and 'application/octet-stream' not in content_type:
        return JSONResponse({'erro': 'Envie o conteúdo do CSV no corpo com Content-Type: text/csv.'}, status_code=415)
    if request.headers.get('content-length') and int(request.headers['content-length']) > 2_000_000:
        return JSONResponse({'erro': 'CSV maior que 2 MB.'}, status_code=413)
    payload = await request.body()
    filename = request.headers.get('x-filename', 'arquivo.csv')
    try:
        report = analisar_csv(payload, filename)
        return JSONResponse(report, headers={'Cache-Control': 'no-store'})
    except ValueError as exc:
        return JSONResponse({'erro': str(exc)}, status_code=422)


@app.get('/')
def root():
    return {'message': 'TI Corporation DQ API', 'health': '/api/health', 'docs': '/api/docs'}
