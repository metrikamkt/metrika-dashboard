import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AccessDenied() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-2">Acesso não autorizado</h1>
        <p className="text-gray-500 text-sm mb-1">
          A conta <span className="text-gray-300">{user?.email}</span> não tem permissão para acessar o sistema.
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Entre em contato com o administrador para solicitar acesso.
        </p>
        <div className="bg-surface border border-border rounded-card p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1">Administrador</p>
          <p className="text-white text-sm font-medium">Arthur Haag</p>
          <p className="text-gray-400 text-xs">arthur.haag2511@gmail.com</p>
        </div>
        <button
          onClick={logout}
          className="w-full py-2.5 bg-surface border border-border rounded-input text-gray-400 hover:text-white text-sm transition-colors"
        >
          Sair e tentar com outra conta
        </button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasAccess } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasAccess) return <AccessDenied />;

  return <>{children}</>;
}
