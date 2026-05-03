import React, { useState, useEffect } from 'react';

// ============================================================
// Datos de las preguntas por especialidad (Sección 1 - Control de Calidad)
// ============================================================
const PREGUNTAS_CANERIAS = [
  '¿Se inspeccionaron y ajustaron las bridas con el torque y secuencia correcta según Procedimiento de torqueo? ¿Se completó la planilla y se colocó la identificación de torqueo?',
  '¿Están las soldaduras y ensayos no destructivos completos?',
  '¿Se retiraron las colpas/tapas de las cañerías?',
  '¿Están los soportes/patines de cañerías colocados?',
  '¿Están tapones y bridas ciegas colocadas?',
  '¿Están los filtros instalados y en el sentido de flujo adecuado?',
  '¿Están todos los flexibles/tubings reconectados?',
  '¿Está la válvula montada y con sentido de flujo correcto?',
  '¿Está la continuidad eléctrica en las bridas de las cañerías?',
  '¿Está la puesta a tierra re instalada en los equipos?',
  '¿Los dispositivos de lucha contra incendio se re instalaron correctamente?',
  '¿Quedó el área de trabajo limpia y/o libre de materiales de mantenimiento?',
  '¿La aislación quedó colocada correctamente, incluyendo cubiertas para protección personal?',
  '¿Están las rejillas, pasamanos y barandas montadas en su lugar?',
];

const PREGUNTAS_MECANICA = [
  '¿Quedó el equipo acoplado correctamente?',
  '¿Quedaron los filtros y/o cono de bruja instalados y en el sentido de flujo correcto?',
  '¿Tiene el equipo nivel de aceite correcto? ¿Tiene la identificación del lubricante colocada?',
  '¿Está el equipo rotativo y su motor alineado correctamente?',
  '¿La tensión de correa es la correcta?',
  '¿Quedaron las protecciones colocadas (cubreacoples)?',
  '¿Están instaladas las juntas, o-rings adecuadas?',
  '¿Está la puesta a tierra re instalada?',
  '¿Está conectado el tubing del circuito de sello?',
  '¿Se completó el nivel del pote de sello? ¿Se retiraron las trabas del sello?',
  '¿Se ajustaron los prensa estopa?',
  '¿Están todas las tapas correctamente atornilladas?',
  '¿Los dispositivos de lucha contra incendio se re instalaron correctamente?',
  '¿Las fijaciones del equipo a la fundación están bien ajustadas y sin faltantes?',
  '¿Están las rejillas, pasamanos y barandas montadas en su lugar?',
  '¿Quedó el área de trabajo limpia y/o libre de materiales de mantenimiento?',
  '¿La aislación quedó colocada correctamente, incluyendo cubiertas para protección personal?',
];

const PREGUNTAS_INSTRUMENTOS = [
  '¿Se retiraron con Hart los instrumentos/válvulas de control? ¿Se realizó prueba funcional en planta, y quedaron normalizados?',
  '¿Están las válvulas montadas y con el sentido de flujo correcto?',
  '¿Están los instrumentos correctamente montados, conectados y ajustados?',
  '¿Están todas las mangueras o tubings reconectados?',
  '¿Quedó el aire de instrumentos habilitado y con la presión correcta?',
  '¿Están los analizadores y detectores de gas conectados, calibrados y listos para operar y verificados a través del sistema de control?',
  '¿Las purgas "Z" funcionan correctamente (hay presión positiva en el equipo según las especificaciones)?',
  '¿Las cajas de instrumentos/conduits quedan cerrados y sellados? ¿Los cables, capilares y conduits están seguros y bien fijados?',
  '¿Están todas las tapas correctamente atornilladas?',
  '¿Está la continuidad eléctrica/puesta a tierra re instalada?',
  '¿Se realizó prueba de estanqueidad en instrumentos/analizadores?',
  '¿Quedaron los instrumentos encendidos y/o con alimentación eléctrica?',
  '¿Quedó el área de trabajo limpia y/o libre de materiales de mantenimiento?',
  '¿Se colocaron los tags del instrumento?',
];

