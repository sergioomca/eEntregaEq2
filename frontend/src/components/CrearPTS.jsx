
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
      solicitante: '',
      supervisor: '',
      responsableAreaTrabajo: '',
      requiereAnalisisRiesgo: false,
      requiereProcedimientoEspecifico: false,
      observaciones: '',
      riesgosControles: [{ riesgo: '', control: '' }],
      equiposSeguridad: [{ equipo: '', cantidad: 1 }],
      // --- Sección 1: Secciones adicionales aplicables ---
      seccionesAdicionales: {
        noAplica: false,
        aislamientoFuentesEnergia: false,
        entradaEspacioConfinado: false,
        excavacionDemolicion: false,
        prevencionCaidas: false,
        trabajoElectrico: false,
        equiposPesados: false,
        trabajoEnCaliente: false,
        hidrolavado: false,
        lavadoPresion: false,
        aperturaLineasEquipos: false,
        sistemasAereosNoTripulados: false
      },
      // --- Sección 2: Herramientas y equipos ---
      herramientasEquipos: '',
      // --- Sección 4: Preguntas de seguridad ---
      preguntasSeguridad: {
        orientacionFormacion: '',
        procedimientosEmergencia: '',
        alcanceRevisado: '',
        areasAdyacentesNotificadas: '',
        equiposPreparados: '',
        areaInspeccionadaAsbesto: '',
        equiposPortatilesVerificados: '',
        huecosBordesProtegidos: '',
        trabajadoresEntrenamientoEspecial: '',
        pruebasCampoMonitoreos: '',
        monitoreoPor: '',
        monitoreoFecha: '',
        monitoreoHora: '',
        monitoreoResultados: ''
      },
      // --- Sección 6: Riesgos Químicos ---
      riesgosQuimicos: {
        noAplica: false,
        explosivo: false,
        inflamable: false,
        combustible: false,
        toxico: false,
        corrosivo: false,
        irritante: false,
        narcotico: false,
        peligroInhalacion: false,
        mutageno: false,
        cancerigeno: false,
        teratogenico: false,
        danaMedioAmbiente: false,
        danaCapaOzono: false
      },
      // --- Sección 7: Riesgos Físicos ---
      riesgosFisicos: {
        noAplica: false,
        atmosferaDeficienteO2: false,
        vibracion: false,
        presion: false,
        ruidoAlto: false,
        iluminacion: false,
        radiacion: false,
        bordesCortantes: false,
        shockElectrico: false,
        arcoElectrico: false,
        alturamayor180: false,
        alturaMenor180: false,
        caidaObjetos: false,
        proyeccionParticulas: false,
        areaCongestionada: false,
        estresCalorFrio: false,
        quemaduras: false,
        polvos: false,
        lineaDeFuego: false,
        puntosPellizco: false,
        tropiezos: false
      },
      // --- Sección 8: Riesgos Biológicos ---
      riesgosBiologicos: {
        noAplica: false,
        aguaResiduosContaminados: false,
        insectos: false,
        animales: false,
        bacterias: false
      },
      // --- Sección 9: Consideraciones Medio Ambiente ---
      medioAmbiente: {
        noAplica: false,
        impactosAire: false,
        impactosSuelo: false,
        impactosAgua: false,
        manejoResiduos: false,
        ordenLimpieza: false,
        precauciones: ''
      },
      // --- Sección 10: Consideraciones Ergonómicas ---
      ergonomia: {
        noAplica: false,
        levantamientoCarga: false,
        empujeArrastre: false,
        posturaForzada: false,
        estresContacto: false,
        transporteManualCarga: false,
        bipedestacion: false,
        duracion: false,
        movimientoRepetitivo: false,
        rotacionDescansos: false,
        posturaAdecuada: false,
        esfuerzoDeDos: false,
        facilidadesEquipos: false
      },
      // --- Sección 11: EPPs ---
      epps: {
        caraCabeza: { casco: false, protectorFacial: false, capucha: false, caretaSoldador: false },
        ojos: { anteojosSeguridadClaro: false, anteojosSeguridadOscuro: false, antiparrasQuimicas: false, antiparrasOxicorte: false },
        proteccionRespiratoria: { equipoAutonomo: false, mascaraCompleta: false, mascaraConFiltro: false, semimascaraFiltros: false, barbijo: false, mascaraEscapeCloro: false },
        proteccionAuditiva: { proteccionAuricular: false, simplesDoble: false, limiteExposicion: false, endoaural: false, copa: false },
        manos: { guantesCueroVaqueta: false, guantesQuimicos: false, telaFina: false, guantesAnticorte: false, guantesTemperatura: false, guantesSoldador: false },
        brazos: { mangasLargas: false, mangasAnticorte: false, mangasProteccionCuero: false },
        cuerpo: { ropaResistenteFuego: false, ropaResistenteQuimicos: false, descartableIgnifugo: false, descartableNoIgnifugo: false, trajeAluminizado: false, delantal: false, campera: false, eppCriogenicoFrio: false, ropaChalecoAltaVisibilidad: false },
        piesPiernas: { calzadoPuntera: false, calzadoDielectrico: false, proteccionRodillas: false, proteccionPiernas: false, bolasDePVC: false, proteccionMetatarsal: false, bolasGomaPuntera: false },
        electricidad: { mantaAislante: false, eppContraArco: false, herramientasClasificadas: false, guantesAislantesGoma: false, herramientasPlasticoReforzado: false, puestasTierra: false }
      }
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

  // Helper para cambios en objetos anidados (seccionesAdicionales, riesgosQuimicos, etc.)
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => {
      const updated = { ...prev[section], [field]: value };
      // Si se activa "No Aplica", desmarcar todos los demás checkboxes de la sección
      if (field === 'noAplica' && value === true) {
        Object.keys(updated).forEach(k => {
          if (k !== 'noAplica' && typeof updated[k] === 'boolean') updated[k] = false;
        });
      }
      return { ...prev, [section]: updated };
    });
    // Limpiar error de la sección al cambiar
    setErrors(prev => { const copy = { ...prev }; delete copy[section]; return copy; });
  };

  // Helper para cambios en EPPs (2 niveles de anidamiento)
  const handleEppChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      epps: { ...prev.epps, [category]: { ...prev.epps[category], [field]: value } }
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
        requiereAnalisisRiesgoAdicional: formData.requiereAnalisisRiesgo === true,
        // Nuevos campos del PTS extendido
        seccionesAdicionales: formData.seccionesAdicionales,
        herramientasEquipos: formData.herramientasEquipos,
        preguntasSeguridad: formData.preguntasSeguridad,
        riesgosQuimicos: formData.riesgosQuimicos,
        riesgosFisicos: formData.riesgosFisicos,
        riesgosBiologicos: formData.riesgosBiologicos,
        medioAmbiente: formData.medioAmbiente,
        ergonomia: formData.ergonomia,
        epps: formData.epps
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
    // Pedir supervisor si requiere análisis de riesgo, procedimiento específico o alguna sección adicional
    const tieneSeccionAdicional = Object.values(formData.seccionesAdicionales).some(v => v === true);
    if ((formData.requiereAnalisisRiesgo || formData.requiereProcedimientoEspecifico || tieneSeccionAdicional) && !formData.supervisor.trim()) {
      newErrors.supervisor = 'El supervisor es obligatorio cuando se requiere análisis de riesgo, procedimiento específico o secciones adicionales';
    }

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

    // Validar secciones de riesgos: debe estar tildado "No Aplica" o al menos un checkbox
    const seccionesRiesgo = [
      { key: 'riesgosQuimicos', label: 'Riesgos Químicos' },
      { key: 'riesgosFisicos', label: 'Riesgos Físicos' },
      { key: 'riesgosBiologicos', label: 'Riesgos Biológicos' },
      { key: 'medioAmbiente', label: 'Consideraciones Medioambientales' },
      { key: 'ergonomia', label: 'Consideraciones Ergonómicas' }
    ];
    seccionesRiesgo.forEach(({ key, label }) => {
      const seccion = formData[key];
      if (!seccion.noAplica) {
        const tieneAlguno = Object.entries(seccion).some(([k, v]) => k !== 'noAplica' && k !== 'precauciones' && v === true);
        if (!tieneAlguno) newErrors[key] = `Debe marcar "No Aplica" o al menos una opción en ${label}`;
      }
    });

    // Validar campos de monitoreo si se seleccionó "Sí" en Pruebas de Campo
    if (formData.preguntasSeguridad.pruebasCampoMonitoreos === 'Sí') {
      if (!formData.preguntasSeguridad.monitoreoPor.trim()) newErrors.monitoreoPor = 'El campo "Monitoreo hecho por" es obligatorio';
      if (!formData.preguntasSeguridad.monitoreoFecha) newErrors.monitoreoFecha = 'La fecha de monitoreo es obligatoria';
      if (!formData.preguntasSeguridad.monitoreoHora) newErrors.monitoreoHora = 'La hora de monitoreo es obligatoria';
      if (!formData.preguntasSeguridad.monitoreoResultados.trim()) newErrors.monitoreoResultados = 'Los resultados del monitoreo son obligatorios';
    }

    // Validar Preguntas de Seguridad
    const preguntasNoDebenSerNo = [
      'orientacionFormacion', 'procedimientosEmergencia', 'alcanceRevisado',
      'areasAdyacentesNotificadas', 'equiposPreparados', 'areaInspeccionadaAsbesto',
      'equiposPortatilesVerificados', 'trabajadoresEntrenamientoEspecial'
    ];
    const preguntasConNo = preguntasNoDebenSerNo.filter(k => formData.preguntasSeguridad[k] === 'No');
    if (preguntasConNo.length > 0) {
      newErrors.preguntasSeguridad = 'Una o más preguntas de seguridad fueron respondidas "No". No se puede crear el PTS hasta corregirlas.';
    }
    if (formData.preguntasSeguridad.huecosBordesProtegidos === 'Sí') {
      newErrors.preguntasSeguridad = (newErrors.preguntasSeguridad ? newErrors.preguntasSeguridad + ' ' : '') + 'La pregunta sobre huecos/bordes desprotegidos fue respondida "Sí". No se puede crear el PTS si existen riesgos de caída sin protección.';
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
        solicitanteLegajo: user?.dni || '',
        supervisorLegajo: formData.supervisor,
        observaciones: `${formData.observaciones}\n\nResponsable del Área: ${formData.responsableAreaTrabajo}`.trim(),
        
        // Campos adicionales del modelo
        area: formData.ubicacion,
        equipoOInstalacion: formData.equiposSeguridad.map(e => e.equipo).join(', '),
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
        requiereAnalisisRiesgoAdicional: formData.requiereAnalisisRiesgo === true,
        
        // Nuevos campos del PTS extendido
        seccionesAdicionales: formData.seccionesAdicionales,
        herramientasEquipos: formData.herramientasEquipos,
        preguntasSeguridad: formData.preguntasSeguridad,
        riesgosQuimicos: formData.riesgosQuimicos,
        riesgosFisicos: formData.riesgosFisicos,
        riesgosBiologicos: formData.riesgosBiologicos,
        medioAmbiente: formData.medioAmbiente,
        ergonomia: formData.ergonomia,
        epps: formData.epps
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
      solicitante: user?.nombre || '',
      supervisor: '',
      responsableAreaTrabajo: '',
      requiereAnalisisRiesgo: false,
      requiereProcedimientoEspecifico: false,
      observaciones: '',
      riesgosControles: [{ riesgo: '', control: '' }],
      equiposSeguridad: [{ equipo: '', cantidad: 1 }],
      seccionesAdicionales: {
        noAplica: false,
        aislamientoFuentesEnergia: false, entradaEspacioConfinado: false, excavacionDemolicion: false,
        prevencionCaidas: false, trabajoElectrico: false, equiposPesados: false, trabajoEnCaliente: false,
        hidrolavado: false, lavadoPresion: false, aperturaLineasEquipos: false, sistemasAereosNoTripulados: false
      },
      herramientasEquipos: '',
      preguntasSeguridad: {
        orientacionFormacion: '', procedimientosEmergencia: '', alcanceRevisado: '',
        areasAdyacentesNotificadas: '', equiposPreparados: '', areaInspeccionadaAsbesto: '',
        equiposPortatilesVerificados: '', huecosBordesProtegidos: '', trabajadoresEntrenamientoEspecial: '',
        pruebasCampoMonitoreos: '', monitoreoPor: '', monitoreoFecha: '', monitoreoHora: '', monitoreoResultados: ''
      },
      riesgosQuimicos: {
        noAplica: false,
        explosivo: false, inflamable: false, combustible: false, toxico: false, corrosivo: false,
        irritante: false, narcotico: false, peligroInhalacion: false, mutageno: false,
        cancerigeno: false, teratogenico: false, danaMedioAmbiente: false, danaCapaOzono: false
      },
      riesgosFisicos: {
        noAplica: false,
        atmosferaDeficienteO2: false, vibracion: false, presion: false, ruidoAlto: false,
        iluminacion: false, radiacion: false, bordesCortantes: false, shockElectrico: false,
        arcoElectrico: false, alturamayor180: false, alturaMenor180: false, caidaObjetos: false,
        proyeccionParticulas: false, areaCongestionada: false, estresCalorFrio: false,
        quemaduras: false, polvos: false, lineaDeFuego: false, puntosPellizco: false, tropiezos: false
      },
      riesgosBiologicos: {
        noAplica: false,
        aguaResiduosContaminados: false, insectos: false, animales: false, bacterias: false
      },
      medioAmbiente: {
        noAplica: false,
        impactosAire: false, impactosSuelo: false, impactosAgua: false,
        manejoResiduos: false, ordenLimpieza: false, precauciones: ''
      },
      ergonomia: {
        noAplica: false,
        levantamientoCarga: false, empujeArrastre: false, posturaForzada: false,
        estresContacto: false, transporteManualCarga: false, bipedestacion: false,
        duracion: false, movimientoRepetitivo: false, rotacionDescansos: false,
        posturaAdecuada: false, esfuerzoDeDos: false, facilidadesEquipos: false
      },
      epps: {
        caraCabeza: { casco: false, protectorFacial: false, capucha: false, caretaSoldador: false },
        ojos: { anteojosSeguridadClaro: false, anteojosSeguridadOscuro: false, antiparrasQuimicas: false, antiparrasOxicorte: false },
        proteccionRespiratoria: { equipoAutonomo: false, mascaraCompleta: false, mascaraConFiltro: false, semimascaraFiltros: false, barbijo: false, mascaraEscapeCloro: false },
        proteccionAuditiva: { proteccionAuricular: false, simplesDoble: false, limiteExposicion: false, endoaural: false, copa: false },
        manos: { guantesCueroVaqueta: false, guantesQuimicos: false, telaFina: false, guantesAnticorte: false, guantesTemperatura: false, guantesSoldador: false },
        brazos: { mangasLargas: false, mangasAnticorte: false, mangasProteccionCuero: false },
        cuerpo: { ropaResistenteFuego: false, ropaResistenteQuimicos: false, descartableIgnifugo: false, descartableNoIgnifugo: false, trajeAluminizado: false, delantal: false, campera: false, eppCriogenicoFrio: false, ropaChalecoAltaVisibilidad: false },
        piesPiernas: { calzadoPuntera: false, calzadoDielectrico: false, proteccionRodillas: false, proteccionPiernas: false, bolasDePVC: false, proteccionMetatarsal: false, bolasGomaPuntera: false },
        electricidad: { mantaAislante: false, eppContraArco: false, herramientasClasificadas: false, guantesAislantesGoma: false, herramientasPlasticoReforzado: false, puestasTierra: false }
      }
    });
    setErrors({});
    setSubmitMessage('');
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



            {/* ============================================================ */}
            {/* SECCIÓN 1: Secciones Adicionales Aplicables */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #b2dfdb', borderRadius: 12, padding: 20, background: '#f8fdfd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d7377', margin: 0 }}>Secciones Adicionales Aplicables</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#0d7377', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.seccionesAdicionales.noAplica} onChange={e => handleNestedChange('seccionesAdicionales', 'noAplica', e.target.checked)} style={{ accentColor: '#0d7377' }} />
                  No Aplica
                </label>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 12 }}>Marque las secciones que apliquen al trabajo. (Requerirá firma de supervisor)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, opacity: formData.seccionesAdicionales.noAplica ? 0.4 : 1, pointerEvents: formData.seccionesAdicionales.noAplica ? 'none' : 'auto' }}>
                {[
                  ['aislamientoFuentesEnergia', 'Aislamiento de Fuentes de Energía'],
                  ['entradaEspacioConfinado', 'Entrada a Espacio Confinado'],
                  ['excavacionDemolicion', 'Excavación / Demolición'],
                  ['prevencionCaidas', 'Prevención de Caídas'],
                  ['trabajoElectrico', 'Trabajo Eléctrico'],
                  ['equiposPesados', 'Equipos Pesados'],
                  ['trabajoEnCaliente', 'Trabajo en Caliente'],
                  ['hidrolavado', 'Hidrolavado'],
                  ['lavadoPresion', 'Lavado a Presión'],
                  ['aperturaLineasEquipos', 'Apertura de Líneas y Equipos'],
                  ['sistemasAereosNoTripulados', 'Sistemas Aéreos no Tripulados']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.seccionesAdicionales[key]} onChange={e => handleNestedChange('seccionesAdicionales', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 2: Herramientas y Equipos */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #b2dfdb', borderRadius: 12, padding: 20, background: '#f8fdfd' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d7377', marginBottom: 14 }}>Herramientas y Equipos</h3>
              <textarea
                name="herramientasEquipos"
                value={formData.herramientasEquipos}
                onChange={handleInputChange}
                rows="3"
                className="form-input"
                placeholder="Listar herramientas y equipos a utilizar..."
              />
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 4: Preguntas de Seguridad */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #b2dfdb', borderRadius: 12, padding: 20, background: '#f8fdfd' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d7377', marginBottom: 14 }}>Preguntas de Seguridad</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 12 }}>Responda Sí, No o N/A según corresponda.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['orientacionFormacion', '¿Los empleados cuentan con la orientación y formación necesaria?'],
                  ['procedimientosEmergencia', '¿Se han revisado los procedimientos de emergencia y alarmas, rutas de evacuación y puntos de encuentro?'],
                  ['alcanceRevisado', '¿Se ha revisado y comprendido el alcance y los límites de cualquier otro trabajo que pueda influir?'],
                  ['areasAdyacentesNotificadas', '¿Otros trabajadores en áreas adyacentes han sido notificados?'],
                  ['equiposPreparados', '¿Se han preparado e identificado adecuadamente todos los equipos que se van a trabajar?'],
                  ['areaInspeccionadaAsbesto', '¿El área de trabajo se inspeccionó en cuanto a asbesto?'],
                  ['equiposPortatilesVerificados', '¿Los equipos portátiles tienen protección diferencial y térmica? ¿Se encuentran verificados?'],
                  ['huecosBordesProtegidos', '¿El trabajo creará huecos, bordes desprotegidos u otros riesgos de caída? Si es trabajo en altura, completar Sección adicional.'],
                  ['trabajadoresEntrenamientoEspecial', '¿Los trabajadores cuentan con entrenamiento especial requerido? (Amoladoras, Manejo de JLG, Hydrorc, Movimiento de Cargas, Guía/Spotter, Oxicorte)']
                ].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: '1px solid #e2eff1' }}>
                    <div style={{ flex: 1, fontSize: '0.88rem', color: '#334155' }}>{label}</div>
                    <div style={{ display: 'flex', gap: 8, minWidth: 160 }}>
                      {['Sí', 'No', 'N/A'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', cursor: 'pointer' }}>
                          <input type="radio" name={`seg_${key}`} value={opt} checked={formData.preguntasSeguridad[key] === opt} onChange={() => handleNestedChange('preguntasSeguridad', key, opt)} style={{ accentColor: '#0d7377' }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.preguntasSeguridad && <p className="error-validacion" style={{ marginTop: 10 }}>{errors.preguntasSeguridad}</p>}

              {/* Pruebas de campo / Monitoreos (Sección 5 del papel) */}
              <div style={{ marginTop: 16, padding: 16, background: '#e8f5f5', borderRadius: 10 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 10 }}>Pruebas de Campo / Monitoreos</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: '0.88rem', color: '#334155' }}>¿Se requieren pruebas de campo o monitoreos?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Sí', 'No', 'N/A'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input type="radio" name="seg_pruebasCampoMonitoreos" value={opt} checked={formData.preguntasSeguridad.pruebasCampoMonitoreos === opt} onChange={() => handleNestedChange('preguntasSeguridad', 'pruebasCampoMonitoreos', opt)} style={{ accentColor: '#0d7377' }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                {formData.preguntasSeguridad.pruebasCampoMonitoreos === 'Sí' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Monitoreo hecho por *</label>
                      <input type="text" className={`form-input ${errors.monitoreoPor ? 'border-red-500' : ''}`} value={formData.preguntasSeguridad.monitoreoPor} onChange={e => handleNestedChange('preguntasSeguridad', 'monitoreoPor', e.target.value)} placeholder="Nombre" />
                      {errors.monitoreoPor && <p className="error-validacion">{errors.monitoreoPor}</p>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Fecha *</label>
                      <input type="date" className={`form-input ${errors.monitoreoFecha ? 'border-red-500' : ''}`} value={formData.preguntasSeguridad.monitoreoFecha} onChange={e => handleNestedChange('preguntasSeguridad', 'monitoreoFecha', e.target.value)} />
                      {errors.monitoreoFecha && <p className="error-validacion">{errors.monitoreoFecha}</p>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Hora *</label>
                      <input type="time" className={`form-input ${errors.monitoreoHora ? 'border-red-500' : ''}`} value={formData.preguntasSeguridad.monitoreoHora} onChange={e => handleNestedChange('preguntasSeguridad', 'monitoreoHora', e.target.value)} />
                      {errors.monitoreoHora && <p className="error-validacion">{errors.monitoreoHora}</p>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Resultados *</label>
                      <input type="text" className={`form-input ${errors.monitoreoResultados ? 'border-red-500' : ''}`} value={formData.preguntasSeguridad.monitoreoResultados} onChange={e => handleNestedChange('preguntasSeguridad', 'monitoreoResultados', e.target.value)} placeholder="Resultados obtenidos" />
                      {errors.monitoreoResultados && <p className="error-validacion">{errors.monitoreoResultados}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN 6: Riesgos Químicos */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #fbbf24', borderRadius: 12, padding: 20, background: '#fffbeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>Riesgos Químicos</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.riesgosQuimicos.noAplica} onChange={e => handleNestedChange('riesgosQuimicos', 'noAplica', e.target.checked)} style={{ accentColor: '#d97706' }} />
                  No Aplica
                </label>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: 12 }}>Si hay riesgos químicos, marque los EPP necesarios en la sección de EPPs.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, opacity: formData.riesgosQuimicos.noAplica ? 0.4 : 1, pointerEvents: formData.riesgosQuimicos.noAplica ? 'none' : 'auto' }}>
                {[
                  ['explosivo', 'Explosivo'], ['inflamable', 'Inflamable'], ['combustible', 'Combustible'],
                  ['toxico', 'Tóxico'], ['corrosivo', 'Corrosivo'], ['irritante', 'Irritante'],
                  ['narcotico', 'Narcótico'], ['peligroInhalacion', 'Peligro por Inhalación'],
                  ['mutageno', 'Mutagéno'], ['cancerigeno', 'Cancerígeno'], ['teratogenico', 'Teratogénico'],
                  ['danaMedioAmbiente', 'Daña al Medio Ambiente'], ['danaCapaOzono', 'Daña Capa de Ozono']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.riesgosQuimicos[key]} onChange={e => handleNestedChange('riesgosQuimicos', key, e.target.checked)} style={{ accentColor: '#d97706' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {errors.riesgosQuimicos && <p className="error-validacion">{errors.riesgosQuimicos}</p>}

            {/* ============================================================ */}
            {/* SECCIÓN 7: Riesgos Físicos */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #fbbf24', borderRadius: 12, padding: 20, background: '#fffbeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>Riesgos Físicos</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.riesgosFisicos.noAplica} onChange={e => handleNestedChange('riesgosFisicos', 'noAplica', e.target.checked)} style={{ accentColor: '#d97706' }} />
                  No Aplica
                </label>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: 12 }}>Si hay riesgos físicos, marque los EPP necesarios en la sección de EPPs.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, opacity: formData.riesgosFisicos.noAplica ? 0.4 : 1, pointerEvents: formData.riesgosFisicos.noAplica ? 'none' : 'auto' }}>
                {[
                  ['atmosferaDeficienteO2', 'Atmósfera deficiente en Oxígeno'], ['vibracion', 'Vibración'],
                  ['presion', 'Presión'], ['ruidoAlto', 'Ruido (>85dBA)'],
                  ['iluminacion', 'Iluminación'], ['radiacion', 'Radiación'],
                  ['bordesCortantes', 'Bordes Cortantes'], ['shockElectrico', 'Riesgo de Shock Eléctrico'],
                  ['arcoElectrico', 'Arco Eléctrico'], ['alturamayor180', 'Altura >1,80m'],
                  ['alturaMenor180', 'Altura <1,80m'], ['caidaObjetos', 'Caída de Objetos'],
                  ['proyeccionParticulas', 'Proyección de Partículas'], ['areaCongestionada', 'Área Congestionada'],
                  ['estresCalorFrio', 'Estrés Calor/Frío'], ['quemaduras', 'Quemaduras'],
                  ['polvos', 'Polvos'], ['lineaDeFuego', 'Línea de Fuego'],
                  ['puntosPellizco', 'Puntos de Pellizco'], ['tropiezos', 'Tropiezos/Caídas al mismo nivel']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.riesgosFisicos[key]} onChange={e => handleNestedChange('riesgosFisicos', key, e.target.checked)} style={{ accentColor: '#d97706' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {errors.riesgosFisicos && <p className="error-validacion">{errors.riesgosFisicos}</p>}

            {/* ============================================================ */}
            {/* SECCIÓN 8: Riesgos Biológicos */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #fbbf24', borderRadius: 12, padding: 20, background: '#fffbeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>Riesgos Biológicos</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.riesgosBiologicos.noAplica} onChange={e => handleNestedChange('riesgosBiologicos', 'noAplica', e.target.checked)} style={{ accentColor: '#d97706' }} />
                  No Aplica
                </label>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: 12 }}>Si hay riesgos biológicos, marque los EPP necesarios en la sección de EPPs.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, opacity: formData.riesgosBiologicos.noAplica ? 0.4 : 1, pointerEvents: formData.riesgosBiologicos.noAplica ? 'none' : 'auto' }}>
                {[
                  ['aguaResiduosContaminados', 'Agua o residuos contaminados con materiales potencialmente infecciosos'],
                  ['insectos', 'Insectos'], ['animales', 'Animales'], ['bacterias', 'Bacterias']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.riesgosBiologicos[key]} onChange={e => handleNestedChange('riesgosBiologicos', key, e.target.checked)} style={{ accentColor: '#d97706' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {errors.riesgosBiologicos && <p className="error-validacion">{errors.riesgosBiologicos}</p>}

            {/* ============================================================ */}
            {/* SECCIÓN 9: Consideraciones al Medio Ambiente */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #86efac', borderRadius: 12, padding: 20, background: '#f0fdf4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#166534', margin: 0 }}>Consideraciones al Medio Ambiente</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#166534', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.medioAmbiente.noAplica} onChange={e => handleNestedChange('medioAmbiente', 'noAplica', e.target.checked)} style={{ accentColor: '#16a34a' }} />
                  No Aplica
                </label>
              </div>
              <div style={{ opacity: formData.medioAmbiente.noAplica ? 0.4 : 1, pointerEvents: formData.medioAmbiente.noAplica ? 'none' : 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 12 }}>
                {[
                  ['impactosAire', 'Impactos al Aire'], ['impactosSuelo', 'Impactos al Suelo'],
                  ['impactosAgua', 'Impactos al Agua'], ['manejoResiduos', 'Manejo y Disposición de Residuos'],
                  ['ordenLimpieza', 'Orden y Limpieza']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.medioAmbiente[key]} onChange={e => handleNestedChange('medioAmbiente', key, e.target.checked)} style={{ accentColor: '#16a34a' }} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Precauciones utilizadas</label>
                <input type="text" className="form-input" value={formData.medioAmbiente.precauciones} onChange={e => handleNestedChange('medioAmbiente', 'precauciones', e.target.value)} placeholder="Describir precauciones de medio ambiente..." />
              </div>
              </div>
            </div>
            {errors.medioAmbiente && <p className="error-validacion">{errors.medioAmbiente}</p>}

            {/* ============================================================ */}
            {/* SECCIÓN 10: Consideraciones Ergonómicas */}
            {/* ============================================================ */}
            <div style={{ border: '1px solid #c4b5fd', borderRadius: 12, padding: 20, background: '#f5f3ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#5b21b6', margin: 0 }}>Consideraciones Ergonómicas</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#5b21b6', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.ergonomia.noAplica} onChange={e => handleNestedChange('ergonomia', 'noAplica', e.target.checked)} style={{ accentColor: '#7c3aed' }} />
                  No Aplica
                </label>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: 12 }}>Marque los riesgos ergonómicos identificados y las medidas de prevención.</p>
              <div style={{ opacity: formData.ergonomia.noAplica ? 0.4 : 1, pointerEvents: formData.ergonomia.noAplica ? 'none' : 'auto' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d28d9', marginBottom: 8 }}>Riesgos Identificados</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 14 }}>
                {[
                  ['levantamientoCarga', 'Levantamiento de Carga'], ['empujeArrastre', 'Empuje / Arrastre de Carga'],
                  ['posturaForzada', 'Postura Forzada'], ['estresContacto', 'Estrés por Contacto'],
                  ['transporteManualCarga', 'Transporte Manual de Carga'], ['bipedestacion', 'Bipedestación'],
                  ['duracion', 'Duración'], ['movimientoRepetitivo', 'Movimiento Repetitivo']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.ergonomia[key]} onChange={e => handleNestedChange('ergonomia', key, e.target.checked)} style={{ accentColor: '#7c3aed' }} />
                    {label}
                  </label>
                ))}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d28d9', marginBottom: 8 }}>Medidas de Prevención y Protección</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {[
                  ['rotacionDescansos', 'Rotación y Descansos'], ['posturaAdecuada', 'Postura Adecuada'],
                  ['esfuerzoDeDos', 'Esfuerzo de a Dos'], ['facilidadesEquipos', 'Facilidades / Equipos']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.ergonomia[key]} onChange={e => handleNestedChange('ergonomia', key, e.target.checked)} style={{ accentColor: '#7c3aed' }} />
                    {label}
                  </label>
                ))}
              </div>
              </div>
            </div>
            {errors.ergonomia && <p className="error-validacion">{errors.ergonomia}</p>}

            {/* ============================================================ */}
            {/* SECCIÓN 11: Equipos de Protección Personal (EPPs) */}
            {/* ============================================================ */}
            <div style={{ border: '2px solid #0d7377', borderRadius: 12, padding: 20, background: '#f0fafa' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d7377', marginBottom: 6 }}>Equipos de Protección Personal (EPPs)</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>Marque todos los EPPs requeridos para este trabajo.</p>

              {/* Cara/Cabeza */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Cara / Cabeza</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                  {[['casco', 'Casco'], ['protectorFacial', 'Protector Facial'], ['capucha', 'Capucha'], ['caretaSoldador', 'Careta de Soldador']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.caraCabeza[key]} onChange={e => handleEppChange('caraCabeza', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ojos */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Ojos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {[['anteojosSeguridadClaro', 'Anteojos de Seguridad (claro)'], ['anteojosSeguridadOscuro', 'Anteojos de Seguridad (oscuro)'], ['antiparrasQuimicas', 'Antiparras Químicas'], ['antiparrasOxicorte', 'Antiparras de Oxicorte']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.ojos[key]} onChange={e => handleEppChange('ojos', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Protección Respiratoria */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Protección Respiratoria</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {[['equipoAutonomo', 'Equipo Autónomo (SCBA)'], ['mascaraCompleta', 'Máscara Completa c/ suministro aire'], ['mascaraConFiltro', 'Máscara Completa con Filtro'], ['semimascaraFiltros', 'Semimáscara con Filtros'], ['barbijo', 'Barbijo'], ['mascaraEscapeCloro', 'Máscara de escape de Cloro']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.proteccionRespiratoria[key]} onChange={e => handleEppChange('proteccionRespiratoria', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Protección Auditiva */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Protección Auditiva</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                  {[['proteccionAuricular', 'Protección Auricular'], ['simplesDoble', 'Simples / Doble'], ['limiteExposicion', 'Límite de tiempo de exposición'], ['endoaural', 'Endoaural'], ['copa', 'Copa']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.proteccionAuditiva[key]} onChange={e => handleEppChange('proteccionAuditiva', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Manos */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Manos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                  {[['guantesCueroVaqueta', 'Guantes de Cuero / Vaqueta'], ['guantesQuimicos', 'Guantes para Químicos'], ['telaFina', 'Tela Fina'], ['guantesAnticorte', 'Guantes Anticorte'], ['guantesTemperatura', 'Guantes para Temperatura'], ['guantesSoldador', 'Guantes de Soldador']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.manos[key]} onChange={e => handleEppChange('manos', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Brazos */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Brazos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {[['mangasLargas', 'Mangas Largas'], ['mangasAnticorte', 'Mangas Anticorte'], ['mangasProteccionCuero', 'Mangas de Protección de Cuero']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.brazos[key]} onChange={e => handleEppChange('brazos', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuerpo */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Cuerpo</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {[['ropaResistenteFuego', 'Ropa Resistente al Fuego'], ['ropaResistenteQuimicos', 'Ropa Resistente a Químicos'], ['descartableIgnifugo', 'Descartable Ignífugo'], ['descartableNoIgnifugo', 'Descartable NO Ignífugo'], ['trajeAluminizado', 'Traje Aluminizado'], ['delantal', 'Delantal'], ['campera', 'Campera'], ['eppCriogenicoFrio', 'EPP para criogénico o muy frío'], ['ropaChalecoAltaVisibilidad', 'Ropa/Chaleco de Alta Visibilidad']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.cuerpo[key]} onChange={e => handleEppChange('cuerpo', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pies/Piernas */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Pies / Piernas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {[['calzadoPuntera', 'Calzado con Puntera'], ['calzadoDielectrico', 'Calzado Dieléctrico c/ Puntera'], ['proteccionRodillas', 'Protección de Rodillas'], ['proteccionPiernas', 'Protección de las Piernas'], ['bolasDePVC', 'Bolas de PVC'], ['proteccionMetatarsal', 'Protección Metatarsal'], ['bolasGomaPuntera', 'Bolas de Goma con Puntera']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.piesPiernas[key]} onChange={e => handleEppChange('piesPiernas', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Electricidad */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a5c5f', marginBottom: 8, borderBottom: '1px solid #b2dfdb', paddingBottom: 4 }}>Electricidad</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6 }}>
                  {[['mantaAislante', 'Manta/Alfombra Aislante de Goma'], ['eppContraArco', 'EPP contra Arco Eléctrico (EWP-21)'], ['herramientasClasificadas', 'Herramientas Clasificadas para Tensión (EWP-32)'], ['guantesAislantesGoma', 'Guantes Aislantes de Goma (EWP-22)'], ['herramientasPlasticoReforzado', 'Herramientas de Plástico Reforzado c/ fibras (EWP-32)'], ['puestasTierra', 'Puestas a Tierra Temporales de Protección']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.epps.electricidad[key]} onChange={e => handleEppChange('electricidad', key, e.target.checked)} style={{ accentColor: '#0d7377' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Mensaje de estado */}
            {submitMessage && (
              <div style={{ padding: 14, borderRadius: 10, background: submitMessage.includes('Error') ? '#fef2f2' : '#f0fdf4', color: submitMessage.includes('Error') ? '#991b1b' : '#166534', fontSize: '0.9rem' }}>
                {submitMessage}
              </div>
            )}

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