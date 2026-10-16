import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import {
  Bus,
  Users,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Wifi,
  Sparkles,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Banner de Bienvenida y Estado del Sistema */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Plataforma SaaS Operativa &bull; Código Base Inicial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bienvenido, {user.firstName}
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Sistema de transporte escolar activo para <strong>{user.organizationName}</strong>. 
            Módulos listos para pruebas de campo en modo offline, telemetría adaptativa y timbre de proximidad.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Bus className="w-96 h-96" />
        </div>
      </div>

      {/* Métricas Operativas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rutas Activas</span>
            <Bus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">2 / 2</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">● En servicio matutino</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estudiantes a Bordo</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">18</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">De 18 inscritos hoy</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Puntualidad</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">97.4%</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">↑ +1.2% este mes</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resiliencia Offline</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">0 ms</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">IndexedDB activo</span>
        </div>
      </div>

      {/* Accesos Directos a las 3 Épicas del Proyecto */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Flujos de Prueba Rápidos (Historias de Usuario)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Épica 1 y 2: Consola Conductor */}
          <Link
            to="/driver-console"
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  HU-01 &bull; HU-03
                </span>
                <Bus className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Consola Móvil de Conductor
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prueba el registro táctil de asistencia con 1 solo toque, la tolerancia a desconexión y la cola de sincronización local (IndexedDB).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Abrir Consola</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Épica 3: Rastreo Padres & Timbre */}
          <Link
            to="/live-tracking"
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  HU-04 &bull; HU-05
                </span>
                <MapPin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Rastreo en Vivo & Timbre Sonoro
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visualiza el bus escolar en tiempo real sobre el mapa, activa el timbre de proximidad (Web Audio API) y el botón "¡Ya estamos en la parada!".
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Ver Mapa en Vivo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Épica 2: Nómina y Domicilios */}
          <Link
            to="/students"
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  HU-02
                </span>
                <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Padrón de Estudiantes & Domicilios
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Administra la nómina de alumnos, añade o retira estudiantes de las rutas y asigna sus coordenadas domiciliarias precisas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Gestionar Nómina</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tarjeta de Especificación Técnica & Garantías */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 text-xs">
        <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Blindaje Técnico y Arquitectura Validada</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="text-white block mb-0.5">PostGIS + RLS</strong>
            Cálculo nativo de distancias y geocercas en base de datos con aislamiento de privacidad por colegio y familia.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="text-white block mb-0.5">Muestreo Adaptativo</strong>
            Dead Reckoning que ahorra megas prepago enviando micro-payloads compactos de 50 bytes.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="text-white block mb-0.5">Web Audio API</strong>
            Timbre sonoro sintetizado matemáticamente en tiempo de ejecución sin descargar archivos MP3 de la red.
          </div>
        </div>
      </div>
    </div>
  );
};
