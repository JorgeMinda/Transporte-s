import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Route as RouteIcon,
  Truck,
  FileText,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const adminLinks = [
    { to: '/admin', label: 'Panel de Control', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Nómina & Domicilios', icon: Users, end: false },
    { to: '/admin/routes', label: 'Rutas & Paradas', icon: RouteIcon, end: false },
    { to: '/admin/fleet', label: 'Flota & Conductores', icon: Truck, end: false },
    { to: '/admin/audit', label: 'Auditoría & Seguridad', icon: FileText, end: false },
  ];

  return (
    <div className="min-h-[calc(100vh-37px)] bg-slate-100 flex flex-col font-sans">
      {/* Barra de Encabezado Administrativo */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm block tracking-tight leading-tight">
                Consola Administrativa Institucional
              </span>
              <span className="text-xs text-slate-400 block">
                {user.organizationName} &bull; Panel de Gestión Central
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aislamiento RLS Multi-Tenant Activo</span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-800 border border-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-white block">{user.firstName}</span>
                <span className="text-[11px] text-slate-400">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor con Sidebar para Escritorio */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 flex-shrink-0">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
                Gestión Institucional
              </span>
              <nav className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Tarjeta de Seguridad LOPDP */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Normativa LOPDP</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Cédulas, domicilios y fotos de estudiantes protegidos. Auditoría inmutable de accesos activa.
              </p>
            </div>
          </div>
        </aside>

        {/* Contenido Principal Admin */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
