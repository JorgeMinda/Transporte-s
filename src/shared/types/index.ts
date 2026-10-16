// ==============================================================================
// DEFINICIONES DE TIPOS DE DOMINIO - SAAS TRANSPORTE ESCOLAR
// ==============================================================================

export type OrgType = 'school' | 'transport_company' | 'hybrid';

export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'transporter_admin'
  | 'transport_coordinator'
  | 'driver'
  | 'parent_guardian'
  | 'school_gatekeeper';

export type BoardingStatus = 'pending' | 'boarded' | 'dropped_off' | 'absent' | 'excused';

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  identificationNumber?: string;
  gradeLevel: string;
  homeAddress: string;
  homeLocation: {
    lat: number;
    lng: number;
  };
  emergencyPhone: string;
  medicalNotes?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
}

export interface RouteStop {
  id: string;
  routeId: string;
  stopOrder: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  addressReference?: string;
  scheduledTime: string;
  geofenceRadiusMeters: number;
}

export interface Route {
  id: string;
  schoolId: string;
  transporterId: string;
  name: string;
  direction: 'morning_pickup' | 'afternoon_dropoff' | 'round_trip' | 'special';
  vehiclePlate: string;
  driverName: string;
  status: 'active' | 'inactive';
  stopsCount: number;
  studentsCount: number;
}

export interface StudentTripAttendance {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  stopId: string;
  stopName: string;
  addressReference?: string;
  status: BoardingStatus;
  recordedAt?: string;
  parentAcknowledged?: boolean; // El padre marcó "¡Ya estoy en la parada!"
  notes?: string;
}

export interface TripManifest {
  tripId: string;
  routeId: string;
  routeName: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  serviceDate: string;
  status: TripStatus;
  currentStopIndex: number;
  stops: RouteStop[];
  students: StudentTripAttendance[];
}

export interface SyncQueueItem {
  id: string; // UUID v4 idempotente
  action: 'BOARD_STUDENT' | 'DROP_STUDENT' | 'MARK_ABSENT' | 'PARENT_ACK' | 'BATCH_TELEMETRY';
  payload: Record<string, any>;
  clientTimestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

// Micro-payload optimizado para telemetría [lat, lng, speed_kmh, heading, timestamp_sec]
export type CompactTelemetryPayload = [number, number, number, number, number];

export interface VehicleTelemetry {
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  headingDegrees: number;
  recordedAt: string;
  isStale?: boolean; // Si lleva > 45s sin emitir
}
