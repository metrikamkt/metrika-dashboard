import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, Kanban, Users, ClipboardList,
  TrendingUp, Package, UserCheck, Target, FileText, MoreHorizontal, X,
} from 'lucide-react';

const PRIMARY = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Demandas',  icon: ClipboardList,   to: '/demandas'  },
  { label: 'Financeiro',icon: DollarSign,      to: '/financeiro'},
  { label: 'CRM',       icon: Kanban,          to: '/crm'       },
  { label: 'Clientes',  icon: Users,           to: '/clientes'  },
];

const MORE_GROUPS = [
  { section: 'Financeiro', items: [
    { label: 'Faturamento', icon: DollarSign,    to: '/faturamento' },
    { label: 'Financeiro',  icon: TrendingUp,    to: '/financeiro'  },
  ]},
  { section: 'Comercial', items: [
    { label: 'Vendas',    icon: TrendingUp, to: '/vendas'    },
    { label: 'CRM',       icon: Kanban,     to: '/crm'       },
    { label: 'Clientes',  icon: Users,      to: '/clientes'  },
    { label: 'Produtos',  icon: Package,    to: '/produtos'  },
  ]},
  { section: 'Operações', items: [
    { label: 'Pessoas',   icon: UserCheck,  to: '/pessoas'   },
  ]},
  { section: 'Estratégia', items: [
    { label: 'Metas',     icon: Target,     to: '/metas'     },
    { label: 'Contratos', icon: FileText,   to: '/contratos' },
  ]},
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-stretch h-16">
        {PRIMARY.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px] text-gray-500 transition-colors"
        >
          <MoreHorizontal size={20} strokeWidth={1.8} />
          <span className="font-medium">Mais</span>
        </button>
      </nav>

      {/* Bottom sheet overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-surface border-t border-border rounded-t-2xl pb-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-white font-semibold">Todas as seções</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {MORE_GROUPS.map(group => (
              <div key={group.section} className="px-5 pt-4">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  {group.section}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {group.items.map(item => (
                    <button
                      key={item.to}
                      onClick={() => { navigate(item.to); setOpen(false); }}
                      className="flex flex-col items-center gap-1.5 p-3 bg-bg border border-border rounded-card hover:border-primary/40 transition-colors"
                    >
                      <item.icon size={22} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
