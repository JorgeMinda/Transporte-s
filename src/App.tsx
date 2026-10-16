import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/modules/auth/context/AuthContext';
import { RolePortalSwitcher } from '@/shared/components/RolePortalSwitcher';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import { DriverLayout } from '@/shared/layouts/DriverLayout';
import { ParentLayout } from '@/shared/layouts/ParentLayout';
import { RolePortalHubPage } from '@/modules/auth/pages/RolePortalHubPage';
import { DashboardOverviewPage } from '@/modules/dashboard/pages/DashboardOverviewPage';
import { StudentsManagementPage } from '@/modules/students/pages/StudentsManagementPage';
import { RoutesManagementPage } from '@/modules/routes/pages/RoutesManagementPage';
import { FleetManagementPage } from '@/modules/fleet/pages/FleetManagementPage';
import { AuditLogPage } from '@/modules/audit/pages/AuditLogPage';
import { DriverConsolePage } from '@/modules/trips/pages/DriverConsolePage';
import { ParentLiveTrackingPage } from '@/modules/tracking/pages/ParentLiveTrackingPage';
import { ParentAttendanceHistoryPage } from '@/modules/tracking/pages/ParentAttendanceHistoryPage';
import { ParentDriverInfoPage } from '@/modules/tracking/pages/ParentDriverInfoPage';
import { initAutoSync } from '@/shared/lib/sync-manager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  useEffect(() => {
    const cleanup = initAutoSync();
    return () => cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* Barra Conmutadora de Rol Siempre Accesible para Pruebas UI/UX */}
          <RolePortalSwitcher />

          <Routes>
            {/* Hub Central de Selección de Portales */}
            <Route path="/" element={<RolePortalHubPage />} />

            {/* 1. PORTAL ADMINISTRATIVO INSTITUCIONAL (Desktop / Tablet) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="students" element={<StudentsManagementPage />} />
              <Route path="routes" element={<RoutesManagementPage />} />
              <Route path="fleet" element={<FleetManagementPage />} />
              <Route path="audit" element={<AuditLogPage />} />
            </Route>

            {/* 2. CONSOLA MÓVIL DEL CONDUCTOR (Mobile First / Cabina) */}
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<DriverConsolePage />} />
            </Route>

            {/* 3. PORTAL FAMILIAR DEL REPRESENTANTE (Mobile Friendly) */}
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentLiveTrackingPage />} />
              <Route path="history" element={<ParentAttendanceHistoryPage />} />
              <Route path="info" element={<ParentDriverInfoPage />} />
            </Route>

            {/* Redirección por defecto al Hub */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
