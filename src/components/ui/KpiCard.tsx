import type { ReactNode } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  delta: number;
  sparkline: number[];
  icon?: ReactNode;
}

export function KpiCard({ title, value, delta, sparkline }: KpiCardProps) {
  const isPositive = delta >= 0;
  const data = sparkline.map((v, i) => ({ v, i }));

  return (
    <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3">
      <p className="text-gray-400 text-sm">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositive ? '+' : ''}{delta.toFixed(1)}% vs anterior
          </span>
        </div>
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={6}>
              <Bar dataKey="v" fill="#0087f0" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
