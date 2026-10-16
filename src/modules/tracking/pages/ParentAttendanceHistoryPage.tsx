import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const ParentAttendanceHistoryPage: React.FC = () => {
  const history = [
    {
      id: 'h-1',
      date: 'Hoy, 16 de Octubre 2026',
      serviceType: 'Recogida Matutina',
      status: 'boarded',
      boardTime: '06:48 AM',
      stopName: 'Parada 1: Conjunto Los Cedros',
      driver: 'Carlos Zambrano',
      plate: 'PBY-7821 (Disco 14)',
    },
    {
      id: 'h-2',
      date: 'Ayer, 15 de Octubre 2026',
      serviceType: 'Retorno Vespertino',
      status: 'dropped_off',
      boardTime: '01:15 PM (Salida Plantel)',
      dropTime: '01:52 PM (Entregado en Parada)',
      stopName: 'Parada 1: Conjunto Los Cedros',
      driver: 'Carlos Zambrano',
      plate: 'PBY-7821 (Disco 14)',
    },
    {
      id: 'h-3',
      date: 'Ayer, 15 de Octubre 2026',
      serviceType: 'Recogida Matutina',
      status: 'boarded',
      boardTime: '06:49 AM',
      stopName: 'Parada 1: Conjunto Los Cedros',
      driver: 'Carlos Zambrano',
      plate: 'PBY-7821 (Disco 14)',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
          Historial de Asistencia y Abordajes
        </h1>
        <p className="text-xs text-slate-500">
          Registro cronológico verificable de subidas y bajadas de Mateo Carrillo.
        </p>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{item.date}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                A Bordo
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-extrabold text-slate-900">{item.serviceType}</p>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Abordaje registrado a las: <strong className="text-slate-800 font-mono">{item.boardTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.stopName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Unidad: <strong className="text-slate-600">{item.plate}</strong></span>
              <span>Conductor: <strong className="text-slate-600">{item.driver}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
