from flask import Flask, jsonify, request
import os
from datetime import datetime
from flask_cors import CORS
import requests
import time
from dotenv import load_dotenv
from auth_utils import auth_bp, carregar_tokens, salvar_tokens, refresh_access_token

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
REDIRECT_URI = os.getenv('REDIRECT_URI')

app.register_blueprint(auth_bp)

API_BASE_URL = 'https://www.bling.com.br/Api/v3'
RATE_LIMIT = 3  # Requisições antes de dar sleep
SLEEP_SECONDS = 1

def obter_headers(access_token):
    return {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/json'
    }

def buscar_lista_vendas(headers, data_inicial=None, data_final=None):
    url = f'{API_BASE_URL}/pedidos/vendas'
    pagina = 1
    limite = 100  # máximo permitido pela API
    todas_vendas = []

    while True:
        params = {
            "pagina": pagina,
            "limite": limite
        }
        if data_inicial:
            params["dataInicial"] = data_inicial
        if data_final:
            params["dataFinal"] = data_final

        print(f"📄 Buscando página {pagina} com params:", params)
        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            raise Exception(f'Erro ao buscar lista de pedidos: {resp.text}')
        
        vendas = resp.json().get('data', [])
        if not vendas:
            break

        todas_vendas.extend(vendas)
        pagina += 1

        # Adiciona uma pausa entre páginas para respeitar rate limit
        time.sleep(0.5)

    return todas_vendas

def buscar_detalhes_venda(venda_id, headers):
    url = f'{API_BASE_URL}/pedidos/vendas/{venda_id}'
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        raise Exception(f'Erro ao buscar detalhes da venda {venda_id}: {resp.text}')
    return resp.json().get('data', {})

def buscar_nome_vendedora(vendedora_id, headers, cache):
    if vendedora_id in cache:
        return cache[vendedora_id]

    url = f'{API_BASE_URL}/vendedores/{vendedora_id}'
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        nome = resp.json().get('data', {}).get('contato', {}).get('nome')
        cache[vendedora_id] = nome
        return nome
    else:
        print(f"Erro ao buscar nome da vendedora {vendedora_id}: {resp.text}")
        return None

@app.route('/pedidos/vendas', methods=['GET'])
def get_detalhes_vendas():
    tokens = carregar_tokens()
    access_token = tokens.get('access_token')
    if not access_token:
        return jsonify({"error": "Token de acesso não encontrado. Faça login via / para obter um novo token."}), 401

    # Atualiza token
    refresh_access_token()
    tokens = carregar_tokens()
    access_token = tokens.get('access_token')
    headers = obter_headers(access_token)

    # Captura os parâmetros de data
    data_inicial = request.args.get("dataInicial")
    data_final = request.args.get("dataFinal")

    try:
        lista_vendas = buscar_lista_vendas(headers, data_inicial, data_final)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    resultados = []
    cache_vendedoras = {}
    contador_requisicoes = 0

    for venda in lista_vendas:
        venda_id = venda.get('id')
        if not venda_id:
            continue

        try:
            dados_venda = buscar_detalhes_venda(venda_id, headers)
        except Exception as e:
            print(e)
            continue

        id_vendedora = dados_venda.get('vendedor', {}).get('id')
        nome_vendedora = None

        if id_vendedora:
            nome_vendedora = buscar_nome_vendedora(id_vendedora, headers, cache_vendedoras)
            contador_requisicoes += 1

        resultados.append({
            'id_venda': dados_venda.get('id'),
            'numero_venda': dados_venda.get('numero'),
            'id_vendedora': id_vendedora,
            'nome_vendedora': nome_vendedora,
            'data_venda': dados_venda.get('data'),
            'valor_total': dados_venda.get('totalProdutos')
        })

        contador_requisicoes += 1

        if contador_requisicoes % RATE_LIMIT == 0:
            time.sleep(SLEEP_SECONDS)

    return jsonify({"vendas": resultados}), 200


if __name__ == '__main__':
    app.run(debug=True, port=8080)
