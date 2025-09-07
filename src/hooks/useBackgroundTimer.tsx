import { useEffect, useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  sessionDuration: number;
  startTime: number;
}

const TIMER_STORAGE_KEY = 'studyflow_timer_state';

export const useBackgroundTimer = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState(25 * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Save timer state to localStorage
  const saveTimerState = (state: Partial<TimerState>) => {
    const currentState = getStoredTimerState();
    const newState = { ...currentState, ...state };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newState));
  };

  // Get timer state from localStorage
  const getStoredTimerState = (): TimerState => {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored timer state:', e);
      }
    }
    return {
      isActive: false,
      isPaused: false,
      timeRemaining: 25 * 60,
      sessionDuration: 25 * 60,
      startTime: 0
    };
  };

  // Calculate elapsed time when tab becomes visible
  const recalculateTimeRemaining = () => {
    const storedState = getStoredTimerState();
    if (storedState.isActive && !storedState.isPaused && storedState.startTime) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - storedState.startTime) / 1000);
      const newTimeRemaining = Math.max(0, storedState.timeRemaining - elapsedSeconds);
      
      setTimeRemaining(newTimeRemaining);
      saveTimerState({ timeRemaining: newTimeRemaining });
      
      if (newTimeRemaining === 0) {
        setTimerActive(false);
        saveTimerState({ isActive: false, isPaused: false });
      }
    }
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible - recalculate time
        recalculateTimeRemaining();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Restore timer state on mount
  useEffect(() => {
    const storedState = getStoredTimerState();
    setTimerActive(storedState.isActive);
    setTimerPaused(storedState.isPaused);
    setTimeRemaining(storedState.timeRemaining);
    setSelectedSessionDuration(storedState.sessionDuration);
    
    // If timer was active, recalculate time
    if (storedState.isActive && !storedState.isPaused) {
      recalculateTimeRemaining();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timerActive && !timerPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          saveTimerState({ timeRemaining: newTime });
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      saveTimerState({ isActive: false, isPaused: false });
      
      // Show completion notification
      toast({
        title: "🎉 Timer Complete!",
        description: "Your focus session has ended. Great work! Click reset to start a new session.",
        duration: 0, // Persistent until dismissed
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerActive, timerPaused, timeRemaining]);

  const startTimer = (duration?: number) => {
    const now = Date.now();
    
    if (duration && !timerActive) {
      setTimeRemaining(duration);
      setSelectedSessionDuration(duration);
    }
    
    setTimerActive(true);
    setTimerPaused(false);
    startTimeRef.current = now;
    
    saveTimerState({
      isActive: true,
      isPaused: false,
      timeRemaining: duration || timeRemaining,
      sessionDuration: duration || selectedSessionDuration,
      startTime: now
    });
  };

  const updateTimerDuration = (duration: number) => {
    if (!timerActive) {
      setTimeRemaining(duration);
      setSelectedSessionDuration(duration);
      saveTimerState({ timeRemaining: duration, sessionDuration: duration });
    }
  };

  const pauseTimer = () => {
    const newPausedState = !timerPaused;
    setTimerPaused(newPausedState);
    
    if (newPausedState) {
      // Pausing - save current state
      saveTimerState({ isPaused: true });
    } else {
      // Resuming - update start time
      const now = Date.now();
      startTimeRef.current = now;
      saveTimerState({ isPaused: false, startTime: now });
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimeRemaining(selectedSessionDuration);
    
    saveTimerState({
      isActive: false,
      isPaused: false,
      timeRemaining: selectedSessionDuration,
      startTime: 0
    });
  };

  return {
    timerActive,
    timeRemaining,
    timerPaused,
    selectedSessionDuration,
    startTimer,
    updateTimerDuration,
    pauseTimer,
    resetTimer
  };
};