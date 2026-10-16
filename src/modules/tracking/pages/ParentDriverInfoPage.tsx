import React from 'react';
import { Bus, Phone, ShieldCheck } from 'lucide-react';

export const ParentDriverInfoPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
          Información del Conductor y Vehículo
        </h1>
        <p className="text-xs text-slate-500">
          Datos de la tripulación y unidad asignada a la Ruta 04.
        </p>
      </div>

      {/* Ficha Conductor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
            CZ
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Conductor Asignado
            </span>
            <h2 className="text-base font-extrabold text-slate-900">Carlos Zambrano</h2>
            <p className="text-xs text-slate-500">Licencia Profesional Tipo D &bull; Cooperativa TransValle</p>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-slate-600">
            <span>Vigencia Licencia:</span>
            <strong className="text-slate-900 font-mono">12 / 09 / 2028</strong>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Experiencia en Transporte Escolar:</span>
            <strong className="text-slate-900">8 años</strong>
          </div>
        </div>

        <a
          href="tel:0998765432"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Llamar al Conductor (099-876-5432)</span>
        </a>
      </div>

      {/* Ficha Vehículo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Bus className="w-5 h-5 text-amber-500" />
          <span>Datos de la Unidad Escolar</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Placa Vehicular</span>
            <strong className="text-slate-900 font-mono text-sm">PBY-7821</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Número de Disco</span>
            <strong className="text-slate-900 text-sm">Disco 14</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Modelo / Capacidad</span>
            <strong className="text-slate-900">Hino FC (28 pax)</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Póliza SOAT</span>
            <strong className="text-emerald-700 font-semibold">Vigente (2027)</strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Unidad inspeccionada y certificada por la ANT Ecuador.</span>
        </div>
      </div>
    </div>
  );
};
