"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function CadastroVendedora() {
  const [ignorar, setIgnorar] = useState("");
  const [nomesIgnorados, setNomesIgnorados] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Carregar nomes ignorados do banco
  useEffect(() => {
    const carregarNomes = async () => {
      try {
        const resp = await fetch("http://localhost:3004/vendedoras/");
        if (!resp.ok) throw new Error("Erro ao buscar nomes");
        const data = await resp.json();
        setNomesIgnorados(data); // espera que API retorne array de nomes
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar nomes ignorados.");
      }
    };
    carregarNomes();
  }, []);

  const adicionarNomeIgnorado = async () => {
    const nomeTrimado = ignorar.trim();
    if (!nomeTrimado) return;
    if (nomesIgnorados.includes(nomeTrimado)) {
      toast.warning("Este nome já foi adicionado.");
      return;
    }

    try {
      const resp = await fetch("http://localhost:3004/vendedoras/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeTrimado }),
      });

      if (!resp.ok) throw new Error("Erro ao salvar nome");
      setNomesIgnorados((prev) => [...prev, nomeTrimado]);
      setIgnorar("");
      toast.success("Nome ignorado adicionado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar nome.");
    }
  };

  const removerIgnorado = async (nome: string) => {
    try {
      const resp = await fetch(`http://localhost:3004/vendedoras/${encodeURIComponent(nome)}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Erro ao remover nome");

      setNomesIgnorados((prev) => prev.filter((n) => n !== nome));
      toast.success("Nome removido!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover nome.");
    }
  };

  return (
    <div className="flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="max-w-4xl mx-auto p-5 w-full">
        <h1 className="text-2xl font-bold my-10">Gerenciar Nomes Ignorados</h1>

        {/* Input para adicionar nome */}
        <div className="flex gap-2 mb-6">
          <input
            value={ignorar}
            onChange={(e) => setIgnorar(e.target.value)}
            placeholder="Digite um nome para ignorar"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={adicionarNomeIgnorado}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de nomes ignorados */}
        {nomesIgnorados.length > 0 && (
          <table className="table-auto border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Nome</th>
                <th className="border px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {nomesIgnorados.map((nome, idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{nome}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => removerIgnorado(nome)}
                      className="text-red-500 underline px-3 py-1 rounded"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
