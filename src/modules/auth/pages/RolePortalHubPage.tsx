import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { UserRole } from '@/shared/types';
import { Shield, Bus, Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const RolePortalHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const handleEnterPortal = (role: UserRole, path: string) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-[calc(100vh-37px)] bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-8 font-sans">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Titular */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma SaaS Multiinstitucional de Transporte Escolar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Selecciona la Experiencia de Rol (UI/UX)
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Cada actor dispone de una interfaz especialmente diseñada para su contexto operativo, respetando la seguridad y aislamiento de datos.
          </p>
        </div>

        {/* Las 3 Tarjetas de Portales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Tarjeta 1: Portal Administrador */}
          <div
            onClick={() => handleEnterPortal('school_admin', '/admin')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl p-6 shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block mb-1">
                  Desktop & Tablet
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  Portal Administrativo
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Para autoridades de colegios y cooperativas. Padrón de alumnos, trazado de rutas, gestión de flota vehicular y pistas de auditoría inmutables.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Ingresar como Administrador</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Tarjeta 2: Consola Conductor */}
          <div
            onClick={() => handleEnterPortal('driver', '/driver')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-3xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Bus className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                  Mobile First & Cabina
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Consola Conductor
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Para el chofer en el bus. Botones táctiles grandes de 1 toque (A bordo / Ausente), 100% tolerante a desconexión (Offline IndexedDB) y reporte de novedades.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Ingresar como Conductor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Tarjeta 3: Portal Familiar */}
          <div
            onClick={() => handleEnterPortal('parent_guardian', '/parent')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl p-6 shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                  Mobile Friendly & Familias
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Portal del Representante
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Para padres de familia. Mapa en vivo del recorrido de su hijo, timbre sonoro de proximidad (Web Audio API), cuenta regresiva y botón anti-impuntualidad.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Ingresar como Representante</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Garantía de Aislamiento */}
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Aislamiento de datos gobernado por PostgreSQL Row Level Security (RLS) & Normativa LOPDP Ecuador</span>
        </div>
      </div>
    </div>
  );
};
