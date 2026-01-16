import React, { useEffect, useState } from 'react';
import { UserProfile, Cycle, AppView } from './types';
import { StorageService } from './services/storageService';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Home, List } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const loadData = () => {
    const savedProfile = StorageService.getProfile();
    const savedCycles = StorageService.getCycles();
    
    if (savedProfile) {
      setProfile(savedProfile);
      setCycles(savedCycles);
      if (view === AppView.ONBOARDING) {
        setView(AppView.DASHBOARD);
      }
    } else {
      // Data cleared or new user
      setProfile(null);
      setCycles([]);
      setView(AppView.ONBOARDING);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOnboardingComplete = () => {
    loadData();
    setView(AppView.DASHBOARD);
  };

  const handleUpdate = () => {
    loadData();
  };

  if (view === AppView.ONBOARDING) {
    return <Welcome onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fdf2f8] text-gray-800 font-sans relative">
      <main className="p-6 pt-8">
        {/* Header removed as requested */}
        
        {view === AppView.DASHBOARD && profile && (
          <div className="animate-fade-in-up">
            <Dashboard 
              profile={profile} 
              cycles={cycles} 
              onUpdate={handleUpdate} 
            />
          </div>
        )}

        {view === AppView.HISTORY && (
          <div className="animate-fade-in-up">
            <History 
              cycles={cycles} 
              onUpdate={handleUpdate} 
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[380px] bg-white rounded-full shadow-2xl shadow-pink-200/50 border border-pink-50 flex justify-around items-center p-2 z-50">
        <button
          onClick={() => setView(AppView.DASHBOARD)}
          className={`p-3 rounded-full transition-all duration-300 ${
            view === AppView.DASHBOARD 
              ? 'bg-pink-500 text-white shadow-lg transform -translate-y-2' 
              : 'text-gray-400 hover:bg-pink-50'
          }`}
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => setView(AppView.HISTORY)}
          className={`p-3 rounded-full transition-all duration-300 ${
            view === AppView.HISTORY 
              ? 'bg-pink-500 text-white shadow-lg transform -translate-y-2' 
              : 'text-gray-400 hover:bg-pink-50'
          }`}
        >
          <List size={24} />
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}