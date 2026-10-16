-- ==============================================================================
-- SCRIPT DE POBLACIÓN INICIAL (SEED DATA): TRANSPORTE ESCOLAR SAAS
-- Version: 20261016000002
-- Propósito: Cargar datos iniciales reales en Supabase para visualizar en el Table Editor
-- ==============================================================================

-- 1. PERMITIR CONDUCTORES EN MODO DEMO SIN FORZAR REGISTRO PREVIO EN AUTH.USERS
ALTER TABLE public.drivers ALTER COLUMN user_id DROP NOT NULL;

-- 2. INSERTAR ORGANIZACIONES (COLEGIO Y COOPERATIVA DE TRANSPORTE)
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

-- 3. RELACIÓN CONTRACTUAL ACTIVA ENTRE COLEGIO Y TRANSPORTE
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

-- 4. VEHÍCULOS DE TRANSPORTE ESCOLAR
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

-- 5. CONDUCTORES HABILITADOS
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

-- 6. ESTUDIANTES CON COORDENADAS DOMICILIARIAS POSTGIS (QUITO / CUMBAYÁ)
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

-- 7. RUTAS ESCOLARES
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

-- 8. PARADAS SECUENCIALES DE LA RUTA 04 (CON GEOCERCAS DE 500M)
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

-- 9. ASIGNACIONES DE ESTUDIANTES A PARADAS
INSERT INTO public.student_stop_assignments (id, student_id, route_id, stop_id, assignment_type, status)
VALUES
    ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000101', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000001', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000102', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000002', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000103', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000003', 'both', 'active'),
    ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000104', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-000000000004', 'both', 'active')
ON CONFLICT (id) DO NOTHING;

-- 10. RECORRIDO ACTIVO HOY EN TIEMPO REAL
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

-- 11. ASISTENCIA A BORDO DEL VIAJE ACTIVO
INSERT INTO public.student_trip_logs (client_event_id, trip_id, student_id, stop_id, status, client_recorded_at, parent_acknowledged)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000101', '77777777-7777-7777-7777-000000000001', 'pending', NOW(), TRUE),
    ('c2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000102', '77777777-7777-7777-7777-000000000002', 'pending', NOW(), FALSE),
    ('c3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000103', '77777777-7777-7777-7777-000000000003', 'pending', NOW(), FALSE),
    ('c4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-000000000104', '77777777-7777-7777-7777-000000000004', 'pending', NOW(), FALSE)
ON CONFLICT (client_event_id) DO NOTHING;

-- 12. PISTAS DE AUDITORÍA
INSERT INTO public.audit_logs (organization_id, action, entity_name, entity_id, new_data)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'SYSTEM_SEED_INITIALIZED',
        'organizations',
        '11111111-1111-1111-1111-111111111111',
        '{"event": "Población inicial de rutas, flota y estudiantes completada"}'::jsonb
    );

-- 13. POLÍTICAS DE LECTURA DEMO PARA ANON (PERMITE VER DATOS EN FRONTEND SIN LOGIN PREVIO)
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
