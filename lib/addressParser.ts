// src/lib/addressParser.ts

export interface ParsedAddress {
  address: string;
  address_number: string;
  desc_district: string;
  desc_city: string;
  short_desc_state: string;
  address_zipcode: string;
  address_complement: string;
}

export function parseAddressIntelligently(fullAddress: string): ParsedAddress {
  const result: ParsedAddress = {
    address: "", address_number: "", desc_district: "",
    desc_city: "", short_desc_state: "", address_zipcode: "", address_complement: "",
  };

  if (!fullAddress) return result;

  // 1. Limpeza de Ruído (Remover instruções de entrega comuns)
  let workStr = fullAddress
    .replace(/-\s*Entrega sem Contato.*/gi, "")
    .replace(/Deixar o pedido.*/gi, "")
    .replace(/Entrega em mãos.*/gi, "")
    .replace(/\(Instrução de entrega:.*\)/gi, "")
    .trim();

  // 2. Extração de CEP
  const cepMatch = workStr.match(/\b(\d{5}-?\d{3})\b/);
  if (cepMatch) {
    result.address_zipcode = cepMatch[1].replace("-", "");
    workStr = workStr.replace(cepMatch[0], "").trim();
  }

  // 3. Extração de Cidade/UF no final (Ex: Sorocaba/SP ou São Paulo - SP)
  const cityStateMatch = workStr.match(/[,\s-]\s*([a-zA-ZÀ-ú\s\.]+?)\s*[-/,]\s*([A-Z]{2})\s*$/i);
  if (cityStateMatch) {
    result.desc_city = cityStateMatch[1].trim();
    result.short_desc_state = cityStateMatch[2].toUpperCase().trim();
    workStr = workStr.substring(0, cityStateMatch.index).trim();
  }

  // 4. Lógica de "Ancoragem por Número" (Funciona para: "Rua João 234 Casa Morada da Vila")
  // Procuramos o número que costuma dividir a rua do bairro/complemento
  const parts = workStr.split(/(\s\d+\s|\s\d+$)/); // Divide no número isolado
  
  if (parts.length >= 2) {
    result.address = parts[0].replace(/,$/, "").trim(); // Antes do número é a Rua
    result.address_number = parts[1].trim(); // O número em si
    
    // O que sobrou (depois do número) tentamos separar entre Bairro e Complemento
    let rest = parts.slice(2).join("").replace(/^[,\s-]+/, "").trim();
    
    if (rest) {
      // Se houver uma vírgula, o que vem depois dela costuma ser o bairro
      if (rest.includes(",")) {
        const subParts = rest.split(",");
        result.address_complement = subParts[0].trim();
        result.desc_district = subParts.slice(1).join(", ").trim();
      } else {
        // Se não houver vírgula, tentamos identificar palavras-chave de bairro
        if (rest.toLowerCase().includes("bairro") || rest.toLowerCase().includes("jd") || rest.toLowerCase().includes("vila")) {
          result.desc_district = rest;
        } else {
          result.address_complement = rest;
        }
      }
    }
  } else {
    // Caso não tenha número (Ex: "Rua João sem numero Bairro Centro")
    result.address = workStr;
  }

  return result;
}