# Plataforma SaaS de Transporte Escolar Multiinstitucional

Plataforma empresarial multi-tenant para la gestión, control de asistencia en ruta, rastreo GPS adaptativo y notificaciones de proximidad escolar.

Diseñada con principios de **Arquitectura Limpia**, **Modo Offline-First** para zonas sin cobertura celular, **Ahorro Extremo de Megas** para usuarios prepago, **Timbre Sonoro de Proximidad** y **Aislamiento de Privacidad de Menores (LOPDP Ecuador)**.

---

## 🚀 Arquitectura y Tecnologías

- **Frontend:** React 18 / 19 + TypeScript (Strict) + Vite.
- **Estilos & UI:** Tailwind CSS + Lucide Icons + componentes accesibles.
- **Base de Datos Local (Offline-First):** IndexedDB con la librería `idb` (Patrón *Outbox* con cola de sincronización e idempotencia).
- **Audio Web (Timbre sin descargas):** Web Audio API nativo con síntesis matemática de tonos armónicos.
- **Mapas & Telemetría:** Leaflet + OpenStreetMap + algoritmo de muestreo *Dead Reckoning* adaptativo.
- **Backend & Base de Datos:** PostgreSQL 15+ con extensión espacial **PostGIS** y **Row Level Security (RLS)** en Supabase.

---

## 📂 Mapeo de Historias de Usuario (HU) en el Código

| Historia de Usuario | Descripción Técnica | Archivos Clave |
| :--- | :--- | :--- |
| **HU-01: Modo Sin Conexión & Ahorro de Megas** | Almacenamiento local en IndexedDB, cola de sincronización con `client_event_id` y algoritmo de muestreo adaptativo que reduce datos a < 1.5 MB/hora. | `src/shared/lib/offline-db.ts`<br>`src/shared/lib/sync-manager.ts`<br>`src/shared/lib/adaptive-gps.ts` |
| **HU-02: Administración de Estudiantes & Domicilios** | Padrón dinámico de alumnos, registro de direcciones físicas y coordenadas geoespaciales PostGIS. | `src/modules/students/pages/StudentsManagementPage.tsx`<br>`supabase/migrations/20261016000001_initial_schema.sql` |
| **HU-03: Listado Digital de Asistencia a Bordo** | Consola táctil de 1 toque para el conductor (A bordo / Ausente), operable con 0 ms de latencia y resistente a desconexión. | `src/modules/trips/pages/DriverConsolePage.tsx` |
| **HU-04: Monitoreo Geográfico en Tiempo Real** | Mapa interactivo para padres con visualización en vivo de la unidad escolar y geocerca de proximidad. | `src/modules/tracking/pages/ParentLiveTrackingPage.tsx` |
| **HU-05: Alerta Sonora & Anti-Impuntualidad** | Sintetizador de timbre sonoro (`playSchoolChime`), cuenta regresiva y botón de 1 toque: *"¡Ya estamos en la parada!"*. | `src/shared/lib/audio-chime.ts`<br>`src/modules/tracking/pages/ParentLiveTrackingPage.tsx` |

---

## 🛠️ Instrucciones de Ejecución

### 1. Desarrollo Local del Frontend

```bash
# Instalar dependencias (ya instaladas)
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### 2. Base de Datos Supabase (PostgreSQL + PostGIS + RLS)

El script SQL completo y versionado se encuentra en:
📁 `supabase/migrations/20261016000001_initial_schema.sql`

Para aplicarlo:
1. Copia y ejecuta el archivo en el **SQL Editor** de tu proyecto Supabase (Cloud o Docker Local).
2. Configura las variables en `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```
*(Nota: Si no se configuran credenciales en `.env`, el sistema funciona en modo local/mock interactivo completo).*
