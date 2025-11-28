
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { X, Code, Layers, Settings2, Save, GripHorizontal, Scaling, Cpu } from 'lucide-react';

interface TaskEditorPopoverProps {
  task: Task | null;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}

export const TaskEditorPopover: React.FC<TaskEditorPopoverProps> = ({ task, isOpen, anchorRect, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 500, h: 650 });
  
  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Resizing State
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  // Initialize Position
  useEffect(() => {
    if (isOpen && anchorRect) {
        const width = 500;
        const left = Math.min(
            Math.max(10, anchorRect.left + (anchorRect.width / 2) - (width / 2)),
            window.innerWidth - width - 20
        );
        const top = anchorRect.bottom + 10;
        
        // Ensure it fits vertically
        const finalTop = (top + 650 > window.innerHeight) 
            ? Math.max(10, anchorRect.top - 660) 
            : top;

        setPosition({ x: left, y: finalTop });
        setSize({ w: 500, h: 650 });
    }
  }, [isOpen, anchorRect]);

  // Global Mouse Handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        }
        if (isResizing) {
            setSize({
                w: Math.max(400, resizeStart.current.w + (e.clientX - resizeStart.current.x)),
                h: Math.max(400, resizeStart.current.h + (e.clientY - resizeStart.current.y))
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleMouseDownHeader = (e: React.MouseEvent) => {
      if (popoverRef.current) {
          setIsDragging(true);
          dragOffset.current = {
              x: e.clientX - position.x,
              y: e.clientY - position.y
          };
      }
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      resizeStart.current = {
          x: e.clientX,
          y: e.clientY,
          w: size.w,
          h: size.h
      };
  };

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div 
        ref={popoverRef}
        className={`fixed z-[100] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200`}
        style={{ 
            top: position.y,
            left: position.x, 
            width: size.w,
            height: size.h
        }}
    >
        {/* Header (Draggable) */}
        <div 
            onMouseDown={handleMouseDownHeader}
            className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl cursor-move select-none shrink-0"
        >
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded">
                    <Settings2 className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Edit Task</h2>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <GripHorizontal className="w-4 h-4 text-slate-300" />
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors"
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Content - Flex Column Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Scrollable Top Section (Settings & Imports) */}
            <div className="flex-shrink-0 max-h-[50%] overflow-y-auto p-5 space-y-6 custom-scrollbar border-b border-slate-100">
                {/* 1. Name & Type */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Function Name</label>
                        <input 
                            type="text" 
                            value={editedTask.name}
                            onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                            placeholder="e.g. process_data"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Task Type</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                             <button
                                onClick={() => setEditedTask({ ...editedTask, type: 'python' })}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${editedTask.type === 'python' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                             >
                                Python
                             </button>
                             <button disabled className="flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide text-slate-400 cursor-not-allowed opacity-50">
                                Bash (Soon)
                             </button>
                             <button disabled className="flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide text-slate-400 cursor-not-allowed opacity-50">
                                Dummy (Soon)
                             </button>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visual Priority */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Priority</label>
                        <div className="flex gap-2">
                            {['low', 'mid', 'high'].map((p) => {
                                const isSelected = editedTask.priority === p;
                                let colorClass = 'bg-slate-100 text-slate-500 hover:bg-slate-200';
                                if (isSelected) {
                                    if (p === 'low') colorClass = 'bg-slate-600 text-white ring-2 ring-slate-200';
                                    if (p === 'mid') colorClass = 'bg-blue-500 text-white ring-2 ring-blue-200';
                                    if (p === 'high') colorClass = 'bg-red-500 text-white ring-2 ring-red-200';
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setEditedTask({ ...editedTask, priority: p as any })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${colorClass}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Visual Slots & Calc */}
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                             <label className="text-[10px] font-bold uppercase text-slate-400">Pool Slots</label>
                             <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                 <Cpu className="w-3 h-3" />
                                 <span>{editedTask.pool_slots * 0.5} vCPU / {editedTask.pool_slots * 5}GB</span>
                             </div>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => {
                                const isSelected = editedTask.pool_slots === num;
                                return (
                                    <button
                                        key={num}
                                        onClick={() => setEditedTask({ ...editedTask, pool_slots: num })}
                                        className={`
                                            flex-1 h-8 rounded-lg text-xs font-bold transition-all border
                                            ${isSelected 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                                            }
                                        `}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 3. Imports */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" /> Library Imports
                    </label>
                    <textarea 
                        value={editedTask.imports}
                        onChange={(e) => setEditedTask({ ...editedTask, imports: e.target.value })}
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all"
                        placeholder="import pandas as pd"
                    />
                </div>
            </div>

            {/* Flexible Bottom Section (Code) - Fills remaining space */}
            <div className="flex-1 flex flex-col min-h-0 p-5 pt-4 bg-slate-50/30">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                    <Code className="w-3.5 h-3.5 text-slate-400" /> Python Code
                </label>
                <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-inner relative group">
                    <textarea 
                        value={editedTask.code}
                        onChange={(e) => setEditedTask({ ...editedTask, code: e.target.value })}
                        className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-300 bg-transparent outline-none resize-none custom-scrollbar"
                        placeholder="# Write your python logic here..."
                        spellCheck={false}
                    />
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl shrink-0 relative">
            {/* Resize Handle */}
            <div 
                onMouseDown={handleMouseDownResize}
                className="absolute bottom-1 right-1 p-1 cursor-nwse-resize text-slate-300 hover:text-slate-500 z-50"
            >
                <Scaling className="w-4 h-4" />
            </div>

            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
        </div>
    </div>
  );
};
