import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole } from '@/shared/types';

interface AuthContextType {
  user: UserProfile;
  switchRole: (newRole: UserRole) => void;
  isAuthenticated: boolean;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  school_admin: {
    id: 'usr-admin-1',
    email: 'admin@colegio-cumbaya.edu.ec',
    firstName: 'Lic. Patricia',
    lastName: 'Guerrero',
    role: 'school_admin',
    organizationId: 'org-school-1',
    organizationName: 'Unidad Educativa Cumbayá',
  },
  driver: {
    id: 'usr-driver-1',
    email: 'carlos.zambrano@transvalle.ec',
    firstName: 'Carlos',
    lastName: 'Zambrano',
    role: 'driver',
    organizationId: 'org-trans-1',
    organizationName: 'Cooperativa TransValle',
    phone: '0998765432',
  },
  parent_guardian: {
    id: 'usr-parent-1',
    email: 'marcelo.carrillo@gmail.com',
    firstName: 'Marcelo',
    lastName: 'Carrillo',
    role: 'parent_guardian',
    organizationId: 'org-school-1',
    organizationName: 'Unidad Educativa Cumbayá',
    phone: '0991234567',
  },
  super_admin: {
    id: 'usr-super-1',
    email: 'director@saas-transporte.ec',
    firstName: 'Admin',
    lastName: 'Global',
    role: 'super_admin',
    organizationId: 'platform-root',
    organizationName: 'Plataforma SaaS Matriz',
  },
  transporter_admin: {
    id: 'usr-trans-1',
    email: 'gerencia@transvalle.ec',
    firstName: 'Ing. Rodrigo',
    lastName: 'Cevallos',
    role: 'transporter_admin',
    organizationId: 'org-trans-1',
    organizationName: 'Cooperativa TransValle',
  },
  transport_coordinator: {
    id: 'usr-coord-1',
    email: 'despacho@colegio-cumbaya.edu.ec',
    firstName: 'Andrea',
    lastName: 'Molina',
    role: 'transport_coordinator',
    organizationId: 'org-school-1',
    organizationName: 'Unidad Educativa Cumbayá',
  },
  school_gatekeeper: {
    id: 'usr-gate-1',
    email: 'seguridad@colegio-cumbaya.edu.ec',
    firstName: 'Manuel',
    lastName: 'Sánchez',
    role: 'school_gatekeeper',
    organizationId: 'org-school-1',
    organizationName: 'Unidad Educativa Cumbayá',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('school_admin');

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const user = DEFAULT_USERS[currentRole] || DEFAULT_USERS.school_admin;

  return (
    <AuthContext.Provider value={{ user, switchRole, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}
