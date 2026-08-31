"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  stop: () => number; // returns elapsed milliseconds
  reset: () => void;
  elapsedMs: number;
}

export function useTimer(): UseTimerReturn {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setSeconds(0);
    setIsRunning(true);
  }, []);

  const stop = useCallback((): number => {
    if (!startTimeRef.current) return 0;
    const elapsed = Date.now() - startTimeRef.current;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return elapsed;
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setSeconds(elapsed);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const elapsedMs = startTimeRef.current
    ? isRunning
      ? Date.now() - startTimeRef.current
      : seconds * 1000
    : 0;

  return { seconds, isRunning, start, stop, reset, elapsedMs };
}
