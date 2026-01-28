// src/services/cepApi.ts

interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

// Cache simples para não consultar o mesmo CEP repetido (economiza tempo)
const cepCache = new Map<string, CepResponse | null>();

export async function fetchAddressByCep(cep: string): Promise<CepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  // Se já consultou esse CEP antes, retorna da memória
  if (cepCache.has(cleanCep)) {
    return cepCache.get(cleanCep) || null;
  }

  try {
    // Chama a NOSSA rota de API criada no passo 2
    const res = await fetch(`/api/cep/${cleanCep}`);
    
    if (!res.ok) {
      cepCache.set(cleanCep, null); // Marca como inválido para não tentar de novo
      return null;
    }
    
    const data = await res.json();
    cepCache.set(cleanCep, data); // Salva no cache
    return data;
  } catch (error) {
    return null;
  }
}