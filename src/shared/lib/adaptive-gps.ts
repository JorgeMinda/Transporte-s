// ==============================================================================
// ALGORITMO DE MUESTREO ADAPTATIVO (DEAD RECKONING) Y MICRO-PAYLOADS
// Optimiza el consumo de datos para usuarios prepago (< 1.5 MB por hora)
// ==============================================================================

import { CompactTelemetryPayload, VehicleTelemetry } from '../types';

export interface GPSReading {
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  timestamp: number; // Unix ms
}

/**
 * Calcula la distancia en metros entre dos coordenadas usando la fórmula de Haversine
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class AdaptiveGPSSampler {
  private lastTransmitted: GPSReading | null = null;
  private readonly STOPPED_SPEED_THRESHOLD_KMH = 3.0; // Considerado detenido
  private readonly STOPPED_PING_INTERVAL_MS = 60000; // 60 segundos si está detenido
  private readonly MOVING_INTERVAL_MS = 12000; // 12 segundos en marcha recta
  private readonly DISTANCE_THRESHOLD_METERS = 75; // 75 metros
  private readonly HEADING_DELTA_THRESHOLD_DEG = 25; // Giro pronunciado > 25°

  /**
   * Evalúa si una nueva lectura GPS amerita ser transmitida por la red
   */
  public shouldTransmit(reading: GPSReading): boolean {
    if (!this.lastTransmitted) {
      this.lastTransmitted = reading;
      return true;
    }

    const timeDiffMs = reading.timestamp - this.lastTransmitted.timestamp;
    const distanceMeters = calculateHaversineDistance(
      this.lastTransmitted.lat,
      this.lastTransmitted.lng,
      reading.lat,
      reading.lng
    );

    // CASO 1: Vehículo detenido en parada o semáforo
    if (reading.speedKmh < this.STOPPED_SPEED_THRESHOLD_KMH) {
      if (timeDiffMs >= this.STOPPED_PING_INTERVAL_MS) {
        this.lastTransmitted = reading;
        return true; // Solo un ping de presencia cada 60s
      }
      return false; // Ahorro total de megas mientras espera
    }

    // CASO 2: Giro pronunciado (para trazar curvas fieles en el mapa)
    const headingDelta = Math.abs(reading.heading - this.lastTransmitted.heading);
    const normalizedDelta = headingDelta > 180 ? 360 - headingDelta : headingDelta;
    if (normalizedDelta >= this.HEADING_DELTA_THRESHOLD_DEG) {
      this.lastTransmitted = reading;
      return true;
    }

    // CASO 3: Movimiento en marcha normal
    if (distanceMeters >= this.DISTANCE_THRESHOLD_METERS || timeDiffMs >= this.MOVING_INTERVAL_MS) {
      this.lastTransmitted = reading;
      return true;
    }

    return false;
  }

  /**
   * Serializa la lectura a un micro-payload compacto (50 bytes vs 250 bytes de JSON tradicional)
   * Formato: [lat, lng, speed_kmh, heading, timestamp_sec]
   */
  public serializeToCompact(reading: GPSReading): CompactTelemetryPayload {
    return [
      Number(reading.lat.toFixed(6)),
      Number(reading.lng.toFixed(6)),
      Number(reading.speedKmh.toFixed(1)),
      Math.round(reading.heading),
      Math.floor(reading.timestamp / 1000),
    ];
  }

  /**
   * Decodifica un micro-payload compacto a un objeto legible para el mapa
   */
  public static deserializeCompact(tripId: string, payload: CompactTelemetryPayload): VehicleTelemetry {
    return {
      tripId,
      lat: payload[0],
      lng: payload[1],
      speedKmh: payload[2],
      headingDegrees: payload[3],
      recordedAt: new Date(payload[4] * 1000).toISOString(),
    };
  }
}
