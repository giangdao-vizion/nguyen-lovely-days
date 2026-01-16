import React, { useState } from 'react';
import { UserProfile, Cycle } from '../types';
import { StorageService } from '../services/storageService';
import { Heart } from 'lucide-react';

interface WelcomeProps {
  onComplete: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');

  const handleStart = () => {
    if (!name.trim() || !lastPeriodDate) return;

    const profile: UserProfile = {
      name: name.trim(),
      averageCycleLength: 28,
      averagePeriodDuration: 5,
    };

    const initialCycle: Cycle = {
      id: Date.now().toString(),
      startDate: lastPeriodDate,
    };

    StorageService.saveProfile(profile);
    StorageService.addCycle(initialCycle);
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-2 border-pink-100">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-pink-100 rounded-full text-pink-500">
            <Heart size={48} fill="currentColor" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-pink-600 mb-2">Chào bạn mới!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Để "Chu Kỳ Của Em" chăm sóc bạn tốt hơn, hãy cho mình biết một chút thông tin nhé.
        </p>

        <div className="space-y-6 text-left">
          <div>
            <label className="block text-pink-700 font-semibold mb-2 text-lg">Tên thân mật của bạn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Mèo Ú"
              className="w-full p-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-lg text-gray-700 bg-pink-50 placeholder-pink-200"
            />
          </div>

          <div>
            <label className="block text-pink-700 font-semibold mb-2 text-lg">Ngày bắt đầu kỳ kinh gần nhất</label>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-lg text-gray-700 bg-pink-50"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!name || !lastPeriodDate}
            className={`w-full py-4 rounded-xl font-bold text-xl shadow-md transition-all transform hover:scale-[1.02] ${
              name && lastPeriodDate
                ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-300/50'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Bắt đầu theo dõi
          </button>
        </div>
      </div>
    </div>
  );
};
