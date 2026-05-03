interface ProgressBarProps {
  label: string;
  atual: number;
  alvo: number;
  unidade?: string;
  responsavel?: string;
}

function getColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function ProgressBar({ label, atual, alvo, unidade: _unidade = '', responsavel }: ProgressBarProps) {
  const pct = Math.min((atual / alvo) * 100, 100);
  const color = getColor(pct);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm text-white font-medium">{label}</span>
        <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {responsavel && <p className="text-xs text-gray-600 mt-0.5">Resp: {responsavel}</p>}
    </div>
  );
}
