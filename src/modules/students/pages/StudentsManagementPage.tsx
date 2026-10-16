import React, { useState } from 'react';
import { MOCK_STUDENTS } from '@/shared/lib/mock-data';
import { Student } from '@/shared/types';
import { Users, UserPlus, MapPin, Phone, Search, Trash2 } from 'lucide-react';

export const StudentsManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Formulario nuevo estudiante
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    identificationNumber: '',
    gradeLevel: '5to EGB - Paralelo A',
    homeAddress: '',
    emergencyPhone: '',
    lat: -0.180653,
    lng: -78.467834,
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.homeAddress) return;

    const student: Student = {
      id: `s-${Date.now()}`,
      schoolId: 'org-school-1',
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      identificationNumber: newStudent.identificationNumber,
      gradeLevel: newStudent.gradeLevel,
      homeAddress: newStudent.homeAddress,
      homeLocation: { lat: newStudent.lat, lng: newStudent.lng },
      emergencyPhone: newStudent.emergencyPhone,
      status: 'active',
    };

    setStudents([student, ...students]);
    setShowModal(false);
    setNewStudent({
      firstName: '',
      lastName: '',
      identificationNumber: '',
      gradeLevel: '5to EGB - Paralelo A',
      homeAddress: '',
      emergencyPhone: '',
      lat: -0.180653,
      lng: -78.467834,
    });
  };

  const handleRemoveStudent = (id: string) => {
    if (confirm('¿Estás seguro de retirar a este estudiante del padrón de transporte?')) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.homeAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Padrón de Estudiantes & Domicilios (HU-02)
            </h1>
            <p className="text-xs text-slate-500">
              Gestión de nóminas de pasajeros, puntos de recogida domiciliaria y contactos de emergencia.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Agregar Estudiante</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, grado o dirección..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Tabla / Tarjetas de Estudiantes */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Grado / Curso</th>
                <th className="py-3 px-4">Dirección Domiciliaria (Recogida)</th>
                <th className="py-3 px-4">Contacto Emergencia</th>
                <th className="py-3 px-4">Coordenadas PostGIS</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{student.firstName} {student.lastName}</div>
                    {student.identificationNumber && (
                      <span className="text-[11px] font-normal text-slate-400">CI: {student.identificationNumber}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-medium">
                      {student.gradeLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{student.homeAddress}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{student.emergencyPhone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    [{student.homeLocation.lat.toFixed(4)}, {student.homeLocation.lng.toFixed(4)}]
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Retirar de la ruta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Agregar Estudiante (HU-02) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Incorporar Nuevo Estudiante a la Ruta
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nombres</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Apellidos</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Grado / Paralelo</label>
                <input
                  type="text"
                  required
                  value={newStudent.gradeLevel}
                  onChange={(e) => setNewStudent({ ...newStudent, gradeLevel: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Dirección Domiciliaria Exacta</label>
                <input
                  type="text"
                  required
                  value={newStudent.homeAddress}
                  onChange={(e) => setNewStudent({ ...newStudent, homeAddress: e.target.value })}
                  placeholder="Ej. Av. Ilaló y Calle 3, Conjunto Los Cedros"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Teléfono de Emergencia Representante</label>
                <input
                  type="tel"
                  required
                  value={newStudent.emergencyPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, emergencyPhone: e.target.value })}
                  placeholder="0991234567"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
