import React, { useState, useEffect } from 'react';
import { MOCK_ACTIVE_TRIP } from '@/shared/lib/mock-data';
import {
  saveActiveTripManifest,
  getActiveTripManifest,
  updateLocalAttendance,
  getSyncQueueCount,
} from '@/shared/lib/offline-db';
import { playSuccessBeep } from '@/shared/lib/audio-chime';
import { processSyncQueue } from '@/shared/lib/sync-manager';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { StudentTripAttendance, TripManifest } from '@/shared/types';
import {
  Bus,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Wifi,
  WifiOff,
  RefreshCw,
  Navigation,
  Check,
} from 'lucide-react';

export const DriverConsolePage: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [manifest, setManifest] = useState<TripManifest>(MOCK_ACTIVE_TRIP);
  const [currentStopId, setCurrentStopId] = useState<string>('stop-1');
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSimulatingGps] = useState<boolean>(true);
  const [simulatedSpeed] = useState<number>(32);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'boarded' | 'absent'>('all');

  // Inicializar o cargar desde IndexedDB (HU-01)
  useEffect(() => {
    const initStore = async () => {
      let stored = await getActiveTripManifest();
      if (!stored) {
        await saveActiveTripManifest(MOCK_ACTIVE_TRIP);
        stored = MOCK_ACTIVE_TRIP;
      }
      setManifest(stored);
      const count = await getSyncQueueCount();
      setQueueCount(count);
    };
    initStore();
  }, []);

  // Actualizar asistencia en IndexedDB con 0 ms de latencia (HU-03)
  const handleUpdateStatus = async (
    studentId: string,
    newStatus: StudentTripAttendance['status']
  ) => {
    // 1. Sonido táctil inmediato
    playSuccessBeep();

    // 2. Actualización en IndexedDB
    await updateLocalAttendance(studentId, newStatus);

    // 3. Actualizar estado en memoria
    setManifest((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.studentId === studentId ? { ...s, status: newStatus, recordedAt: new Date().toISOString() } : s
      ),
    }));

    // 4. Refrescar contador de la cola
    const count = await getSyncQueueCount();
    setQueueCount(count);

    // 5. Si hay red, sincronizar en segundo plano
    if (isOnline) {
      processSyncQueue().then(async () => {
        const remaining = await getSyncQueueCount();
        setQueueCount(remaining);
      });
    }
  };

  const filteredStudents = manifest.students.filter((student) => {
    if (statusFilter === 'all') return true;
    return student.status === statusFilter;
  });

  const boardedCount = manifest.students.filter((s) => s.status === 'boarded').length;
  const absentCount = manifest.students.filter((s) => s.status === 'absent').length;
  const pendingCount = manifest.students.filter((s) => s.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Banner de Estado de Ruta & Telemetría en Vivo (HU-01) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">{manifest.routeName}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {manifest.vehiclePlate}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Conductor: <strong className="text-slate-200">{manifest.driverName}</strong> &bull; {manifest.serviceDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Estado GPS Adaptativo */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>
                GPS: <strong className="text-white">{isSimulatingGps ? `${simulatedSpeed} km/h` : 'Pausado'}</strong>
              </span>
            </div>

            {/* Estado Offline y Cola */}
            {isOnline ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Resumen numérico rápido de asistencia */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px] mb-0.5">A Bordo</span>
            <span className="text-xl font-extrabold text-emerald-400">{boardedCount}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px] mb-0.5">Pendientes</span>
            <span className="text-xl font-extrabold text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px] mb-0.5">Ausentes</span>
            <span className="text-xl font-extrabold text-rose-400">{absentCount}</span>
          </div>
        </div>

        {/* Aviso si hay eventos encolados en IndexedDB */}
        {queueCount > 0 && (
          <div className="mt-3 bg-amber-950/60 border border-amber-800/70 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span>
                <strong>{queueCount} evento(s)</strong> guardados localmente en el teléfono (se sincronizarán con el servidor).
              </span>
            </div>
            {isOnline && (
              <button
                onClick={() => processSyncQueue().then(() => getSyncQueueCount().then(setQueueCount))}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px]"
              >
                Sincronizar Ya
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selector de Paradas Secuenciales (Ruta) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
          Paradas Programadas de la Ruta
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {manifest.stops.map((stop) => {
            const isSelected = stop.id === currentStopId;
            return (
              <button
                key={stop.id}
                onClick={() => setCurrentStopId(stop.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Parada {stop.stopOrder}</span>
                  <span className="text-blue-600 font-mono">{stop.scheduledTime}</span>
                </div>
                <p className="font-bold text-xs text-slate-900 truncate">{stop.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{stop.addressReference}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nómina Digital en Ruta (HU-03): Botones Táctiles Grandes de 1 Toque */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Nómina de Pasajeros ({filteredStudents.length})
          </h2>

          {/* Filtro de estado */}
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl text-xs font-bold">
            {(['all', 'pending', 'boarded', 'absent'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === filter
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'all' ? 'Todos' : filter === 'boarded' ? 'A bordo' : filter === 'pending' ? 'Pendientes' : 'Ausentes'}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas de estudiantes optimizadas para operar con 1 mano */}
        <div className="space-y-2.5">
          {filteredStudents.map((student) => {
            const isBoarded = student.status === 'boarded';
            const isAbsent = student.status === 'absent';

            return (
              <div
                key={student.studentId}
                className={`rounded-2xl border p-4 transition-all bg-white shadow-sm ${
                  isBoarded
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : isAbsent
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Datos del estudiante */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">
                        {student.studentName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {student.gradeLevel}
                      </span>
                      {/* Distintivo si el padre marcó "Ya estoy en la parada" */}
                      {student.parentAcknowledged && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 animate-pulse">
                          <Check className="w-3 h-3" /> Padre listo en parada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.stopName} &bull; <em className="text-slate-600">{student.addressReference}</em></span>
                    </div>
                  </div>

                  {/* Botones de acción táctiles grandes (>50px alto para no errar al tocar) */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleUpdateStatus(student.studentId, 'boarded')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${
                        isBoarded
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>A Bordo</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(student.studentId, 'absent')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${
                        isAbsent
                          ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-500'
                          : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 active:scale-95'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Ausente</span>
                    </button>

                    <a
                      href="tel:0991234567"
                      className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                      title="Llamar al representante legal"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Hora de registro local */}
                {student.recordedAt && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Registrado localmente a las {new Date(student.recordedAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
