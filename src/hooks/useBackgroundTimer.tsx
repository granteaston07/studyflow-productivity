import { useEffect, useRef, useState, useCallback } from 'react';

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  timeRemainingAtStart: number; // snapshot when timer was last started/resumed
  startTime: number;            // Date.now() when last started/resumed
  sessionDuration: number;
}

const TIMER_KEY = 'studyflow_timer_state';

function loadState(): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isActive: false, isPaused: false, timeRemainingAtStart: 25 * 60, startTime: 0, sessionDuration: 25 * 60 };
}

function saveState(patch: Partial<TimerState>) {
  const next = { ...loadState(), ...patch };
  localStorage.setItem(TIMER_KEY, JSON.stringify(next));
}

function calcRemaining(state: TimerState): number {
  if (!state.isActive || state.isPaused || !state.startTime) {
    return state.timeRemainingAtStart;
  }
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  return Math.max(0, state.timeRemainingAtStart - elapsed);
}

export const useBackgroundTimer = (onTimerComplete?: () => void) => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [timerPaused, setTimerPaused] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState(25 * 60);

  const completedRef = useRef(false); // prevent double-firing onTimerComplete
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setTimerActive(false);
    setTimerPaused(false);
    saveState({ isActive: false, isPaused: false });
    onTimerComplete?.();
  }, [onTimerComplete]);

  // Core tick — recalculates from wall clock, correct even after tab sleep
  const tick = useCallback(() => {
    const state = loadState();
    if (!state.isActive || state.isPaused) return;
    const remaining = calcRemaining(state);
    setTimeRemaining(remaining);
    if (remaining === 0) handleComplete();
  }, [handleComplete]);

  // Run interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (timerActive && !timerPaused) {
      intervalRef.current = setInterval(tick, 500); // 500ms for snappier UI
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive, timerPaused, tick]);

  // Catch up when tab becomes visible again (browser may have throttled interval)
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [tick]);

  // Restore state on mount
  useEffect(() => {
    const state = loadState();
    const remaining = calcRemaining(state);
    setTimerActive(state.isActive && remaining > 0);
    setTimerPaused(state.isPaused);
    setTimeRemaining(remaining > 0 ? remaining : state.sessionDuration);
    setSelectedSessionDuration(state.sessionDuration);
    completedRef.current = false;
  }, []);

  const startTimer = useCallback((duration?: number) => {
    const now = Date.now();
    const dur = duration ?? selectedSessionDuration;
    const timeLeft = (duration != null) ? duration : timeRemaining;
    completedRef.current = false;
    setTimerActive(true);
    setTimerPaused(false);
    setTimeRemaining(timeLeft);
    if (duration != null) setSelectedSessionDuration(dur);
    saveState({ isActive: true, isPaused: false, startTime: now, timeRemainingAtStart: timeLeft, sessionDuration: dur });
  }, [selectedSessionDuration, timeRemaining]);

  const updateTimerDuration = useCallback((duration: number) => {
    setSelectedSessionDuration(duration);
    setTimeRemaining(duration);
    saveState({ sessionDuration: duration, timeRemainingAtStart: duration });
  }, []);

  const pauseTimer = useCallback(() => {
    const state = loadState();
    if (!timerPaused) {
      // Pausing — snapshot current remaining
      const remaining = calcRemaining(state);
      setTimerPaused(true);
      setTimeRemaining(remaining);
      saveState({ isPaused: true, timeRemainingAtStart: remaining, startTime: 0 });
    } else {
      // Resuming
      const now = Date.now();
      setTimerPaused(false);
      saveState({ isPaused: false, startTime: now });
    }
  }, [timerPaused]);

  const resetTimer = useCallback(() => {
    completedRef.current = false;
    setTimerActive(false);
    setTimerPaused(false);
    setTimeRemaining(selectedSessionDuration);
    saveState({ isActive: false, isPaused: false, timeRemainingAtStart: selectedSessionDuration, startTime: 0 });
  }, [selectedSessionDuration]);

  return { timerActive, timeRemaining, timerPaused, selectedSessionDuration, startTimer, updateTimerDuration, pauseTimer, resetTimer };
};
