
import React, { useState, useEffect } from 'react';
import { ProjectConfig } from '../types';
import { Rocket, Check, Calendar, Clock, MousePointerClick, RefreshCw, CalendarDays, ArrowRight, Box, Info } from 'lucide-react';

interface EnvironmentBuilderProps {
  config: ProjectConfig;
  onChange: (key: keyof ProjectConfig, value: any) => void;
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

export const EnvironmentBuilder: React.FC<EnvironmentBuilderProps> = ({ config, onChange, onContinue }) => {
  const [schedFreq, setSchedFreq] = useState<'Manual' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Manual');
  const [schedTime, setSchedTime] = useState('09:00');
  const [schedDays, setSchedDays] = useState<number[]>([]); 
  const [schedMonthDay, setSchedMonthDay] = useState<number>(1); 
  const [schedMonth, setSchedMonth] = useState<number>(1); 

  // --- Constants ---
  const WEEKDAYS = [
      { l: 'M', v: 1 }, { l: 'T', v: 2 }, { l: 'W', v: 3 }, { l: 'T', v: 4 }, 
      { l: 'F', v: 5 }, { l: 'S', v: 6 }, { l: 'S', v: 0 }
  ];
  const MONTHS = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const CONDA_ENVS = [
      'airflow-ml-3.11', 'airflow-data-3.10', 'custom-pandas-2.0', 'pytorch-gpu-env'
  ];

  // --- Effects ---
  useEffect(() => {
      if (!config.cron) {
          setSchedFreq('Manual');
          return;
      }
      const parts = config.cron.split(' ');
      if (parts.length !== 5) {
          setSchedFreq('Manual'); 
          return;
      }
      const [m, h, dom, mon, dow] = parts;

      if (dom === '*' && mon === '*' && dow === '*') { 
          setSchedFreq('Hourly');
      } else if (dom === '*' && mon === '*' && dow !== '*') { 
          setSchedFreq('Weekly');
          setSchedDays(dow.split(',').map(Number));
          setSchedTime(`${h.padStart(2,'0')}:${m.padStart(2,'0')}`);
      } else if (dom !== '*' && mon === '*' && dow === '*') {
          setSchedFreq('Monthly');
          setSchedMonthDay(parseInt(dom));
          setSchedTime(`${h.padStart(2,'0')}:${m.padStart(2,'0')}`);
      } else if (dom !== '*' && mon !== '*' && dow === '*') { 
          setSchedFreq('Yearly');
          setSchedMonth(parseInt(mon));
          setSchedMonthDay(parseInt(dom));
          setSchedTime(`${h.padStart(2,'0')}:${m.padStart(2,'0')}`);
      } else {
          setSchedFreq('Daily'); 
          setSchedTime(`${h.padStart(2,'0')}:${m.padStart(2,'0')}`);
      }
  }, []);

  useEffect(() => {
    if (schedFreq === 'Manual') {
        if (config.cron !== '') onChange('cron', '');
        return;
    }

    const [h, m] = schedTime.split(':');
    const safeH = h || '00';
    const safeM = m || '00';
    let c = '';

    switch (schedFreq) {
        case 'Hourly': c = `${safeM} * * * *`; break;
        case 'Daily': c = `${safeM} ${safeH} * * *`; break;
        case 'Weekly': c = `${safeM} ${safeH} * * ${schedDays.length > 0 ? schedDays.join(',') : '*'}`; break;
        case 'Monthly': c = `${safeM} ${safeH} ${schedMonthDay} * *`; break;
        case 'Yearly': c = `${safeM} ${safeH} ${schedMonthDay} ${schedMonth} *`; break;
    }

    if (c !== config.cron) onChange('cron', c);
  }, [schedFreq, schedTime, schedDays, schedMonthDay, schedMonth]);

  const toggleDay = (d: number) => {
      if (schedDays.includes(d)) setSchedDays(schedDays.filter(x => x !== d));
      else setSchedDays([...schedDays, d]);
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Deployment Stage */}
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-400 mb-3 block">Deployment Target</label>
        <div className="grid grid-cols-2 gap-4">
            {['SXB', 'LIL'].map((loc) => (
                <div 
                    key={loc}
                    onClick={() => onChange('stage', loc)}
                    className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3
                        ${config.stage === loc 
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20' 
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                        }
                    `}
                >
                     <div className={`p-2 rounded-lg ${config.stage === loc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                         <Rocket className="w-5 h-5" />
                     </div>
                     <div>
                         <div className={`font-bold text-sm ${config.stage === loc ? 'text-indigo-900' : 'text-slate-600'}`}>Production {loc}</div>
                         <div className="text-[10px] text-slate-400">Main Cluster</div>
                     </div>
                     {config.stage === loc && <Check className="w-5 h-5 text-indigo-600 ml-auto" />}
                </div>
            ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />
      
      {/* 2. Conda Environment */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                     <Box className="w-4 h-4" />
                 </div>
                 <div>
                     <h3 className="text-sm font-bold text-slate-700">Conda Environment</h3>
                     <p className="text-[10px] text-slate-400">Custom Python Dependencies</p>
                 </div>
              </div>
              <Toggle checked={config.use_conda} onChange={(v) => onChange('use_conda', v)} />
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${config.use_conda ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-50'}`}>
               <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Select Environment</label>
               <div className="relative">
                   <select 
                       value={config.condaenv}
                       onChange={(e) => onChange('condaenv', e.target.value)}
                       className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                   >
                       {CONDA_ENVS.map(env => <option key={env} value={env}>{env}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <ArrowRight className="w-4 h-4 rotate-90" />
                   </div>
               </div>
               <p className="text-[10px] text-slate-400 mt-2 ml-1">Listed from /etc/conda/envs/custom</p>
          </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* 3. Infrastructure */}
      <div>
         <label className="text-[10px] font-bold uppercase text-slate-400 mb-3 block">Resources</label>
         <div className="flex flex-col gap-4">
             {/* NAS */}
             <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                 <div className="flex flex-col">
                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                        <Toggle checked={config.use_nas} onChange={(v) => onChange('use_nas', v)} />
                        <span className="text-xs font-bold text-slate-700">Using NAS</span>
                    </label>
                    {config.use_nas && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded ml-12">
                            <Info className="w-3 h-3" />
                            Please contact P630 for configuration
                        </div>
                    )}
                 </div>
             </div>

             {/* GPU */}
             <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                 <div className="flex flex-col">
                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                        <Toggle checked={config.use_gpu} onChange={(v) => onChange('use_gpu', v)} />
                        <span className="text-xs font-bold text-slate-700">Use GPU</span>
                    </label>
                    {config.use_gpu && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded ml-12">
                            <Check className="w-3 h-3" />
                            1 MIG assigned
                        </div>
                    )}
                 </div>
             </div>
         </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* 4. Graphic Schedule */}
      <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-4 block">Job Schedule</label>
          <div className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                      { id: 'Manual', icon: MousePointerClick, label: 'Manual' },
                      { id: 'Hourly', icon: Clock, label: 'Hourly' },
                      { id: 'Daily', icon: RefreshCw, label: 'Daily' },
                      { id: 'Weekly', icon: Calendar, label: 'Weekly' },
                      { id: 'Monthly', icon: CalendarDays, label: 'Monthly' },
                      { id: 'Yearly', icon: Calendar, label: 'Yearly' },
                  ].map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setSchedFreq(opt.id as any)}
                        className={`
                            cursor-pointer p-2 py-3 rounded-xl border transition-all flex flex-col items-center gap-2
                            ${schedFreq === opt.id 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                            }
                        `}
                      >
                          <opt.icon className="w-4 h-4" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{opt.label}</span>
                      </div>
                  ))}
              </div>

