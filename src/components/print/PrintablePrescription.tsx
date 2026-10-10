import React from 'react';
import { Prescription } from '../../types';
import { Button } from '../common/Button';
import { printSection } from '../../lib/utils';
import { Printer, HeartPulse } from 'lucide-react';

interface PrintablePrescriptionProps {
  prescription: Prescription;
}

export const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({ prescription }) => {
  const printId = `rx-print-${prescription.id}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <Button
          variant="primary"
          size="sm"
          onClick={() => printSection(printId)}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Prescription (Rx)
        </Button>
      </div>

      <div
        id={printId}
        className="bg-white text-slate-800 p-8 rounded-xl border border-slate-200 shadow-sm font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-sky-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sky-900 tracking-tight">MediCare Health Systems</h1>
              <p className="text-xs text-slate-500">Center for Medical Excellence & Clinical Research</p>
              <p className="text-[11px] text-slate-400">770 Healthcare Way, Suite 400 • Tel: +1 (555) MED-CARE</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-sky-800 bg-sky-50 px-2 py-1 rounded">
              Outpatient Prescription
            </span>
            <p className="text-sm font-semibold text-slate-700 mt-2">Rx ID: {prescription.prescriptionCode}</p>
            <p className="text-xs text-slate-500">Date: {prescription.date}</p>
          </div>
        </div>

        {/* Doctor & Patient Info Bar */}
        <div className="grid grid-cols-2 gap-6 my-5 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Attending Physician</p>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{prescription.doctorName}</p>
            <p className="text-slate-600">{prescription.doctorSpecialization}</p>
            <p className="text-slate-500 text-[11px]">License No: {prescription.doctorLicense}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Patient Information</p>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{prescription.patientName}</p>
            <p className="text-slate-600">
              Age: {prescription.patientAge} yrs • Gender: {prescription.patientGender}
            </p>
            <p className="text-slate-500 text-[11px]">Patient ID: {prescription.patientId}</p>
          </div>
        </div>

        {/* Clinical Diagnosis */}
        <div className="mb-6 text-xs">
          <span className="font-semibold text-slate-700">Clinical Diagnosis: </span>
          <span className="font-medium text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {prescription.diagnosis}
          </span>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-serif font-black text-sky-800">℞</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Prescribed Medications
            </span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-2.5 border-b border-slate-200">#</th>
                <th className="p-2.5 border-b border-slate-200">Medicine & Dosage</th>
                <th className="p-2.5 border-b border-slate-200">Form</th>
                <th className="p-2.5 border-b border-slate-200">Frequency</th>
                <th className="p-2.5 border-b border-slate-200">Duration</th>
                <th className="p-2.5 border-b border-slate-200">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {prescription.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                  <td className="p-2.5 capitalize text-slate-600">{item.form}</td>
                  <td className="p-2.5 font-medium text-sky-800">{item.frequency}</td>
                  <td className="p-2.5 text-slate-700">{item.duration}</td>
                  <td className="p-2.5 text-slate-600 italic">{item.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prescription.notes && (
          <div className="p-3 bg-sky-50/60 rounded border border-sky-100 text-xs mb-8">
            <p className="font-semibold text-sky-900">Physician Advice:</p>
            <p className="text-slate-600 mt-0.5">{prescription.notes}</p>
          </div>
        )}

        {/* Doctor Signature Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="text-[11px] text-slate-400 max-w-sm">
            <p>• Valid for 30 days from date of issue unless specified otherwise.</p>
            <p>• Please report any adverse drug reactions immediately to emergency services.</p>
          </div>
          <div className="text-center w-52">
            <div className="border-b border-slate-400 pb-1 mb-1 italic font-serif text-slate-700">
              {prescription.doctorName}
            </div>
            <p className="font-semibold text-slate-800">{prescription.doctorName}</p>
            <p className="text-[11px] text-slate-500">Authorized Medical Practitioner</p>
          </div>
        </div>
      </div>
    </div>
  );
};
