// src/lib/validators.ts

export function validateAndFormatPhone(phone: string, defaultDDD: string = ""): string {
  if (!phone) return "";

  // 1. Remove tudo que não é dígito
  let cleanPhone = phone.toString().replace(/\D/g, "");

  // 2. Remove código do país 55 se estiver no início
  if (cleanPhone.startsWith("55") && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
    cleanPhone = cleanPhone.substring(2);
  }

  // 3. Adiciona DDD padrão se o número for curto (8 ou 9 dígitos)
  if (defaultDDD && (cleanPhone.length === 8 || cleanPhone.length === 9)) {
    cleanPhone = defaultDDD + cleanPhone;
  }

  // 4. Formatação visual (Opcional, mas bom para CSV final)
  // Formato: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  // Se não for válido (não tem 10 ou 11 dígitos), retorna o original limpo ou marca erro
  return cleanPhone; // Retornamos o limpo, o usuário decide se filtra depois
}