import React, { useState, useEffect } from 'react';
import { Cycle, UserProfile } from '../types';
import { addDays, differenceInDays, format } from 'date-fns';
import { Droplet, CheckCircle, Save, PenLine, RotateCcw } from 'lucide-react';
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
  
  // Edit End Date State
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  const [editDate, setEditDate] = useState('');

  // Sync note state when currentCycle changes (e.g. switching users or adding new cycle)
  useEffect(() => {
    setNote(currentCycle?.note || '');
    // Reset edit state when cycle changes
    setIsEditingEndDate(false);
  }, [currentCycle]);

  // LOGIC
  const today = new Date();
  const startDate = new Date(currentCycle.startDate);
  
  // Is the period currently active?
  const isPeriodFinished = !!currentCycle.endDate;
  const daysSinceStart = differenceInDays(today, startDate) + 1; // Day 1 is the start date
  
  const isCurrentlyOnPeriod = !isPeriodFinished && daysSinceStart <= 10 && daysSinceStart >= 1;

  // Prediction Logic
  const averageCycleLength = profile.averageCycleLength || 28;
  const nextPeriodDate = addDays(startDate, averageCycleLength);
  const daysUntilNext = differenceInDays(nextPeriodDate, today);

  const recalculateProfileStats = (updatedCycles: Cycle[]) => {
    const finishedCycles = updatedCycles.filter(c => c.endDate);
    if (finishedCycles.length === 0) return;
    
    const totalDuration = finishedCycles.reduce((acc, c) => {
        return acc + (differenceInDays(new Date(c.endDate!), new Date(c.startDate)) + 1);
    }, 0);
    
    const newAvg = Math.round(totalDuration / finishedCycles.length);
    StorageService.saveProfile({
        ...profile,
        averagePeriodDuration: newAvg
    });
  };

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
  };

  const handleUpdateEndDate = () => {
    if (!editDate) return;
    const updatedCycle = { ...currentCycle, endDate: editDate };
    StorageService.updateCycle(updatedCycle);
    
    const updatedCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    recalculateProfileStats(updatedCycles);
    
    setIsEditingEndDate(false);
    onUpdate();
  };

  const handleResumePeriod = () => {
    const updatedCycle = { ...currentCycle, endDate: undefined };
    StorageService.updateCycle(updatedCycle);
    
    // Recalc without this cycle (it's now ongoing)
    const updatedCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    recalculateProfileStats(updatedCycles);
    
    setIsEditingEndDate(false);
    onUpdate();
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

              {/* Edit Last Cycle End Date */}
              {currentCycle && currentCycle.endDate && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  {!isEditingEndDate ? (
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-sm opacity-80">Kỳ trước kết thúc: {format(new Date(currentCycle.endDate), 'dd/MM/yyyy')}</p>
                       <button 
                         onClick={() => {
                           setEditDate(currentCycle.endDate!);
                           setIsEditingEndDate(true);
                         }}
                         className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                       >
                         <PenLine size={12} />
                         Chỉnh sửa ngày kết thúc
                       </button>
                    </div>
                  ) : (
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm animate-fade-in text-left">
                      <p className="text-sm font-bold mb-2 text-center">Sửa ngày kết thúc</p>
                      <input 
                        type="date" 
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full p-2 rounded-lg text-gray-700 text-sm mb-3 focus:outline-none"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setIsEditingEndDate(false)}
                            className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-xs font-bold"
                          >
                            Hủy
                          </button>
                          <button 
                            onClick={handleUpdateEndDate}
                            className="flex-1 bg-white text-purple-600 hover:bg-purple-50 py-2 rounded-lg text-xs font-bold shadow-sm"
                          >
                            Lưu
                          </button>
                        </div>
                        <button 
                           onClick={handleResumePeriod}
                           className="w-full flex items-center justify-center gap-1 text-xs text-white/90 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-colors border border-white/30"
                        >
                           <RotateCcw size={12} />
                           Vẫn đang có kinh (Xóa ngày kết thúc)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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