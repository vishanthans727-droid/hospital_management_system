import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { NurseDashboard } from './NurseDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { PatientPortal } from './PatientPortal';

export const DashboardIndex: React.FC = () => {
  const { user, role } = useAuth();

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'administrator':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'patient':
      return <PatientPortal />;
    default:
      return <Navigate to="/login" replace />;
  }
};
