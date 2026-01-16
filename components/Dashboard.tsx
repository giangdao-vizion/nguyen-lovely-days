import React, { useState, useEffect } from 'react';
import { Cycle, UserProfile } from '../types';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import { Droplet, CheckCircle, Save, PenLine } from 'lucide-react';
import { SmartAdvice } from './SmartAdvice';
import { StorageService } from '../services/storageService';

interface DashboardProps {
  profile: UserProfile;
  cycles: Cycle[];
  onUpdate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, cycles, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const currentCycle = cycles[0]; // Most recent cycle
  const [note, setNote] = useState(currentCycle?.note || '');

  // Sync note state when currentCycle changes (e.g. switching users or adding new cycle)
  useEffect(() => {
    setNote(currentCycle?.note || '');
  }, [currentCycle]);

  // LOGIC
  const today = new Date();
  const startDate = parseISO(currentCycle.startDate);
  
  // Is the period currently active?
  const isPeriodFinished = !!currentCycle.endDate;
  const daysSinceStart = differenceInDays(today, startDate) + 1; // Day 1 is the start date
  
  const isCurrentlyOnPeriod = !isPeriodFinished && daysSinceStart <= 10 && daysSinceStart >= 1;

  // Prediction Logic
  const averageCycleLength = profile.averageCycleLength || 28;
  const nextPeriodDate = addDays(startDate, averageCycleLength);
  const daysUntilNext = differenceInDays(nextPeriodDate, today);

  const handleEndPeriod = () => {
    setLoading(true);
    // User says period ended TODAY
    const todayStr = format(today, 'yyyy-MM-dd');
    const updatedCycle = { ...currentCycle, endDate: todayStr };
    
    StorageService.updateCycle(updatedCycle);
    
    // Update profile averages
    const newDuration = differenceInDays(today, startDate) + 1;
    // Simple moving average for demo
    const newAvgDuration = Math.round((profile.averagePeriodDuration + newDuration) / 2);
    
    StorageService.saveProfile({
      ...profile,
      averagePeriodDuration: newAvgDuration
    });

    onUpdate();
    setLoading(false);
  };

  const handleStartNewPeriod = () => {
    setLoading(true);
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // If previous cycle wasn't closed, close it as of yesterday
    if (!currentCycle.endDate) {
       const yesterday = addDays(today, -1);
       StorageService.updateCycle({
         ...currentCycle,
         endDate: format(yesterday, 'yyyy-MM-dd')
       });
    }

    // Recalculate cycle length average
    const cycleLength = differenceInDays(today, startDate);
    const newAvgLen = Math.round((profile.averageCycleLength + cycleLength) / 2);
    
    StorageService.saveProfile({
      ...profile,
      averageCycleLength: newAvgLen
    });

    StorageService.addCycle({
      id: Date.now().toString(),
      startDate: todayStr
    });

    onUpdate();
    setLoading(false);
  };

  const handleSaveNote = () => {
    if (!currentCycle) return;
    const updatedCycle = { ...currentCycle, note: note.trim() };
    StorageService.updateCycle(updatedCycle);
    onUpdate();
    // Optional: Visual feedback could go here
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Card */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl text-white transition-all duration-500 ${
        isCurrentlyOnPeriod 
          ? 'bg-gradient-to-br from-rose-400 to-pink-600 shadow-rose-300/50' 
          : 'bg-gradient-to-br from-indigo-300 to-purple-400 shadow-indigo-300/50'
      }`}>
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center">
          <p className="text-lg font-medium opacity-90 mb-2">Xin chào, {profile.name} ❤️</p>
          
          {isCurrentlyOnPeriod ? (
            <>
              <div className="text-6xl font-bold mb-2">{daysSinceStart}</div>
              <p className="text-xl font-medium tracking-wide opacity-90">Ngày thứ {daysSinceStart} của kỳ kinh</p>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleEndPeriod}
                  disabled={loading}
                  className="bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2"
                >
                  <CheckCircle size={20} />
                  Kết thúc hôm nay
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold mb-2">{daysUntilNext > 0 ? daysUntilNext : 0}</div>
              <p className="text-xl font-medium tracking-wide opacity-90">
                {daysUntilNext > 0 ? 'Ngày nữa tới kỳ tiếp theo' : 'Dự kiến hôm nay!'}
              </p>
              <p className="text-sm mt-2 opacity-75">
                Dự kiến: {format(nextPeriodDate, 'dd/MM/yyyy')}
              </p>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleStartNewPeriod}
                  disabled={loading}
                  className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Droplet size={20} fill="currentColor" />
                  Kỳ kinh đã đến
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-sm font-medium mb-1">Độ dài chu kỳ</p>
          <p className="text-2xl font-bold text-gray-700">{profile.averageCycleLength} ngày</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-sm font-medium mb-1">Thời gian hành kinh</p>
          <p className="text-2xl font-bold text-gray-700">{profile.averagePeriodDuration} ngày</p>
        </div>
      </div>

      {/* Note Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2 mb-4 text-pink-600 font-bold">
          <PenLine size={20} />
          <span>Ghi chú cho kỳ này</span>
        </div>
        <div className="relative">
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bạn cảm thấy thế nào? Có triệu chứng gì đặc biệt không?"
            className="w-full p-4 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none text-gray-700 bg-pink-50/50 min-h-[100px] resize-none"
          />
          {note !== (currentCycle?.note || '') && (
             <button 
               onClick={handleSaveNote}
               className="absolute bottom-3 right-3 bg-pink-500 text-white p-2 rounded-lg shadow-md hover:bg-pink-600 transition-colors"
               title="Lưu ghi chú"
             >
               <Save size={18} />
             </button>
          )}
        </div>
      </div>

      {/* AI Advice Section */}
      <SmartAdvice 
        dayOfCycle={daysSinceStart} // Simplified logic: days since start of LAST cycle
        isPeriod={isCurrentlyOnPeriod}
        userName={profile.name}
      />

    </div>
  );
};