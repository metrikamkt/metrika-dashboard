import React, { createContext, useContext, useState } from 'react';

type Period = 'mes' | 'trimestre' | 'ano';
interface PeriodContextType { period: Period; setPeriod: (p: Period) => void }
const PeriodContext = createContext<PeriodContextType>({ period: 'mes', setPeriod: () => {} });

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>('mes');
  return <PeriodContext.Provider value={{ period, setPeriod }}>{children}</PeriodContext.Provider>;
}

export function usePeriod() { return useContext(PeriodContext); }
