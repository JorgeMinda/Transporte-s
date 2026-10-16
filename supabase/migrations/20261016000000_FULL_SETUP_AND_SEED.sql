-- ==============================================================================
-- SCRIPT MAESTRO UNIFICADO: ESTRUCTURA COMPLETA + DATOS SEMILLA (SEED)
-- Version: 20261016000000_FULL_SETUP_AND_SEED
-- Motor: PostgreSQL 15+ con PostGIS y Row Level Security (RLS)
-- INSTRUCCIÓN: Copia y pega TODO este archivo en el SQL Editor de Supabase y presiona Run.
-- ==============================================================================

-- 1. EXTENSIONES
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
    tax_id VARCHAR(20),
    contact_phone VARCHAR(25),
    contact_email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    identification_number VARCHAR(20),
    phone_number VARCHAR(25),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    internal_number VARCHAR(20),
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
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable para conductores demo o antes de registro
    driver_license_type VARCHAR(10) NOT NULL,
    driver_license_expires_at DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(25),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    grade_level VARCHAR(40) NOT NULL,
    home_address TEXT NOT NULL,
    home_location GEOMETRY(Point, 4326) NOT NULL,
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
    guardian_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_name VARCHAR(120),
    guardian_phone VARCHAR(25),
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'legal_guardian',
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_authorize_pickup BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLAS DE RUTAS Y PARADAS LOGÍSTICAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transporter_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
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
    geofence_radius_meters INTEGER NOT NULL DEFAULT 500,
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

CREATE TABLE IF NOT EXISTS public.student_trip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_event_id UUID UNIQUE,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES public.route_stops(id),
    status boarding_status NOT NULL DEFAULT 'pending',
    client_recorded_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by_driver_id UUID REFERENCES public.drivers(id),
    parent_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    CONSTRAINT unique_trip_student UNIQUE(trip_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_logs_trip_status ON public.student_trip_logs (trip_id, status);

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

-- ==============================================================================
-- 8. FUNCIONES HELPER & RPC
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
    SELECT id INTO v_existing_id
    FROM student_trip_logs
    WHERE client_event_id = p_client_event_id;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'status', 'already_applied', 'id', v_existing_id);
    END IF;

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
-- 9. HABILITAR ROW LEVEL SECURITY (RLS)
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

-- Políticas de lectura públicas para pruebas / modo demo
DO $$ BEGIN
    CREATE POLICY "anon_read_organizations" ON public.organizations FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_students" ON public.students FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_vehicles" ON public.vehicles FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_drivers" ON public.drivers FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_routes" ON public.routes FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_route_stops" ON public.route_stops FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_trips" ON public.trips FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_student_trip_logs" ON public.student_trip_logs FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "anon_read_audit_logs" ON public.audit_logs FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 10. INSERTAR DATOS SEMILLA (SEED DATA)
-- ==============================================================================

-- Organizaciones
INSERT INTO public.organizations (id, name, type, tax_id, contact_phone, contact_email, address, status)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Unidad Educativa Cumbayá',
        'school',
        '1792345678001',
        '022891234',
        'info@colegiocumbaya.edu.ec',
        'Av. Francisco de Orellana y Pampite, Cumbayá, Quito',
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Cooperativa de Transporte Escolar TransValle',
        'transport_company',
        '1791234567001',
        '022895678',
        'gerencia@transvalle.ec',
        'Av. Interoceánica km 12, Tumbaco, Quito',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Relación contractual
INSERT INTO public.organization_relationships (id, school_id, transporter_id, contract_status, valid_from, valid_until)
VALUES
    (
        '33333333-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'active',
        '2026-09-01',
        '2027-07-31'
    )
ON CONFLICT (school_id, transporter_id) DO NOTHING;

-- Vehículos
INSERT INTO public.vehicles (id, transporter_id, license_plate, internal_number, brand, model, year, passenger_capacity, insurance_policy_number, insurance_expires_at, technical_review_expires_at, status)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'PBY-7821',
        'Disco 14',
        'Hino',
        'FC Bus Escolar',
        2022,
        28,
        'SOAT-EC-98214-2026',
        '2027-04-15',
        '2026-11-30',
        'active'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'PCD-3490',
        'Disco 08',
        'Mercedes-Benz',
        'Sprinter 516',
        2023,
        18,
        'SOAT-EC-45129-2026',
        '2027-08-20',
        '2027-02-14',
        'active'
    )
ON CONFLICT (license_plate) DO NOTHING;

