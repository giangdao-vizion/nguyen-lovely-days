export interface Cycle {
  id: string;
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  note?: string;
}

export interface UserProfile {
  name: string;
  averageCycleLength: number; // Default 28
  averagePeriodDuration: number; // Default 5
}

export interface Activity {
  text: string;
  emoji: string;
}

export interface DailyAdvice {
  date: string;
  activities: Activity[];
  menu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  mood: string;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}