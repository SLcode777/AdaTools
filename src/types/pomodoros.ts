export type TimerState = 'idle' | 'work' | 'break' | 'paused';

 export type SoundEvent =
   | 'sessionStart'
   | 'breakStart'
   | 'breakEnd'
   | 'sessionEnd';

 export interface PomodoroSettings {
   workDuration: number;
   breakDuration: number;
   cycles: number;
   sessionStartSound: string;
   breakStartSound: string;
   breakEndSound: string;
   sessionEndSound: string;
   backgroundImage: string | null;
   backgroundType: 'gallery' | 'custom' | 'none';
   textColor: string;
   autoStartBreaks: boolean;
   autoStartPomodoros: boolean;
   soundEnabled: boolean;
 }

 export interface TimerSession {
   currentCycle: number;
   totalCycles: number;
   completedCycles: number;
   state: TimerState;
   remainingSeconds: number;
   totalSeconds: number;
 }