import os
import json
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
TOKENS_FILE = 'tokens.json'

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
