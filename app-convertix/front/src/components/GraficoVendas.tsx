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
import {
  buscarVendasPorPeriodo,
  processarVendas,
  formatarData,
} from "../utils/relatorioVendas";

type ResultadoMensal = {
  nome: string;
  conversoes: number;
  tentativas: number;
  taxa: string;
};

type LinhaGrafico = {
  mes: string;
  [vendedora: string]: string | number;
};

const GraficoDeVendas = forwardRef<HTMLDivElement>((_props, ref) => {
  const [data, setData] = useState<LinhaGrafico[]>([]);
  const [vendedoras, setVendedoras] = useState<string[]>([]);

  const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const localStorageKey = "graficoVendasUltimos3Meses";

    const carregarDados = async () => {
      const dadosSalvos = localStorage.getItem(localStorageKey);
      if (dadosSalvos) {
        const dadosParse: { data: LinhaGrafico[]; vendedoras: string[] } = JSON.parse(dadosSalvos);
        setData(dadosParse.data);
        setVendedoras(dadosParse.vendedoras);
        return;
      }

      const hoje = new Date();
      const nomesMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      const meses: { mes: string; inicio: Date; fim: Date }[] = [];

      for (let i = 2; i >= 0; i--) {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);
        meses.push({ mes: nomesMeses[inicio.getMonth()], inicio, fim });
      }

      const tentativasMock: Record<string, number> = {};
      const resultados: LinhaGrafico[] = [];
      const nomesUnicos = new Set<string>();

      for (const { mes, inicio, fim } of meses) {
        try {
          const vendas = await buscarVendasPorPeriodo(formatarData(inicio), formatarData(fim));
          const resultadosMensais: ResultadoMensal[] = await processarVendas(vendas, tentativasMock);

          const linhaMes: LinhaGrafico = { mes };
          for (const r of resultadosMensais) {
            linhaMes[r.nome] = parseFloat(r.taxa.replace("%", ""));
            nomesUnicos.add(r.nome);
          }

          resultados.push(linhaMes);
        } catch (erro) {
          console.error("Erro ao buscar dados do mês:", mes, erro);
          resultados.push({ mes });
        }

        await esperar(600);
      }

      let nomesIgnorados: string[] = [];
      try {
        const resp = await fetch("http://localhost:3004/vendedoras/");
        if (resp.ok) {
          nomesIgnorados = await resp.json(); 
        } else {
          console.error("Erro ao buscar nomes ignorados do banco");
        }
      } catch (err) {
        console.error("Falha ao buscar nomes ignorados:", err);
      }

      const vendedoresFiltrados = Array.from(nomesUnicos).filter(
        (nome) => !nomesIgnorados.includes(nome)
      );

      setData(resultados);
      setVendedoras(vendedoresFiltrados);
      localStorage.setItem(localStorageKey, JSON.stringify({ data: resultados, vendedoras: vendedoresFiltrados }));
    };

    carregarDados();
  }, []);

  const cores = ["#1E90FF", "#FF4500", "#32CD32", "#8A2BE2", "#FF1493", "#20B2AA", "#FFA500", "#4B0082"];

  return (
    <div ref={ref} className="w-full h-96 bg-white p-4 rounded shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="mes" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value: number | string) => `${value}%`} />
          <Legend />
          {vendedoras.map((vendedora, index) => (
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
                formatter={(val: number | string) => `${val}%`}
              />
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Adiciona displayName para o forwardRef
GraficoDeVendas.displayName = "GraficoDeVendas";

export default GraficoDeVendas;
