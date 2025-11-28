
import React, { useState } from 'react';
import { Task, PipelineStep } from '../types';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface TaskBuilderProps {
  pipeline: PipelineStep[];
  pools: string[]; // Access to available pools for defaults
  onChange: (pipeline: PipelineStep[]) => void;
  onEditTask: (stepIdx: number, taskIdx: number, rect: DOMRect) => void;
  poolLimit?: number; 
  onContinue: () => void;
}

export const TaskBuilder: React.FC<TaskBuilderProps> = ({ pipeline, pools, onChange, onEditTask, poolLimit = 5, onContinue }) => {
  const [draggedItem, setDraggedItem] = useState<{ stepIdx: number, taskIdx: number } | null>(null);
  const [dragOverStep, setDragOverStep] = useState<number | null>(null);

  const handleSliderChange = (val: number) => {
    const currentLen = pipeline.length;
    if (val > currentLen) {
        const toAdd = val - currentLen;
        const newSteps: PipelineStep[] = Array.from({ length: toAdd }).map((_, i) => ({
            id: `step_${Date.now()}_${i}`,
            tasks: [{
                id: `t_${Date.now()}_${Math.random()}`,
                name: `task_step_${currentLen + i + 1}`,
                imports: '',
                code: '# Add your logic here...',
                priority: 'low',
                pool_slots: 1,
                type: 'python',
                selected_pool: pools.length > 0 ? pools[0] : undefined
            }]
        }));
        onChange([...pipeline, ...newSteps]);
    } else if (val < currentLen) {
        onChange(pipeline.slice(0, val));
    }
  };

  const addTaskToStep = (stepIndex: number) => {
    const newPipeline = [...pipeline];
    newPipeline[stepIndex].tasks.push({
        id: `t_${Date.now()}_${Math.random()}`,
        name: `parallel_task_${newPipeline[stepIndex].tasks.length + 1}`,
        imports: '',
        code: '# Add logic...',
        priority: 'low',
        pool_slots: 1,
        type: 'python',
        selected_pool: pools.length > 0 ? pools[0] : undefined
    });
    onChange(newPipeline);
  };

  const removeTask = (stepIndex: number, taskIndex: number) => {
    const newPipeline = [...pipeline];
    if (newPipeline.length === 1 && newPipeline[0].tasks.length === 1) return; // Prevent empty
    newPipeline[stepIndex].tasks.splice(taskIndex, 1);
    onChange(newPipeline);
  };

  const onDragStart = (e: React.DragEvent, stepIdx: number, taskIdx: number) => {
    setDraggedItem({ stepIdx, taskIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, targetStepIdx: number) => {
    e.preventDefault();
    setDragOverStep(null);
    if (!draggedItem) return;

    const { stepIdx: srcStep, taskIdx: srcTask } = draggedItem;
    const newPipeline = JSON.parse(JSON.stringify(pipeline));
    
    const [movedTask] = newPipeline[srcStep].tasks.splice(srcTask, 1);
    newPipeline[targetStepIdx].tasks.push(movedTask);
    
    onChange(newPipeline);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-8">
        
        {/* Step Control */}
        <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sequence Length</span>
                <span className="text-[10px] text-slate-400 font-medium">Define sequential stages</span>
            </div>
            <div className="flex items-center gap-4 w-1/2">
                <input 
                    type="range" min="1" max="10" 
                    value={pipeline.length || 1}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                />
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 shadow-sm min-w-[3rem] text-center">
                    {pipeline.length}
                </span>
            </div>
        </div>

        {/* Pipeline Visualizer */}
        <div className="flex flex-col gap-6 relative pl-6">
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>

            {pipeline.map((step, stepIdx) => {
                const usedSlots = step.tasks.reduce((acc, t) => acc + t.pool_slots, 0);
                const isOverLimit = usedSlots > poolLimit;

                return (
                    <div 
                        key={step.id} 
                        className="relative z-0"
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => onDrop(e, stepIdx)}
                    >
                        {/* Indicator */}
                        <div className={`
                            absolute -left-[27px] top-6 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 bg-white shadow-sm border-2
                            ${isOverLimit ? 'border-red-400 text-red-500' : 'border-slate-200 text-slate-500'}
                        `}>
                            {stepIdx + 1}
                        </div>

                        {/* Step Container */}
                        <div className={`
                            bg-white rounded-xl border transition-all duration-300 p-1
                            ${isOverLimit ? 'border-red-300 shadow-sm bg-red-50/10' : 'border-slate-200 hover:border-indigo-300'}
                        `}>
                            {/* Header */}
                            <div className="px-3 py-2 flex justify-between items-center border-b border-slate-100/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage {stepIdx + 1}</span>
                                <div className="flex items-center gap-2">
                                     {isOverLimit && <span className="text-[9px] font-bold text-red-500">Over Capacity ({usedSlots}/{poolLimit})</span>}
                                </div>
                            </div>
                            
                            {/* Tasks Horizontal Scroll */}
                            <div className="p-2 flex flex-row flex-wrap gap-2">
                                {step.tasks.map((task, taskIdx) => (
                                    <div 
                                        key={task.id} 
                                        draggable
                                        onDragStart={(e) => onDragStart(e, stepIdx, taskIdx)}
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            onEditTask(stepIdx, taskIdx, rect);
                                        }}
                                        className={`
                                            w-40 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] hover:border-indigo-300 group relative
                                            ${task.priority === 'high' ? 'border-l-4 border-l-red-500' : task.priority === 'mid' ? 'border-l-4 border-l-sky-500' : 'border-l-4 border-l-slate-300'}
                                        `}
                                    >
                                        <div className="font-bold text-xs text-slate-700 truncate mb-1">{task.name}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-slate-400 bg-white px-1.5 rounded border border-slate-100">{task.pool_slots} slots</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeTask(stepIdx, taskIdx); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {step.tasks.length < 5 && (
                                    <button 
                                        onClick={() => addTaskToStep(stepIdx)}
                                        onDragEnter={() => setDragOverStep(stepIdx)}
                                        onDragLeave={() => setDragOverStep(null)}
                                        onDrop={(e) => {
                                            // Ensure drop logic happens on the step container, but visuals update here
                                            setDragOverStep(null);
                                        }}
                                        className={`
                                            w-10 flex items-center justify-center border border-dashed rounded-lg transition-all
                                            ${dragOverStep === stepIdx 
                                                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 scale-105' 
                                                : 'border-slate-300 text-slate-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-500'
                                            }
                                        `}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
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
