export function fmt(n: number): string {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}
