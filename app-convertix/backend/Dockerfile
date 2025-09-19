# Usar imagem oficial do Python
FROM python:3.13-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar todos os arquivos do backend para dentro do container
COPY . /app

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Expor a porta que a Vercel espera
EXPOSE 8080

# Rodar o app com Gunicorn (4 workers, porta 8080)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "api-bling_0_2_0:app"]
