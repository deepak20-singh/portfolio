import { useState, useCallback } from 'react';
import { lsGet, lsSet } from '../utils/persistence';

const LS_KEY = 'portfolio-tweaks';

export type TweakValues = Record<string, unknown>;

export function useTweaks<T extends TweakValues>(defaults: T): [T, (keyOrEdits: keyof T | Partial<T>, val?: T[keyof T]) => void] {
  const [values, setValues] = useState<T>(() => lsGet<T>(LS_KEY, defaults));

  const setTweak = useCallback(
    (keyOrEdits: keyof T | Partial<T>, val?: T[keyof T]) => {
      const edits =
        typeof keyOrEdits === 'object' && keyOrEdits !== null
          ? (keyOrEdits as Partial<T>)
          : ({ [keyOrEdits]: val } as Partial<T>);
      setValues((prev) => {
        const next = { ...prev, ...edits };
        lsSet(LS_KEY, next);
        return next;
      });
    },
    [],
  );

  return [values, setTweak];
}
