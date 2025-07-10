export type Venda = {
  nome_vendedora: string;
};

export type ResultadoVendedora = {
  nome: string;
  conversoes: number;
  tentativas: number;
  taxa: string;
};

const DEFAULT_TENTATIVAS = 300;

export const calcularTaxa = (conversoes = 0, tentativas = 1) =>
  ((conversoes / tentativas) * 100).toFixed(1) + "%";

export const formatarData = (d: Date) => d.toISOString().split("T")[0];

export async function buscarVendasPorPeriodo(dataInicial: string, dataFinal: string) {
  const url = `http://localhost:8080/pedidos/vendas?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;
  const resposta = await fetch(url);
  const dados = await resposta.json();
  return dados.vendas as Venda[];
}

export async function processarVendas(
  vendas: Venda[],
  tentativasMock: Record<string, number> = {}
): Promise<ResultadoVendedora[]> {
  const contagem: Record<string, number> = {};
  const ignoradosRaw = localStorage.getItem("nomesIgnorados");
  const nomesIgnorados = ignoradosRaw ? JSON.parse(ignoradosRaw) : [];

  vendas.forEach((venda) => {
    const nome = venda.nome_vendedora || "Desconhecida";
    if (nomesIgnorados.includes(nome)) return;

    contagem[nome] = (contagem[nome] || 0) + 1;
    if (!tentativasMock[nome]) tentativasMock[nome] = DEFAULT_TENTATIVAS;
  });

  return Object.entries(contagem).map(([nome, conversoes]) => {
    const tentativas = tentativasMock[nome];
    return {
      nome,
      conversoes,
      tentativas,
      taxa: calcularTaxa(conversoes, tentativas),
    };
  });
}
