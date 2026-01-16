import { Cycle, UserProfile, DailyAdvice } from '../types';
import { differenceInDays } from 'date-fns';

const KEYS = {
  PROFILE: 'ckce_profile',
  CYCLES: 'ckce_cycles',
  ADVICE_CACHE: 'ckce_advice_cache',
};

export const StorageService = {
  // User Profile
  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // Cycles
  saveCycles: (cycles: Cycle[]): void => {
    localStorage.setItem(KEYS.CYCLES, JSON.stringify(cycles));
  },
  getCycles: (): Cycle[] => {
    const data = localStorage.getItem(KEYS.CYCLES);
    return data ? JSON.parse(data) : [];
  },
  addCycle: (cycle: Cycle): Cycle[] => {
    const cycles = StorageService.getCycles();
    const newCycles = [cycle, ...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    StorageService.saveCycles(newCycles);
    return newCycles;
  },
  updateCycle: (updatedCycle: Cycle): Cycle[] => {
    const cycles = StorageService.getCycles();
    const newCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    StorageService.saveCycles(newCycles);
    return newCycles;
  },
  deleteCycle: (id: string): Cycle[] => {
    const cycles = StorageService.getCycles();
    const newCycles = cycles.filter(c => c.id !== id);
    StorageService.saveCycles(newCycles);
    return newCycles;
  },

  // Helper: Recalculate Profile Stats based on current cycles
  recalculateAndSaveProfile: (): UserProfile | null => {
    const profile = StorageService.getProfile();
    const cycles = StorageService.getCycles();
    
    if (!profile) return null;

    let totalPeriodDays = 0;
    let periodCount = 0;
    
    // 1. Calculate Average Period Duration (length of bleeding)
    cycles.forEach(c => {
      if (c.endDate) {
        const duration = differenceInDays(new Date(c.endDate), new Date(c.startDate)) + 1;
        if (duration > 0 && duration < 15) { // Sanity check
          totalPeriodDays += duration;
          periodCount++;
        }
      }
    });

    // 2. Calculate Average Cycle Length (gap between start dates)
    let totalCycleDays = 0;
    let gapCount = 0;
    
    // Sort desc first
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    for (let i = 0; i < sortedCycles.length - 1; i++) {
      const currentStart = new Date(sortedCycles[i].startDate);
      const prevStart = new Date(sortedCycles[i+1].startDate);
      const gap = differenceInDays(currentStart, prevStart);
      
      if (gap > 15 && gap < 60) { // Sanity check for valid cycle gaps
        totalCycleDays += gap;
        gapCount++;
      }
    }

    const newProfile = {
      ...profile,
      averagePeriodDuration: periodCount > 0 ? Math.round(totalPeriodDays / periodCount) : profile.averagePeriodDuration,
      averageCycleLength: gapCount > 0 ? Math.round(totalCycleDays / gapCount) : profile.averageCycleLength
    };

    StorageService.saveProfile(newProfile);
    return newProfile;
  },

  // Advice Cache (to prevent spamming API)
  getAdvice: (dateKey: string): DailyAdvice | null => {
    const data = localStorage.getItem(`${KEYS.ADVICE_CACHE}_${dateKey}`);
    return data ? JSON.parse(data) : null;
  },
  saveAdvice: (dateKey: string, advice: DailyAdvice): void => {
    try {
      localStorage.setItem(`${KEYS.ADVICE_CACHE}_${dateKey}`, JSON.stringify(advice));
    } catch (e) {
      console.warn('Storage full, clearing old advice');
    }
  },

  // Clear All
  clearAllData: (): void => {
    localStorage.clear();
  }
};