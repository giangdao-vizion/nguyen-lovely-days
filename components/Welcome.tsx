import React, { useState } from 'react';
import { UserProfile, Cycle } from '../types';
import { StorageService } from '../services/storageService';
import { Heart, Plus, Trash2, Calendar } from 'lucide-react';

interface WelcomeProps {
  onComplete: () => void;
}

interface TempCycle {
  startDate: string;
  endDate: string;
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  // Initialize with one empty entry
  const [historyInput, setHistoryInput] = useState<TempCycle[]>([{ startDate: '', endDate: '' }]);

  const handleAddCycle = () => {
    if (historyInput.length < 3) {
      setHistoryInput([...historyInput, { startDate: '', endDate: '' }]);
    }
  };

  const handleRemoveCycle = (index: number) => {
    const updated = [...historyInput];
    updated.splice(index, 1);
    setHistoryInput(updated);
  };

  const handleDateChange = (index: number, field: 'startDate' | 'endDate', value: string) => {
    const updated = [...historyInput];
    updated[index][field] = value;
    setHistoryInput(updated);
  };

  const handleStart = () => {
    const validInputs = historyInput.filter(h => h.startDate);
    
    if (!name.trim() || validInputs.length === 0) return;

    // 1. Create Cycles
    const cyclesToSave: Cycle[] = validInputs.map(input => ({
      id: Date.now().toString() + Math.random().toString(),
      startDate: input.startDate,
      endDate: input.endDate || undefined
    }));

    // Save cycles first so we can use the helper
    // We reverse to add them in order, but the helper sorts them anyway
    cyclesToSave.forEach(c => StorageService.addCycle(c));

    // 2. Initial Profile
    const profile: UserProfile = {
      name: name.trim(),
      averageCycleLength: 28, // Default, will be recalculated
      averagePeriodDuration: 5, // Default, will be recalculated
    };
    StorageService.saveProfile(profile);

    // 3. Recalculate based on input
    StorageService.recalculateAndSaveProfile();

    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-2 border-pink-100 relative">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-pink-100 rounded-full text-pink-500 shadow-inner">
            <Heart size={40} fill="currentColor" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-pink-600 mb-1">LovelyDays</h1>
        <p className="text-sm font-semibold text-pink-400 uppercase tracking-widest mb-6">Trợ lý kinh nguyệt</p>
        
        <p className="text-gray-600 mb-6 text-sm">
          Chào bạn mới! Hãy nhập tên và tối đa 3 kỳ kinh gần nhất để dự đoán chính xác hơn nhé.
        </p>

        <div className="space-y-6 text-left">
          {/* Name Input */}
          <div>
            <label className="block text-pink-700 font-semibold mb-2 text-sm">Tên thân mật của bạn (*)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Mèo Ú"
              className="w-full p-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none text-gray-700 bg-pink-50 placeholder-pink-200"
            />
          </div>

          {/* Cycles Input */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="block text-pink-700 font-semibold text-sm">Dữ liệu kỳ kinh gần đây</label>
                {historyInput.length < 3 && (
                  <button 
                    onClick={handleAddCycle}
                    className="text-xs flex items-center gap-1 bg-pink-100 text-pink-600 px-2 py-1 rounded-lg hover:bg-pink-200 transition-colors"
                  >
                    <Plus size={12} /> Thêm kỳ
                  </button>
                )}
             </div>

             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {historyInput.map((cycle, index) => (
                  <div key={index} className="p-3 bg-pink-50 rounded-xl border border-pink-100 relative group">
                     {historyInput.length > 1 && (
                        <button 
                          onClick={() => handleRemoveCycle(index)}
                          className="absolute -top-2 -right-2 bg-white text-red-400 p-1 rounded-full shadow-sm border border-red-100 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                     )}
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs text-gray-500 mb-1 block">Ngày bắt đầu (*)</label>
                           <input
                            type="date"
                            value={cycle.startDate}
                            onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
                            className="w-full p-2 rounded-lg border border-pink-200 text-sm focus:outline-none bg-white text-gray-700"
                          />
                        </div>
                        <div>
                           <label className="text-xs text-gray-500 mb-1 block">Ngày kết thúc</label>
                           <input
                            type="date"
                            value={cycle.endDate}
                            onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                            className="w-full p-2 rounded-lg border border-pink-200 text-sm focus:outline-none bg-white text-gray-700"
                          />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!name || !historyInput[0].startDate}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all transform active:scale-95 ${
              name && historyInput[0].startDate
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