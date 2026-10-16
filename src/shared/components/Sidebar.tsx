import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { LayoutDashboard, Users, Route as RouteIcon, BusFront, MapPin, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navLinks = [
    {
      to: '/',
      label: 'Panel General',
      icon: LayoutDashboard,
      badge: 'Admin',
      roles: ['school_admin', 'transporter_admin', 'super_admin'],
    },
    {
      to: '/students',
      label: 'Nómina & Domicilios',
      icon: Users,
      badge: 'HU-02',
      roles: ['school_admin', 'transporter_admin'],
    },
    {
      to: '/routes',
      label: 'Rutas & Paradas',
      icon: RouteIcon,
      badge: null,
      roles: ['school_admin', 'transporter_admin'],
    },
    {
      to: '/driver-console',
      label: 'Consola Conductor',
      icon: BusFront,
      badge: 'HU-01/03',
      roles: ['driver', 'school_admin', 'transporter_admin'],
    },
    {
      to: '/live-tracking',
      label: 'Rastreo Padres & Timbre',
      icon: MapPin,
      badge: 'HU-04/05',
      roles: ['parent_guardian', 'school_admin'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Módulos del Sistema
          </span>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Tarjeta de Cumplimiento LOPDP Ecuador */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Blindaje LOPDP</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Datos de menores cifrados y aislados por RLS. Visibilidad de domicilios restringida por parentesco legal.
          </p>
        </div>
      </div>

      {/* Usuario actual */}
      <div className="border-t border-slate-800 pt-3 flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center text-blue-200 text-xs font-bold">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-white truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-[11px] text-slate-400 capitalize truncate">
            {user.role.replace('_', ' ')}
          </p>
        </div>
      </div>
    </aside>
  );
};
