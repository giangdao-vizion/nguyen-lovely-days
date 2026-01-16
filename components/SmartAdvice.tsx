import React, { useEffect, useState } from 'react';
import { DailyAdvice } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { Sparkles, Coffee, Sun, Utensils } from 'lucide-react';

interface SmartAdviceProps {
  dayOfCycle: number;
  isPeriod: boolean;
  userName: string;
}

export const SmartAdvice: React.FC<SmartAdviceProps> = ({ dayOfCycle, isPeriod, userName }) => {
  const [advice, setAdvice] = useState<DailyAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    
    const fetchAdvice = async () => {
      // 1. Check Cache
      const cached = StorageService.getAdvice(todayKey);
      
      // If cached advice exists and it matches today's condition (rough check), use it
      // For simplicity, we trust the cache for the day.
      if (cached) {
        setAdvice(cached);
        return;
      }

      // 2. Fetch API
      setLoading(true);
      const newAdvice = await GeminiService.getAdviceForCycleDay(dayOfCycle, isPeriod, userName);
      if (newAdvice) {
        setAdvice(newAdvice);
        StorageService.saveAdvice(todayKey, newAdvice);
      }
      setLoading(false);
    };

    fetchAdvice();
  }, [dayOfCycle, isPeriod, userName]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 animate-pulse">
        <div className="h-6 bg-pink-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-200 space-y-6">
      
      {/* Header / Mood */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl text-white shadow-lg shadow-pink-200">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Lời khuyên hôm nay</h3>
          <p className="text-pink-600 italic">"{advice.mood}"</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
        <div className="flex items-center gap-2 mb-3 text-pink-700 font-bold">
          <Utensils size={20} />
          <span>Thực đơn đề xuất</span>
        </div>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="font-semibold text-pink-500 min-w-[60px]">Sáng:</span>
            <span className="text-gray-700">{advice.menu.breakfast}</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-pink-500 min-w-[60px]">Trưa:</span>
            <span className="text-gray-700">{advice.menu.lunch}</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-pink-500 min-w-[60px]">Tối:</span>
            <span className="text-gray-700">{advice.menu.dinner}</span>
          </li>
        </ul>
      </div>

      {/* Activities */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-orange-600 font-bold">
          <Sun size={20} />
          <span>Hoạt động gợi ý</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {advice.activities.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 text-gray-700">
              <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></div>
              {activity}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
