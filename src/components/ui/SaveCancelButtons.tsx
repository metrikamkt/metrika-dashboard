interface SaveCancelProps { onSave: () => void; onCancel: () => void }

export function SaveCancelButtons({ onSave, onCancel }: SaveCancelProps) {
  return (
    <div className="flex gap-3 pt-4 border-t border-border mt-6">
      <button onClick={onSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium transition-colors">
        Salvar
      </button>
      <button onClick={onCancel} className="flex-1 bg-bg hover:bg-white/5 text-gray-400 border border-border rounded-input py-2 text-sm transition-colors">
        Cancelar
      </button>
    </div>
  );
}
