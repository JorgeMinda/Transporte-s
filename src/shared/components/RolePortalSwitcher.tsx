import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { UserRole } from '@/shared/types';
import { Shield, Bus, Heart, Sparkles } from 'lucide-react';

export const RolePortalSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchRole } = useAuth();

  const isCurrent = (path: string) => location.pathname.startsWith(path);

  const handleSelectRole = (role: UserRole, targetPath: string) => {
    switchRole(role);
    navigate(targetPath);
  };

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800 px-3 py-1.5 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Identificador de Modo Demo Multi-Rol */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>MODO SIMULADOR DE ROLES</span>
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Viendo como: <strong className="text-white">{user.firstName} {user.lastName}</strong> ({user.organizationName})
          </span>
        </div>

        {/* Pestañas de Cambio de Portal Inmediato */}
        <div className="flex items-center gap-1.5">
          {/* Botón Admin */}
          <button
            onClick={() => handleSelectRole('school_admin', '/admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
              isCurrent('/admin')
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40 ring-1 ring-blue-400'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span>Portal Admin</span>
          </button>

          {/* Botón Conductor */}
          <button
            onClick={() => handleSelectRole('driver', '/driver')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
              isCurrent('/driver')
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40 ring-1 ring-amber-300 font-extrabold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Consola Conductor</span>
          </button>

          {/* Botón Representante */}
          <button
            onClick={() => handleSelectRole('parent_guardian', '/parent')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
              isCurrent('/parent')
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/40 ring-1 ring-emerald-300'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-300" />
            <span>Portal Familia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
