import { getPendingSyncItems, removeSyncItem, markSyncItemFailed } from './offline-db';
import { supabase, isSupabaseConfigured } from './supabase';

let isSyncing = false;

export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  if (isSyncing) return { processed: 0, failed: 0 };
  if (!navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  isSyncing = true;
  let processed = 0;
  let failed = 0;

  try {
    const pendingItems = await getPendingSyncItems();

    for (const item of pendingItems) {
      try {
        if (isSupabaseConfigured()) {
          // Si Supabase está conectado, invocar la función RPC idempotente
          const { error } = await supabase.rpc('sync_offline_attendance', {
            p_client_event_id: item.id,
            p_trip_id: item.payload.tripId,
            p_student_id: item.payload.studentId,
            p_stop_id: item.payload.stopId,
            p_status: item.payload.status,
            p_client_recorded_at: item.clientTimestamp,
            p_driver_id: item.payload.driverId || '00000000-0000-0000-0000-000000000000',
            p_notes: item.payload.notes || null,
          });

          if (error) throw error;
        } else {
          // En modo offline/local mock: simular éxito de red con latencia mínima
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        // Remover item procesado con éxito
        await removeSyncItem(item.id);
        processed++;
      } catch (err: any) {
        console.warn(`[SyncManager] Error al sincronizar evento ${item.id}:`, err);
        await markSyncItemFailed(item.id, err?.message || 'Error de red');
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { processed, failed };
}

// Iniciar listener automático para reconexión de red
export function initAutoSync(onSyncComplete?: (count: number) => void): () => void {
  const handleOnline = async () => {
    const result = await processSyncQueue();
    if (result.processed > 0 && onSyncComplete) {
      onSyncComplete(result.processed);
    }
  };

  window.addEventListener('online', handleOnline);

  // Intentar sincronizar periódicamente cada 30s si hay conexión
  const interval = setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue().then((res) => {
        if (res.processed > 0 && onSyncComplete) {
          onSyncComplete(res.processed);
        }
      });
    }
  }, 30000);

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(interval);
  };
}