const PREGUNTAS_ELECTRICIDAD = [
  '¿Quedaron los circuitos eléctricos testeados? ¿Son los fusibles del tamaño correcto?',
  '¿Están los cables soportados correctamente, sin conductores expuestos?',
  '¿Quedaron las puestas a tierra conectadas? ¿Se verificó continuidad?',
  '¿Quedaron los instrumentos con alimentación eléctrica?',
  '¿Está el tracing colocado y listo para operar?',
  '¿Están los puentes temporales eliminados?',
  '¿Quedó la identificación del equipo y de riesgos eléctricos colocada en CCM, y en campo?',
  '¿Están las cajas de conexiones de campo cerradas y aseguradas con todos los tornillos? ¿Los cables entran por la parte inferior o lateral de la caja y están sellados?',
  '¿Se chequeó el sentido de giro? ¿Es el correcto?',
  '¿Están las tapas de conduits cerradas y/o en su lugar?',
  '¿Quedó el área de trabajo limpia y/o libre de materiales de mantenimiento?',
];

// Sección 2 - Chequeos Operativos
const PREGUNTAS_OPERADOR_IZQUIERDA = [
  '¿Se completaron las secciones aplicables de control de calidad?',
  '¿La aislación quedó colocada correctamente, incluyendo cubiertas para protección personal?',
  '¿Se desmontaron las líneas y equipos de uso temporal?',
  '¿Están los soportes, patines de cañerías colocados?',
  '¿Está el tracing de calentamiento colocado y listo para operar?',
  '¿Están las puestas a tierra colocadas?',
  '¿Están las rejillas, pasamanos y barandas en su lugar?',
  '¿Se realizó limpieza completa en el lugar de trabajo?',
  '¿Quedaron las protecciones colocadas (cubreacoples)?',
  '¿Quedaron todos los equipos de emergencia sin restricción de acceso?',
  '¿Quedaron los sprinklers y otros equipos de agua de incendio nuevamente operativos y en la posición original?',
  '¿Quedaron los tubings de sellos conectados? ¿El nivel de pote de sello es el apropiado? ¿El nivel de aceite del equipo es el correcto?',
  '¿Quedaron las válvulas de los diques de contención cerradas y canaletas sin obstáculos?',
  'Realizar chequeo visual de bulones faltantes o sueltos',
  '¿Quedó la instrumentación habilitada?',
  '¿Quedaron habilitados y alineados los dispositivos de alivio? (ej: PSV)',
];

const PREGUNTAS_OPERADOR_DERECHA = [
  '¿Se completó la lista de verificación del procedimiento crítico SSIS y los octógonos/precintos de seguridad están en su lugar?',
  '¿Se completó el Formulario de Cambio (Addendum) para realizar la prueba de pérdidas y/o habilitar la instrumentación necesaria? (Si Aplica)',
  '¿La prueba de pérdidas en todos los puntos intervenidos fue exitosa de acuerdo al procedimiento operativo?',
  '¿El equipo ha sido purgado, secado y verificado de estar libre de oxígeno?',
  '¿Están todas las válvulas, drenajes, bridas, puntos de muestreo, cerrados y tapados?',
  '¿El / los Master de Tarjetas Rojas ha sido liberado por todas las personas, reconciliado y cerrado?',
  '¿El listado de ubicación de las tarjetas amarillas fue conciliado?',
];

// Sección 3 - Arranque del equipo/sistema
const PREGUNTAS_ARRANQUE = [
  'Realizar una inspección visual en campo al momento de la introducción de fluido/producto',
  'Realizar una inspección visual en campo al momento del arranque del equipo/sistema',
];

// ============================================================
// Helper: inicializar respuestas para un array de preguntas
// ============================================================
const initRespuestas = (preguntas) =>
  preguntas.map(() => ({ respuesta: '', iniciales: '' }));

