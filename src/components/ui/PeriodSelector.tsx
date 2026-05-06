import { usePeriod } from '../../context/PeriodContext';

const PERIODS = [
  { value: 'mes',       label: 'Este mês'  },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'ano',       label: 'Este ano'  },
] as const;

export function PeriodSelector() {
  const { period, setPeriod } = usePeriod();
  return (
    <>
      {/* Mobile: compact select */}
      <select
        value={period}
        onChange={e => setPeriod(e.target.value as typeof period)}
        className="md:hidden bg-surface border border-border rounded-input px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
      >
        {PERIODS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Desktop: button group */}
      <div className="hidden md:flex bg-surface border border-border rounded-input p-0.5 gap-0.5">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              period === p.value ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </>
  );
}
