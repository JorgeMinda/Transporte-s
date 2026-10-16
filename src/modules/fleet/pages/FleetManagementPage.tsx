import React from 'react';
import { Truck, UserCheck, ShieldCheck, Plus, Calendar } from 'lucide-react';

export const FleetManagementPage: React.FC = () => {
  const vehicles = [
    {
      id: 'v-1',
      plate: 'PBY-7821',
      internalNumber: 'Disco 14',
      brandModel: 'Hino FC Bus (2022)',
      capacity: 28,
      soatExpiry: '2027-04-15',
      techReviewExpiry: '2026-11-30',
      status: 'active',
      assignedDriver: 'Carlos Zambrano',
    },
    {
      id: 'v-2',
      plate: 'PCD-3490',
      internalNumber: 'Disco 08',
      brandModel: 'Mercedes-Benz Sprinter (2023)',
      capacity: 18,
      soatExpiry: '2027-08-20',
      techReviewExpiry: '2027-02-14',
      status: 'active',
      assignedDriver: 'Manuel Rivas',
    },
  ];

  const drivers = [
    {
      id: 'd-1',
      name: 'Carlos Zambrano',
      licenseType: 'Tipo D (Profesional)',
      licenseExpiry: '2028-09-12',
      phone: '0998765432',
      assignedVehicle: 'PBY-7821 (Disco 14)',
      status: 'active',
    },
    {
      id: 'd-2',
      name: 'Manuel Rivas',
      licenseType: 'Tipo E (Profesional)',
      licenseExpiry: '2027-12-05',
      phone: '0987112233',
      assignedVehicle: 'PCD-3490 (Disco 08)',
      status: 'active',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Flota Vehicular & Conductores Autorizados
            </h1>
            <p className="text-xs text-slate-500">
              Supervisión de pólizas SOAT, revisiones técnicas y vigencia de licencias de conducir.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Registrar Unidad</span>
        </button>
      </div>

      {/* Sección 1: Vehículos */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Unidades de Transporte Registradas ({vehicles.length})
          </h2>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Documentación al día
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Unidad / Placa</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Capacidad</th>
                <th className="py-3 px-4">Conductor Asignado</th>
                <th className="py-3 px-4">Seguro SOAT</th>
                <th className="py-3 px-4">Revisión Técnica</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{v.plate}</div>
                    <span className="text-[11px] text-blue-600 font-semibold">{v.internalNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{v.brandModel}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-bold">{v.capacity} pax</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{v.assignedDriver}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <Calendar className="w-3 h-3" />
                      <span>{v.soatExpiry}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1 text-amber-700">
                      <Calendar className="w-3 h-3" />
                      <span>{v.techReviewExpiry}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Operativa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Conductores */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Conductores Habilitados ({drivers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Conductor</th>
                <th className="py-3 px-4">Tipo de Licencia (ANT)</th>
                <th className="py-3 px-4">Vencimiento Licencia</th>
                <th className="py-3 px-4">Teléfono Móvil</th>
                <th className="py-3 px-4">Vehículo Asignado</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{d.licenseType}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{d.licenseExpiry}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{d.phone}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-medium">{d.assignedVehicle}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Habilitado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
