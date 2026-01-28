"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { CheckCircle, Download, RefreshCw, AlertTriangle, FileSpreadsheet } from "lucide-react";

type ProcessedRow = Record<string, any>;

interface ResultsTableProps {
  data: {
    validos: ProcessedRow[];
    invalidos: ProcessedRow[];
  } | null;
  fileNameSuffix: string;
  onReset: () => void;
}

export default function ResultsTable({ data, fileNameSuffix, onReset }: ResultsTableProps) {
  const [activeTab, setActiveTab] = useState<'validos' | 'invalidos'>('validos');
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.validos && data.validos.length > 0) {
      const initialMap: Record<string, string> = {};
      Object.keys(data.validos[0]).forEach(key => {
        initialMap[key] = key;
      });
      setColumnMap(initialMap);
    } else if (data?.invalidos && data.invalidos.length > 0) {
      const initialMap: Record<string, string> = {};
      Object.keys(data.invalidos[0]).forEach(key => {
        initialMap[key] = key;
      });
      setColumnMap(initialMap);
    }
  }, [data]);
  
  if (!data) return null;

  const { validos, invalidos } = data;
  const dataToShow = activeTab === 'validos' ? validos : invalidos;

  const handleColumnRename = (originalName: string, newName: string) => {
    setColumnMap(prev => ({ ...prev, [originalName]: newName }));
  };

  const downloadCSV = (dataToDownload: ProcessedRow[], type: 'validos' | 'invalidos') => {
    if (dataToDownload.length === 0) return;

    const finalData = dataToDownload.map(row => {
      const newRow: ProcessedRow = {};
      for (const originalKey in row) {
        const newKey = columnMap[originalKey] || originalKey;
        newRow[newKey] = row[originalKey];
      }
      return newRow;
    });

    const csv = Papa.unparse(finalData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clientes_${type}_${fileNameSuffix || "lista"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
          <p className="text-4xl font-bold text-white">{validos.length.toLocaleString()}</p>
          <p className="text-slate-400">Clientes Válidos</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3" />
          <p className="text-4xl font-bold text-white">{invalidos.length.toLocaleString()}</p>
          <p className="text-slate-400">Clientes Inválidos</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-center">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-cyan-400 mb-3" />
          <p className="text-4xl font-bold text-white">{(validos.length + invalidos.length).toLocaleString()}</p>
          <p className="text-slate-400">Total Processado</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex border-b border-slate-700">
            <button onClick={() => setActiveTab('validos')} className={`px-5 py-2 text-sm font-semibold transition-colors ${activeTab === 'validos' ? 'border-b-2 border-cyan-400 text-white' : 'text-slate-400 hover:text-white'}`}>Válidos ({validos.length})</button>
            <button onClick={() => setActiveTab('invalidos')} className={`px-5 py-2 text-sm font-semibold transition-colors ${activeTab === 'invalidos' ? 'border-b-2 border-amber-400 text-white' : 'text-slate-400 hover:text-white'}`}>Inválidos ({invalidos.length})</button>
          </div>
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-semibold rounded-lg transition-colors"><RefreshCw size={16} /> Nova Lista</button>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
              <tr>
                {dataToShow.length > 0 && Object.keys(dataToShow[0]).map(key => (
                  <th key={key} className="px-4 py-3 font-bold border-b border-slate-700 whitespace-nowrap">
                    <input
                      type="text"
                      value={columnMap[key] || key}
                      onChange={e => handleColumnRename(key, e.target.value)}
                      className="bg-transparent text-cyan-400 font-bold uppercase p-1 w-full outline-none focus:bg-slate-700 rounded-md transition-colors"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dataToShow.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors even:bg-slate-800/10">
                  {Object.keys(row).map((key, j) => (
                    <td key={j} className="px-4 py-3 text-slate-400 whitespace-nowrap min-w-[150px]">
                      {String(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">Mostrando as 5 primeiras linhas. O download contém o arquivo completo.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => downloadCSV(validos, 'validos')} disabled={validos.length === 0} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Download size={20} /> Baixar Válidos ({validos.length})</button>
        <button onClick={() => downloadCSV(invalidos, 'invalidos')} disabled={invalidos.length === 0} className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Download size={20} /> Baixar Inválidos ({invalidos.length})</button>
      </div>
    </div>
  );
}