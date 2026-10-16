import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { getSyncQueueCount } from '@/shared/lib/offline-db';
import { processSyncQueue } from '@/shared/lib/sync-manager';
import {
  Bus,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  X,
  PhoneCall,
} from 'lucide-react';

export const DriverLayout: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [queueCount, setQueueCount] = useState<number>(0);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [incidentReported, setIncidentReported] = useState<string | null>(null);

  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getSyncQueueCount();
        setQueueCount(count);
      } catch {
        // En caso de IndexedDB ocupada
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleReportIncident = (type: string) => {
    setIncidentReported(`Incidencia reportada: "${type}". Notificación enviada al colegio y a los representantes.`);
    setTimeout(() => {
      setShowIncidentModal(false);
      setIncidentReported(null);
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-37px)] bg-slate-900 text-white flex flex-col font-sans">
      {/* Barra de Telemetría Superior Móvil (Pantalla Conductor) */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Identificador Conductor */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black block tracking-tight">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] text-amber-400 font-bold block">
                Unidad PBY-7821 &bull; Modo Conducción Activo
              </span>
            </div>
          </div>

          {/* Estado de Red & Botón de Incidencia */}
          <div className="flex items-center gap-2">
            {/* Monitor Offline */}
            {isOnline ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-extrabold animate-pulse">
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>Sin Red (Offline)</span>
              </span>
            )}

            {/* Eventos en cola local */}
            {queueCount > 0 && (
              <button
                onClick={() => processSyncQueue().then(() => getSyncQueueCount().then(setQueueCount))}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold"
                title="Presiona para sincronizar con el servidor"
              >
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span>{queueCount}</span>
              </button>
            )}

            {/* Botón de Emergencia / Incidencia */}
            <button
              onClick={() => setShowIncidentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novedad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Área Operativa Principal */}
      <main className="flex-1 p-3 sm:p-5 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Modal Rápido de Reporte de Incidencias en Ruta */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Reportar Novedad en Ruta</span>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {incidentReported ? (
              <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-4 text-center text-emerald-200 text-xs font-bold">
                {incidentReported}
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Selecciona la novedad con un solo toque para notificar automáticamente al colegio y calcular desvíos:
                </p>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                  <button
                    onClick={() => handleReportIncident('Congestión vehicular severa (Tráfico)')}
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left"
                  >
                    🚗 Tráfico Severo (+10 min)
                  </button>
                  <button
                    onClick={() => handleReportIncident('Avería mecánica en la unidad')}
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-amber-300"
                  >
                    ⚙️ Falla Mecánica
                  </button>
                  <button
                    onClick={() => handleReportIncident('Neumático ponchado')}
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left"
                  >
                    🛞 Llanta Baja / Ponchada
                  </button>
                  <button
                    onClick={() => handleReportIncident('Desvío obligado por cierre de vía')}
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left"
                  >
                    🚧 Cierre de Vía / Desvío
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">¿Emergencia médica grave?</span>
                  <a
                    href="tel:911"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Llamar al ECU 911</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
