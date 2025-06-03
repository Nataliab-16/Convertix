from flask import Flask, redirect, request
import os
import requests
import time
import base64
from urllib.parse import urlencode
from dotenv import load_dotenv
from auth_utils import auth_bp, carregar_tokens, salvar_tokens, refresh_access_token

load_dotenv()
app = Flask(__name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize'
TOKEN_URL = "https://bling.com.br/Api/v3/oauth/token"
REDIRECT_URI = os.getenv('REDIRECT_URI')

app.register_blueprint(auth_bp)  

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
    cache_vendedoras = {}

    for venda in lista_vendas:
        id_venda = venda.get('id')
        if not id_venda:
            continue

        detalhes_url = f'https://www.bling.com.br/Api/v3/pedidos/vendas/{id_venda}'
        detalhes_response = requests.get(detalhes_url, headers=headers)

        if detalhes_response.status_code != 200:
            print(f"Erro ao buscar detalhes da venda {id_venda}: {detalhes_response.text}")
            continue

        dados = detalhes_response.json().get('data', {})
        id_vendedora = dados.get('vendedor', {}).get('id')
        nome_vendedora = None

        if id_vendedora:
            if id_vendedora in cache_vendedoras:
                nome_vendedora = cache_vendedoras[id_vendedora]
            else:
                vendedora_url = f'https://www.bling.com.br/Api/v3/vendedores/{id_vendedora}'
                vendedora_response = requests.get(vendedora_url, headers=headers)
                if vendedora_response.status_code == 200:
                    nome_vendedora = vendedora_response.json().get('data', {}).get('contato', {}).get('nome')
                    cache_vendedoras[id_vendedora] = nome_vendedora
                else:
                    print(f"Erro ao buscar nome da vendedora {id_vendedora}: {vendedora_response.text}")

                contador_requisicoes += 1

        resultados.append({
            'id': dados.get('id'),
            'numero': dados.get('numero'),
            'id_vendedora': id_vendedora,
            'nome_vendedora': nome_vendedora,
            'data': dados.get('data'),
            'totalProdutos': dados.get('totalProdutos')
        })

        contador_requisicoes += 1  # Conta a requisição do pedido
        if contador_requisicoes % 3 == 0:
            time.sleep(1)

    return {"vendas": resultados}, 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
