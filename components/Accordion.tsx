
import React, { useEffect, useRef } from 'react';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  summary?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  icon, 
  children, 
  isOpen, 
  onToggle, 
  isCompleted = false,
  summary
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
        // Scroll into view if needed, with a slight delay for animation
        setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
  }, [isOpen]);

  return (
    <div 
      className={`
        bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden
        ${isOpen 
            ? 'border-indigo-500 ring-1 ring-indigo-500/20 shadow-xl shadow-indigo-500/10 z-10' 
            : isCompleted 
                ? 'border-emerald-200/60 bg-emerald-50/10 hover:border-emerald-300 hover:bg-emerald-50/30' 
                : 'border-slate-100 hover:border-slate-200'
        }
      `}
    >
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`
            p-2.5 rounded-xl transition-all duration-300 relative
            ${isOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 
              isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}
          `}>
            {isCompleted && !isOpen ? <CheckCircle2 className="w-5 h-5" /> : icon}
          </div>
          
          <div className="flex flex-col">
            <h2 className={`text-sm font-bold uppercase tracking-wide transition-colors ${isOpen ? 'text-indigo-900' : isCompleted ? 'text-emerald-900' : 'text-slate-700'}`}>
                {title}
            </h2>
            {/* Summary View when closed */}
            {!isOpen && summary && (
                <div className="mt-1 text-xs font-medium text-slate-500 animate-in fade-in slide-in-from-left-2 duration-300">
                    {summary}
                </div>
            )}
          </div>
        </div>

        <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'text-slate-300'}
        `}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <div 
        ref={contentRef}
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};
