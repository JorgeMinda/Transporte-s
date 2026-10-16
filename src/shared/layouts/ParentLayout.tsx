import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import {
  MapPin,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const ParentLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-37px)] bg-slate-100 flex flex-col font-sans">
      {/* Encabezado Familiar Superior */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                  Mateo Carrillo
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  5to EGB
                </span>
              </div>
              <span className="text-xs text-slate-500 block">
                {user.organizationName} &bull; Tutor: {user.firstName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Protegido LOPDP</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal del Portal Familiar */}
      <main className="flex-1 p-3 sm:p-5 max-w-2xl w-full mx-auto pb-20">
        <Outlet />
      </main>

      {/* Barra de Navegación Inferior Móvil (Mobile App Experience) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1 text-center">
          <NavLink
            to="/parent"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`
            }
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">En Ruta</span>
          </NavLink>

          <NavLink
            to="/parent/history"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`
            }
          >
            <ClipboardList className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Asistencia</span>
          </NavLink>

          <NavLink
            to="/parent/info"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`
            }
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Conductor</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
