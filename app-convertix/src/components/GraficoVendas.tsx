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

  const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    useEffect(() => {
    const localStorageKey = "graficoVendasUltimos3Meses";

    const carregarDados = async () => {
      // 1. Tenta carregar do localStorage
      const dadosSalvos = localStorage.getItem(localStorageKey);
      if (dadosSalvos) {
        setData(JSON.parse(dadosSalvos));
        return;
      }

      // 2. Se não houver, busca da API
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

      const tentativasMock: Record<string, number> = {
        "Nicole Gonçalves": 120,
        "Ingrid Povoa": 114,
      };

      const formatar = (d: Date) => d.toISOString().split("T")[0];
      const calcularTaxa = (conversoes = 0, tentativas = 1) =>
        parseFloat(((conversoes / tentativas) * 100).toFixed(1));

      const resultados: any[] = [];

      for (const { mes, inicio, fim } of meses) {
        const url = `http://localhost:8080/pedidos/vendas?dataInicial=${formatar(inicio)}&dataFinal=${formatar(fim)}`;
        try {
          const resposta = await fetch(url);
          const dados = await resposta.json();

          const conversoesPorVendedora: Record<string, number> = {};
          dados.vendas.forEach((venda: any) => {
            const nome = venda.nome_vendedora || "Desconhecida";
            conversoesPorVendedora[nome] = (conversoesPorVendedora[nome] || 0) + 1;
          });

          resultados.push({
            mes,
            taxaNicole: calcularTaxa(conversoesPorVendedora["Nicole Gonçalves"], tentativasMock["Nicole Gonçalves"]),
            taxaIngrid: calcularTaxa(conversoesPorVendedora["Ingrid Povoa"], tentativasMock["Ingrid Povoa"]),
          });
        } catch (erro) {
          console.error("Erro ao buscar dados do mês:", mes, erro);
          resultados.push({
            mes,
            taxaNicole: 0,
            taxaIngrid: 0,
          });
        }

        await esperar(600); // evita estourar o limite da API
      }

      setData(resultados);
      localStorage.setItem(localStorageKey, JSON.stringify(resultados));
    };

    carregarDados();
  }, []);

  return (
    <div ref={ref} className="w-full h-96 bg-white p-4 rounded">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="mes" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="taxaIngrid"
            stroke="#FF4500"
            name="Ingrid"
          >
            <LabelList dataKey="taxaIngrid" position="top" formatter={(val: number) => `${val}%`} />
          </Line>

          <Line
            type="monotone"
            dataKey="taxaNicole"
            stroke="#1E90FF"
            name="Nicole"
          >
            <LabelList dataKey="taxaNicole" position="top" formatter={(val: number) => `${val}%`} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default GraficoDeVendas;
