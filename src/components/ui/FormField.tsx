interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}

export function FormField({ label, value, onChange, type = 'text', step }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}
