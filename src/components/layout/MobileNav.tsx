import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, Kanban, Users, ClipboardList,
} from 'lucide-react';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Demandas',  icon: ClipboardList,   to: '/demandas'  },
  { label: 'Financeiro',icon: DollarSign,      to: '/financeiro'},
  { label: 'CRM',       icon: Kanban,          to: '/crm'       },
  { label: 'Clientes',  icon: Users,           to: '/clientes'  },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-stretch h-16">
      {items.map(item => (
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
    </nav>
  );
}
