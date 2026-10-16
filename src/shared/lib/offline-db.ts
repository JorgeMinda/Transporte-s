import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TripManifest, StudentTripAttendance, SyncQueueItem } from '../types';

interface TransportDB extends DBSchema {
  manifests: {
    key: string;
    value: TripManifest;
  };
  attendance: {
    key: string;
    value: StudentTripAttendance;
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'transporte_escolar_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TransportDB>> | null = null;

export function getOfflineDB(): Promise<IDBPDatabase<TransportDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TransportDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store para el manifiesto de viaje activo
        if (!db.objectStoreNames.contains('manifests')) {
          db.createObjectStore('manifests');
        }
        // Store para estados locales de asistencia
        if (!db.objectStoreNames.contains('attendance')) {
          db.createObjectStore('attendance');
        }
        // Store para cola de sincronización (Outbox Pattern)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
        }
      },
    });
  }
  return dbPromise;
}

// -----------------------------------------------------------------------------
// OPERACIONES DEL MANIFIESTO DE VIAJE
// -----------------------------------------------------------------------------

export async function saveActiveTripManifest(manifest: TripManifest): Promise<void> {
  const db = await getOfflineDB();
  await db.put('manifests', manifest, 'active_trip');
  
  // Guardar también estudiantes en la tabla de asistencia local
  const tx = db.transaction('attendance', 'readwrite');
  for (const student of manifest.students) {
    await tx.store.put(student, student.studentId);
  }
  await tx.done;
}

export async function getActiveTripManifest(): Promise<TripManifest | undefined> {
  const db = await getOfflineDB();
  return db.get('manifests', 'active_trip');
}

// -----------------------------------------------------------------------------
// OPERACIONES DE ASISTENCIA LOCAL (0 ms latencia)
// -----------------------------------------------------------------------------

export async function updateLocalAttendance(
  studentId: string,
  newStatus: StudentTripAttendance['status']
): Promise<StudentTripAttendance | null> {
  const db = await getOfflineDB();
  const student = await db.get('attendance', studentId);
  if (!student) return null;

  const updated: StudentTripAttendance = {
    ...student,
    status: newStatus,
    recordedAt: new Date().toISOString(),
  };

  await db.put('attendance', updated, studentId);

  // Encolar en Outbox para sincronizar con el servidor
  const syncItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    action: newStatus === 'boarded' ? 'BOARD_STUDENT' : 'MARK_ABSENT',
    payload: {
      studentId: student.studentId,
      stopId: student.stopId,
      status: newStatus,
      recordedAt: updated.recordedAt,
    },
    clientTimestamp: updated.recordedAt!,
    retryCount: 0,
    status: 'pending',
  };

  await db.put('sync_queue', syncItem);
  return updated;
}

export async function getAllLocalAttendance(): Promise<StudentTripAttendance[]> {
  const db = await getOfflineDB();
  return db.getAll('attendance');
}

// -----------------------------------------------------------------------------
// OPERACIONES DE LA COLA DE SINCRONIZACIÓN (OUTBOX PATTERN)
// -----------------------------------------------------------------------------

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex('sync_queue', 'by-status', 'pending');
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getOfflineDB();
  return db.count('sync_queue');
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('sync_queue', id);
}

export async function markSyncItemFailed(id: string, errorMsg: string): Promise<void> {
  const db = await getOfflineDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.status = 'failed';
    item.retryCount += 1;
    item.lastError = errorMsg;
    await db.put('sync_queue', item);
  }
}
