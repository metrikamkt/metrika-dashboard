type BadgeVariant = 'ok' | 'atencao' | 'critico';

interface BadgeProps { variant: BadgeVariant; label: string }

const styles: Record<BadgeVariant, string> = {
  ok: 'bg-green-500/20 text-green-400 border-green-500/30',
  atencao: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  critico: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const labels: Record<BadgeVariant, string> = {
  ok: 'OK',
  atencao: 'Atenção',
  critico: 'Crítico',
};

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {label || labels[variant]}
    </span>
  );
}
