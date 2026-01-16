import { Cycle, UserProfile, DailyAdvice } from '../types';

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
    const newCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    StorageService.saveCycles(newCycles);
    return newCycles;
  },
  deleteCycle: (id: string): Cycle[] => {
    const cycles = StorageService.getCycles();
    const newCycles = cycles.filter(c => c.id !== id);
    StorageService.saveCycles(newCycles);
    return newCycles;
  },

  // Advice Cache (to prevent spamming API)
  getAdvice: (dateKey: string): DailyAdvice | null => {
    const data = localStorage.getItem(`${KEYS.ADVICE_CACHE}_${dateKey}`);
    return data ? JSON.parse(data) : null;
  },
  saveAdvice: (dateKey: string, advice: DailyAdvice): void => {
    // Simple cleanup: try to remove old keys if needed, but for now just save
    try {
      localStorage.setItem(`${KEYS.ADVICE_CACHE}_${dateKey}`, JSON.stringify(advice));
    } catch (e) {
      console.warn('Storage full, clearing old advice');
      // In a real app, implement LRU cache. Here we might just clear all advice.
    }
  },

  // Clear All
  clearAllData: (): void => {
    localStorage.clear();
  }
};
