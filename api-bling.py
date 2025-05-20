import base64
from flask import Flask, redirect, request
import os
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
REDIRECT_URI = os.getenv('REDIRECT_URI')

# Temos que armazenar o token fora da memória
ACCESS_TOKEN = None


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
    global ACCESS_TOKEN
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

    ACCESS_TOKEN = token_data.get('access_token')

    return f"Token de acesso obtido com sucesso.", 200


@app.route('/pedidos/vendas', methods=['GET'])
def get_pedidos_compras():
    if not ACCESS_TOKEN:
        return {"error": "Token de acesso não encontrado. Faça login via / para obter um novo token."}, 401

    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Accept': 'application/json'
    }

    idVendedor = input("Digite o ID do vendedor: ")

    pedidos_url = f'https://www.bling.com.br/Api/v3/pedidos/vendas?idVendedor={idVendedor}' # BUSCA PEDIDOS FEITOS PELO ID DO VENDEDOR

    response = requests.get(pedidos_url, headers=headers)
    if response.status_code != 200:
        return {"error": "Erro ao buscar pedidos", "detalhes": response.text}, response.status_code

    return response.json(), 200


if __name__ == '__main__':
    app.run(debug=True, port=8080)
