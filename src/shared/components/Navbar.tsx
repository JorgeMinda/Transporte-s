import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { getSyncQueueCount } from '@/shared/lib/offline-db';
import { processSyncQueue } from '@/shared/lib/sync-manager';
import { UserRole } from '@/shared/types';
import { Wifi, WifiOff, RefreshCw, Bus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Consultar periódicamente la cantidad de eventos en la cola local de IndexedDB
  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getSyncQueueCount();
        setQueueCount(count);
      } catch {
        // En caso de que IndexedDB no esté lista
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await processSyncQueue();
    const count = await getSyncQueueCount();
    setQueueCount(count);
    setIsSyncing(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo y Organización */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block leading-tight">
              Transporte Escolar <span className="text-blue-400 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800">SaaS</span>
            </span>
            <span className="text-xs text-slate-400 block truncate max-w-[200px] sm:max-w-xs">
              {user.organizationName}
            </span>
          </div>
        </div>

        {/* Indicadores de Red y Cola Offline (HU-01) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">En Línea</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Modo Offline</span>
            </span>
          )}

          {/* Badge de Cola Outbox con botón para forzar sincronización */}
          {queueCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={!isOnline || isSyncing}
              title="Eventos pendientes de sincronizar con el servidor"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{queueCount} en cola</span>
            </button>
          )}

          {/* Selector Rápido de Rol para Pruebas Multi-Tenant */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <span className="text-xs text-slate-400 hidden md:inline ml-1.5 font-medium">Ver como:</span>
            <select
              value={user.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="bg-slate-900 text-white text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="school_admin">🏫 Admin Colegio</option>
              <option value="driver">🚌 Conductor (Móvil)</option>
              <option value="parent_guardian">👨‍👩‍👧 Representante</option>
              <option value="transporter_admin">🏢 Empresa Trans.</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
