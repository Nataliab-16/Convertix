from flask import Flask, redirect, request
import os
import requests
import time
from urllib.parse import urlencode
from dotenv import load_dotenv

from auth_utils import carregar_tokens, salvar_tokens, refresh_access_token

load_dotenv()
app = Flask(__name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
REDIRECT_URI = os.getenv('REDIRECT_URI')

@app.route('/', methods=['GET'])
def auth_bling():
    state = os.urandom(16).hex()
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'state': state,
        'redirect_uri': REDIRECT_URI
    }
    redirect_url = f'{AUTHORIZATION_URL}?{urlencode(params)}'
    return redirect(redirect_url)

@app.route('/oauth/bling', methods=['GET'])
def oauth_callback():
    code = request.args.get('code')
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    headers = {
        'Authorization': f"Basic {auth_header}",
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }

    response = requests.post(TOKEN_URL, headers=headers, data=data)
    token_data = response.json()

    if 'access_token' not in token_data:
        return f"Erro ao obter token: {token_data}", 400

    salvar_tokens({
        'access_token': token_data.get('access_token'),
        'refresh_token': token_data.get('refresh_token')
    })

    return "Token de acesso obtido com sucesso.", 200

@app.route('/pedidos/vendas', methods=['GET'])
def get_detalhes_vendas():
    tokens = carregar_tokens()
    access_token = tokens.get('access_token')
    if not access_token:
        return {"error": "Token de acesso não encontrado. Faça login via / para obter um novo token."}, 401

    refresh_access_token()
    tokens = carregar_tokens()
    access_token = tokens.get('access_token')

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/json'
    }

    lista_url = 'https://www.bling.com.br/Api/v3/pedidos/vendas'
    response = requests.get(lista_url, headers=headers)
    if response.status_code != 200:
        return {"error": "Erro ao buscar lista de pedidos", "detalhes": response.text}, response.status_code

    lista_vendas = response.json().get('data', [])
    resultados = []
    contador_requisicoes = 0

    for venda in lista_vendas:
        id_venda = venda.get('id')
        if not id_venda:
            continue

        detalhes_url = f'https://www.bling.com.br/Api/v3/pedidos/vendas/{id_venda}'
        detalhes_response = requests.get(detalhes_url, headers=headers)

        if detalhes_response.status_code == 200:
            dados = detalhes_response.json().get('data', {})
            resultados.append({
                'id': dados.get('id'),
                'numero': dados.get('numero'),
                'id_vendedora': dados.get('vendedor', {}).get('id'),
                'data': dados.get('data'),
                'totalProdutos': dados.get('totalProdutos')
            })
        else:
            print(f"Erro ao buscar detalhes da venda {id_venda}: {detalhes_response.text}")

        contador_requisicoes += 1
        if contador_requisicoes % 3 == 0:
            time.sleep(1)

    return {"vendas": resultados}, 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
