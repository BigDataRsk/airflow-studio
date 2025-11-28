
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Code, Layers, Settings2, Save } from 'lucide-react';

interface TaskEditorModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        ></div>

        {/* Modal Window */}
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-[101] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Configure Task</h2>
                        <p className="text-xs text-slate-500 font-mono">{editedTask.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* General Settings */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Function Name</label>
                        <input 
                            type="text" 
                            value={editedTask.name}
                            onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Priority</label>
                             <select 
                                value={editedTask.priority}
                                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
                             >
                                <option value="low">Low</option>
                                <option value="mid">Mid</option>
                                <option value="high">High</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Slots</label>
                             <input 
                                type="number" min="1" max="5"
                                value={editedTask.pool_slots}
                                onChange={(e) => setEditedTask({ ...editedTask, pool_slots: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
                             />
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Imports */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-2">
                        <Layers className="w-4 h-4" /> Library Imports
                    </label>
                    <textarea 
                        value={editedTask.imports}
                        onChange={(e) => setEditedTask({ ...editedTask, imports: e.target.value })}
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 resize-none"
                        placeholder="import pandas as pd..."
                    />
                </div>

                {/* Logic Code */}
                <div className="flex-1 flex flex-col">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-2">
                        <Code className="w-4 h-4" /> Python Logic
                    </label>
                    <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-inner min-h-[200px]">
                        <textarea 
                            value={editedTask.code}
                            onChange={(e) => setEditedTask({ ...editedTask, code: e.target.value })}
                            className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-300 bg-transparent outline-none resize-none"
                            placeholder="# Write your transformation logic here..."
                            spellCheck={false}
                        />
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </div>
    </div>
  );
};
