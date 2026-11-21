import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function compute(target: number): Countdown {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
}

export function useCountdown(target: Date): Countdown {
  const t = target.getTime();
  const [value, setValue] = useState(() => compute(t));
  useEffect(() => {
    const id = window.setInterval(() => setValue(compute(t)), 1000);
    return () => window.clearInterval(id);
  }, [t]);
  return value;
}
