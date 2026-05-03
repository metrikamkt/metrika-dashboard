import { useState, useRef, useEffect } from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePeriod } from '../../context/PeriodContext';
import { useAuth } from '../../context/AuthContext';

const PERIOD_ROUTES = ['/dashboard', '/faturamento', '/financeiro', '/vendas'];

const PERIODS = [
  { value: 'mes', label: 'Este mês' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'ano', label: 'Este ano' },
] as const;

export function Topbar() {
  const { period, setPeriod } = usePeriod();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showPeriod = PERIOD_ROUTES.includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = profile?.displayName || user?.displayName || 'Usuário';
  const firstName = displayName.split(' ')[0];
  const email = user?.email ?? '';
  const photoURL = profile?.photoURL || user?.photoURL || null;
  const role = profile?.role || '';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-surface border-b border-border z-20 flex items-center justify-between px-6"
      style={{ left: 220 }}
    >
      <div className="flex items-center gap-3">
        {showPeriod && (
          <>
            <span className="text-gray-400 text-sm">Período:</span>
            <div className="flex bg-bg rounded-input border border-border p-0.5 gap-0.5">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    period === p.value
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-white">{firstName}</p>
            <p className="text-xs text-gray-500 max-w-[180px] truncate">
              {role || email}
            </p>
          </div>
          {photoURL ? (
            <img
              src={photoURL}
              alt={firstName}
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-52 bg-surface border border-border rounded-card shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-gray-500 text-xs truncate">{email}</p>
              {role && <p className="text-primary text-xs mt-0.5">{role}</p>}
            </div>
            <button
              onClick={() => { setMenuOpen(false); navigate('/perfil'); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <UserCircle size={14} />
              Meu Perfil
            </button>
            <button
              onClick={() => { setMenuOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors border-t border-border"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
