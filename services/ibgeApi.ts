// src/services/ibgeApi.ts

interface IbgeUF {
  id: number;
  sigla: string;
  nome: string;
}

interface IbgeMunicipio {
  id: number;
  nome: string;
}

export async function fetchStates(): Promise<IbgeUF[]> {
  try {
    const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar estados", error);
    return [];
  }
}

export async function fetchCities(ufSigla: string): Promise<IbgeMunicipio[]> {
  if (!ufSigla) return [];
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar cidades", error);
    return [];
  }
}