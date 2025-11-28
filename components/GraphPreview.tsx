
import React, { useState } from 'react';
import { PipelineStep } from '../types';
import { ZoomIn, ZoomOut, Maximize, Play, Flag } from 'lucide-react';

interface GraphPreviewProps {
  pipeline: PipelineStep[];
}

export const GraphPreview: React.FC<GraphPreviewProps> = ({ pipeline }) => {
  const [zoom, setZoom] = useState(1);

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'border-l-red-500';
    if (p === 'mid') return 'border-l-blue-500';
    return 'border-l-slate-300'; 
  };

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden flex flex-col select-none">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
                backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
                backgroundSize: '24px 24px' 
            }}>
       </div>

       {/* Canvas */}
       <div className="flex-1 overflow-auto flex items-center justify-start p-12 cursor-grab active:cursor-grabbing z-0 custom-scrollbar">
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: 'left center', transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
            className="flex items-center min-w-max pl-10"
          >
             {/* Start Node */}
             <div className="flex items-center">
                 <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 z-10 border-4 border-white">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                 </div>
                 <div className="w-12 h-0.5 bg-slate-300"></div>
             </div>

             {/* Steps Loop (Horizontal) */}
             {pipeline.map((step, idx) => (
                 <div key={step.id} className="flex items-center">
                     
                     {/* Step Container Visual */}
                     <div className="relative border border-dashed border-slate-300 rounded-xl p-2 bg-slate-50/50">
                        <div className="absolute -top-3 left-2 bg-[#F8FAFC] px-1 text-[9px] font-bold text-slate-400 uppercase">Step {idx + 1}</div>
                        
                        {/* Tasks Block (Vertical Stack for Parallel) */}
                        <div className="flex flex-col gap-2">
                            {step.tasks.map((task) => (
                                <div key={task.id} className={`
                                    w-40 p-2 rounded-lg shadow-sm bg-white border border-slate-200 border-l-4
                                    ${getPriorityColor(task.priority)}
                                `}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{task.priority}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 truncate block">{task.name}</span>
                                </div>
                            ))}
                        </div>
                     </div>

                     {/* Connector */}
                     <div className="w-12 h-0.5 bg-slate-300 relative mx-1">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                     </div>
                 </div>
             ))}

             {/* End Node */}
             <div className="flex items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow-lg z-10 border-4 border-white">
                    <Flag className="w-4 h-4 text-white fill-white" />
                 </div>
             </div>
          </div>
       </div>

       {/* Floating Controls */}
       <div className="absolute bottom-6 right-6 z-10 flex gap-2 bg-white/90 backdrop-blur rounded-full shadow-xl shadow-slate-200 border border-slate-100 p-1.5">
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setZoom(1)} className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><Maximize className="w-4 h-4" /></button>
       </div>
    </div>
  );
};
