// app/api/cep/[cep]/route.ts
import { NextRequest, NextResponse } from "next/server";

// No Next.js 15+, params é uma Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cep: string }> } 
) {
  // Precisamos dar "await" nos params antes de usar
  const resolvedParams = await params;
  const cep = resolvedParams.cep;

  if (!cep || cep.replace(/\D/g, "").length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      signal: AbortSignal.timeout(4000), 
    });

    if (!res.ok) {
      return NextResponse.json({ error: "CEP não encontrado na base nacional" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro de conexão com o serviço de busca" }, { status: 500 });
  }
}