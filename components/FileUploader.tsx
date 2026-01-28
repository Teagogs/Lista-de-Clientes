"use client";

import React from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploaderProps {
  onFileLoaded: (data: Record<string, string>[], headers: string[]) => void;
  title?: string;
  subtitle?: string;
}

export default function FileUploader({ onFileLoaded, title, subtitle }: FileUploaderProps) {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const headers = results.meta.fields || [];
        const data = results.data;
        onFileLoaded(data, headers);
      },
    });
  };

  return (
    <div className="group relative w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative border-2 border-dashed border-slate-600 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer">
        <input 
          type="file" 
          accept=".csv" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
          onChange={handleFileUpload}
        />
        
        <div className="bg-slate-800 p-5 rounded-full mb-5 shadow-lg group-hover:scale-110 group-hover:bg-cyan-900/30 transition-transform duration-300">
          <Upload size={40} className="text-cyan-400" />
        </div>
        
        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {title || "Clique ou arraste o arquivo"}
        </h4>
        <p className="text-slate-400 text-sm mb-6 max-w-xs text-center">
          {subtitle || "Selecione sua lista de clientes para iniciar a limpeza automática."}
        </p>

        <button className="px-6 py-2 bg-slate-700 text-white text-sm font-semibold rounded-full flex items-center gap-2 group-hover:bg-cyan-600 transition-colors">
          <FileSpreadsheet size={16} /> Selecionar CSV
        </button>
      </div>
    </div>
  );
}