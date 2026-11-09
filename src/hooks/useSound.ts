import { useCallback, useEffect, useRef } from 'react';

export type SoundName =
  | 'placeX'
  | 'placeO'
  | 'win'
  | 'draw'
  | 'invalid'
  | 'reset';

interface Tone {
  frequency: number;
  endFrequency?: number;
  delay?: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

const SOUNDS: Record<SoundName, Tone[]> = {
  placeX: [
    {
      frequency: 560,
      endFrequency: 780,
      duration: 0.09,
      type: 'sine',
      volume: 0.035,
    },
  ],
  placeO: [
    {
      frequency: 390,
      endFrequency: 300,
      duration: 0.1,
      type: 'triangle',
      volume: 0.04,
    },
  ],
  win: [
    { frequency: 523.25, delay: 0, duration: 0.16, type: 'sine', volume: 0.035 },
    {
      frequency: 659.25,
      delay: 0.09,
      duration: 0.18,
      type: 'sine',
      volume: 0.035,
    },
    {
      frequency: 783.99,
      delay: 0.18,
      duration: 0.2,
      type: 'sine',
      volume: 0.035,
    },
    {
      frequency: 1046.5,
      delay: 0.28,
      duration: 0.38,
      type: 'sine',
      volume: 0.03,
    },
  ],
  draw: [
    {
      frequency: 392,
      endFrequency: 370,
      duration: 0.18,
      type: 'triangle',
      volume: 0.03,
    },
    {
      frequency: 329.63,
      endFrequency: 294,
      delay: 0.13,
      duration: 0.28,
      type: 'triangle',
      volume: 0.028,
    },
  ],
  invalid: [
    {
      frequency: 150,
      endFrequency: 118,
      duration: 0.07,
      type: 'square',
      volume: 0.018,
    },
  ],
  reset: [
    {
      frequency: 300,
      endFrequency: 220,
      duration: 0.1,
      type: 'sine',
      volume: 0.022,
    },
  ],
};

export function useSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!contextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextConstructor) return null;
      contextRef.current = new AudioContextConstructor();
    }

    if (contextRef.current.state === 'suspended') {
      void contextRef.current.resume();
    }

    return contextRef.current;
  }, []);

  // Browsers require a user gesture before audio can start. Warm the context
  // on the very first interaction, even while muted, so unmuting is instant.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      const context = getContext();
      void context?.resume();
    };

    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });

    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, [getContext]);

  const play = useCallback(
    (sound: SoundName) => {
      if (!enabledRef.current) return;

      const context = getContext();
      if (!context) return;

      const now = context.currentTime;

      for (const tone of SOUNDS[sound]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = now + (tone.delay ?? 0);
        const end = start + tone.duration;

        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.frequency, start);
        if (tone.endFrequency) {
          oscillator.frequency.exponentialRampToValueAtTime(
            tone.endFrequency,
            end,
          );
        }

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(tone.volume, 0.0002),
          start + 0.008,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(end + 0.02);
      }
    },
    [getContext],
  );

  return play;
}
