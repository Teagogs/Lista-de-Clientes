// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilitário para combinar classes Tailwind (padrão shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalização de texto (remove acentos, caixa baixa)
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
    .replace(/[^a-z0-9\s]/g, "") // Mantém apenas letras e números
    .replace(/\s+/g, " "); // Remove espaços duplos
}

// Interface da resposta da API
interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

// Busca dados de endereço na BrasilAPI (Gratuita)
export async function fetchAddressByCep(cep: string): Promise<CepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  
  if (cleanCep.length !== 8) return null;

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
    if (!res.ok) throw new Error("CEP não encontrado");
    return await res.json();
  } catch (error) {
    console.warn(`Erro ao buscar CEP ${cep}:`, error);
    return null;
  }
}