# -*- coding: utf-8 -*-
"""
Serviço Flask para buscar e consolidar dados de vendas da API v3 do Bling.

Este script implementa a abordagem de maior performance para extrair dados
de pedidos de vendas, utilizando o parâmetro 'expand' da API para incluir
dados de recursos relacionados em uma única requisição por página,
minimizando o tempo de execução e a complexidade do código.

Endpoints:
  - GET /pedidos/vendas: Retorna uma lista consolidada de pedidos de venda,
    incluindo detalhes do pedido e do vendedor.
"""

import os
import asyncio
import requests
import aiohttp
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from auth_utils import auth_bp, carregar_tokens, refresh_access_token

# --- Configuração da Aplicação ---
load_dotenv()
app = Flask(__name__)
CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(','))
app.register_blueprint(auth_bp)

API_BASE_URL = 'https://www.bling.com.br/Api/v3'

# --- Módulos de Lógica Assíncrona ---

async def fetch_json(session, url, headers, params=None):
    """
    Executa uma requisição GET assíncrona e retorna a resposta JSON.

    Args:
        session (aiohttp.ClientSession): A sessão do cliente aiohttp.
        url (str): A URL para a requisição.
        headers (dict): Os cabeçalhos da requisição.
        params (dict, optional): Os parâmetros da query string.

    Returns:
        dict: Os dados da resposta JSON, ou None em caso de erro.
    """
    try:
        async with session.get(url, headers=headers, params=params) as response:
            response.raise_for_status()
            return await response.json()
    except aiohttp.ClientError as e:
        print(f"ERRO de requisição para {url} com params {params}: {e}")
        return None

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

async def obter_vendas_definitivo_async(headers, data_inicial, data_final):
    """
    Orquestra o fluxo de busca de vendas usando o parâmetro 'expand'.

    Este método é o mais eficiente, pois busca a lista de vendas já com os
    dados do vendedor aninhados, eliminando a necessidade de requisições
    secundárias.
    """
    async with aiohttp.ClientSession() as session:
        url_vendas = f'{API_BASE_URL}/pedidos/vendas'
        pagina = 1
        resultados_finais = []

        while True:
            # Usamos 'expand=vendedor' para que a API já inclua os dados do vendedor.
            params = {
                "pagina": pagina,
                "limite": 100,
            }
            if data_inicial: params["dataInicial"] = data_inicial
            if data_final: params["dataFinal"] = data_final
            
            print(f"📄 Buscando página {pagina} de vendas")
            resp = await fetch_json(session, url_vendas, headers, params)
            
            vendas_da_pagina = resp.get('data', []) if resp else []
            if not vendas_da_pagina:
                break
            cache_vendedoras = {}
            # O processamento agora é direto, pois todos os dados já estão presentes.
            for venda in vendas_da_pagina:
                vendedor_info = venda.get('vendedor', {})
                nome_vendedora = vendedor_info.get('contato', {}).get('nome') if vendedor_info else None

                resultados_finais.append({
                    'id_venda': venda.get('id'),
                    'numero_venda': venda.get('numero'),
                    'id_vendedora': vendedor_info.get('id') if vendedor_info else None,
                    'nome_vendedora': nome_vendedora,
                    'data_venda': venda.get('data'),
                    'valor_total': venda.get('totalProdutos')
                })

            pagina += 1
            await asyncio.sleep(0.4) # Pausa amigável entre páginas

        print(f"✅ Processo concluído. Total de {len(resultados_finais)} vendas retornadas.")
        return resultados_finais

# --- Definição de Rotas da API ---

@app.route('/pedidos/vendas', methods=['GET'])
def get_detalhes_vendas():
    """
    Endpoint para obter uma lista consolidada de pedidos de vendas.

    Utiliza a estratégia 'expand' da API para máxima performance.

    Query Params:
        dataInicial (str, opcional): Data inicial no formato AAAA-MM-DD.
        dataFinal (str, opcional): Data final no formato AAAA-MM-DD.

    Returns:
        JSON: Uma lista de objetos de venda ou um objeto de erro.
    """
    try:
        refresh_access_token()
        tokens = carregar_tokens()
        access_token = tokens['access_token']
        headers = {'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'}
    except Exception as e:
        return jsonify({"error": f"Falha na autenticação ou refresh de token: {e}"}), 401
    
    data_inicial = request.args.get("dataInicial")
    data_final = request.args.get("dataFinal")
    
    try:
        resultados = asyncio.run(obter_vendas_definitivo_async(headers, data_inicial, data_final))
        return jsonify({"vendas": resultados}), 200
    except Exception as e:
        print(f"ERRO CRÍTICO na rota /pedidos/vendas: {e}")
        return jsonify({"error": f"Ocorreu um erro inesperado durante o processamento: {e}"}), 500

# --- Ponto de Entrada da Aplicação ---

if __name__ == '__main__':
    app.run(debug=True, port=8080)