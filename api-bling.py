import base64
import json
from flask import Flask, redirect, request
import os
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

# Bling permite até 3 requisições por segundo

# Carregar variáveis do arquivo .env
load_dotenv()
app = Flask(__name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
REDIRECT_URI = os.getenv('REDIRECT_URI')

TOKENS_FILE = 'tokens.json'

# Carregar tokens se existirem
def carregar_tokens():
    if os.path.exists(TOKENS_FILE):
        with open(TOKENS_FILE, 'r') as f:
            return json.load(f)
    return {}

# Salvar tokens no arquivo
def salvar_tokens(tokens):
    with open(TOKENS_FILE, 'w') as f:
        json.dump(tokens, f)

# Atualizar access_token usando refresh_token
def refresh_access_token():
    tokens = carregar_tokens()
    refresh_token = tokens.get('refresh_token')
    if not refresh_token:
        print("Nenhum refresh_token encontrado.")
        return

    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    headers = {
        'Authorization': f"Basic {auth_header}",
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token
    }

    response = requests.post(TOKEN_URL, headers=headers, data=data)
    if response.status_code == 200:
        token_data = response.json()
        salvar_tokens({
            'access_token': token_data.get('access_token'),
            'refresh_token': token_data.get('refresh_token')
        })
        print("Access token renovado com sucesso.")
    else:
        print("Erro ao renovar token:", response.text)

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
def get_pedidos_compras():
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

    pedidos_url = f'https://www.bling.com.br/Api/v3/pedidos/vendas'

    response = requests.get(pedidos_url, headers=headers)
    if response.status_code != 200:
        return {"error": "Erro ao buscar pedidos", "detalhes": response.text}, response.status_code


    dados = response.json()
    resultados = []

    for pedido in dados.get('data', []):
        data_emissao = pedido.get('data', 'Data não encontrada')
        nome_vendedora = pedido.get('vendedor', {}).get('nome', 'Vendedora não identificada')
        numero = pedido.get('numero', 'Número não encontrado')

    resultados.append({
        'numero': numero,
        'data_emissao': data_emissao,
        'vendedora': nome_vendedora
    })

    return {"pedidos": resultados}, 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
