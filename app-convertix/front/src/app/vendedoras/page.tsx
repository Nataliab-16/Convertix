"use client";

import Sidebar from "@/components/Sidebar";
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { toast, Toaster } from "sonner";

export default function CadastroVendedora() {
  const [ignorar, setIgnorar] = useState("");
  const [nome, setNome] = useState("");
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  const [vendedoras, setVendedoras] = useState<
    { nome: string; imagens: string[] }[]
  >([]);
  const [nomesIgnorados, setNomesIgnorados] = useState<string[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const dadosVendedoras = localStorage.getItem("vendedoras");
    const dadosIgnorados = localStorage.getItem("nomesIgnorados");

    if (dadosVendedoras) {
      try {
        setVendedoras(JSON.parse(dadosVendedoras));
      } catch (err) {
        console.error("Erro ao carregar vendedoras:", err);
      }
    }

    if (dadosIgnorados) {
      try {
        setNomesIgnorados(JSON.parse(dadosIgnorados));
      } catch (err) {
        console.error("Erro ao carregar nomes ignorados:", err);
      }
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImagensChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const arquivos = Array.from(e.target.files);
      const base64Array = await Promise.all(
        arquivos.map((file) => fileToBase64(file))
      );
      setImagensBase64(base64Array);
    },
    []
  );

  const validarFormulario = () => {
    if (!nome.trim()) {
      toast.warning("Por favor, preencha o nome da vendedora.");
      return false;
    }
    if (imagensBase64.length === 0) {
      toast.warning("Por favor, carregue pelo menos uma imagem.");
      return false;
    }
    return true;
  };

  const limparFormulario = () => {
    setNome("");
    setImagensBase64([]);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const novaVendedora = { nome, imagens: imagensBase64 };

    setVendedoras((prev) => {
      const novaLista = [...prev, novaVendedora];
      localStorage.setItem("vendedoras", JSON.stringify(novaLista));
      return novaLista;
    });

    limparFormulario();
  };

  const adicionarNomeIgnorado = () => {
    const nomeTrimado = ignorar.trim();
    if (!nomeTrimado) return;
    if (nomesIgnorados.includes(nomeTrimado)) {
      toast.warning("Este nome já foi adicionado.");
      return;
    }

    const novosNomes = [...nomesIgnorados, nomeTrimado];
    setNomesIgnorados(novosNomes);
    localStorage.setItem("nomesIgnorados", JSON.stringify(novosNomes));
    setIgnorar("");
    toast.success("Nome ignorado adicionado!");
  };

  const removerIgnorado = (nome: string) => {
    const atualizados = nomesIgnorados.filter((n) => n !== nome);
    setNomesIgnorados(atualizados);
    localStorage.setItem("nomesIgnorados", JSON.stringify(atualizados));
  };

  return (
    <div className="flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="max-w-4xl mx-auto p-5 w-full">
        <h1 className="text-2xl font-bold my-10">Cadastro de Vendedora</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {imagensBase64.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {imagensBase64.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            className="text-white bg-green-400 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2"
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

        {vendedoras.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Vendedoras Cadastradas
            </h2>
            <table className="min-w-full table-auto border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Foto(s)</th>
                  <th className="border px-4 py-2">Nome</th>
                </tr>
              </thead>
              <tbody>
                {vendedoras
                  .filter((v) => !nomesIgnorados.includes(v.nome))
                  .map((vendedora, index) => (
                    <tr key={index} className="text-center">
                      <td className="border px-4 py-2">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {vendedora.imagens.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Vendedora ${index + 1} - Foto ${i + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="border px-4 py-2">{vendedora.nome}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lista de nomes ignorados */}
        <div className="p-4 mt-10 bg-gray-100 rounded">
          <h2 className="text-lg font-bold mb-4">Nomes a Ignorar</h2>
          <div className="flex gap-2 mb-4">
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
                        className=" text-red-500 underline px-3 py-1 rounded"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
