import { FileText, ShieldCheck, Clock, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const auditEntries = [
    {
      id: 'aud-01',
      action: 'BOARD_STUDENT',
      actor: 'Carlos Zambrano (Conductor)',
      target: 'Mateo Carrillo (5to EGB)',
      detail: 'Abordaje confirmado en Parada 1 (Conjunto Los Cedros)',
      timestamp: 'Hoy, 06:48:12 AM',
      ip: '190.152.14.88 (Red Celular)',
      status: 'success',
    },
    {
      id: 'aud-02',
      action: 'PARENT_ACKNOWLEDGE',
      actor: 'Marcelo Carrillo (Representante)',
      target: 'Mateo Carrillo',
      detail: 'Confirmó "¡Ya estamos en la parada!" vía botón táctil',
      timestamp: 'Hoy, 06:46:50 AM',
      ip: '181.113.82.10 (WiFi Residencial)',
      status: 'success',
    },
    {
      id: 'aud-03',
      action: 'START_TRIP',
      actor: 'Carlos Zambrano (Conductor)',
      target: 'Ruta 04 - Valle Cumbayá',
      detail: 'Inicio formal de recorrido matutino. Telemetría GPS activada.',
      timestamp: 'Hoy, 06:30:00 AM',
      ip: '190.152.14.88',
      status: 'success',
    },
    {
      id: 'aud-04',
      action: 'UPDATE_STUDENT_ADDRESS',
      actor: 'Lic. Patricia Guerrero (Admin)',
      target: 'Valentina Morales (3ro EGB)',
      detail: 'Actualización de parada domiciliaria a Calle Guayaquil y Esmeraldas',
      timestamp: 'Ayer, 04:15:32 PM',
      ip: '200.25.198.5 (Red Institucional)',
      status: 'success',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pistas de Auditoría Inmutables
            </h1>
            <p className="text-xs text-slate-500">
              Registro legal de eventos críticos, autorizaciones de recogida y trazabilidad de abordajes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Firma Hash Criptográfica Activa</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 text-xs">
          {auditEntries.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-900">{log.detail}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Actor: <strong>{log.actor}</strong></span>
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span>Afectado: <strong>{log.target}</strong></span>
                </div>
                <span className="font-mono text-slate-400">IP: {log.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
