
import React from 'react';
import { ProjectConfig, SILOTS_LIL, SILOTS_SXB } from '../types';
import { Database, FolderOpen, HardDrive, ArrowRight, FolderInput, FolderOutput } from 'lucide-react';

interface IOBuilderProps {
  config: ProjectConfig;
  onChange: (key: keyof ProjectConfig, value: any) => void;
  onOpenFilePicker: (target: 'input' | 'output') => void;
  onContinue: () => void;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <div 
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
);

export const IOBuilder: React.FC<IOBuilderProps> = ({ config, onChange, onOpenFilePicker, onContinue }) => {
  const currentSilots = config.stage === 'SXB' ? SILOTS_SXB : SILOTS_LIL;

  return (
    <div className="space-y-8">
        
        {/* 1. Database Connection (Vertica) */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <Database className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700">Vertica Connection</h3>
                        <p className="text-[10px] text-slate-400">Optional SQL Database Link</p>
                    </div>
                 </div>
                 <Toggle checked={config.use_vertica} onChange={(v) => onChange('use_vertica', v)} />
             </div>

             <div className={`transition-all duration-300 overflow-hidden ${config.use_vertica ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-50'}`}>
                 <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Select Silot Context ({config.stage})</label>
                 <div className="flex gap-3">
                     {currentSilots.map(s => (
                         <button 
                            key={s} 
                            onClick={() => onChange('silot', s)}
                            className={`
                                flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all border
                                ${config.silot === s 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                }
                            `}
                         >
                             {s}
                         </button>
                     ))}
                 </div>
             </div>
        </div>

        {/* 2. File System / Volumes */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <HardDrive className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-700">Volume I/O</h3>
                    <p className="text-[10px] text-slate-400">Optional Datalab Paths</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Folder */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold uppercase text-slate-400">Input Source</label>
                         <Toggle checked={config.use_input} onChange={(v) => onChange('use_input', v)} />
                    </div>
                    {config.use_input && (
                        <div className="w-full group cursor-pointer animate-in fade-in slide-in-from-top-1" onClick={() => onOpenFilePicker('input')}>
                            <div className="relative flex items-center w-full p-1 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition-all shadow-sm group-hover:shadow-md">
                                <div className="flex items-center justify-center w-10 h-10 ml-1 rounded-lg bg-emerald-50 text-emerald-600">
                                    <FolderInput className="w-5 h-5" />
                                </div>
                                <div className="flex-1 px-3 py-1 overflow-hidden">
                                    <div className={`text-sm font-medium truncate ${config.datalab_in ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                        {config.datalab_in || 'Select input folder...'}
                                    </div>
                                </div>
                                <div className="pr-3 text-slate-300 group-hover:text-emerald-500">
                                    <FolderOpen className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Output Folder */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold uppercase text-slate-400">Output Destination</label>
                         <Toggle checked={config.use_output} onChange={(v) => onChange('use_output', v)} />
                    </div>
                    {config.use_output && (
                        <div className="w-full group cursor-pointer animate-in fade-in slide-in-from-top-1" onClick={() => onOpenFilePicker('output')}>
                            <div className="relative flex items-center w-full p-1 bg-white border border-slate-200 rounded-xl hover:border-amber-400 transition-all shadow-sm group-hover:shadow-md">
                                <div className="flex items-center justify-center w-10 h-10 ml-1 rounded-lg bg-amber-50 text-amber-600">
                                    <FolderOutput className="w-5 h-5" />
                                </div>
                                <div className="flex-1 px-3 py-1 overflow-hidden">
                                    <div className={`text-sm font-medium truncate ${config.datalab_out ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                        {config.datalab_out || 'Select output folder...'}
                                    </div>
                                </div>
                                <div className="pr-3 text-slate-300 group-hover:text-amber-500">
                                    <FolderOpen className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Continue Action */}
        <div className="flex justify-end pt-2">
             <button 
                onClick={onContinue}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
             >
                Continue <ArrowRight className="w-4 h-4" />
             </button>
        </div>
    </div>
  );
};
