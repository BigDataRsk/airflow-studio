import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, Home, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';

interface FileExplorerProps {
  onSelect: (path: string) => void;
  onBack: () => void;
  serviceManager?: any; // Injected from App, relaxed to any
}

interface FileModel {
  name: string;
  type: 'directory' | 'file' | 'notebook';
  path: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onSelect, onBack, serviceManager }) => {
  const [currentPath, setCurrentPath] = useState<string>('workspaces'); // Default start relative to root
  const [contents, setContents] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch directories from Jupyter Server
  useEffect(() => {
    const fetchContents = async () => {
      if (!serviceManager) {
        // Fallback for standalone dev mode (mock)
        return; 
      }

      setLoading(true);
      setError(null);
      try {
        const result = await serviceManager.contents.get(currentPath);
        if (result.type === 'directory' && result.content) {
          // Filter only directories for workspace selection
          const dirs: FileModel[] = (result.content as any[])
            .filter((item: any) => item.type === 'directory')
            .map((item: any) => ({
              name: item.name,
              type: 'directory',
              path: item.path
            }));
          setContents(dirs);
        } else {
            setContents([]);
        }
      } catch (err) {
        console.error("Failed to fetch contents:", err);
        setError("Could not access directory. Ensure /home/jovyan/workspaces exists.");
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [currentPath, serviceManager]);

  const handleNavigate = (folderName: string) => {
    // Jupyter paths are relative to root, e.g., "workspaces/project1"
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  const handleUp = () => {
    if (currentPath === 'workspaces' || currentPath === '') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  // Mock data fallback if no service manager (Dev mode)
  if (!serviceManager) {
      // ... keep existing mock logic if you want to test outside Jupyter, 
      // otherwise render an error or just the mock.
      // For this implementation, we assume extension mode.
  }

  const breadcrumbs = currentPath.split('/');

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
             <span>/home/jovyan/{currentPath}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 relative">
          {loading && (
             <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
             </div>
          )}

          {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                 <AlertCircle className="w-5 h-5" />
                 {error}
             </div>
          )}

          <div className="grid grid-cols-1 gap-1">
             {/* Back Directory */}
             {currentPath !== 'workspaces' && currentPath !== '' && (
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
             {!loading && !error && contents.map((folder) => (
               <div 
                 key={folder.path}
                 onClick={() => handleNavigate(folder.name)}
                 className="group flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
               >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                       <Folder className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 group-hover:text-indigo-900">{folder.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
               </div>
             ))}

             {!loading && contents.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <span className="text-sm">Empty Directory</span>
                </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="text-xs text-slate-500">
              Selected: <span className="font-bold text-slate-700">{breadcrumbs[breadcrumbs.length - 1]}</span>
           </div>
           <button 
             onClick={() => onSelect(breadcrumbs[breadcrumbs.length - 1])} 
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