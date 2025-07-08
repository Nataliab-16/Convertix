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

export default function CadastroVendedora() {
  const [nome, setNome] = useState("");
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  const [vendedoras, setVendedoras] = useState<
    { nome: string; imagens: string[] }[]
  >([]);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Carregar vendedoras salvas
  useEffect(() => {
    const dadosSalvos = localStorage.getItem("vendedoras");
    if (dadosSalvos) {
      try {
        setVendedoras(JSON.parse(dadosSalvos));
      } catch (err) {
        console.error("Erro ao carregar do localStorage:", err);
      }
    }
  }, []);

  // Converte arquivo em base64
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
      alert("Por favor, preencha o nome da vendedora.");
      return false;
    }
    if (imagensBase64.length === 0) {
      alert("Por favor, carregue pelo menos uma imagem.");
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

    const novaVendedora = {
      nome,
      imagens: imagensBase64,
    };

    setVendedoras((prev) => {
      const novaLista = [...prev, novaVendedora];
      localStorage.setItem("vendedoras", JSON.stringify(novaLista));
      return novaLista;
    });

    limparFormulario();
  };

  return (
    <div className="flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="max-w-4xl mx-auto p-5 w-full">
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

          {/* Previews das imagens em base64 */}
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

        {/* Tabela de Vendedoras Cadastradas */}
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
                {vendedoras.map((vendedora, index) => (
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
      </div>
    </div>
  );
}
