"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import GraficoDeVendas from "@/components/GraficoVendas";
import Sidebar from "@/components/Sidebar";

function CalendarIcon() {
  return (
    <svg
      className="w-5 h-6 text-green-500"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellersData, setSellersData] = useState<{ nome: string; conversoes: number; tentativas: number; taxa: string }[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const exportarPDF = async () => {
    const doc = new jsPDF();
    doc.text("Relatório de Conversões", 14, 10);
    autoTable(doc, {
      head: [["Vendedora", "Conversões", "Tentativas", "Taxa de conversão"]],
      body: sellersData.map(({ nome, conversoes, tentativas, taxa }) => [
        nome,
        conversoes.toString(),
        tentativas.toString(),
        taxa,
      ]),
      startY: 20,
      styles: { fontSize: 10 },
    });

    // Posição abaixo da tabela
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Captura o gráfico como imagem
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = doc.internal.pageSize.getWidth() - 20;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      doc.text("Gráfico de Conversões", 14, finalY);
      doc.addImage(imgData, "PNG", 10, finalY + 5, pdfWidth, pdfHeight);
    }

    doc.save("Relatorio.pdf");




  };


  return (
    <div className="flex min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`flex-1 p-4 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <h2 className="text-lg font-bold mb-4">Gráficos</h2>

        <div className="mb-8">
          <GraficoDeVendas ref={chartRef} />
        </div>
        <div className="flex flex-col sm:flex-row flex-nowrap items-center justify-center sm:items-center gap-4 mb-6">
          {/* Data de início */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
              <CalendarIcon />
            </div>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Data de início"
              className="pl-10 w-full py-2.5 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-center sm:mt-0 mt-1">até</span>

          {/* Data de fim */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
              <CalendarIcon />
            </div>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              placeholderText="Data fim"
              className="pl-10 w-full py-2.5 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        <div className="mb-6 justify-center flex">
          <button
            onClick={async () => {
              alert(`Relatório gerado de ${startDate ? startDate.toLocaleDateString() : "sem data de início"} até ${endDate ? endDate.toLocaleDateString() : "sem data de fim"}`);
              const formatarParaAPI = (data: Date | null): string => {
                return data ? data.toISOString().split("T")[0] : "";
              };

              const inicioFormatado = formatarParaAPI(startDate);
              const fimFormatado = formatarParaAPI(endDate);
              console.log(`Relatório gerado de ${inicioFormatado} até ${fimFormatado}`);

              const url = `http://localhost:8080/pedidos/vendas?dataInicial=${inicioFormatado}&dataFinal=${fimFormatado}`;

              try {
                const resposta = await fetch(url);
                const dados = await resposta.json();
                console.log("Dados recebidos:", dados);
                
                // Agrupar vendas por nome_vendedora
                const contagemPorVendedora: Record<string, number> = {};
                dados.vendas.forEach((venda: any) => {
                  const nome = venda.nome_vendedora || "Vendedora Desconhecida";
                  contagemPorVendedora[nome] = (contagemPorVendedora[nome] || 0) + 1;
                });

                // Mock de tentativas
                const tentativasMock: Record<string, number> = {
                  "Nicole Gonçalves": 120,
                  "Ingrid Povoa": 114,
                  "Mariana Carvalho": 98,
                };

                const sellers = Object.entries(contagemPorVendedora).map(([nome, conversoes]) => {
                  const tentativas = tentativasMock[nome] || 30; 
                  const taxa = ((conversoes / tentativas) * 100).toFixed(1) + "%";
                  return { nome, conversoes, tentativas, taxa };
                });

                setSellersData(sellers);
              } catch (erro) {
                console.error("Erro ao buscar relatório:", erro);
              }
            }}
            type="button"
            className=" w-full sm:w-auto text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Ver relatório do período
          </button>
          <button className="w-full mx-4 sm:w-auto text-yellow-700 hover:text-white border border-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5">
            Gerar relatório do dia
          </button>
        </div>

      {sellersData.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Painel de conversão</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Vendedora</th>
                  <th scope="col" className="px-4 py-3">Conversões</th>
                  <th scope="col" className="px-4 py-3">Tentativas</th>
                  <th scope="col" className="px-4 py-3">Taxa de conversão</th>
                </tr>
              </thead>
              <tbody>
                {sellersData.map(({ nome, conversoes, tentativas, taxa }) => (
                  <tr
                    key={nome}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {nome}
                    </th>
                    <td className="px-4 py-4">{conversoes}</td>
                    <td className="px-4 py-4">{tentativas}</td>
                    <td className="px-4 py-4">{taxa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        <div className="mb-4">
          <button
            type="button"
            onClick={exportarPDF}
            className="w-full sm:w-auto text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Exportar em PDF
          </button>
        </div>
        
      </main>

    </div>
  );
}
