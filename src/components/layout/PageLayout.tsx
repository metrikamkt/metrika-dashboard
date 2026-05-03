import type { ReactNode } from 'react';
import { Edit2 } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
}

export function PageLayout({ title, children, onEdit }: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-input text-sm font-medium transition-all"
          >
            <Edit2 size={14} />
            Editar dados
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
