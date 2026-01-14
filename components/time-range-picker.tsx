'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeRangePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function TimeRangePicker({
  value = '06:00 - 21:00',
  onChange,
  className,
  required = false
}: TimeRangePickerProps) {
  // Parse the initial value
  const parseValue = (val: string) => {
    const match = val.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      return {
        openHour: match[1],
        openMinute: match[2],
        closeHour: match[3],
        closeMinute: match[4]
      };
    }
    return { openHour: '06', openMinute: '00', closeHour: '21', closeMinute: '00' };
  };

  const initial = parseValue(value);
  const [openHour, setOpenHour] = useState(initial.openHour);
  const [openMinute, setOpenMinute] = useState(initial.openMinute);
  const [closeHour, setCloseHour] = useState(initial.closeHour);
  const [closeMinute, setCloseMinute] = useState(initial.closeMinute);

  useEffect(() => {
    const newValue = `${openHour}:${openMinute} - ${closeHour}:${closeMinute}`;
    // Only call onChange if the value actually changed
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [openHour, openMinute, closeHour, closeMinute, value, onChange]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Opening Time */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">
          <Clock className="inline-block w-3 h-3 mr-1" />
          開放時間 {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2 items-center">
          <select
            value={openHour}
            onChange={(e) => setOpenHour(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-center bg-white"
            required={required}
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-stone-500 font-medium">:</span>
          <select
            value={openMinute}
            onChange={(e) => setOpenMinute(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-center bg-white"
            required={required}
          >
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Closing Time */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">
          <Clock className="inline-block w-3 h-3 mr-1" />
          關閉時間 {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2 items-center">
          <select
            value={closeHour}
            onChange={(e) => setCloseHour(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-center bg-white"
            required={required}
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-stone-500 font-medium">:</span>
          <select
            value={closeMinute}
            onChange={(e) => setCloseMinute(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-center bg-white"
            required={required}
          >
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-600">
          營業時間: <span className="font-medium text-stone-800">
            {openHour}:{openMinute} - {closeHour}:{closeMinute}
          </span>
        </p>
      </div>
    </div>
  );
}