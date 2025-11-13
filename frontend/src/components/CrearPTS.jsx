
import React, { useState, useEffect } from 'react';
import { fetchSupervisores } from '../api/supervisores';

const CrearPTS = () => {
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

    // Al cargar la fecha, obtener el número de permiso correcto
    useEffect(() => {
      async function updateNumeroPermiso() {
        const numero = await fetchNumeroPermiso(formData.fecha);
        setFormData(prev => ({ ...prev, numeroPermiso: numero }));
      }
      updateNumeroPermiso();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.fecha]);
  // Estados para validación de equipo
  const [equipoError, setEquipoError] = useState(null);
  const [equipoLoading, setEquipoLoading] = useState(false);
  const [equipoDescripcion, setEquipoDescripcion] = useState("");

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
  const [searchError, setSearchError] = useState(null);
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

  // Validacion del formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos HU-011
    if (!formData.descripcionTrabajo.trim()) newErrors.descripcionTrabajo = 'La descripcion del trabajo es obligatoria';
    if (!formData.solicitante.trim()) newErrors.solicitante = 'El solicitante es obligatorio';
    if (!formData.supervisor.trim()) newErrors.supervisor = 'El supervisor es obligatorio';
    
    // Validaciones de autocompletado eliminadas
    // validación de área eliminada
    
    // Campos adicionales 
    if (!formData.numeroPermiso.trim()) newErrors.numeroPermiso = 'El número de permiso es obligatorio';
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
        rtoEstado: 'PENDIENTE'
      };

      console.log('Enviando PTS:', ptsData);

      const response = await fetch('http://localhost:8080/api/pts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ptsData)
      });

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
    setSearchError(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 text-center">
            Debes iniciar sesión para crear un PTS.
          </p>
          <div className="mt-6 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-epu-primary text-white px-4 py-2 rounded hover:bg-epu-primary-dark transition-colors"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="bg-epu-primary text-white p-6 rounded-t-lg">
            <h1 className="text-2xl font-bold">Crear Permiso de Trabajo Seguro</h1>
            <p className="mt-2 opacity-90">
              Usuario: {user.nombre}
              {userRole && ` | Rol: ${userRole}`}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Permiso *
                </label>
                <input
                  type="text"
                  name="numeroPermiso"
                  value={formData.numeroPermiso}
                  readOnly
                  className={`w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.numeroPermiso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: PTS-2025-001"
                />
                {errors.numeroPermiso && <p className="error-validacion">{errors.numeroPermiso}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.fecha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fecha && <p className="error-validacion">{errors.fecha}</p>}
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio *
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.horaInicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.horaInicio && <p className="error-validacion">{errors.horaInicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin *
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.horaFin ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.horaFin && <p className="mt-1 text-sm text-red-600">{errors.horaFin}</p>}
              </div>
            </div>

            {/* Equipo a Intervenir */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Equipo a Intervenir *</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag de Equipo
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
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
                    return (
                      <p className={`mt-2 text-sm font-semibold ${equipo.estado === 'HABILITADO' ? 'text-green-700' : 'text-red-600'}`}>
                        Estado: {equipo.estado === 'HABILITADO' ? 'Habilitado' : 'Deshabilitado'}
                      </p>
                    );
                  })()}
                  {equipoLoading && <p className="text-gray-500 text-sm mt-1">Validando equipo...</p>}
                  {equipoError && <p className="text-red-600 text-sm mt-1">{equipoError}</p>}
                </div>
              </div>
              {errors.equiposSeguridad && <p className="mt-1 text-sm text-red-600">{errors.equiposSeguridad}</p>}
            </div>

            {/* Ubicación y descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación del Trabajo *
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                  errors.ubicacion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Sector A, Planta 2, Oficina 205"
              />
              {errors.ubicacion && <p className="mt-1 text-sm text-red-600">{errors.ubicacion}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Trabajo *
              </label>
              <textarea
                name="descripcionTrabajo"
                value={formData.descripcionTrabajo}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                  errors.descripcionTrabajo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe detalladamente el trabajo a realizar..."
              />
              {errors.descripcionTrabajo && <p className="error-validacion">{errors.descripcionTrabajo}</p>}
            </div>

            {/* Información del Solicitante - Autocompletado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Solicitante</h3>
              

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Solicitante fijo, solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitante *
                  </label>
                  <input
                    type="text"
                    name="solicitante"
                    value={user ? user.dni : ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Legajo del solicitante"
                  />
                </div>

                {/* Nombre Solicitante - Solo lectura, desde base de datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Solicitante *
                  </label>
                  <input
                    type="text"
                    name="nombreSolicitante"
                    value={nombreSolicitante}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Nombre completo del solicitante"
                  />
                </div>


                {/* Campo nombreSolicitante eliminado, ya no es editable ni visible */}

                {/* Campo de área eliminado por solicitud */}
              </div>
            </div>


            {/* Otros Responsables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor *
                </label>
                <select
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.supervisor ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Seleccione un supervisor --</option>
                  {supervisores.map(sup => (
                    <option key={sup.legajo} value={sup.legajo}>{sup.legajo} - {sup.nombre}</option>
                  ))}
                </select>
                {errors.supervisor && <p className="error-validacion">{errors.supervisor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable del Área *
                </label>
                <input
                  type="text"
                  name="responsableAreaTrabajo"
                  value={formData.responsableAreaTrabajo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.responsableAreaTrabajo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Responsable del área de trabajo"
                />
                {errors.responsableAreaTrabajo && <p className="mt-1 text-sm text-red-600">{errors.responsableAreaTrabajo}</p>}
              </div>
            </div>

            {/* Checkboxes de requerimientos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiereAnalisisRiesgo"
                  checked={formData.requiereAnalisisRiesgo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-epu-primary focus:ring-epu-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Requiere Análisis de Riesgo Adicional
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiereProcedimientoEspecifico"
                  checked={formData.requiereProcedimientoEspecifico}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-epu-primary focus:ring-epu-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Requiere Procedimiento Específico
                </label>
              </div>
            </div>

            {/* Riesgos y Controles */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Riesgos y Controles *</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('riesgosControles', { riesgo: '', control: '' })}
                  className="bg-epu-secondary text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  + Agregar Riesgo
                </button>
              </div>
              
              {formData.riesgosControles.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Riesgo {index + 1}
                    </label>
                    <input
                      type="text"
                      value={item.riesgo}
                      onChange={(e) => handleArrayChange('riesgosControles', index, 'riesgo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                      placeholder="Describe el riesgo identificado"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Control {index + 1}
                      </label>
                      {formData.riesgosControles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('riesgosControles', index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.control}
                      onChange={(e) => handleArrayChange('riesgosControles', index, 'control', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                      placeholder="Medida de control para este riesgo"
                    />
                  </div>
                </div>
              ))}
              {errors.riesgosControles && <p className="error-validacion">{errors.riesgosControles}</p>}
            </div>

            {/* ...se eliminó la sección duplicada de 'Equipo a Intervenir'... */}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Adicionales
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                placeholder="Información adicional relevante..."
              />
            </div>

            {/* Mensaje de estado */}
            {submitMessage && (
              <div className={`p-4 rounded-md ${
                submitMessage.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
              }`}>
                {submitMessage}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-epu-primary text-white rounded-md hover:bg-epu-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear PTS'}
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