-- Conductores
INSERT INTO public.drivers (id, transporter_id, driver_license_type, driver_license_expires_at, emergency_contact_name, emergency_contact_phone, status)
VALUES
    (
        '33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'Tipo D',
        '2028-09-12',
        'Martha Zambrano (Esposa)',
        '0998765432',
        'active'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        'Tipo E',
        '2027-12-05',
        'Lucía Rivas (Hermana)',
        '0987112233',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Estudiantes (Quito / Cumbayá con PostGIS Point)
INSERT INTO public.students (id, school_id, first_name, last_name, identification_number, grade_level, home_address, home_location, emergency_phone, medical_notes, status)
VALUES
    (
        '55555555-5555-5555-5555-000000000101',
        '11111111-1111-1111-1111-111111111111',
        'Mateo',
        'Carrillo',
        '1723456789',
        '5to EGB - Paralelo A',
        'Av. Ilaló y Calle 3, Conjunto Los Cedros Casa 4',
        ST_SetSRID(ST_MakePoint(-78.467834, -0.180653), 4326),
        '0991234567',
        'Alergia al maní',
        'active'
    ),
    (
        '55555555-5555-5555-5555-000000000102',
        '11111111-1111-1111-1111-111111111111',
        'Valentina',
        'Morales',
        '1729876543',
        '3ro EGB - Paralelo B',
        'Calle Guayaquil y Esmeraldas, frente a SanaSana',
        ST_SetSRID(ST_MakePoint(-78.465123, -0.182412), 4326),
        '0987654321',
        NULL,
        'active'
    ),
    (
        '55555555-5555-5555-5555-000000000103',
        '11111111-1111-1111-1111-111111111111',
        'Joaquín',
        'Pérez',
        '1725556667',
        '6to EGB - Paralelo A',
        'Av. Interoceánica km 11, entrada San Juan',
        ST_SetSRID(ST_MakePoint(-78.462345, -0.185123), 4326),
        '0993334444',
        NULL,
        'active'
    ),
    (
        '55555555-5555-5555-5555-000000000104',
        '11111111-1111-1111-1111-111111111111',
        'Camila',
        'Navas',
        '1721112223',
        '4to EGB - Paralelo C',
        'Urbanización La Floresta, Pasaje Los Pinos 12',
        ST_SetSRID(ST_MakePoint(-78.459789, -0.188456), 4326),
        '0981112233',
        NULL,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Rutas
INSERT INTO public.routes (id, school_id, transporter_id, name, direction, default_vehicle_id, default_driver_id, status)
VALUES
    (
        '99999999-9999-9999-9999-999999999999',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'Ruta 04 - Valle Cumbayá Matutina',
        'morning_pickup',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333333',
        'active'
    ),
    (
        '88888888-8888-8888-8888-888888888888',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'Ruta 07 - Tumbaco / La Cerámica',
        'morning_pickup',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '44444444-4444-4444-4444-444444444444',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Paradas
INSERT INTO public.route_stops (id, route_id, stop_order, name, location, address_reference, scheduled_time, geofence_radius_meters)
VALUES
    (
        '77777777-7777-7777-7777-000000000001',
        '99999999-9999-9999-9999-999999999999',
        1,
        'Parada 1: Conjunto Los Cedros',
        ST_SetSRID(ST_MakePoint(-78.467834, -0.180653), 4326),
        'Av. Ilaló y Calle 3 (Portón negro)',
        '06:45:00',
        500
    ),
    (
        '77777777-7777-7777-7777-000000000002',
        '99999999-9999-9999-9999-999999999999',
        2,
        'Parada 2: Farmacia SanaSana',
        ST_SetSRID(ST_MakePoint(-78.465123, -0.182412), 4326),
        'Calle Guayaquil y Esmeraldas',
        '06:53:00',
        500
    ),
    (
        '77777777-7777-7777-7777-000000000003',
        '99999999-9999-9999-9999-999999999999',
        3,
        'Parada 3: Entrada San Juan',
        ST_SetSRID(ST_MakePoint(-78.462345, -0.185123), 4326),
        'Av. Interoceánica km 11',
        '07:02:00',
        500
    ),
    (
        '77777777-7777-7777-7777-000000000004',
        '99999999-9999-9999-9999-999999999999',
        4,
        'Parada 4: Pasaje Los Pinos',
        ST_SetSRID(ST_MakePoint(-78.459789, -0.188456), 4326),
        'Urb. La Floresta Casa 12',
        '07:12:00',
        500
    )
ON CONFLICT (id) DO NOTHING;

-- Asignación de estudiantes a paradas
INSERT INTO public.student_stop_assignments (id, student_id, route_id, stop_id, assignment_type, status)
VALUES
    ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000101', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000001', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000102', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000002', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000103', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000003', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000104', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000004', 'both', 'active')
ON CONFLICT (id) DO NOTHING;

-- Viaje activo en curso hoy
INSERT INTO public.trips (id, route_id, driver_id, vehicle_id, service_date, status, started_at)
VALUES
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '99999999-9999-9999-9999-999999999999',
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        CURRENT_DATE,
        'in_progress',
        NOW() - INTERVAL '25 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- Asistencia de estudiantes en el viaje activo
INSERT INTO public.student_trip_logs (client_event_id, trip_id, student_id, stop_id, status, client_recorded_at, parent_acknowledged)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000101', '77777777-7777-7777-7777-000000000001', 'pending', NOW(), TRUE),
    ('c2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000102', '77777777-7777-7777-7777-000000000002', 'pending', NOW(), FALSE),
    ('c3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000103', '77777777-7777-7777-7777-000000000003', 'pending', NOW(), FALSE),
    ('c4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000104', '77777777-7777-7777-7777-000000000004', 'pending', NOW(), FALSE)
ON CONFLICT (client_event_id) DO NOTHING;

-- Registro de telemetría inicial
INSERT INTO public.trip_telemetry (trip_id, location, speed_kmh, heading_degrees, recorded_at)
VALUES
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        ST_SetSRID(ST_MakePoint(-78.471000, -0.183500), 4326),
        34.5,
        42.0,
        NOW()
    );

-- Bitácora de auditoría
INSERT INTO public.audit_logs (organization_id, action, entity_name, entity_id, new_data)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'SYSTEM_INITIALIZED',
        'organizations',
        '11111111-1111-1111-1111-111111111111',
        '{"status": "Base de datos y datos semilla inicializados con éxito"}'::jsonb
    );
