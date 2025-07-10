import {
  LineChart,
  LabelList,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import React, { useEffect, useState, forwardRef } from "react";

const GraficoDeVendas = forwardRef<HTMLDivElement>((_props, ref) => {
  const [data, setData] = useState<any[]>([]);
  const [vendedoras, setVendedoras] = useState<string[]>([]);

  const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const localStorageKey = "graficoVendasUltimos3Meses";

    const carregarDados = async () => {
      const dadosSalvos = localStorage.getItem(localStorageKey);
      if (dadosSalvos) {
        const dadosParse = JSON.parse(dadosSalvos);
        setData(dadosParse.data);
        setVendedoras(dadosParse.vendedoras);
        return;
      }

      const hoje = new Date();
      const nomesMeses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];

      const meses: { mes: string; inicio: Date; fim: Date }[] = [];
      for (let i = 2; i >= 0; i--) {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);
        meses.push({ mes: nomesMeses[inicio.getMonth()], inicio, fim });
      }

      // Objeto para armazenar as "tentativas" para cada vendedora (valor padrão)
      const tentativasMock: Record<string, number> = {};

      const formatar = (d: Date) => d.toISOString().split("T")[0];
      const calcularTaxa = (conversoes = 0, tentativas = 1) =>
        parseFloat(((conversoes / tentativas) * 100).toFixed(1));

      const resultados: any[] = [];
      // Usaremos um Set para armazenar os nomes únicos de vendedoras
      const nomesUnicos = new Set<string>();

      for (const { mes, inicio, fim } of meses) {
        const url = `http://localhost:8080/pedidos/vendas?dataInicial=${formatar(inicio)}&dataFinal=${formatar(fim)}`;
        try {
          const resposta = await fetch(url);
          const dados = await resposta.json();

          const conversoesPorVendedora: Record<string, number> = {};
          dados.vendas.forEach((venda: any) => {
            const nome = venda.nome_vendedora || "Desconhecida";
            nomesUnicos.add(nome);
            conversoesPorVendedora[nome] = (conversoesPorVendedora[nome] || 0) + 1;
            // Caso ainda não exista um valor para esta vendedora, define como 20 (ou outro valor padrão)
            tentativasMock[nome] = tentativasMock[nome] || 300;
          });

          const linhaMes: any = { mes };
          for (const nome of Object.keys(conversoesPorVendedora)) {
            linhaMes[nome] = calcularTaxa(conversoesPorVendedora[nome], tentativasMock[nome]);
          }

          resultados.push(linhaMes);
        } catch (erro) {
          console.error("Erro ao buscar dados do mês:", mes, erro);
          resultados.push({ mes });
        }

        await esperar(600); // evita estourar o limite da API
      }

      // Recupera os nomes das vendedoras a serem ignoradas, conforme armazenado no localStorage
      const ignoradosRaw = localStorage.getItem("nomesIgnorados");
      const nomesIgnorados = ignoradosRaw ? JSON.parse(ignoradosRaw) : [];
      // Filtra as vendedoras, removendo as ignoradas
      const vendedoresFiltrados = Array.from(nomesUnicos).filter(
        (nome) => !nomesIgnorados.includes(nome)
      );

      setData(resultados);
      setVendedoras(vendedoresFiltrados);
      localStorage.setItem(localStorageKey, JSON.stringify({ data: resultados, vendedoras: vendedoresFiltrados }));
    };

    carregarDados();
  }, []);

  const cores = [
    "#1E90FF", "#FF4500", "#32CD32", "#8A2BE2", "#FF1493", "#20B2AA", "#FFA500", "#4B0082",
  ];

  return (
    <div ref={ref} className="w-full h-96 bg-white p-4 rounded shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="mes" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
          {(vendedoras ?? []).map((vendedora, index) => (
            <Line
              key={vendedora}
              type="monotone"
              dataKey={vendedora}
              stroke={cores[index % cores.length]}
              name={vendedora}
              strokeWidth={2}
            >
              <LabelList
                dataKey={vendedora}
                position="top"
                formatter={(val: number) => `${val}%`}
              />
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default GraficoDeVendas;
