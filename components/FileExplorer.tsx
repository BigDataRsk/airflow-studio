
import React, { useState } from 'react';
import { Folder, ChevronRight, Home, ArrowLeft, Check } from 'lucide-react';

interface FileExplorerProps {
  onSelect: (path: string) => void;
  onBack: () => void;
}

// Mock Data Structure
const MOCK_FILE_SYSTEM: any = {
  "marketing": {
    "campaigns": {},
    "analysis": {},
    "reports": {}
  },
  "finance": {
    "q1_2024": {},
    "forecasting": {},
    "ledger": {}
  },
  "risk": {
    "credit_scoring": {},
    "fraud_detection": {}
  },
  "data-engineering": {
    "pipelines": {},
    "bronze": {},
    "silver": {}
  },
  "sandbox": {
    "test_project": {}
  }
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ onSelect, onBack }) => {
  const [path, setPath] = useState<string[]>([]);
  
  // Get current directory contents
  const getCurrentContents = () => {
    let current = MOCK_FILE_SYSTEM;
    for (const p of path) {
      if (current[p]) {
        current = current[p];
      } else {
        return {};
      }
    }
    return current;
  };

  const handleNavigate = (folder: string) => {
    setPath([...path, folder]);
  };

  const handleUp = () => {
    setPath(path.slice(0, -1));
  };

  const currentContents = getCurrentContents();
  const fullPath = `/home/jovyan/workspaces/${path.join('/')}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-lg font-bold text-slate-800">Select Project Location</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
             <Home className="w-3 h-3" />
             <span>/home/jovyan/workspaces/{path.join('/')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 gap-1">
             {/* Back Directory */}
             {path.length > 0 && (
               <div 
                 onClick={handleUp}
                 className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-500 transition-colors"
               >
                 <div className="w-10 h-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5"></div>
                 </div>
                 <span className="font-medium text-sm">..</span>
               </div>
             )}

             {/* Folders */}
             {Object.keys(currentContents).map((folder) => (
               <div 
                 key={folder}
                 onClick={() => handleNavigate(folder)}
                 className="group flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
               >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                       <Folder className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 group-hover:text-indigo-900">{folder}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
               </div>
             ))}

             {Object.keys(currentContents).length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <span className="text-sm">Empty Directory</span>
                </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="text-xs text-slate-500">
              Selected: <span className="font-bold text-slate-700">{path.length > 0 ? path[path.length-1] : 'Root'}</span>
           </div>
           <button 
             onClick={() => onSelect(path.length > 0 ? path[path.length-1] : 'marketing')} // Default if root
             className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95"
           >
             <Check className="w-4 h-4" />
             Select This Folder
           </button>
        </div>

      </div>
    </div>
  );
};
