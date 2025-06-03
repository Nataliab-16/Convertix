# auth_utils.py

import os
import base64
from flask import Blueprint, redirect, request
from urllib.parse import urlencode
import requests
from dotenv import load_dotenv
import os
TOKENS_FILE = os.path.join(os.path.dirname(__file__), 'tokens.json')
import json 

load_dotenv()

auth_bp = Blueprint('auth', __name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = 'https://bling.com.br/Api/v3/oauth/token'


@auth_bp.route('/', methods=['GET'])
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


@auth_bp.route('/oauth/bling', methods=['GET'])
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


def carregar_tokens():
    if os.path.exists(TOKENS_FILE):
        with open(TOKENS_FILE, 'r') as f:
            return json.load(f)
    return {}

def salvar_tokens(tokens):
    with open(TOKENS_FILE, 'w') as f:
        json.dump(tokens, f)

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
