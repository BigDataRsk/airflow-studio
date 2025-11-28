
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleBuilderProps {
  value: string;
  onChange: (val: string) => void;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ value, onChange }) => {
  const [frequency, setFrequency] = useState('Manual');
  const [time, setTime] = useState('09:00');
  const [days, setDays] = useState<number[]>([]); // 1=Mon, 7=Sun

  // Reconstruct state from CRON if possible (simplified)
  useEffect(() => {
    if (!value) {
      setFrequency('Manual');
      return;
    }
    // Very basic reverse parsing could go here, but for now we default to what was set in UI
  }, []);

  useEffect(() => {
    if (frequency === 'Manual') {
      onChange('');
      return;
    }

    const [hour, minute] = time.split(':');
    let cron = '';

    if (frequency === 'Hourly') {
      cron = `${minute} * * * *`;
    } else if (frequency === 'Daily') {
      cron = `${minute} ${hour} * * *`;
    } else if (frequency === 'Weekly') {
      const dow = days.length > 0 ? days.join(',') : '*';
      cron = `${minute} ${hour} * * ${dow}`;
    } else if (frequency === 'Custom') {
      // Don't overwrite if user is typing manually
      return;
    }

    if (cron && cron !== value) {
      onChange(cron);
    }
  }, [frequency, time, days]);

  const toggleDay = (d: number) => {
    if (days.includes(d)) setDays(days.filter(x => x !== d));
    else setDays([...days, d].sort());
  };

  const WEEKDAYS = [
    { label: 'M', val: 1 },
    { label: 'T', val: 2 },
    { label: 'W', val: 3 },
    { label: 'T', val: 4 },
    { label: 'F', val: 5 },
    { label: 'S', val: 6 },
    { label: 'S', val: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Frequency Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-lg">
        {['Manual', 'Hourly', 'Daily', 'Weekly'].map(f => (
          <button
            key={f}
            onClick={() => setFrequency(f)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              frequency === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {frequency !== 'Manual' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Time Picker */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time
            </label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>

          {/* Days Picker (Weekly) */}
          {frequency === 'Weekly' && (
            <div>
               <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Run Days
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d.val}
                    onClick={() => toggleDay(d.val)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      days.includes(d.val) 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Result Preview */}
          <div className="pt-2 border-t border-slate-200">
             <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <span>Cron Expression</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{value}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
