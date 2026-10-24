import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, UserCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const ITEMS = [
  { to: '/',        icon: Home,        key: 'home'    },
  { to: '/search',  icon: Search,      key: 'search'  },
  { to: '/library', icon: Library,     key: 'library' },
  { to: '/profile', icon: UserCircle,  key: 'profile' },
];

export default function BottomNav() {
  const { t } = useI18n();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden
                 bg-[#121212]/95 backdrop-blur-md border-t border-white/8
                 flex items-stretch"
      aria-label="Mobile navigation"
    >
      {ITEMS.map(({ to, icon: Icon, key }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-2 gap-0.5
             transition-colors duration-150
             ${isActive ? 'text-white' : 'text-sp-muted hover:text-white/70'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-sp-green' : ''}
              />
              <span
                className={`text-[10px] font-medium leading-none
                             ${isActive ? 'text-white' : 'text-sp-muted'}`}
              >
                {t(key)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
