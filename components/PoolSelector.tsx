
import React from 'react';
import { Server, Cpu, CircuitBoard } from 'lucide-react';

interface PoolSelectorProps {
  value: string;
  onChange: (val: string) => void;
  lddata: string;
}

export const PoolSelector: React.FC<PoolSelectorProps> = ({ value, onChange, lddata }) => {
  const pools = [
    { id: 'pool_standard', name: `${lddata}_std_pool`, icon: Server, color: 'indigo' },
    { id: 'pool_high_mem', name: `${lddata}_high_mem`, icon: CircuitBoard, color: 'purple' },
    { id: 'pool_compute', name: `${lddata}_compute`, icon: Cpu, color: 'sky' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-4 min-w-max">
            {pools.map((pool) => {
                const isSelected = value === pool.name;
                return (
                    <div 
                        key={pool.id}
                        onClick={() => onChange(pool.name)}
                        className={`
                            group relative cursor-pointer w-64 p-4 rounded-2xl border-2 transition-all duration-300
                            ${isSelected 
                                ? `border-${pool.color}-500 bg-white shadow-xl shadow-${pool.color}-500/10 ring-4 ring-${pool.color}-500/5` 
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'
                            }
                        `}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`
                                p-2.5 rounded-xl transition-colors
                                ${isSelected ? `bg-${pool.color}-50 text-${pool.color}-600` : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}
                            `}>
                                <pool.icon className="w-5 h-5" />
                            </div>
                            {isSelected && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider text-${pool.color}-600 bg-${pool.color}-50 px-2 py-1 rounded-full`}>
                                    Selected
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-slate-800 text-sm mb-1">{pool.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                            <span>0.5 vCPU</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>5GB RAM / Slot</span>
                        </div>

                        {/* 3D Cube Slots */}
                        <div className="flex gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100/50">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`
                                        w-8 h-8 rounded-md transition-all duration-300 relative
                                        ${isSelected 
                                            ? `bg-gradient-to-br from-${pool.color}-400 to-${pool.color}-600 shadow-sm transform hover:-translate-y-0.5` 
                                            : 'bg-slate-200'
                                        }
                                    `}
                                    title="Available Slot"
                                >
                                    {/* 3D Top Edge */}
                                    <div className={`absolute top-0 inset-x-0 h-2 bg-white/20 rounded-t-md`}></div>
                                </div>
                            ))}
                        </div>
                        <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">5 Slots Capacity</div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
