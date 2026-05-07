import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { PeriodProvider } from './context/PeriodContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Faturamento from './pages/Faturamento';
import Financeiro from './pages/Financeiro';
import Vendas from './pages/Vendas';
import CRM from './pages/CRM';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Pessoas from './pages/Pessoas';
import Metas from './pages/Metas';
import Contratos from './pages/Contratos';
import Demandas from './pages/Demandas';
import Perfil from './pages/Perfil';

function AppShell() {
  return (
    <DataProvider>
      <PeriodProvider>
        <ToastProvider>
          <div className="flex min-h-screen bg-bg overflow-x-hidden">
            <Sidebar />
            <MobileNav />
            <div className="flex-1 min-w-0 flex flex-col md:ml-[220px]">
              <Topbar />
              <main className="flex-1 min-w-0 p-4 md:p-6 mt-16 pb-20 md:pb-6 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/demandas" element={<Demandas />} />
                  <Route path="/faturamento" element={<Faturamento />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/crm" element={<CRM />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/pessoas" element={<Pessoas />} />
                  <Route path="/metas" element={<Metas />} />
                  <Route path="/contratos" element={<Contratos />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </main>
            </div>
          </div>
        </ToastProvider>
      </PeriodProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
