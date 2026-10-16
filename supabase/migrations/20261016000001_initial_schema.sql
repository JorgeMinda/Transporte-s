-- ==============================================================================
-- MIGRACIÓN INICIAL: PLATAFORMA SAAS TRANSPORTE ESCOLAR MULTIINSTITUCIONAL
-- Version: 20261016000001
-- Motor: PostgreSQL 15+ con PostGIS y RLS
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE org_type AS ENUM ('school', 'transport_company', 'hybrid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE org_membership_role AS ENUM (
        'super_admin',
        'school_admin',
        'transporter_admin',
        'transport_coordinator',
        'driver',
        'parent_guardian',
        'school_gatekeeper'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE boarding_status AS ENUM ('pending', 'boarded', 'dropped_off', 'absent', 'excused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM (
        'traffic_delay',
        'mechanical_failure',
        'flat_tire',
        'medical_emergency',
        'route_detour',
        'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. TABLAS DE ORGANIZACIONES Y USUARIOS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    type org_type NOT NULL,
    tax_id VARCHAR(20), -- RUC en Ecuador
    contact_phone VARCHAR(25),
    contact_email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relación contractual entre colegio y empresa de transporte
CREATE TABLE IF NOT EXISTS public.organization_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transporter_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contract_status VARCHAR(20) DEFAULT 'active' CHECK (contract_status IN ('active', 'inactive', 'expired')),
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_school_transporter UNIQUE(school_id, transporter_id)
);

-- Perfiles de usuario (complemento a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    identification_number VARCHAR(20), -- Cédula ecuatoriana
    phone_number VARCHAR(25),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membresías y roles por organización
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role org_membership_role NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_org_role UNIQUE(organization_id, user_id, role)
);

-- ==============================================================================
-- 4. TABLAS DE FLOTA Y CONDUCTORES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    license_plate VARCHAR(12) NOT NULL UNIQUE,
    internal_number VARCHAR(20), -- Número de disco (Ej. "Disco 14")
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER CHECK (year >= 1990),
    passenger_capacity INTEGER NOT NULL CHECK (passenger_capacity > 0),
    insurance_policy_number VARCHAR(50),
    insurance_expires_at DATE,
    technical_review_expires_at DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_license_type VARCHAR(10) NOT NULL, -- Ej. Tipo D, Tipo E (ANT Ecuador)
    driver_license_expires_at DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(25),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_driver_user UNIQUE(user_id)
);

-- ==============================================================================
-- 5. TABLAS DE ESTUDIANTES Y FAMILIAS (CON PROTECCIÓN LOPDP ECUADOR)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    identification_number VARCHAR(20),
    grade_level VARCHAR(40) NOT NULL, -- Grado / Paralelo
    home_address TEXT NOT NULL,
    home_location GEOMETRY(Point, 4326) NOT NULL, -- Coordenadas precisas del domicilio
    emergency_phone VARCHAR(25) NOT NULL,
    medical_notes TEXT,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_home_location ON public.students USING GIST (home_location);
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students (school_id);

CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'legal_guardian', -- father, mother, tutor
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_authorize_pickup BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_guardian UNIQUE(student_id, guardian_user_id)
);