              {schedFreq !== 'Manual' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Execution Time</label>
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 shadow-sm">
                                      <Clock className="w-5 h-5" />
                                  </div>
                                  <input 
                                      type="time" 
                                      value={schedTime}
                                      onChange={(e) => setSchedTime(e.target.value)}
                                      className="text-2xl font-bold text-slate-700 bg-transparent outline-none font-mono tracking-tight"
                                  />
                              </div>
                          </div>
                          
                          {schedFreq === 'Weekly' && (
                              <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Run Days</label>
                                  <div className="flex gap-2">
                                      {WEEKDAYS.map((d, i) => {
                                          const isSelected = schedDays.includes(d.v);
                                          return (
                                              <button
                                                  key={i}
                                                  onClick={() => toggleDay(d.v)}
                                                  className={`
                                                      w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border
                                                      ${isSelected 
                                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30 scale-105' 
                                                          : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                                                      }
                                                  `}
                                              >
                                                  {d.l}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          )}

                          {(schedFreq === 'Monthly' || schedFreq === 'Yearly') && (
                              <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Day of Month</label>
                                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                                      {Array.from({length: 31}).map((_, i) => (
                                          <button
                                            key={i}
                                            onClick={() => setSchedMonthDay(i+1)}
                                            className={`
                                                w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-all border
                                                ${schedMonthDay === i + 1
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm z-10'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                                }
                                            `}
                                          >
                                              {i + 1}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {schedFreq === 'Yearly' && (
                              <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Month</label>
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                      {MONTHS.map((m, i) => (
                                          <button
                                            key={m}
                                            onClick={() => setSchedMonth(i+1)}
                                            className={`
                                                py-2 rounded text-xs font-bold uppercase transition-all border
                                                ${schedMonth === i + 1
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                                }
                                            `}
                                          >
                                              {m}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Continue Action */}
      <div className="flex justify-end pt-4">
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
