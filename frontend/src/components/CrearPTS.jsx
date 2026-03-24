
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSupervisores } from '../api/supervisores';

const CrearPTS = () => {
    // Efecto para limpiar el formulario al recibir el evento global
    useEffect(() => {
      const resetHandler = () => {
        resetForm();
      };
      window.addEventListener('resetCrearPTS', resetHandler);
      return () => {
        window.removeEventListener('resetCrearPTS', resetHandler);
      };
    }, []);
  const navigate = useNavigate();
  const location = useLocation();
  // PTS en standby que se está retomando (viene desde la navegación)
  const editingPts = location.state?.editingPts || null;
  // Estado para el nombre real del solicitante
  const [nombreSolicitante, setNombreSolicitante] = useState('');
  // Lista de supervisores disponibles
  const [supervisores, setSupervisores] = useState([]);

  // Cargar supervisores al montar el componente
  useEffect(() => {
    fetchSupervisores().then(setSupervisores);
  }, []);
  // Lista de equipos disponibles
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);

  // Cargar equipos al montar el componente
  useEffect(() => {
    fetch('/api/equipos')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEquiposDisponibles(Array.isArray(data) ? data : []))
      .catch(() => setEquiposDisponibles([]));
  }, []);
    // Estado para los datos del formulario

    // Generar número de permiso consultando al backend
    async function fetchNumeroPermiso(fecha) {
      // fecha en formato YYYY-MM-DD
      const d = new Date(fecha);
      const aa = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      try {
        const res = await fetch(`/api/pts/ultimo-numero?fechaInicio=${fecha}`);
        if (res.ok) {
          const ultimo = await res.json();
          const next = (parseInt(ultimo, 10) || 0) + 1;
          return `PTS-${aa}${mm}${dd}-${String(next).padStart(3, '0')}`;
        }
      } catch {}
      // fallback
      return `PTS-${aa}${mm}${dd}-001`;
    }

    const [formData, setFormData] = useState(() => ({
      numeroPermiso: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      ubicacion: '',
      descripcionTrabajo: '',
      solicitanteLegajo: '',
      nombreSolicitante: '',
      // area eliminado
      solicitante: '',
      supervisor: '',
      responsableAreaTrabajo: '',
      requiereAnalisisRiesgo: false,
      requiereProcedimientoEspecifico: false,
      observaciones: '',
      riesgosControles: [{ riesgo: '', control: '' }],
      equiposSeguridad: [{ equipo: '', cantidad: 1 }]
    }));

  // Estados para validación de equipo
  const [equipoError, setEquipoError] = useState(null);
  const [equipoLoading, setEquipoLoading] = useState(false);
  const [equipoDescripcion, setEquipoDescripcion] = useState("");

  // Cargar datos del PTS en standby si se está retomando
  useEffect(() => {
    if (editingPts) {
      setFormData(prev => ({
        ...prev,
        numeroPermiso: editingPts.id || '',
        fecha: editingPts.fechaInicio || prev.fecha,
        horaInicio: editingPts.horaInicio || '',
        horaFin: editingPts.horaFin || '',
        ubicacion: editingPts.ubicacion || '',
        descripcionTrabajo: editingPts.descripcionTrabajo || '',
        solicitanteLegajo: editingPts.solicitanteLegajo || '',
        nombreSolicitante: editingPts.nombreSolicitante || '',
        solicitante: editingPts.nombreSolicitante || prev.solicitante,
        supervisor: editingPts.supervisorLegajo || '',
        responsableAreaTrabajo: '', // extraer de observaciones si existe
        requiereAnalisisRiesgo: editingPts.requiereAnalisisRiesgoAdicional || false,
        observaciones: editingPts.rtoObservaciones || editingPts.observaciones || '',
        riesgosControles: editingPts.riesgosControles && editingPts.riesgosControles.length > 0
          ? editingPts.riesgosControles.map(rc => ({ riesgo: rc.peligro || '', control: rc.controlRequerido || '' }))
          : [{ riesgo: '', control: '' }],
        equiposSeguridad: editingPts.equiposSeguridad && editingPts.equiposSeguridad.length > 0
          ? editingPts.equiposSeguridad.map(es => ({ equipo: es.equipo || '', cantidad: 1 }))
          : [{ equipo: '', cantidad: 1 }]
      }));
    }
  }, [editingPts]);

  // Validar equipo por tag (solo 1 equipo por PTS)
  const handleValidarEquipo = async () => {
    const token = localStorage.getItem('authToken');
    const tag = formData.equiposSeguridad[0]?.equipo?.trim();
    if (!tag) {
      setEquipoDescripcion("");
      setEquipoError("El tag del equipo es obligatorio.");
      return;
    }
    setEquipoLoading(true);
    setEquipoError(null);
    setEquipoDescripcion("");
    try {
      const response = await fetch(`/api/equipos/${tag}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEquipoDescripcion(data.descripcion);
        setEquipoError(null);
      } else if (response.status === 404) {
        setEquipoDescripcion("");
        setEquipoError("Tag de equipo no encontrado.");
      } else {
        setEquipoDescripcion("");
        setEquipoError("Error al validar el equipo.");
      }
    } catch (error) {
      setEquipoDescripcion("");
      setEquipoError("Error de conexión al validar equipo.");
    } finally {
      setEquipoLoading(false);
    }
  };

// ...existing code...

  // Estado para validacion
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Estados para autocompletado de usuarios
        // equipoOInstalacion: formData.equiposSeguridad[0]?.equipo || '', // Solo el primer equipo (eliminado por error de sintaxis)
  const [searchLoading, setSearchLoading] = useState(false);

  // Estado de autenticacion
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Obtener nombre real del solicitante desde la base de datos al cargar el usuario
  useEffect(() => {
    if (user && user.dni) {
      const token = localStorage.getItem('authToken');
      fetch(`/api/usuarios/${user.dni}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setNombreSolicitante(data?.nombreCompleto || ''));
    }
  }, [user]);

  // Verificar autenticacion 
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setSubmitMessage('Error: No estás autenticado. Por favor, inicia sesión.');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        localStorage.removeItem('authToken');
        setSubmitMessage('Error: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
      }

      setUser({
        dni: payload.sub,
        nombre: payload.nombre || payload.sub,
        roles: payload.roles || []
      });

      // Extraer rol principal y setearlo en el estado
      if (payload.roles && payload.roles.length > 0) {
        setUserRole(payload.roles[0]);
      }

      // Autollenar campos basados en el usuario
      setFormData(prev => ({
        ...prev,
        solicitante: payload.nombre || payload.sub
      }));

    } catch (error) {
      console.error('Error al decodificar el token:', error);
      setSubmitMessage('Error: Token inválido. Por favor, inicia sesión nuevamente.');
    }
  }, []);

  // Funcion para manejar cambios en entradas simples
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Funcion para manejar cambios en arrays
  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Funcion para agregar elementos a arrays
  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  // Funcion para eliminar elementos de arrays
  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  // handleBuscarLegajo eliminado

  // Funcion para guardar PTS en Stand by (formulario parcial)
  const handleStandby = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      const ptsData = {
        fechaInicio: formData.fecha || new Date().toISOString().split('T')[0],
        fechaFin: formData.fecha || new Date().toISOString().split('T')[0],
        horaInicio: formData.horaInicio || '',
        horaFin: formData.horaFin || '',
        ubicacion: formData.ubicacion || '',
        descripcionTrabajo: formData.descripcionTrabajo || '',
        tareaDetallada: formData.descripcionTrabajo || '',
        nombreSolicitante: formData.solicitante || '',
        solicitanteLegajo: user?.dni || '',
        supervisorLegajo: formData.supervisor || '',
        observaciones: formData.observaciones || '',
        area: formData.ubicacion || '',
        equipoOInstalacion: formData.equiposSeguridad.map(e => e.equipo).filter(e => e).join(', ') || '',
        tipoTrabajo: 'GENERAL',
        riesgosControles: formData.riesgosControles
          .filter(rc => rc.riesgo || rc.control)
          .map(rc => ({
            peligro: rc.riesgo || '',
            consecuencia: 'A definir',
            controlRequerido: rc.control || ''
          })),
        equiposSeguridad: formData.equiposSeguridad
          .filter(es => es.equipo)
          .map(es => ({
            equipo: es.equipo,
            esRequerido: true,
            esProporcionado: false,
            observacion: `Cantidad: ${es.cantidad}`
          })),
        rtoEstado: 'STANDBY',
        requiereAnalisisRiesgoAdicional: formData.requiereAnalisisRiesgo === true
      };

      let response;
      if (editingPts) {
        // Actualizar PTS existente en standby
        response = await fetch(`/api/pts/${editingPts.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ptsData)
        });
      } else {
        // Crear nuevo PTS en standby
        response = await fetch('/api/pts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ptsData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage(`PTS guardado en Stand by. ID: ${result.id || 'asignado'}`);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorText = await response.text();
        setSubmitMessage(`Error al guardar en Stand by: ${errorText}`);
      }
    } catch (error) {
      console.error('Error al guardar en Stand by:', error);
      setSubmitMessage('Error de conexión al guardar en Stand by.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validacion del formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos HU-011
    if (!formData.descripcionTrabajo.trim()) newErrors.descripcionTrabajo = 'La descripcion del trabajo es obligatoria';
    if (!formData.solicitante.trim()) newErrors.solicitante = 'El solicitante es obligatorio';
    // Solo pedir supervisor si requiere análisis de riesgo adicional
    if (formData.requiereAnalisisRiesgo && !formData.supervisor.trim()) newErrors.supervisor = 'El supervisor es obligatorio';

    // Validaciones de autocompletado eliminadas
    // validación de área eliminada

    // Campos adicionales 
    if (!formData.fecha) newErrors.fecha = 'La fecha es obligatoria';
    if (!formData.horaInicio) newErrors.horaInicio = 'La hora de inicio es obligatoria';
    if (!formData.horaFin) newErrors.horaFin = 'La hora de fin es obligatoria';
    if (!formData.ubicacion.trim()) newErrors.ubicacion = 'La ubicación es obligatoria';
    if (!formData.responsableAreaTrabajo.trim()) newErrors.responsableAreaTrabajo = 'El responsable del área de trabajo es obligatorio';

    // Validar horas
    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Validar que la lista de riesgos no esté vacía (HU-011)
    if (formData.riesgosControles.length === 0 || !formData.riesgosControles[0].riesgo.trim()) {
      newErrors.riesgosControles = 'Debe especificar al menos un riesgo y su control';
    }

    // Validar que al menos haya un equipo de seguridad
    if (formData.equiposSeguridad.length === 0 || !formData.equiposSeguridad[0].equipo.trim()) {
      newErrors.equiposSeguridad = 'Debe especificar al menos un equipo de seguridad';
    }

    // Validar equipo (tag)
    if (equipoError !== null) {
      newErrors.equiposSeguridad = equipoError;
    }

    // Validar estado DCS del equipo seleccionado
    const tag = formData.equiposSeguridad[0]?.equipo;
    if (tag) {
      const equipo = equiposDisponibles.find(eq => eq.tag === tag);
      if (equipo && equipo.estadoDcs !== 'DESHABILITADO') {
        newErrors.equiposSeguridad = 'Solo se puede crear un PTS si el equipo está DESHABILITADO en DCS.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funcion para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage('Por favor, corrige los errores en el formulario.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Preparar datos para envío - Mapear al modelo backend
      const ptsData = {
        // Campos básicos mapeados
        id: formData.numeroPermiso,
        fechaInicio: formData.fecha,
        fechaFin: formData.fecha, 
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        ubicacion: formData.ubicacion,
        descripcionTrabajo: formData.descripcionTrabajo,
        tareaDetallada: formData.descripcionTrabajo, 
        
        // Campos de personal
        nombreSolicitante: formData.solicitante,
        solicitanteLegajo: user?.dni || '', // !!! ver si queda asi Usar DNI del usuario como legajo
        supervisorLegajo: formData.supervisor, // El supervisor es un legajo/DNI
        // !!! Nota: responsableAreaTrabajo se almacena en observaciones por ahora
        observaciones: `${formData.observaciones}\n\nResponsable del Área: ${formData.responsableAreaTrabajo}`.trim(),
        
        // Campos adicionales del modelo
        area: formData.ubicacion, // este campo es para la ubicación, no para el área del solicitante
        equipoOInstalacion: formData.equiposSeguridad.map(e => e.equipo).join(', '), // String con equipos
        tipoTrabajo: 'GENERAL', 
        
        // Mapear riesgos y controles al formato backend
        riesgosControles: formData.riesgosControles.map(rc => ({
          peligro: rc.riesgo,
          consecuencia: 'A definir', 
          controlRequerido: rc.control
        })),
        
        // Mapear equipos de seguridad al formato backend
        equiposSeguridad: formData.equiposSeguridad.map(es => ({
          equipo: es.equipo,
          esRequerido: true,
          esProporcionado: false,
          observacion: `Cantidad: ${es.cantidad}`
        })),
        
        // Estado inicial del RTO
        rtoEstado: 'PENDIENTE',

        // Nuevo campo: requiereAnalisisRiesgoAdicional
        requiereAnalisisRiesgoAdicional: formData.requiereAnalisisRiesgo === true
      };

      // console.log eliminado (control)

      let response;
      // Si estamos editando un PTS en standby, usar PUT para actualizar
      if (editingPts) {
        response = await fetch(`/api/pts/${editingPts.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ptsData)
        });
      } else {
        response = await fetch('/api/pts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ptsData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage(`¡PTS creado exitosamente! Número: ${result.numeroPermiso || formData.numeroPermiso}`);
        
        // Limpiar formulario despues del exito
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitMessage(`Error al crear PTS: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar PTS:', error);
      setSubmitMessage('Error de conexión. Por favor, verifica que el servidor esté ejecutándose.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcion para resetear el formulario
  const resetForm = async () => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const numeroPermiso = await fetchNumeroPermiso(fechaHoy);
    setFormData({
      numeroPermiso,
      fecha: fechaHoy,
      horaInicio: '',
      horaFin: '',
      ubicacion: '',
      descripcionTrabajo: '',
      solicitanteLegajo: '',
      nombreSolicitante: '',
      // area eliminado
      solicitante: user?.nombre || '',
      supervisor: '',
      responsableAreaTrabajo: '',
      requiereAnalisisRiesgo: false,
      requiereProcedimientoEspecifico: false,
      observaciones: '',
      riesgosControles: [{ riesgo: '', control: '' }],
      equiposSeguridad: [{ equipo: '', cantidad: 1 }]
    });
    setErrors({});
    setSubmitMessage('');
      // setSearchError(null); // Eliminado porque no existe o no es necesario
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: 12 }}>Acceso Denegado</h2>
          <p style={{ color: '#64748b' }}>Debes iniciar sesión para crear un PTS.</p>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => window.location.reload()} className="btn btn-primary">Volver al Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: '#0d7377', color: '#fff', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {editingPts ? `Continuar PTS - ${editingPts.id}` : 'Crear Permiso de Trabajo Seguro'}
            </h1>
            <p style={{ marginTop: 6, opacity: 0.9, fontSize: '0.85rem' }}>
              Usuario: {user.nombre}
              {userRole && ` | Rol: ${userRole}`}
              {editingPts && ' | Retomando PTS en Stand by'}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Información básica */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.fecha ? 'border-red-500' : ''
                  }`}
                />
                {errors.fecha && <p className="error-validacion">{errors.fecha}</p>}
              </div>
            </div>


            {/* Horarios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Hora de Inicio *</label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.horaInicio ? 'border-red-500' : ''
                  }`}
                />
                {errors.horaInicio && <p className="error-validacion">{errors.horaInicio}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Hora de Fin *</label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.horaFin ? 'border-red-500' : ''
                  }`}
                />
                {errors.horaFin && <p className="error-validacion">{errors.horaFin}</p>}
              </div>
            </div>

            {/* Equipo a Intervenir */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2332' }}>Equipo a Intervenir *</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, padding: 16, border: '1px solid #e2eff1', borderRadius: 12, background: '#f8fdfd' }}>
                <div>
                  <label className="form-label">Tag de Equipo</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className="form-input"
                      value={formData.equiposSeguridad[0]?.equipo || ''}
                      onChange={e => handleArrayChange('equiposSeguridad', 0, 'equipo', e.target.value)}
                      onBlur={handleValidarEquipo}
                    >
                      <option value="">-- Seleccione un equipo --</option>
                      {equiposDisponibles.map(eq => (
                        <option key={eq.tag} value={eq.tag}>{eq.tag} - {eq.descripcion}</option>
                      ))}
                    </select>
                  </div>
                  {/* Estado del equipo */}
                  {(() => {
                    const tag = formData.equiposSeguridad[0]?.equipo;
                    if (!tag) return null;
                    const equipo = equiposDisponibles.find(eq => eq.tag === tag);
                    if (!equipo) return null;
                    // Mostrar el estadoDcs real
                    let color = 'text-red-600';
                    let label = equipo.estadoDcs || 'Desconocido';
                    switch (equipo.estadoDcs) {
                      case 'DESHABILITADO':
                        color = 'text-green-700';
                        label = 'Deshabilitado';
                        break;
                      case 'HABILITADO':
                        label = 'Habilitado';
                        break;
                      case 'PARADO':
                        label = 'Parado';
                        break;
                      case 'EN_MARCHA':
                        label = 'En marcha';
                        break;
                      default:
                        color = 'text-gray-600';
                        label = equipo.estadoDcs || 'Desconocido';
                    }
                    return (
                      <p className={`mt-2 text-sm font-semibold ${color}`}>
                        Estado DCS: {label}
                      </p>
                    );
                  })()}
                  {equipoLoading && <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Validando equipo...</p>}
                  {equipoError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 4 }}>{equipoError}</p>}
                </div>
              </div>
              {errors.equiposSeguridad && <p className="error-validacion">{errors.equiposSeguridad}</p>}
            </div>

            {/* Ubicación y descripción */}
            <div className="form-group">
              <label className="form-label">Ubicación del Trabajo *</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.ubicacion ? 'border-red-500' : ''
                }`}
                placeholder="Ej: Sector A, Planta 2, Oficina 205"
              />
              {errors.ubicacion && <p className="error-validacion">{errors.ubicacion}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del Trabajo *</label>
              <textarea
                name="descripcionTrabajo"
                value={formData.descripcionTrabajo}
                onChange={handleInputChange}
                rows="4"
                className={`form-input ${
                  errors.descripcionTrabajo ? 'border-red-500' : ''
                }`}
                placeholder="Describe detalladamente el trabajo a realizar..."
              />
              {errors.descripcionTrabajo && <p className="error-validacion">{errors.descripcionTrabajo}</p>}
            </div>

            {/* Información del Solicitante - Autocompletado */}
            <div style={{ background: '#f0fafa', padding: 16, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2332', marginBottom: 12 }}>Información del Emisor</h3>
              

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>

                <div className="form-group">
                  <label className="form-label">Emisor *</label>
                  <input
                    type="text"
                    name="solicitante"
                    value={user ? user.dni : ''}
                    readOnly
                    className="form-input"
                    style={{ background: '#e2eff1', cursor: 'not-allowed' }}
                    placeholder="Legajo del emisor"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre Emisor *</label>
                  <input
                    type="text"
                    name="nombreSolicitante"
                    value={nombreSolicitante}
                    readOnly
                    className="form-input"
                    style={{ background: '#e2eff1', cursor: 'not-allowed' }}
                    placeholder="Nombre completo del emisor"
                  />
                </div>
              </div>
            </div>

            <div style={{ background: '#f0fafa', padding: 16, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2332', marginBottom: 12 }}>Información del Receptor</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Receptor *</label>
                  <input
                    type="text"
                    name="receptor"
                    value={formData.receptor || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Legajo del receptor"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre Receptor *</label>
                  <input
                    type="text"
                    name="nombreReceptor"
                    value={formData.nombreReceptor || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nombre completo del receptor"
                  />
                </div>
              </div>
            </div>



            {/* Checkboxes de requerimientos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" name="requiereAnalisisRiesgo" checked={formData.requiereAnalisisRiesgo} onChange={handleInputChange} style={{ accentColor: '#0d7377' }} />
                <label style={{ fontSize: '0.9rem', color: '#334155' }}>Requiere Análisis de Riesgo Adicional</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" name="requiereProcedimientoEspecifico" checked={formData.requiereProcedimientoEspecifico} onChange={handleInputChange} style={{ accentColor: '#0d7377' }} />
                <label style={{ fontSize: '0.9rem', color: '#334155' }}>Requiere Procedimiento Específico</label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Supervisor *</label>
                <select
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.supervisor ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">-- Seleccione un supervisor --</option>
                  {supervisores.map(sup => (
                    <option key={sup.legajo} value={sup.legajo}>{sup.legajo} - {sup.nombre}</option>
                  ))}
                </select>
                {errors.supervisor && <p className="error-validacion">{errors.supervisor}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Responsable del Área *</label>
                <input
                  type="text"
                  name="responsableAreaTrabajo"
                  value={formData.responsableAreaTrabajo}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.responsableAreaTrabajo ? 'border-red-500' : ''
                  }`}
                  placeholder="Responsable del área de trabajo"
                />
                {errors.responsableAreaTrabajo && <p className="error-validacion">{errors.responsableAreaTrabajo}</p>}
              </div>
            </div>


            {/* Riesgos y Controles */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2332' }}>Riesgos y Controles *</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('riesgosControles', { riesgo: '', control: '' })}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  + Agregar Riesgo
                </button>
              </div>
              
              {formData.riesgosControles.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, padding: 16, border: '1px solid #e2eff1', borderRadius: 12, background: '#f8fdfd' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Riesgo {index + 1}</label>
                    <input
                      type="text"
                      value={item.riesgo}
                      onChange={(e) => handleArrayChange('riesgosControles', index, 'riesgo', e.target.value)}
                      className="form-input"
                      placeholder="Describe el riesgo identificado"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Control {index + 1}</label>
                      {formData.riesgosControles.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('riesgosControles', index)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Eliminar</button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.control}
                      onChange={(e) => handleArrayChange('riesgosControles', index, 'control', e.target.value)}
                      className="form-input"
                      placeholder="Medida de control para este riesgo"
                    />
                  </div>
                </div>
              ))}
              {errors.riesgosControles && <p className="error-validacion">{errors.riesgosControles}</p>}
            </div>

            {/* ...se eliminó la sección duplicada de 'Equipo a Intervenir'... */}

            {/* Observaciones */}
            <div className="form-group">
              <label className="form-label">Observaciones Adicionales</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
                className="form-input"
                placeholder="Información adicional relevante..."
              />
            </div>

            {/* Mensaje de estado */}
            {submitMessage && (
              <div style={{ padding: 14, borderRadius: 10, background: submitMessage.includes('Error') ? '#fef2f2' : '#f0fdf4', color: submitMessage.includes('Error') ? '#991b1b' : '#166534', fontSize: '0.9rem' }}>
                {submitMessage}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid #e2eff1' }}>
              <button type="button" onClick={resetForm} className="btn btn-outline" disabled={isSubmitting}>Limpiar</button>
              <button type="button" onClick={handleStandby} disabled={isSubmitting} className="btn" style={{ background: '#f59e0b', color: '#fff', border: 'none' }}>
                {isSubmitting ? 'Guardando...' : 'Stand by'}
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Creando...' : (editingPts ? 'Crear PTS' : 'Crear PTS')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS para validación
const styles = `
.error-validacion {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
`;

// Añadir estilos al documento si no existen
if (!document.querySelector('#pts-validation-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'pts-validation-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CrearPTS;