// ============================================================
// Componente de tabla checklist reutilizable
// ============================================================
const ChecklistTable = ({ preguntas, respuestas, onChange, disabled }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
    <thead>
      <tr style={{ background: '#e8f4f5' }}>
        <th style={thStyle}>Ítem</th>
        <th style={{ ...thStyle, width: 40, textAlign: 'center' }}>Sí</th>
        <th style={{ ...thStyle, width: 40, textAlign: 'center' }}>N/A</th>
        <th style={{ ...thStyle, width: 40, textAlign: 'center' }}>No</th>
        <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Iniciales</th>
      </tr>
    </thead>
    <tbody>
      {preguntas.map((pregunta, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
          <td style={{ padding: '8px 10px', color: '#334155', lineHeight: 1.4 }}>{pregunta}</td>
          {['Si', 'NA', 'No'].map((val) => (
            <td key={val} style={{ textAlign: 'center', padding: 4 }}>
              <input
                type="radio"
                name={`chk_${preguntas[0].substring(0,10)}_${idx}`}
                value={val}
                checked={respuestas[idx]?.respuesta === val}
                onChange={() => onChange(idx, 'respuesta', val)}
                disabled={disabled}
                style={{ accentColor: '#0d7377', cursor: disabled ? 'not-allowed' : 'pointer' }}
              />
            </td>
          ))}
          <td style={{ textAlign: 'center', padding: 4 }}>
            <input
              type="text"
              maxLength={5}
              value={respuestas[idx]?.iniciales || ''}
              onChange={(e) => onChange(idx, 'iniciales', e.target.value.toUpperCase())}
              disabled={disabled}
              style={{ width: 60, textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 4px', fontSize: '0.82rem' }}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const thStyle = { padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#0a5c5f', fontSize: '0.82rem' };

// ============================================================
// Componente de subsección pendientes
// ============================================================
const TareasPendientes = ({ value, onChange, disabled }) => (
  <div style={{ marginTop: 12, padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #f59e0b' }}>
    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#92400e', display: 'block', marginBottom: 6 }}>
      Tareas o Ítems que quedan pendientes
    </label>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 8 }}>
      <div>
        <label style={{ fontSize: '0.78rem', color: '#78716c' }}>Descripción</label>
        <textarea
          rows={2}
          value={value.descripcion}
          onChange={(e) => onChange({ ...value, descripcion: e.target.value })}
          disabled={disabled}
          style={textareaStyle}
          placeholder="Descripción de la tarea pendiente..."
        />
      </div>
      <div>
        <label style={{ fontSize: '0.78rem', color: '#78716c' }}>Responsable</label>
        <input
          type="text"
          value={value.responsable}
          onChange={(e) => onChange({ ...value, responsable: e.target.value })}
          disabled={disabled}
          className="form-input"
          placeholder="Legajo o nombre"
        />
      </div>
    </div>
  </div>
);

const textareaStyle = { width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' };

// ============================================================
// Componente Principal: FormularioRTO
// ============================================================
const FormularioRTO = ({ rtoId, ptsIds = [], equipoTag, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [rtoData, setRtoData] = useState(null);

  // Encabezado del formulario
  const [encabezado, setEncabezado] = useState({
    ordenesServicio: '',
    planta: '',
    equipoSistema: equipoTag || '',
    fecha: new Date().toISOString().split('T')[0],
  });

  // Especialidades seleccionadas
  const [especialidades, setEspecialidades] = useState({
    canerias: false,
    mecanica: false,
    instrumentos: false,
    electricidad: false,
  });

  // Respuestas Sección 1 - Control de Calidad
  const [respCanerias, setRespCanerias] = useState(initRespuestas(PREGUNTAS_CANERIAS));
  const [pendientesCanerias, setPendientesCanerias] = useState({ descripcion: '', responsable: '' });
  const [respMecanica, setRespMecanica] = useState(initRespuestas(PREGUNTAS_MECANICA));
  const [pendientesMecanica, setPendientesMecanica] = useState({ descripcion: '', responsable: '' });
  const [respInstrumentos, setRespInstrumentos] = useState(initRespuestas(PREGUNTAS_INSTRUMENTOS));
  const [pendientesInstrumentos, setPendientesInstrumentos] = useState({ descripcion: '', responsable: '' });
  const [respElectricidad, setRespElectricidad] = useState(initRespuestas(PREGUNTAS_ELECTRICIDAD));
  const [pendientesElectricidad, setPendientesElectricidad] = useState({ descripcion: '', responsable: '' });

  // Respuestas Sección 2 - Chequeos Operativos
  const [respOperadorIzq, setRespOperadorIzq] = useState(initRespuestas(PREGUNTAS_OPERADOR_IZQUIERDA));
  const [respOperadorDer, setRespOperadorDer] = useState(initRespuestas(PREGUNTAS_OPERADOR_DERECHA));
  const [chequeosOperativos, setChequeosOperativos] = useState({
    procedimientoPuestaServicio: '',
    fluido: '',
    tipoPrueba: '',       // 'spray', 'estanqueidad', 'visual'
    presionTesteo: '',
    duracionMinutos: '',
    presionInicial: '',
    presionFinal: '',
    fechaFin: '',
  });
  const [pendientesOperativos, setPendientesOperativos] = useState({ descripcion: '', responsable: '' });

  // Respuestas Sección 3 - Arranque del equipo/sistema
  const [respArranque, setRespArranque] = useState(initRespuestas(PREGUNTAS_ARRANQUE));
  const [fechaCierre, setFechaCierre] = useState('');

  // Cargar datos del RTO si ya existe
  useEffect(() => {
    if (!rtoId) return;
    setLoading(true);
    const token = localStorage.getItem('authToken');
    fetch(`/api/rto/${rtoId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data) {
          setRtoData(data);
          setEncabezado(prev => ({ ...prev, equipoSistema: data.equipoTag || prev.equipoSistema }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rtoId]);

  // Handlers
  const handleRespuestaChange = (setter) => (idx, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleEncabezadoChange = (field, value) => {
    setEncabezado(prev => ({ ...prev, [field]: value }));
  };

  const handleEspecialidadToggle = (key) => {
    setEspecialidades(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ningunaEspecialidad = !especialidades.canerias && !especialidades.mecanica && !especialidades.instrumentos && !especialidades.electricidad;

  // ============================================================
  // Guardar / Enviar el formulario
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ningunaEspecialidad) {
      setError('Debe seleccionar al menos una especialidad.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      // Obtener legajo del usuario actual desde el token JWT
      let responsableLegajo = '';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        responsableLegajo = payload.sub || '';
      } catch (_) {}

      // Construir las especialidades para el backend
      const especialidadesSeleccionadas = [];
      if (especialidades.canerias) especialidadesSeleccionadas.push('Cañerías');
      if (especialidades.mecanica) especialidadesSeleccionadas.push('Mecánica');
      if (especialidades.instrumentos) especialidadesSeleccionadas.push('Instrumentos');
      if (especialidades.electricidad) especialidadesSeleccionadas.push('Electricidad');

      const especialidadesArr = especialidadesSeleccionadas.map(nombre => ({
        nombre,
        responsableLegajo,
        cerrada: false,
      }));

      const observacionesJson = JSON.stringify({
        encabezado,
        especialidadesSeleccionadas: especialidades,
        seccion1: {
          canerias: especialidades.canerias ? { respuestas: respCanerias, pendientes: pendientesCanerias } : null,
          mecanica: especialidades.mecanica ? { respuestas: respMecanica, pendientes: pendientesMecanica } : null,
          instrumentos: especialidades.instrumentos ? { respuestas: respInstrumentos, pendientes: pendientesInstrumentos } : null,
          electricidad: especialidades.electricidad ? { respuestas: respElectricidad, pendientes: pendientesElectricidad } : null,
        },
        seccion2: {
          operadorIzq: respOperadorIzq,
          operadorDer: respOperadorDer,
          chequeos: chequeosOperativos,
          pendientes: pendientesOperativos,
        },
        seccion3: {
          arranque: respArranque,
          fechaCierre,
        },
      });

      let rtoFinal;

      if (rtoId) {
        // Agregar PTS al RTO existente
        for (const id of ptsIds) {
          await fetch(`/api/rto/${rtoId}/pts/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
        // Agregar las especialidades seleccionadas al RTO existente
        const addEspResp = await fetch(`/api/rto/${rtoId}/especialidades`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(especialidadesArr),
        });
        if (!addEspResp.ok) {
          const text = await addEspResp.text();
          setError(`Error al agregar especialidades al RTO (HTTP ${addEspResp.status}): ${text}`);
          return;
        }
        const getResp = await fetch(`/api/rto/${rtoId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        rtoFinal = getResp.ok ? await getResp.json() : null;
      } else {
        // Crear nuevo RTO
        const body = {
          equipoTag: encabezado.equipoSistema,
          ptsIds,
          especialidades: especialidadesArr,
          observaciones: observacionesJson,
        };
        const response = await fetch('/api/rto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const text = await response.text();
          setError(`Error al crear el RTO: ${text}`);
          return;
        }
        rtoFinal = await response.json();
      }

      if (!rtoFinal) {
        setError('No se pudo obtener el RTO para completar el cierre.');
        return;
      }

      // Cerrar cada especialidad → cuando todas cierran, el backend cierra el RTO y desbloquea el equipo
      for (const nombre of especialidadesSeleccionadas) {
        const cerrarResp = await fetch(
          `/api/rto/${rtoFinal.id}/especialidad/${encodeURIComponent(nombre)}/cerrar`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ responsableLegajo, observaciones: observacionesJson }),
          }
        );
        if (!cerrarResp.ok) {
          const text = await cerrarResp.text();
          // Si ya estaba cerrada, ignorar; otros errores los reportamos
          if (!text.includes('ya fue cerrada')) {
            setError(`Error al cerrar especialidad "${nombre}": ${text}`);
            return;
          }
        } else {
          rtoFinal = await cerrarResp.json();
        }
      }

      setSuccess(true);
      const estadoFinal = rtoFinal.estado || 'CERRADO';
      alert(
        `✅ RTO ${rtoFinal.id} completado exitosamente.\n\n` +
        `Equipo: ${rtoFinal.equipoTag}\n` +
        `Estado: ${estadoFinal}\n` +
        `PTS asociados: ${(rtoFinal.ptsIds || []).join(', ')}`
      );
      if (onSuccess) onSuccess(rtoFinal);
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}
          <div style={{ background: '#7c2d12', color: '#fff', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Lista de RTO (Retorno a Operaciones)
            </h1>
            <p style={{ marginTop: 6, opacity: 0.9, fontSize: '0.85rem' }}>
              {rtoId ? `RTO: ${rtoId}` : 'Nuevo Formulario RTO'}
              {equipoTag && ` | Equipo: ${equipoTag}`}
              {ptsIds.length > 0 && ` | PTS: ${ptsIds.join(', ')}`}
            </p>
          </div>

          {/* ============================================================ */}
          {/* FORMULARIO */}
          {/* ============================================================ */}
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* --- Encabezado / Alcance --- */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: 12, padding: 20, background: '#fffbf5' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#9a3412', margin: 0, marginBottom: 14 }}>Alcance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nro. de Ordenes de Servicio</label>
                  <input type="text" value={encabezado.ordenesServicio} onChange={e => handleEncabezadoChange('ordenesServicio', e.target.value)} className="form-input" placeholder="Ej: 200198040" />
                </div>
                <div className="form-group">
                  <label className="form-label">Equipo / Sistema</label>
                  <input type="text" value={encabezado.equipoSistema} onChange={e => handleEncabezadoChange('equipoSistema', e.target.value)} className="form-input" readOnly={!!equipoTag} />
                </div>
                <div className="form-group">
                  <label className="form-label">Planta</label>
                  <input type="text" value={encabezado.planta} onChange={e => handleEncabezadoChange('planta', e.target.value)} className="form-input" placeholder="Ej: LDPE" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input type="date" value={encabezado.fecha} onChange={e => handleEncabezadoChange('fecha', e.target.value)} className="form-input" />
                </div>
              </div>

              {/* Especialidades */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#9a3412', display: 'block', marginBottom: 8 }}>Especialidades que aplican *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {[
                    ['canerias', 'Cañerías'],
                    ['mecanica', 'Mecánica'],
                    ['instrumentos', 'Instrumentos'],
                    ['electricidad', 'Electricidad'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={especialidades[key]}
                        onChange={() => handleEspecialidadToggle(key)}
                        style={{ accentColor: '#9a3412', width: 18, height: 18 }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 1: CONTROL DE CALIDAD */}
            {/* ============================================================ */}
            <div style={{ border: '2px solid #dc2626', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#dc2626', color: '#fff', padding: '10px 20px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>1 - Control de Calidad</h2>
              </div>

              {/* --- Cañerías --- */}
              {especialidades.canerias && (
                <div style={{ padding: 20, borderBottom: '1px solid #fecaca' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem' }}>Cañerías</span>
                  </h3>
                  <ChecklistTable
                    preguntas={PREGUNTAS_CANERIAS}
                    respuestas={respCanerias}
                    onChange={handleRespuestaChange(setRespCanerias)}
                    disabled={loading}
                  />
                  <TareasPendientes value={pendientesCanerias} onChange={setPendientesCanerias} disabled={loading} />
                </div>
              )}

              {/* --- Mecánica --- */}
              {especialidades.mecanica && (
                <div style={{ padding: 20, borderBottom: '1px solid #fecaca' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem' }}>Mecánica</span>
                  </h3>
                  <ChecklistTable
                    preguntas={PREGUNTAS_MECANICA}
                    respuestas={respMecanica}
                    onChange={handleRespuestaChange(setRespMecanica)}
                    disabled={loading}
                  />
                  <TareasPendientes value={pendientesMecanica} onChange={setPendientesMecanica} disabled={loading} />
                </div>
              )}

              {/* --- Instrumentos --- */}
              {especialidades.instrumentos && (
                <div style={{ padding: 20, borderBottom: '1px solid #fecaca' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem' }}>Instrumentos</span>
                  </h3>
                  <ChecklistTable
                    preguntas={PREGUNTAS_INSTRUMENTOS}
                    respuestas={respInstrumentos}
                    onChange={handleRespuestaChange(setRespInstrumentos)}
                    disabled={loading}
                  />
                  <TareasPendientes value={pendientesInstrumentos} onChange={setPendientesInstrumentos} disabled={loading} />
                </div>
              )}

              {/* --- Electricidad --- */}
              {especialidades.electricidad && (
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem' }}>Electricidad</span>
                  </h3>
                  <ChecklistTable
                    preguntas={PREGUNTAS_ELECTRICIDAD}
                    respuestas={respElectricidad}
                    onChange={handleRespuestaChange(setRespElectricidad)}
                    disabled={loading}
                  />
                  <TareasPendientes value={pendientesElectricidad} onChange={setPendientesElectricidad} disabled={loading} />
                </div>
              )}

              {ningunaEspecialidad && (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  Seleccione al menos una especialidad en el alcance para ver el checklist.
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 2: CHEQUEOS OPERATIVOS */}
            {/* ============================================================ */}
            <div style={{ border: '2px solid #eab308', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#eab308', color: '#1a2332', padding: '10px 20px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>2 - Chequeos Operativos</h2>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e', marginBottom: 12 }}>Operador de campo</h3>
                <ChecklistTable
                  preguntas={PREGUNTAS_OPERADOR_IZQUIERDA}
                  respuestas={respOperadorIzq}
                  onChange={handleRespuestaChange(setRespOperadorIzq)}
                  disabled={loading}
                />

                {/* Campos especiales de chequeos operativos */}
                <div style={{ marginTop: 20, padding: 16, background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e', marginBottom: 12 }}>Prueba de pérdidas / Puesta en servicio</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Procedimiento de puesta en servicio</label>
                      <input type="text" value={chequeosOperativos.procedimientoPuestaServicio} onChange={e => setChequeosOperativos(prev => ({ ...prev, procedimientoPuestaServicio: e.target.value }))} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fluido</label>
                      <input type="text" value={chequeosOperativos.fluido} onChange={e => setChequeosOperativos(prev => ({ ...prev, fluido: e.target.value }))} className="form-input" />
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label className="form-label">Tipo de prueba</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
                      {[
                        ['spray', 'Chequeo con Spray/solución para detección de pérdidas'],
                        ['estanqueidad', 'Chequeo de estanqueidad'],
                        ['visual', 'Chequeo visual'],
                      ].map(([val, label]) => (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="tipoPrueba"
                            value={val}
                            checked={chequeosOperativos.tipoPrueba === val}
                            onChange={() => setChequeosOperativos(prev => ({ ...prev, tipoPrueba: val }))}
                            style={{ accentColor: '#92400e' }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {chequeosOperativos.tipoPrueba === 'spray' && (
                    <div style={{ marginTop: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Presión de testeo</label>
                        <input type="text" value={chequeosOperativos.presionTesteo} onChange={e => setChequeosOperativos(prev => ({ ...prev, presionTesteo: e.target.value }))} className="form-input" style={{ maxWidth: 200 }} />
                      </div>
                    </div>
                  )}

                  {chequeosOperativos.tipoPrueba === 'estanqueidad' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Duración (Minutos)</label>
                        <input type="number" value={chequeosOperativos.duracionMinutos} onChange={e => setChequeosOperativos(prev => ({ ...prev, duracionMinutos: e.target.value }))} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Presión Inicial (BARG)</label>
                        <input type="text" value={chequeosOperativos.presionInicial} onChange={e => setChequeosOperativos(prev => ({ ...prev, presionInicial: e.target.value }))} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Presión Final (BARG)</label>
                        <input type="text" value={chequeosOperativos.presionFinal} onChange={e => setChequeosOperativos(prev => ({ ...prev, presionFinal: e.target.value }))} className="form-input" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preguntas derecha del operador de campo */}
                <div style={{ marginTop: 20 }}>
                  <ChecklistTable
                    preguntas={PREGUNTAS_OPERADOR_DERECHA}
                    respuestas={respOperadorDer}
                    onChange={handleRespuestaChange(setRespOperadorDer)}
                    disabled={loading}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Fecha de fin</label>
                    <input type="date" value={chequeosOperativos.fechaFin} onChange={e => setChequeosOperativos(prev => ({ ...prev, fechaFin: e.target.value }))} className="form-input" style={{ maxWidth: 200 }} />
                  </div>
                </div>

                <TareasPendientes value={pendientesOperativos} onChange={setPendientesOperativos} disabled={loading} />
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 3: ARRANQUE DEL EQUIPO/SISTEMA */}
            {/* ============================================================ */}
            <div style={{ border: '2px solid #16a34a', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#16a34a', color: '#fff', padding: '10px 20px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>3 - Arranque del equipo/sistema</h2>
              </div>
              <div style={{ padding: 20 }}>
                <ChecklistTable
                  preguntas={PREGUNTAS_ARRANQUE}
                  respuestas={respArranque}
                  onChange={handleRespuestaChange(setRespArranque)}
                  disabled={loading}
                />
                <div style={{ marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Fecha de Cierre</label>
                    <input type="date" value={fechaCierre} onChange={e => setFechaCierre(e.target.value)} className="form-input" style={{ maxWidth: 200 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* MENSAJES Y BOTONES */}
            {/* ============================================================ */}
            {error && (
              <div style={{ background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 8, border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#f0fdf4', color: '#166534', padding: 12, borderRadius: 8, border: '1px solid #86efac', fontSize: '0.9rem' }}>
              ✅ Formulario RTO completado y cerrado exitosamente. El equipo fue desbloqueado.
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading || ningunaEspecialidad}
                className="btn"
                style={{
                  background: loading ? '#f97316' : '#7c2d12',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: loading || ningunaEspecialidad ? 'not-allowed' : 'pointer',
                  opacity: ningunaEspecialidad ? 0.5 : 1,
                }}
              >
                {loading ? 'Cerrando RTO...' : 'Guardar y Cerrar RTO'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ padding: '12px 32px', fontSize: '1rem' }}
                >
                  Cancelar
                </button>
              )}
            </div>

            {/* Nota informativa */}
            <div style={{ background: '#fffbeb', padding: 12, borderRadius: 8, border: '1px solid #f59e0b', textAlign: 'center' }}>
              <small style={{ color: '#92400e' }}>
                <strong>Importante:</strong> El equipo permanecerá BLOQUEADO hasta que todos los responsables de cada especialidad completen y cierren sus secciones del RTO.
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioRTO;
