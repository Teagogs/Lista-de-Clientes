// app/api/cep/[cep]/route.ts
import { NextRequest, NextResponse } from "next/server";

// A assinatura da função foi corrigida para usar os tipos do Next.js
export async function GET(
  request: NextRequest, // Usamos NextRequest
  { params }: { params: { cep: string } }
) {
  const cep = params.cep;

  if (!cep || cep.replace(/\D/g, "").length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      signal: AbortSignal.timeout(3000), 
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || "CEP não encontrado" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro de rede ou timeout na API externa" }, { status: 500 });
  }
}