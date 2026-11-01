"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/** Generate random exercise state after hydration so the server and browser cannot render different questions. */
export function useClientGeneratedState<T>(factory: () => T): [T | null, Dispatch<SetStateAction<T | null>>] {
  const factoryRef = useRef(factory);
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    setValue(factoryRef.current());
  }, []);

  return [value, setValue];
}
