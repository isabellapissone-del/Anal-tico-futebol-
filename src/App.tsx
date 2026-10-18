import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Calculator, AlertCircle, ImagePlus, X } from 'lucide-react';

export default function App() {
  const [tableData, setTableData] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMimeType, setImageMimeType] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  const [matchup, setMatchup] = useState('');
  const [matchupImageBase64, setMatchupImageBase64] = useState('');
  const [matchupImageMimeType, setMatchupImageMimeType] = useState('');
  const [matchupImagePreview, setMatchupImagePreview] = useState('');

  const [bookmakerOdds, setBookmakerOdds] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImageMimeType(file.type);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageBase64('');
    setImageMimeType('');
    setImagePreview('');
  };

  const handleMatchupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMatchupImageBase64(reader.result as string);
        setMatchupImageMimeType(file.type);
        setMatchupImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMatchupImage = () => {
    setMatchupImageBase64('');
    setMatchupImageMimeType('');
    setMatchupImagePreview('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableData.trim() && !imageBase64) {
      setError('Por favor, insira a tabela em texto ou faça o upload de uma imagem.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableData,
          matchup,
          bookmakerOdds,
          imageBase64,
          imageMimeType,
          matchupImageBase64,
          matchupImageMimeType
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar dados');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Football Stats & Odds Analyzer</h1>
            <p className="text-slate-400">Estimativa de probabilidades e xG baseada em Poisson</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleAnalyze} className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-5">
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  1. Tabela de Classificação *
                </label>
                <div className="space-y-4">
                  <textarea
                    value={tableData}
                    onChange={(e) => setTableData(e.target.value)}
                    placeholder="Cole aqui a tabela de classificação (texto puro)..."
                    className="w-full h-32 p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all text-sm font-mono"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow h-px bg-slate-800"></div>
                    <span className="text-xs font-medium text-slate-500 uppercase">Ou envie uma imagem</span>
                    <div className="flex-grow h-px bg-slate-800"></div>
                  </div>

                  {imagePreview ? (
                    <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 group">
                      <img src={imagePreview} alt="Tabela" className="w-full h-32 object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500"><span className="font-semibold text-indigo-400">Upload de Imagem</span> (Opcional)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-sm font-semibold text-slate-300">
                  2. Partidas da Rodada (Final de Semana)
                </label>
                <div className="space-y-4">
                  <textarea
                    value={matchup}
                    onChange={(e) => setMatchup(e.target.value)}
                    placeholder="Cole as partidas aqui. Ex:&#10;Time A x Time B&#10;Time C x Time D"
                    className="w-full h-32 p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all text-sm font-mono"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow h-px bg-slate-800"></div>
                    <span className="text-xs font-medium text-slate-500 uppercase">Ou envie uma imagem dos jogos</span>
                    <div className="flex-grow h-px bg-slate-800"></div>
                  </div>

                  {matchupImagePreview ? (
                    <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 group">
                      <img src={matchupImagePreview} alt="Partidas" className="w-full h-32 object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeMatchupImage}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500"><span className="font-semibold text-indigo-400">Upload de Imagem</span> (Opcional)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleMatchupImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-sm font-semibold text-slate-300">
                  3. Odds da Casa (Opcional)
                </label>
                <input
                  type="text"
                  value={bookmakerOdds}
                  onChange={(e) => setBookmakerOdds(e.target.value)}
                  placeholder="Ex: 1.80 / 3.40 / 4.20"
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-950/50 text-red-400 border border-red-900/50 rounded-xl text-sm flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <span>Gerar Análise</span>
                )}
              </button>
            </form>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 min-h-[600px]">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 py-20">
                  <Calculator className="w-16 h-16 opacity-20" />
                  <p className="text-center">Preencha os dados ao lado para gerar a análise estatística completa.</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-500 space-y-4 py-20">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="font-medium animate-pulse">Processando modelo estatístico...</p>
                </div>
              )}

              {result && !loading && (
                <div className="prose prose-invert prose-indigo max-w-none overflow-auto">
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
