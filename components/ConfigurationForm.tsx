"use client";

import { useEffect, useState } from "react";
import { fetchStates, fetchCities } from "@/services/ibgeApi";
import { Settings, MapPin, Phone, Store, Trash2, SlidersHorizontal } from "lucide-react";

interface ConfigProps {
  settings: {
    idStore: string;
    defaultDDD: string;
    defaultState: string;
    defaultCity: string;
    // Novas configurações
    phoneFormat: 'formatted' | 'numbers_only';
    discardRowsWithoutAddress: boolean;
  };
  setSettings: (s: any) => void;
}

export default function ConfigurationForm({ settings, setSettings }: ConfigProps) {
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ nome: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetchStates().then(setStates);
  }, []);

  useEffect(() => {
    if (settings.defaultState) {
      setLoadingCities(true);
      fetchCities(settings.defaultState).then((data: { nome: string }[]) => {
        setCities(data);
        setLoadingCities(false);
      });
    } else {
      setCities([]);
    }
  }, [settings.defaultState]);

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600";
  const labelClass = "block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2";

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
        <div className="p-2 bg-cyan-500/10 rounded-lg"><Settings className="text-cyan-400" size={24} /></div>
        <div>
          <h2 className="text-xl font-bold text-white">Configurações Padrão</h2>
          <p className="text-sm text-slate-400">Personalize o processamento (Opcional)</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass}><Store size={14}/> ID da Loja</label>
          <input type="text" placeholder="Ex: 101" className={inputClass} value={settings.idStore} onChange={(e) => handleChange("idStore", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}><Phone size={14}/> DDD Padrão</label>
          <input type="text" placeholder="Ex: 11" className={inputClass} maxLength={2} value={settings.defaultDDD} onChange={(e) => handleChange("defaultDDD", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><MapPin size={14}/> Estado (UF)</label>
            <select className={`${inputClass} appearance-none cursor-pointer`} value={settings.defaultState} onChange={(e) => { handleChange("defaultState", e.target.value); handleChange("defaultCity", ""); }}>
              <option value="">Selecione...</option>
              {states.map((uf) => (<option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <select className={`${inputClass} appearance-none cursor-pointer disabled:opacity-50`} value={settings.defaultCity} onChange={(e) => handleChange("defaultCity", e.target.value)} disabled={!settings.defaultState || loadingCities}>
              <option value="">{loadingCities ? "Carregando..." : settings.defaultState ? "Selecione..." : "Escolha UF"}</option>
              {cities.map((city) => (<option key={city.nome} value={city.nome}>{city.nome}</option>))}
            </select>
          </div>
        </div>
        
        {/* NOVAS CONFIGURAÇÕES AVANÇADAS */}
        <div className="pt-4 border-t border-slate-700">
            <label className={labelClass}><SlidersHorizontal size={14}/> Formato do Resultado</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <button onClick={() => handleChange('phoneFormat', 'formatted')} className={`p-2 rounded-lg border transition-colors ${settings.phoneFormat === 'formatted' ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800/50 border-slate-700'}`}>Telefone Formatado</button>
                <button onClick={() => handleChange('phoneFormat', 'numbers_only')} className={`p-2 rounded-lg border transition-colors ${settings.phoneFormat === 'numbers_only' ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800/50 border-slate-700'}`}>Apenas Números</button>
            </div>
        </div>
        <div className="pt-4">
            <label className={labelClass}><Trash2 size={14}/> Limpeza de Dados</label>
            <label className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-cyan-500 focus:ring-cyan-600" checked={settings.discardRowsWithoutAddress} onChange={(e) => handleChange('discardRowsWithoutAddress', e.target.checked)} />
                <span className="text-sm text-slate-300">Descartar clientes sem endereço completo (rua, número, bairro)</span>
            </label>
        </div>
      </div>
    </div>
  );
}