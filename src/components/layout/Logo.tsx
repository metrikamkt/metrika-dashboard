export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <span
      className="font-bold text-xl tracking-tight select-none"
      style={{
        background: 'linear-gradient(90deg, #01c2f0, #0087f0)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      Metrika
    </span>
  );
}
