"use client";

import { useState } from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import ColumnMapper from "@/components/ColumnMapper";
import ResultsTable from "@/components/ResultsTable";
import ConfigurationForm from "@/components/ConfigurationForm";

import { parseAddressIntelligently } from "@/lib/addressParser";
import { validateAndFormatPhone } from "@/lib/validators";
import { fetchAddressByCep } from "@/services/cepApi";

type RawRow = Record<string, string>;
type ProcessedRow = Record<string, any>;

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<{ raw: RawRow[]; headers: string[] } | null>(null);
  const [settings, setSettings] = useState({
    idStore: "", defaultCity: "", defaultState: "", defaultDDD: "",
    phoneFormat: 'formatted' as 'formatted' | 'numbers_only',
    discardRowsWithoutAddress: false,
  });
  const [districtList, setDistrictList] = useState<ProcessedRow[] | null>(null);
  const [districtIndex, setDistrictIndex] = useState<Set<string>>(new Set());
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [processedData, setProcessedData] = useState<{validos: ProcessedRow[], invalidos: ProcessedRow[]} | null>(null);
  const [progress, setProgress] = useState(0);

  const normalizeText = (text: any) => {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const handleClientFileLoaded = (data: RawRow[], headers: string[]) => {
    const initialMap: Record<string, string> = {};
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes("nome")) initialMap[h] = "full_name";
      else if (lower.includes("tel")) initialMap[h] = "phone";
      else if (lower.includes("end")) initialMap[h] = "endereco_completo";
      else if (lower.includes("cep")) initialMap[h] = "address_zipcode";
      else initialMap[h] = "ignorar";
    });
    setMapping(initialMap);
    setFiles({ raw: data, headers });
    setStep(2);
  };
  
  const handleDistrictFileLoaded = (data: RawRow[]) => {
    const index = new Set<string>();
    const normalizedData = data.map(row => {
      const cidade = row.cidade || row.Cidade || "";
      const bairro = row.bairro || row.Bairro || row.Bairros || "";
      index.add(`${normalizeText(cidade)}|${normalizeText(bairro)}`);
      return { cidade, bairro, estado: row.estado || row.Estado || "" };
    });
    setDistrictIndex(index);
    setDistrictList(normalizedData);
  };

  const runProcessing = async () => {
    if (!files) return;
    setStep(3);
    setProgress(0);

    const expandedRows: RawRow[] = [];
    const addressHeader = Object.keys(mapping).find(h => mapping[h] === 'endereco_completo' || mapping[h] === 'address');
    
    files.raw.forEach(row => {
      const addrVal = addressHeader ? row[addressHeader] : null;
      if (addrVal && addrVal.includes(';')) {
        addrVal.split(';').forEach(p => { if (p.trim()) expandedRows.push({ ...row, [addressHeader!]: p.trim() }); });
      } else { expandedRows.push(row); }
    });

    const total = expandedRows.length;
    const validos: ProcessedRow[] = [];
    const invalidos: ProcessedRow[] = [];
    const BATCH_SIZE = 500;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = expandedRows.slice(i, i + BATCH_SIZE);
      chunk.forEach((row) => {
        let newRow: ProcessedRow = { ...row };
        let motivoInvalidacao = "";
        let isAddressValidated = false;

        const mappedRow: ProcessedRow = {};
        Object.entries(mapping).forEach(([originalHeader, targetKey]) => {
          if (targetKey !== "ignorar") mappedRow[targetKey] = row[originalHeader] || "";
        });

        newRow = { ...newRow, ...mappedRow };

        // CORREÇÃO AQUI: Lógica de exclusão de colunas ignoradas e duplicadas
        for (const h in mapping) {
          const destino = mapping[h];
          // Se marcou para ignorar OU se a coluna foi renomeada para outro nome, apaga a original
          if (destino === 'ignorar' || (destino !== h && newRow.hasOwnProperty(h))) {
            delete newRow[h];
          }
        }

        if (newRow["endereco_completo"]) {
          const parsed = parseAddressIntelligently(String(newRow["endereco_completo"]));
          newRow = { ...newRow, ...parsed };
          delete newRow["endereco_completo"];
        }

        const phoneFormatted = validateAndFormatPhone(String(newRow["phone"] || ""), settings.defaultDDD);
        if (!phoneFormatted || phoneFormatted.length < 10) {
          motivoInvalidacao = "Telefone inválido";
        } else {
          newRow["phone"] = settings.phoneFormat === 'numbers_only' ? phoneFormatted.replace(/\D/g, '') : phoneFormatted;
        }

        if (districtIndex.size > 0) {
          const key = `${normalizeText(newRow.desc_city)}|${normalizeText(newRow.desc_district)}`;
          if (districtIndex.has(key)) isAddressValidated = true;
        } 
        
        if (!newRow["desc_city"] && settings.defaultCity) newRow["desc_city"] = settings.defaultCity;
        if (!newRow["short_desc_state"] && settings.defaultState) newRow["short_desc_state"] = settings.defaultState;
        if (settings.idStore) newRow["id_store"] = settings.idStore;

        if (settings.discardRowsWithoutAddress && !motivoInvalidacao && !isAddressValidated) {
          const hasBasic = (newRow.address?.length > 3 && newRow.desc_district?.length > 2);
          if (!hasBasic) motivoInvalidacao = "Endereço não validado ou incompleto";
        }
        
        if (motivoInvalidacao) {
          newRow.motivo_invalidacao = motivoInvalidacao;
          invalidos.push(newRow);
        } else {
          validos.push(newRow);
        }
      });

      setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / total) * 100)));
      await new Promise(r => setTimeout(r, 1)); 
    }

    setProcessedData({ validos, invalidos });
    setStep(4);
  };

  const handleReset = () => {
    setStep(1); setProcessedData(null); setFiles(null); setDistrictList(null); setDistrictIndex(new Set());
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-cyan-500">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 lg:p-12">
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">Organizador de Clientes</h1>
            <p className="text-slate-400 mt-2 text-lg">Processamento de alta escala com limpeza inteligente</p>
          </div>
          <div className="px-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-xs font-mono text-cyan-400">v5.1 Fixed</div>
        </header>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-5 h-full"><ConfigurationForm settings={settings} setSettings={setSettings} /></div>
            <div className="lg:col-span-7 flex flex-col h-full gap-8">
               <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 flex-1 shadow-2xl shadow-black/50">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">1. Importar Clientes</h3>
                  <FileUploader onFileLoaded={handleClientFileLoaded} />
               </div>
               <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 flex-1">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">2. Base de Bairros (Opcional)</h3>
                  {districtList ? (
                    <div className="bg-emerald-900/50 border border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <CheckCircle className="text-emerald-400 h-16 w-16 mb-4" />
                      <h4 className="text-xl font-bold text-white">Base Carregada!</h4>
                      <p className="text-slate-300 mb-6">{districtList.length.toLocaleString()} registros.</p>
                      <button onClick={() => {setDistrictList(null); setDistrictIndex(new Set());}} className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-full hover:bg-slate-600 transition-colors flex items-center gap-2"><RefreshCw size={14} /> Mudar arquivo</button>
                    </div>
                  ) : (
                    <FileUploader onFileLoaded={handleDistrictFileLoaded} title="Carregar CSV de Bairros" subtitle="Estado, Cidade, Bairros" />
                  )}
               </div>
            </div>
          </div>
        )}

        {step === 2 && files && (
           <div className="max-w-4xl mx-auto"><ColumnMapper headers={files.headers} mapping={mapping} onMappingChange={(header, value) => setMapping(prev => ({ ...prev, [header]: value }))} onProcess={runProcessing} onReset={handleReset} /></div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-32 animate-in zoom-in">
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl text-cyan-400">{progress}%</div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Processando...</h3>
          </div>
        )}

        {step === 4 && <ResultsTable data={processedData} fileNameSuffix={settings.idStore} onReset={handleReset} />}
      </div>
    </div>
  );
}