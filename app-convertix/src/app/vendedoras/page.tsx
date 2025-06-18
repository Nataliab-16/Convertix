"use client";

import Sidebar from "@/components/Sidebar";
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useCallback,
} from "react";

export default function CadastroVendedora() {
  const [nome, setNome] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const gerarPreviews = (files: File[]) => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleImagensChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const arquivos = Array.from(e.target.files);
      setImagens(arquivos);
      gerarPreviews(arquivos);
    },
    []
  );

  const validarFormulario = () => {
    if (!nome.trim()) {
      alert("Por favor, preencha o nome da vendedora.");
      return false;
    }
    if (imagens.length === 0) {
      alert("Por favor, carregue pelo menos uma imagem.");
      return false;
    }
    return true;
  };

  const limparFormulario = () => {
    setNome("");
    setImagens([]);
    setPreviewUrls([]);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    // Simula envio
    console.log("Nome:", nome);
    console.log("Imagens:", imagens);
    alert("Cadastro enviado.");

    limparFormulario();
  };

  return (
    <div className="flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="max-w-sm mx-auto p-5">
        <h1 className="text-2xl font-bold my-10">Cadastro de Vendedora</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block font-semibold mb-1">
              Nome da Vendedora
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Digite o nome"
              required
            />
          </div>

          {/* Campo Imagens */}
          <div>
            <label htmlFor="imagens" className="block font-semibold mb-1">
              Imagens da Vendedora
            </label>
            <input
              type="file"
              id="imagens"
              multiple
              accept="image/*"
              onChange={handleImagensChange}
              ref={inputFileRef}
              className="block"
            />
          </div>

          {/* Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previewUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
              ))}
            </div>
          )}

          {/* Botão Enviar */}
          <button
            type="submit"
            className="text-white bg-green-400 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
            <span className="sr-only">Enviar cadastro</span>
          </button>
        </form>
      </div>
    </div>
  );
}
