"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import GraficoDeVendas from "@/components/GraficoVendas";
import Sidebar from "@/components/Sidebar";
import { toast, Toaster } from "sonner";
import { useClienteStore } from "@/context/clientes";

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
  const [loading, setLoading] = useState(false);
  const { cliente } = useClienteStore();

  const toastShown = useRef(false);

  useEffect(() => {
    if (cliente.nome && !toastShown.current) {
      toast(<div className="text-lg poppins-regular">Bem-vindo(a), {cliente.nome}! =)</div>);
      toastShown.current = true;
    }
  }, [cliente.nome]);

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
              if (!startDate || !endDate) {
                toast.warning("Por favor, selecione uma data de início e uma data de fim antes de gerar o relatório.");
                return;
              }

              setLoading(true)

              toast.success(`Gerando relatório de ${startDate ? startDate.toLocaleDateString() : "sem data de início"} até ${endDate ? endDate.toLocaleDateString() : "sem data de fim"}`);
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
                  "Nicole Gonçalves": 300,
                  "Ingrid Povoa": 300,
                  "Mariana Carvalho": 20,
                };

                const ignoradosRaw = localStorage.getItem("nomesIgnorados");
                const nomesIgnorados = ignoradosRaw ? JSON.parse(ignoradosRaw) : [];

                const sellers = Object.entries(contagemPorVendedora)
                  .filter(([nome]) => !nomesIgnorados.includes(nome)) // <- filtro adicionado
                  .map(([nome, conversoes]) => {
                    const tentativas = tentativasMock[nome] || 20;
                    const taxa = ((conversoes / tentativas) * 100).toFixed(1) + "%";
                    return { nome, conversoes, tentativas, taxa };
                  });

                setSellersData(sellers);
              } catch (erro) {
                console.error("Erro ao buscar relatório:", erro);
              } finally {
                setLoading(false); // Finaliza loader
                setStartDate(null);
                setEndDate(null);
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

          {loading ? (<button disabled type="button" className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
            <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
            </svg>
            Carregando...
          </button>) : ""}
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
        <Toaster position="top-center" richColors />
      </main>

    </div>
  );
}
