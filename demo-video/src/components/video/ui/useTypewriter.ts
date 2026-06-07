import { useEffect, useState } from 'react';

export function useTypewriter(
  text: string,
  { startDelay = 0, charDelay = 120, enabled = true }: { startDelay?: number; charDelay?: number; enabled?: boolean } = {},
) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (!enabled) {
      setShown('');
      return;
    }
    setShown('');
    const timers: number[] = [];
    for (let i = 1; i <= text.length; i++) {
      timers.push(
        window.setTimeout(() => setShown(text.slice(0, i)), startDelay + i * charDelay),
      );
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [text, startDelay, charDelay, enabled]);

  const done = shown.length === text.length;
  const lastChar = shown.length > 0 ? shown[shown.length - 1] : '';
  return { shown, done, lastChar };
}