-- ==============================================================================
-- 6. TABLAS DE RUTAS Y PARADAS LOGÍSTICAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transporter_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL, -- Ej. "Ruta 03 - Los Chillos Matutina"
    direction VARCHAR(30) NOT NULL CHECK (direction IN ('morning_pickup', 'afternoon_dropoff', 'round_trip', 'special')),
    default_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    default_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    name VARCHAR(120) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    address_reference TEXT,
    scheduled_time TIME NOT NULL,
    geofence_radius_meters INTEGER NOT NULL DEFAULT 500, -- Radio para activar el timbre de proximidad
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_route_stop_order UNIQUE(route_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_location ON public.route_stops USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_order ON public.route_stops (route_id, stop_order);

CREATE TABLE IF NOT EXISTS public.student_stop_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES public.route_stops(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) DEFAULT 'both' CHECK (assignment_type IN ('morning_only', 'afternoon_only', 'both')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_route UNIQUE(student_id, route_id)
);

-- ==============================================================================
-- 7. TABLAS DE OPERACIÓN EN VIVO (TRIPS, ASISTENCIA Y TELEMETRÍA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status trip_status NOT NULL DEFAULT 'scheduled',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_service_status ON public.trips (service_date, status);

-- Asistencia a bordo optimizada para sincronización Offline-First con idempotencia
CREATE TABLE IF NOT EXISTS public.student_trip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_event_id UUID UNIQUE, -- ID único generado en IndexedDB del teléfono
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES public.route_stops(id),
    status boarding_status NOT NULL DEFAULT 'pending',
    client_recorded_at TIMESTAMPTZ NOT NULL, -- Hora real del clic en el teléfono
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Hora en que llegó al servidor
    recorded_by_driver_id UUID REFERENCES public.drivers(id),
    parent_acknowledged BOOLEAN NOT NULL DEFAULT FALSE, -- Padre marcó "¡Ya estoy en la parada!"
    notes TEXT,
    CONSTRAINT unique_trip_student UNIQUE(trip_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_logs_trip_status ON public.student_trip_logs (trip_id, status);

-- Telemetría GPS en tiempo real (Rastreo continuo eficiente)
CREATE TABLE IF NOT EXISTS public.trip_telemetry (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    location GEOMETRY(Point, 4326) NOT NULL,
    speed_kmh NUMERIC(5,2),
    heading_degrees NUMERIC(5,2),
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_telemetry_trip_time ON public.trip_telemetry (trip_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_telemetry_location ON public.trip_telemetry USING GIST (location);

-- Registro de incidencias en ruta
CREATE TABLE IF NOT EXISTS public.trip_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id),
    type incident_type NOT NULL,
    description TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    notes TEXT
);

-- ==============================================================================
-- 8. PISTAS DE AUDITORÍA INMUTABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(60) NOT NULL,
    entity_name VARCHAR(60) NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_org_time ON public.audit_logs (organization_id, created_at DESC);

-- ==============================================================================
-- 9. FUNCIONES HELPER DE SEGURIDAD PARA RLS (SECURITY DEFINER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_organizations()
RETURNS TABLE(organization_id UUID, role org_membership_role)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id, role
    FROM organization_memberships
    WHERE user_id = auth.uid() AND status = 'active';
$$;

-- Procedimiento almacenado para sincronización offline idempotente
CREATE OR REPLACE FUNCTION public.sync_offline_attendance(
    p_client_event_id UUID,
    p_trip_id UUID,
    p_student_id UUID,
    p_stop_id UUID,
    p_status boarding_status,
    p_client_recorded_at TIMESTAMPTZ,
    p_driver_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    -- Verificar si ya fue aplicado (idempotencia)
    SELECT id INTO v_existing_id
    FROM student_trip_logs
    WHERE client_event_id = p_client_event_id;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'status', 'already_applied', 'id', v_existing_id);
    END IF;

    -- Upsert del registro de asistencia
    INSERT INTO student_trip_logs (
        client_event_id,
        trip_id,
        student_id,
        stop_id,
        status,
        client_recorded_at,
        recorded_by_driver_id,
        notes
    ) VALUES (
        p_client_event_id,
        p_trip_id,
        p_student_id,
        p_stop_id,
        p_status,
        p_client_recorded_at,
        p_driver_id,
        p_notes
    )
    ON CONFLICT (trip_id, student_id)
    DO UPDATE SET
        status = EXCLUDED.status,
        client_recorded_at = EXCLUDED.client_recorded_at,
        recorded_by_driver_id = EXCLUDED.recorded_by_driver_id,
        notes = EXCLUDED.notes,
        synced_at = NOW()
    RETURNING id INTO v_existing_id;

    RETURN jsonb_build_object('success', true, 'status', 'synced', 'id', v_existing_id);
END;
$$;

-- ==============================================================================
-- 10. POLÍTICAS ROW LEVEL SECURITY (RLS) - ZERO TRUST
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizaciones: Ver solo si pertenece a ella
CREATE POLICY "org_member_read" ON public.organizations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_auth_user_organizations() uo
            WHERE uo.organization_id = organizations.id
        )
    );

-- Estudiantes: Admins ven los de su colegio; Padres ven ÚNICAMENTE a sus hijos
CREATE POLICY "school_admin_students" ON public.students
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_auth_user_organizations() uo
            WHERE uo.organization_id = students.school_id
              AND uo.role IN ('school_admin', 'transport_coordinator', 'super_admin')
        )
    );

CREATE POLICY "guardian_own_students" ON public.students
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            WHERE sg.student_id = students.id
              AND sg.guardian_user_id = auth.uid()
        )
    );

CREATE POLICY "driver_route_students" ON public.students
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.drivers d
            JOIN public.trips t ON t.driver_id = d.id
            JOIN public.student_trip_logs stl ON stl.trip_id = t.id
            WHERE d.user_id = auth.uid()
              AND stl.student_id = students.id
              AND t.status = 'in_progress'
        )
    );

-- Telemetría de viaje: Visible para admin del colegio/transporte y padres con hijo a bordo
CREATE POLICY "trip_telemetry_access" ON public.trip_telemetry
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.routes r ON r.id = t.route_id
            JOIN public.get_auth_user_organizations() uo ON (uo.organization_id = r.school_id OR uo.organization_id = r.transporter_id)
            WHERE t.id = trip_telemetry.trip_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.student_trip_logs stl ON stl.trip_id = t.id
            JOIN public.student_guardians sg ON sg.student_id = stl.student_id
            WHERE t.id = trip_telemetry.trip_id
              AND sg.guardian_user_id = auth.uid()
              AND t.status = 'in_progress'
        )
    );
