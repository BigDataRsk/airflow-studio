import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  helper?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, value, onChange, placeholder, required, error, disabled, icon, helper
}) => {
  return (
    <div className="w-full group">
      <div 
        className={`
          relative flex items-center w-full p-1 transition-all duration-200 
          bg-white border rounded-xl
          ${error 
            ? 'border-red-300 ring-4 ring-red-50' 
            : 'border-slate-200 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50'
          }
          ${disabled ? 'bg-slate-50 opacity-60' : 'shadow-sm'}
        `}
      >
        {/* Icon Area */}
        {icon && (
            <div className={`
                flex items-center justify-center w-10 h-10 ml-1 rounded-lg transition-colors
                ${value ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-400'}
            `}>
                {icon}
            </div>
        )}

        {/* Input & Label Stack */}
        <div className="flex-1 px-3 py-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type="text"
                disabled={disabled}
                className="w-full text-sm font-medium text-slate-700 placeholder:text-slate-300 bg-transparent outline-none p-0"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>

        {/* Status Indicator (Optional) */}
        {value && !error && (
            <div className="pr-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            </div>
        )}
      </div>
      
      {(helper || error) && (
        <div className="mt-1.5 ml-1 flex justify-between text-xs">
            <span className="text-red-500 font-medium">{error}</span>
            {!error && helper && <span className="text-slate-400">{helper}</span>}
        </div>
      )}
    </div>
  );
};