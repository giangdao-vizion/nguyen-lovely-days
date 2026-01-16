import React, { useState } from 'react';
import { Cycle } from '../types';
import { StorageService } from '../services/storageService';
import { Trash2, AlertCircle, Calendar, StickyNote, Plus, X, Edit2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryProps {
  cycles: Cycle[];
  onUpdate: () => void;
}

interface ModalState {
  isOpen: boolean;
  type: 'ADD' | 'EDIT';
  cycleId?: string;
  startDate: string;
  endDate: string;
  note: string;
}

export const History: React.FC<HistoryProps> = ({ cycles, onUpdate }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'ADD',
    startDate: '',
    endDate: '',
    note: ''
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa kỳ kinh này không?')) {
      StorageService.deleteCycle(id);
      StorageService.recalculateAndSaveProfile();
      onUpdate();
    }
  };

  const handleClearAll = () => {
    if (confirm('CẢNH BÁO: Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và bạn sẽ quay lại màn hình chào mừng. Bạn có chắc không?')) {
      StorageService.clearAllData();
      // Notify parent to refresh state immediately, avoiding reload issues
      onUpdate();
    }
  };

  const openAddModal = () => {
    setModal({
      isOpen: true,
      type: 'ADD',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      note: ''
    });
  };

  const openEditModal = (cycle: Cycle) => {
    setModal({
      isOpen: true,
      type: 'EDIT',
      cycleId: cycle.id,
      startDate: cycle.startDate,
      endDate: cycle.endDate || '',
      note: cycle.note || ''
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveModal = () => {
    if (!modal.startDate) {
      alert("Vui lòng nhập ngày bắt đầu");
      return;
    }

    if (modal.type === 'ADD') {
      StorageService.addCycle({
        id: Date.now().toString(),
        startDate: modal.startDate,
        endDate: modal.endDate || undefined,
        note: modal.note
      });
    } else if (modal.type === 'EDIT' && modal.cycleId) {
      StorageService.updateCycle({
        id: modal.cycleId,
        startDate: modal.startDate,
        endDate: modal.endDate || undefined,
        note: modal.note
      });
    }

    StorageService.recalculateAndSaveProfile();
    onUpdate();
    closeModal();
  };

  // Prepare chart data
  const chartData = cycles
    .slice(0, 6)
    .reverse() // Show chronological left to right
    .map(c => {
      const duration = c.endDate 
        ? differenceInDays(new Date(c.endDate), new Date(c.startDate)) + 1 
        : 0;
      return {
        date: format(new Date(c.startDate), 'dd/MM'),
        duration: duration > 0 ? duration : 0
      };
    })
    .filter(d => d.duration > 0);

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Lịch sử chu kỳ</h2>
        <button 
          onClick={openAddModal}
          className="bg-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1 shadow-md hover:bg-pink-600 transition-colors"
        >
          <Plus size={16} /> Thêm kỳ cũ
        </button>
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
            const startDate = new Date(cycle.startDate);
            const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
            const duration = endDate 
              ? differenceInDays(endDate, startDate) + 1 
              : null;

            return (
              <div 
                key={cycle.id} 
                onClick={() => openEditModal(cycle)}
                className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-pink-400 relative cursor-pointer hover:bg-pink-50/30 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-3 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 h-fit">
                       <Calendar size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        {format(startDate, 'dd MMMM, yyyy')}
                        <Edit2 size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    onClick={(e) => handleDelete(cycle.id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
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

      {/* Add/Edit Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {modal.type === 'ADD' ? 'Thêm kỳ kinh cũ' : 'Chỉnh sửa kỳ kinh'}
            </h3>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-semibold text-gray-600 mb-1">Ngày bắt đầu</label>
                 <input 
                   type="date"
                   value={modal.startDate}
                   onChange={(e) => setModal({...modal, startDate: e.target.value})}
                   className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:outline-none bg-gray-50 text-gray-800"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-semibold text-gray-600 mb-1">Ngày kết thúc</label>
                 <input 
                   type="date"
                   value={modal.endDate}
                   onChange={(e) => setModal({...modal, endDate: e.target.value})}
                   className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:outline-none bg-gray-50 text-gray-800"
                 />
                 <p className="text-xs text-gray-400 mt-1">Để trống nếu vẫn đang diễn ra (chỉ áp dụng cho kỳ gần nhất)</p>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-600 mb-1">Ghi chú</label>
                 <textarea 
                   value={modal.note}
                   onChange={(e) => setModal({...modal, note: e.target.value})}
                   placeholder="Ghi chú về triệu chứng..."
                   className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:outline-none bg-gray-50 resize-none h-24 text-gray-800"
                 />
               </div>

               <button 
                 onClick={handleSaveModal}
                 className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold text-lg hover:bg-pink-600 shadow-lg shadow-pink-200 mt-2"
               >
                 Lưu thông tin
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};