import React from 'react';
import { MOCK_ROUTES } from '@/shared/lib/mock-data';
import { Route as RouteIcon, Bus, User, MapPin, Plus } from 'lucide-react';

export const RoutesManagementPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <RouteIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Gestión de Rutas y Paradas
            </h1>
            <p className="text-xs text-slate-500">
              Configuración de itinerarios, asignación de unidades vehiculares y paradas secuenciales.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Nueva Ruta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_ROUTES.map((route) => (
          <div key={route.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {route.direction === 'morning_pickup' ? 'Recogida Matutina' : 'Retorno'}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">{route.name}</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Activa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Bus className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Unidad / Placa</span>
                  <strong className="text-slate-900">{route.vehiclePlate}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Conductor</span>
                  <strong className="text-slate-900">{route.driverName}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span><strong>{route.stopsCount}</strong> Paradas programadas</span>
              </span>
              <span><strong>{route.studentsCount}</strong> Estudiantes inscritos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
