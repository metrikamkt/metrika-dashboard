import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, TrendingUp, Users, Package,
  UserCheck, Target, ChevronRight, Kanban, FileText, ClipboardList
} from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';

const nav = [
  { section: 'Visão Geral', items: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Demandas', icon: ClipboardList, to: '/demandas' },
  ]},
  { section: 'Financeiro', items: [
    { label: 'Faturamento', icon: DollarSign, to: '/faturamento' },
    { label: 'Financeiro', icon: TrendingUp, to: '/financeiro' },
  ]},
  { section: 'Comercial', items: [
    { label: 'Vendas', icon: TrendingUp, to: '/vendas' },
    { label: 'CRM', icon: Kanban, to: '/crm' },
    { label: 'Clientes', icon: Users, to: '/clientes' },
    { label: 'Produtos', icon: Package, to: '/produtos' },
  ]},
  { section: 'Operações', items: [
    { label: 'Pessoas', icon: UserCheck, to: '/pessoas' },
  ]},
  { section: 'Estratégia', items: [
    { label: 'Metas', icon: Target, to: '/metas' },
    { label: 'Contratos', icon: FileText, to: '/contratos' },
  ]},
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen bg-surface border-r border-border flex-col transition-all duration-300 z-30"
      style={{ width: collapsed ? 64 : 220 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border min-h-[64px]">
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="text-gray-500 hover:text-white transition-colors mx-auto"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {nav.map(group => (
          <div key={group.section} className="mb-3">
            {!collapsed && (
              <p className="text-[10px] text-gray-600 uppercase tracking-widest px-4 mb-1 mt-2">{group.section}</p>
            )}
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 mx-2 rounded-input text-sm transition-all duration-150 ${
                    collapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={17} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        {!collapsed && <p className="text-xs text-gray-700">v2.0.0</p>}
      </div>
    </aside>
  );
}
