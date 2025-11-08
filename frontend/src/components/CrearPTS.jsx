import React, { useState, useEffect } from 'react';

const CrearPTS = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    numeroPermiso: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    horaInicio: '',
    horaFin: '',
    ubicacion: '',
    descripcionTrabajo: '',
    solicitante: '',
    supervisor: '',
    responsableAreaTrabajo: '',
    requiereAnalisisRiesgo: false,
    requiereProcedimientoEspecifico: false,
    observaciones: '',
    riesgosControles: [{ riesgo: '', control: '' }],
    equiposSeguridad: [{ equipo: '', cantidad: 1 }]
  });

  // Estado para validación
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Verificar autenticación al montar el componente
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

      // Extraer rol principal
      if (payload.roles && payload.roles.length > 0) {
        setUserRole(payload.roles[0].replace('ROLE_', ''));
      }

      // Auto-llenar campos basados en el usuario
      setFormData(prev => ({
        ...prev,
        solicitante: payload.nombre || payload.sub
      }));

    } catch (error) {
      console.error('Error al decodificar el token:', error);
      setSubmitMessage('Error: Token inválido. Por favor, inicia sesión nuevamente.');
    }
  }, []);

  // Función para manejar cambios en inputs simples
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

  // Función para manejar cambios en arrays dinámicos
  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Función para agregar elementos a arrays dinámicos
  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  // Función para eliminar elementos de arrays dinámicos
  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.numeroPermiso.trim()) newErrors.numeroPermiso = 'Número de permiso es requerido';
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.horaInicio) newErrors.horaInicio = 'Hora de inicio es requerida';
    if (!formData.horaFin) newErrors.horaFin = 'Hora de fin es requerida';
    if (!formData.ubicacion.trim()) newErrors.ubicacion = 'Ubicación es requerida';
    if (!formData.descripcionTrabajo.trim()) newErrors.descripcionTrabajo = 'Descripción del trabajo es requerida';
    if (!formData.solicitante.trim()) newErrors.solicitante = 'Solicitante es requerido';
    if (!formData.supervisor.trim()) newErrors.supervisor = 'Supervisor es requerido';
    if (!formData.responsableAreaTrabajo.trim()) newErrors.responsableAreaTrabajo = 'Responsable del área de trabajo es requerido';

    // Validar horas
    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Validar que al menos haya un riesgo/control
    if (formData.riesgosControles.length === 0 || !formData.riesgosControles[0].riesgo.trim()) {
      newErrors.riesgosControles = 'Debe especificar al menos un riesgo y su control';
    }

    // Validar que al menos haya un equipo de seguridad
    if (formData.equiposSeguridad.length === 0 || !formData.equiposSeguridad[0].equipo.trim()) {
      newErrors.equiposSeguridad = 'Debe especificar al menos un equipo de seguridad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar el formulario
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
        fechaFin: formData.fecha, // Por ahora usamos la misma fecha
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        ubicacion: formData.ubicacion,
        descripcionTrabajo: formData.descripcionTrabajo,
        tareaDetallada: formData.descripcionTrabajo, // Mapear a tareaDetallada también
        
        // Campos de personal
        nombreSolicitante: formData.solicitante,
        solicitanteLegajo: user?.dni || '', // Usar DNI del usuario como legajo
        supervisorLegajo: formData.supervisor, // Asumimos que el supervisor es un legajo/DNI
        // Nota: responsableAreaTrabajo se almacena en observaciones por ahora
        observaciones: `${formData.observaciones}\n\nResponsable del Área: ${formData.responsableAreaTrabajo}`.trim(),
        
        // Campos adicionales del modelo
        area: formData.ubicacion, // Por ahora mapear ubicación a área
        equipoOInstalacion: formData.equiposSeguridad.map(e => e.equipo).join(', '), // String con equipos
        tipoTrabajo: 'GENERAL', // Valor por defecto
        
        // Mapear riesgos y controles al formato backend
        riesgosControles: formData.riesgosControles.map(rc => ({
          peligro: rc.riesgo,
          consecuencia: 'A definir', // Valor por defecto
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
        
        // Limpiar formulario después del éxito
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

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      numeroPermiso: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      ubicacion: '',
      descripcionTrabajo: '',
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
              Usuario: {user.nombre} | Rol: {userRole}
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
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.numeroPermiso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: PTS-2025-001"
                />
                {errors.numeroPermiso && <p className="mt-1 text-sm text-red-600">{errors.numeroPermiso}</p>}
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
                {errors.fecha && <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>}
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
                {errors.horaInicio && <p className="mt-1 text-sm text-red-600">{errors.horaInicio}</p>}
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
              {errors.descripcionTrabajo && <p className="mt-1 text-sm text-red-600">{errors.descripcionTrabajo}</p>}
            </div>

            {/* Responsables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solicitante *
                </label>
                <input
                  type="text"
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.solicitante ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del solicitante"
                />
                {errors.solicitante && <p className="mt-1 text-sm text-red-600">{errors.solicitante}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor *
                </label>
                <input
                  type="text"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary ${
                    errors.supervisor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del supervisor"
                />
                {errors.supervisor && <p className="mt-1 text-sm text-red-600">{errors.supervisor}</p>}
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
              {errors.riesgosControles && <p className="mt-1 text-sm text-red-600">{errors.riesgosControles}</p>}
            </div>

            {/* Equipos de Seguridad */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Equipos de Seguridad *</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('equiposSeguridad', { equipo: '', cantidad: 1 })}
                  className="bg-epu-secondary text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  + Agregar Equipo
                </button>
              </div>
              
              {formData.equiposSeguridad.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipo de Seguridad {index + 1}
                    </label>
                    <input
                      type="text"
                      value={item.equipo}
                      onChange={(e) => handleArrayChange('equiposSeguridad', index, 'equipo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                      placeholder="Ej: Casco de seguridad, Gafas protectoras"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cantidad
                      </label>
                      {formData.equiposSeguridad.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('equiposSeguridad', index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleArrayChange('equiposSeguridad', index, 'cantidad', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                    />
                  </div>
                </div>
              ))}
              {errors.equiposSeguridad && <p className="mt-1 text-sm text-red-600">{errors.equiposSeguridad}</p>}
            </div>

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

export default CrearPTS;