import React, { useState, useEffect, useRef } from 'react';
import { playSchoolChime } from '@/shared/lib/audio-chime';
import { calculateHaversineDistance } from '@/shared/lib/adaptive-gps';
import {
  Bus,
  Volume2,
  CheckCircle2,
  Phone,
  Clock,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

export const ParentLiveTrackingPage: React.FC = () => {
  // Coordenadas simuladas para Quito / Cumbayá
  const studentStop = {
    name: 'Parada 1: Conjunto Los Cedros',
    address: 'Av. Ilaló y Calle 3 (Portón negro)',
    lat: -0.180653,
    lng: -78.467834,
  };

  // Posición del bus en aproximación
  const [busPosition, setBusPosition] = useState({
    lat: -0.183500,
    lng: -78.471000,
    speedKmh: 34,
    heading: 42,
  });

  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false);
  const [isChimeActive, setIsChimeActive] = useState<boolean>(false);
  const [etaSeconds, setEtaSeconds] = useState<number>(165); // ~2 min 45s
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);

  // Calcular distancia en metros
  const distanceMeters = Math.round(
    calculateHaversineDistance(busPosition.lat, busPosition.lng, studentStop.lat, studentStop.lng)
  );

  // Inicializar Leaflet dinámicamente en el cliente
  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      const map = L.map(mapContainerRef.current).setView(
        [studentStop.lat, studentStop.lng],
        15
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marcador de Parada del Alumno (Casa)
      const stopIcon = L.divIcon({
        className: 'custom-stop-icon',
        html: `<div style="background-color:#2563eb;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:3px solid white;font-weight:bold;">🏠</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([studentStop.lat, studentStop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`<strong>${studentStop.name}</strong><br/>${studentStop.address}`)
        .openPopup();

      // Círculo de Geocerca de Proximidad (500 metros)
      L.circle([studentStop.lat, studentStop.lng], {
        radius: 500,
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);

      // Marcador del Bus Escolar en movimiento
      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: `<div style="background-color:#f59e0b;color:black;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(245,158,11,0.5);border:3px solid white;font-size:20px;" class="gps-pulse">🚌</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const busMarker = L.marker([busPosition.lat, busPosition.lng], { icon: busIcon }).addTo(map);
      busMarkerRef.current = busMarker;
      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Simular movimiento suave del bus hacia la parada del alumno
  useEffect(() => {
    const timer = setInterval(() => {
      setBusPosition((prev) => {
        const latStep = (studentStop.lat - prev.lat) * 0.05;
        const lngStep = (studentStop.lng - prev.lng) * 0.05;

        const newLat = prev.lat + latStep;
        const newLng = prev.lng + lngStep;

        if (busMarkerRef.current) {
          busMarkerRef.current.setLatLng([newLat, newLng]);
        }

        return {
          ...prev,
          lat: newLat,
          lng: newLng,
          speedKmh: Math.max(15, Math.round(prev.speedKmh + (Math.random() * 4 - 2))),
        };
      });

      setEtaSeconds((prev) => Math.max(10, prev - 1));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Activar Timbre Sonoro de proximidad (HU-05)
  const handleTriggerChime = () => {
    setIsChimeActive(true);
    playSchoolChime();
    setTimeout(() => setIsChimeActive(false), 2000);
  };

  // Acción anti-impuntualidad del Representante
  const handleParentAcknowledge = () => {
    setHasAcknowledged(true);
    playSchoolChime();
  };

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Encabezado del Portal de Representante */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Rastreo de Mateo Carrillo</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  En Ruta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ruta 04 &bull; Unidad <strong className="text-white">PBY-7821</strong> (Disco 14)
              </p>
            </div>
          </div>

          {/* Botón manual para probar timbre sonoro (HU-05) */}
          <button
            onClick={handleTriggerChime}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isChimeActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isChimeActive ? '¡Timbre Sonando!' : 'Probar Timbre'}</span>
          </button>
        </div>
      </div>

      {/* Protocolo UX Anti-Impuntualidad: Cuenta Regresiva + Botón "¡Ya estoy en la parada!" (HU-05) */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-lg shadow-amber-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950">
              <Clock className="w-4 h-4" />
              <span>Tiempo Estimado de Llegada</span>
            </div>
            <div className="text-3xl font-black mt-1 tracking-tight flex items-baseline gap-2">
              <span>{formatEta(etaSeconds)} min</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-400/60 px-2 py-0.5 rounded-full">
                a {distanceMeters} metros
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-950 mt-1">
              Por favor, sal a la puerta o esquina designada para evitar demoras en la ruta.
            </p>
          </div>

          {/* Botón de acción gigante de 1 toque */}
          <button
            onClick={handleParentAcknowledge}
            disabled={hasAcknowledged}
            className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2.5 ${
              hasAcknowledged
                ? 'bg-emerald-700 text-white cursor-default ring-4 ring-emerald-300'
                : 'bg-slate-950 text-white hover:bg-slate-900 active:scale-95 shadow-slate-950/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{hasAcknowledged ? '¡Listo en la Parada!' : '¡Ya estoy en la Parada!'}</span>
          </button>
        </div>
      </div>

      {/* Mapa en Vivo (Leaflet + OpenStreetMap) (HU-04) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Ubicación GPS en Tiempo Real</span>
          </div>
          <span className="text-slate-500 font-medium">
            Velocidad: <strong className="text-slate-900">{busPosition.speedKmh} km/h</strong>
          </span>
        </div>

        <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-200">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Garantía de Privacidad de Menores (LOPDP) */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visualización privada restringida a tu representado legal</span>
          </span>
          <span className="text-slate-400 font-mono">PostGIS RLS Activo</span>
        </div>
      </div>

      {/* Ficha de Información del Conductor y Contacto Rápido */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
            CZ
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Carlos Zambrano</h3>
            <p className="text-xs text-slate-500">Conductor Autorizado &bull; Licencia Profesional Tipo D</p>
          </div>
        </div>

        <a
          href="tel:0998765432"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
        >
          <Phone className="w-4 h-4 text-slate-600" />
          <span>Llamar al Conductor</span>
        </a>
      </div>
    </div>
  );
};
