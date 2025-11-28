import React, { useState } from 'react';
import { generateCronFromText } from '../services/geminiService';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

interface CronGeneratorProps {
  value: string;
  onChange: (val: string) => void;
}

export const CronGenerator: React.FC<CronGeneratorProps> = ({ value, onChange }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const cron = await generateCronFromText(prompt);
    if (cron) {
      onChange(cron);
    }
    setLoading(false);
  };

  return (
    <div className="mb-6 p-1 rounded-lg border border-blue-100 bg-blue-50/50">
      <div className="p-4 bg-white rounded-md shadow-sm border border-blue-100/50">
        <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Wand2 className="w-3 h-3 text-blue-500" /> Smart Schedule
        </label>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="e.g. Every Monday at 9am..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
          />
          <button
            onClick={handleAiGenerate}
            disabled={loading || !prompt}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400 font-mono text-xs">CRON:</span>
          </div>
          <input
            type="text"
            className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="0 9 * * 2"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-right">Leave empty for manual trigger</p>
      </div>
    </div>
  );
};