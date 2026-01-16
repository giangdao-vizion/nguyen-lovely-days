import React from 'react';
import { Cycle } from '../types';
import { StorageService } from '../services/storageService';
import { Trash2, AlertCircle, Calendar, StickyNote } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryProps {
  cycles: Cycle[];
  onUpdate: () => void;
}

export const History: React.FC<HistoryProps> = ({ cycles, onUpdate }) => {
  
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kỳ kinh này không?')) {
      StorageService.deleteCycle(id);
      onUpdate();
    }
  };

  const handleClearAll = () => {
    if (confirm('CẢNH BÁO: Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và bạn sẽ quay lại màn hình chào mừng. Bạn có chắc không?')) {
      StorageService.clearAllData();
      window.location.reload();
    }
  };

  // Prepare chart data
  const chartData = cycles
    .slice(0, 6)
    .reverse() // Show chronological left to right
    .map(c => {
      const duration = c.endDate 
        ? differenceInDays(parseISO(c.endDate), parseISO(c.startDate)) + 1 
        : 0;
      return {
        date: format(parseISO(c.startDate), 'dd/MM'),
        duration: duration > 0 ? duration : 0
      };
    })
    .filter(d => d.duration > 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Lịch sử chu kỳ</h2>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-100 h-64">
           <h3 className="text-sm font-semibold text-gray-500 mb-4">Độ dài kỳ kinh gần đây (ngày)</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
               <YAxis hide domain={[0, 10]} />
               <Tooltip 
                  cursor={{fill: '#fdf2f8'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
               />
               <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.duration > 7 ? '#f472b6' : '#fbcfe8'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* List Section */}
      <div className="space-y-4">
        {cycles.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400">Chưa có dữ liệu lịch sử.</p>
          </div>
        ) : (
          cycles.map((cycle) => {
            const startDate = parseISO(cycle.startDate);
            const endDate = cycle.endDate ? parseISO(cycle.endDate) : null;
            const duration = endDate 
              ? differenceInDays(endDate, startDate) + 1 
              : null;

            return (
              <div key={cycle.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-pink-400 relative">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-3 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 h-fit">
                       <Calendar size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">
                        {format(startDate, 'dd MMMM, yyyy', { locale: vi })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {duration ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                            Kéo dài {duration} ngày
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-medium">
                            Đang diễn ra / Chưa nhập ngày kết thúc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(cycle.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Note Display */}
                {cycle.note && (
                  <div className="mt-4 flex gap-2 items-start text-gray-600 bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                    <StickyNote size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="italic">"{cycle.note}"</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-red-500 font-bold mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Khu vực quản lý dữ liệu
        </h3>
        <button
          onClick={handleClearAll}
          className="w-full p-4 border-2 border-red-100 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
        >
          Xóa toàn bộ dữ liệu & Đặt lại ứng dụng
        </button>
      </div>
    </div>
  );
};