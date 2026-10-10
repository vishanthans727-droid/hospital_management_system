import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockBeds, mockAdmissions, mockPatients } from '../../lib/mockData';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  BedDouble,
  HeartPulse,
  Activity,
  CheckCircle,
  Clock,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [beds, setBeds] = useState(mockBeds);

  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const cleaningBeds = beds.filter(b => b.status === 'cleaning').length;

  const handleUpdateBedStatus = (bedId: string, newStatus: any) => {
    setBeds(prev =>
      prev.map(b => (b.id === bedId ? { ...b, status: newStatus } : b))
    );
    toast.success(`Bed ${bedId} updated to ${newStatus}`);
  };

  const activeInpatients = mockAdmissions.filter(a => a.status === 'active');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-200 bg-teal-800/80 px-2.5 py-1 rounded">
            Nursing Station Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {user?.fullName}
          </h1>
          <p className="text-sm text-teal-100 mt-1">
            Ward Station: Intensive Care & Surgical Recovery • Active Shift: Day
          </p>
        </div>

        <Link to="/admissions">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BedDouble className="w-4 h-4" />}
          >
            Ward Allocation Grid
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupied Beds"
          value={occupiedBeds}
          subtitle="Currently admitted inpatients"
          icon={<HeartPulse className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Available Beds"
          value={availableBeds}
          subtitle="Ready for incoming admissions"
          icon={<BedDouble className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Beds in Sanitation"
          value={cleaningBeds}
          subtitle="Awaiting disinfection signoff"
          icon={<Sparkles className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Active Inpatients"
          value={activeInpatients.length}
          subtitle="Under current ward roster"
          icon={<Activity className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Bed Monitoring & Quick Status Actions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ward Bed Status & Sanitation
              </h3>
              <p className="text-xs text-slate-500">Live Nursing Bed Grid</p>
            </div>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded">
              {beds.length} Total Registered Beds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beds.map(bed => (
              <div
                key={bed.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {bed.bedNumber}
                    </span>
                    <p className="text-[11px] text-slate-500">{bed.wardName}</p>
                  </div>
                  <Badge
                    variant={
                      bed.status === 'available'
                        ? 'success'
                        : bed.status === 'occupied'
                        ? 'primary'
                        : bed.status === 'cleaning'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {bed.status}
                  </Badge>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[140px]">
                    {bed.currentPatientName || 'No Patient'}
                  </span>
                  {bed.status === 'cleaning' ? (
                    <button
                      onClick={() => handleUpdateBedStatus(bed.id, 'available')}
                      className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                    >
                      Mark Ready
                    </button>
                  ) : bed.status === 'available' ? (
                    <button
                      onClick={() => handleUpdateBedStatus(bed.id, 'cleaning')}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300"
                    >
                      Sanitize
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Occupied</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inpatient Care Schedule */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-sky-600" />
              Vitals & Medication Care
            </h3>
            <Badge variant="teal" size="sm">Active Care</Badge>
          </div>

          <div className="space-y-3">
            {activeInpatients.map((adm, index) => (
              <div key={adm.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{adm.patientName}</span>
                  <span className="text-sky-600">{adm.bedNumber}</span>
                </div>
                <p className="text-slate-500 mt-0.5">Admitting: {adm.admittingDoctorName}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Next Vitals: In 45 mins</span>
                  <Link to="/emr">
                    <Button variant="outline" size="sm" className="text-[11px] py-1 px-2">
                      Record Vitals
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
