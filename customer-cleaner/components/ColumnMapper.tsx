"use client";

import { ArrowRight, Play, RotateCcw } from "lucide-react";

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (header: string, value: string) => void;
  onProcess: () => void;
  onReset: () => void;
}

export default function ColumnMapper({ 
  headers, mapping, onMappingChange, onProcess, onReset 
}: ColumnMapperProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-semibold text-slate-100 uppercase tracking-wider">Mapeamento de Colunas</h2>
        <button 
          onClick={onProcess} 
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
        >
          <Play size={18} fill="currentColor" /> Iniciar Processamento
        </button>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-slate-950 p-4 border-b border-slate-700 font-bold text-slate-400 text-xs uppercase tracking-widest">
          <div className="col-span-5 px-2">Coluna no Arquivo</div>
          <div className="col-span-2 flex justify-center opacity-0">Separator</div>
          <div className="col-span-5 px-2">Destino no Sistema</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar divide-y divide-slate-800">
          {headers.map((header) => (
            <div key={header} className="grid grid-cols-12 items-center p-4 hover:bg-slate-800/40 transition-colors">
              <div className="col-span-5 font-mono text-sm truncate px-2 text-slate-200 font-medium" title={header}>
                {header || <span className="text-slate-600 italic">Coluna sem nome</span>}
              </div>
              <div className="col-span-2 flex justify-center text-slate-600">
                <ArrowRight size={18} />
              </div>
              <div className="col-span-5 px-2">
                <select 
                  value={mapping[header] || "ignorar"}
                  onChange={(e) => onMappingChange(header, e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none cursor-pointer transition-all font-semibold appearance-none ${
                    mapping[header] === "ignorar" 
                      ? "bg-slate-950 border-slate-800 text-slate-500" 
                      : "bg-slate-900 border-cyan-600 text-cyan-400 ring-1 ring-cyan-900"
                  }`}
                >
                  <option className="bg-slate-900 text-slate-200 p-2" value="ignorar">Ignorar Coluna</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="full_name">Nome Completo</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="phone">Telefone / Celular</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="email">E-mail</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="cpf_cnpj">CPF / CNPJ</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="birth_date">Data de Nascimento</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="count_sales">Qtd. Pedidos</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="endereco_completo">Endereço Completo (IA)</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="address">Rua / Logradouro</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="address_number">Número</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="desc_district">Bairro</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="desc_city">Cidade</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="short_desc_state">UF</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="address_zipcode">CEP</option>
                  <option className="bg-slate-900 text-slate-200 p-2" value="address_complement">Complemento</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={onReset} 
        className="mt-6 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-2 transition-colors"
      >
        <RotateCcw size={14} /> Voltar e trocar arquivo
      </button>
    </div>
  );
}