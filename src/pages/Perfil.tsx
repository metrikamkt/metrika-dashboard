import { useState, useRef } from 'react';
import { Camera, Mail, Phone, Briefcase, User, Save, Loader2, DatabaseBackup } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';

export default function Perfil() {
  const { user, profile, updateUserProfile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { migrateFromLocalStorage } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const [form, setForm] = useState({
    displayName: profile?.displayName ?? user?.displayName ?? '',
    phone: profile?.phone ?? '',
    role: profile?.role ?? '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile?.photoURL ?? user?.photoURL ?? null
  );

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Foto deve ter menos de 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) { showToast('Nome não pode ficar vazio'); return; }
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: form.displayName.trim(),
        phone: form.phone,
        role: form.role,
        photoURL: photoPreview,
      });
      showToast('Perfil atualizado com sucesso');
    } catch {
      showToast('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.displayName
    ? form.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="text-gray-500 text-sm">Gerencie suas informações de conta</p>
      </div>

      <div className="bg-surface border border-border rounded-card p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-2xl font-bold border-2 border-border">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Trocar foto
          </button>
          <p className="text-gray-600 text-xs mt-1">JPG ou PNG · máx 2MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* Campos */}
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <User size={13} /> Nome completo
            </label>
            <input
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              className="w-full bg-bg border border-border rounded-input px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Mail size={13} /> E-mail
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full bg-bg/50 border border-border/50 rounded-input px-3 py-2.5 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1">E-mail vinculado à conta Google · não editável</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Phone size={13} /> Telefone / WhatsApp
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full bg-bg border border-border rounded-input px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Briefcase size={13} /> Cargo / Função
            </label>
            <input
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Ex: Gerente de Marketing"
              className="w-full bg-bg border border-border rounded-input px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Info conta Google */}
        <div className="mt-6 p-4 bg-bg border border-border/50 rounded-input flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0">
            <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Conta Google vinculada</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">Ativa</span>
        </div>

        {/* Botão salvar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-input text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>


        {/* Migração de dados — apenas admin */}
        {isAdmin && localStorage.getItem('metrika_data_v2') && (
          <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-input">
            <p className="text-yellow-400 text-xs font-medium mb-1">Dados antigos encontrados</p>
            <p className="text-gray-500 text-xs mb-3">
              Encontramos dados salvos localmente no navegador. Clique abaixo para importá-los para o banco de dados.
            </p>
            <button
              onClick={async () => {
                setMigrating(true);
                const ok = await migrateFromLocalStorage();
                setMigrating(false);
                if (ok) {
                  showToast('Dados importados com sucesso!');
                  localStorage.removeItem('metrika_data_v2');
                } else {
                  showToast('Nenhum dado encontrado para importar');
                }
              }}
              disabled={migrating}
              className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-input text-sm font-medium transition-colors disabled:opacity-60"
            >
              {migrating ? <Loader2 size={14} className="animate-spin" /> : <DatabaseBackup size={14} />}
              {migrating ? 'Importando...' : 'Importar dados do navegador'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
