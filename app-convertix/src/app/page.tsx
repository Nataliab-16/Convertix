"use client"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef } from "react";
import GraficoDeVendas from "@/components/GraficoVendas";
import Sidebar from "@/components/Sidebar";

const exportarPDF = () => {
  const doc = new jsPDF();

  doc.text("Relatório de Conversões", 14, 10);

  autoTable(doc, {
    head: [["Vendedora", "Conversões", "Tentativas", "Taxa de conversão"]],
    body: [
      ["Ingrid Povóa", "76", "114", "58,8%"],
      ["Nicole Gonçalves", "87", "120", "64,7%"],
      ["Mariana Carvalho", "79", "98", "89,1%"],
    ],
    styles: { fontSize: 10 },
  });

  doc.save("Relatorio.pdf");
};

export default function Home() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar/>

      <main className="flex-1 p-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm">
            <div className="z-10 absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-6 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
              </svg>
            </div>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Data de início"
              className="pl-10 w-full py-2.5 px-4 text-sm text-gray-300 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 "
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <span>até</span>
          <div className="relative max-w-sm">
            <div className="z-10 absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-6 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
              </svg>
            </div>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              placeholderText="Data fim"
              className="pl-10 w-full py-2.5 px-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 " />
          </div>
        </div>

        <button type="button" className="mt-4 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Gerar Relatório</button>
        
        
        <h2 className="m-4 text-lg poppins-bold">Painel de conversão</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Vendedora
                </th>
                <th scope="col" className="px-6 py-3">
                  Conversões
                </th>
                <th scope="col" className="px-6 py-3">
                  Tentativas
                </th>
                <th scope="col" className="px-6 py-3">
                  Taxa de conversão
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Ingrid Povóa
                </th>
                <td className="px-6 py-4">76</td>
                <td className="px-6 py-4">114</td>
                <td className="px-6 py-4">58,8%</td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Nicole Gonçalves
                </th>
                <td className="px-6 py-4">87</td>
                <td className="px-6 py-4">120</td>
                <td className="px-6 py-4">64,7%</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Mariana Carvalho
                </th>
                <td className="px-6 py-4">79</td>
                <td className="px-6 py-4">98</td>
                <td className="px-6 py-4">89,1%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mx-4 my-8 text-lg poppins-bold">Gráficos</h2>
        <GraficoDeVendas />

        <button type="button" onClick={exportarPDF} className="my-4 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Exportar em PDF</button>
      </main>
    </div>
  );
}
