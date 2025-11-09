import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

// Versión simple sin componente separado - evita problemas de re-render

const ListaPTS = ({ onSelectPtsParaFirma, onSelectPtsParaCierre, defaultFilter = 'TODOS' }) => {
  // Estados principales
  const [ptsList, setPtsList] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [searchTerm, setSearchTerm] = useState('');
  // Tipo de búsqueda rápida: 'equipo' o 'usuario'
  const [searchType, setSearchType] = useState('equipo');
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInicio', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPts, setSelectedPts] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;

  // Estados de búsqueda avanzada - separados para evitar re-renders
  const [searchFilters, setSearchFilters] = useState({
    equipo: '',
    usuario: '',
    area: '',
    estado: '',
    fechaInicio: ''
  });
  // Estados locales para los inputs (no causan búsquedas automáticas)
  const [localFilters, setLocalFilters] = useState({
    equipo: '',
    usuario: '',
    area: '',
    estado: '',
    fechaInicio: ''
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Usuario actual para filtros personalizados
  const [currentUser, setCurrentUser] = useState(null);

  // Filtros disponibles
  const FILTROS = {
    TODOS: 'TODOS',
    PENDIENTE_FIRMA: 'PENDIENTE_FIRMA',
    FIRMADO_PENDIENTE_CIERRE: 'FIRMADO_PENDIENTE_CIERRE', 
    CERRADO: 'CERRADO',
    MIS_PTS: 'MIS_PTS'
  };

  // Estilos para estados
  const estadoStyles = {
    'Pendiente de Firma': { 
      color: '#f59e0b', 
      bgColor: '#fef3c7', 
      icon: '',
      textColor: '#92400e' 
    },
    'Firmado (Pend. Cierre)': { 
      color: '#3b82f6', 
      bgColor: '#dbeafe', 
      icon: '',
      textColor: '#1e40af' 
    },
    'Cerrado': { 
      color: '#10b981', 
      bgColor: '#d1fae5', 
      icon: '',
      textColor: '#047857' 
    }
  };

  // Obtener usuario actual del token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          dni: payload.sub,
          nombre: payload.nombre || payload.sub,
          roles: payload.roles || []
        });
      } catch (error) {
        console.error('Error al decodificar token:', error);
        setError('Token inválido. Por favor, inicia sesión nuevamente.');
      }
    }
  }, []);

  // Aplicar filtro por defecto
  useEffect(() => {
    if (defaultFilter !== 'TODOS') {
      setFilter(defaultFilter);
    }
  }, [defaultFilter]);

  // Refs para timeouts separados para evitar interferencias
  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);

  // Cargar PTS al montar componente y cuando cambie el filtro principal
  useEffect(() => {
    fetchPTS();
  }, [filter]);

  const fetchPTS = async (term = null, type = null, customFilters = null) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      // Prioridad de filtros:
      // 1) si customFilters se provee, usarlo
      // 2) si term + type provistos, construir query con equipo o usuario
      // 3) si no, usar los searchFilters del estado
      const filters = customFilters || searchFilters;

      const queryParams = [];

      // Si se pasó un término rápido (term) y el type ('equipo'|'usuario'), lo incluimos
      if (term && term.toString().trim()) {
        const q = type === 'usuario' ? `usuario=${encodeURIComponent(term.trim())}` : `equipo=${encodeURIComponent(term.trim())}`;
        queryParams.push(q);
      }

      // Añadir filtros avanzados si existen (no sobreescriben term/type)
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          // Evitar duplicar params equipo/usuario si ya vienen por term/type
          if ((key === 'equipo' || key === 'usuario') && term && term.toString().trim()) return;
          queryParams.push(`${key}=${encodeURIComponent(value.toString().trim())}`);
        }
      });

      const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
      const url = `http://localhost:8080/api/pts${queryString}`;
      
      console.log('Obteniendo lista de PTS con filtros:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PTS obtenidos:', data);
      
      // Asegurar que data sea un array
      const ptsList = Array.isArray(data) ? data : [];
      setPtsList(ptsList);
      
    } catch (error) {
      console.error('Error al obtener PTS:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Determinar estado de PTS
  const getPtsEstado = (pts) => {
    if (pts.rtoEstado === 'CERRADO') {
      return 'Cerrado';
    }
    if (pts.firmaSupervisorBase64 && pts.rtoEstado === 'PENDIENTE') {
      return 'Firmado (Pend. Cierre)';
    }
    return 'Pendiente de Firma';
  };

  // Filtrar y ordenar PTS
  const filteredAndSortedPTS = useMemo(() => {
    let filtered = ptsList;

    // Aplicar filtro por estado (pestañas superiores)
    if (filter !== 'TODOS') {
      filtered = filtered.filter(pts => {
        const estado = getPtsEstado(pts);
        
        switch (filter) {
          case 'PENDIENTE_FIRMA':
            return estado === 'Pendiente de Firma';
          case 'FIRMADO_PENDIENTE_CIERRE':
            return estado === 'Firmado (Pend. Cierre)';
          case 'CERRADO':
            return estado === 'Cerrado';
          case 'MIS_PTS':
            return currentUser && pts.solicitanteLegajo === currentUser.dni;
          default:
            return true;
        }
      });
    }

    // Aplicar búsqueda simple por texto (complementaria a los filtros del backend)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pts => 
        (pts.id && pts.id.toLowerCase().includes(term)) ||
        (pts.descripcionTrabajo && pts.descripcionTrabajo.toLowerCase().includes(term)) ||
        (pts.ubicacion && pts.ubicacion.toLowerCase().includes(term)) ||
        (pts.nombreSolicitante && pts.nombreSolicitante.toLowerCase().includes(term)) ||
        (pts.equipoOInstalacion && pts.equipoOInstalacion.toLowerCase().includes(term)) ||
        (pts.area && pts.area.toLowerCase().includes(term))
      );
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        // Ordenamiento especial por fecha
        if (sortConfig.key === 'fechaInicio') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [ptsList, filter, searchTerm, sortConfig, currentUser]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedPTS.length / itemsPerPage);
  const paginatedPTS = filteredAndSortedPTS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar ordenamiento
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Manejar filtros locales (solo actualiza UI, no dispara búsqueda)
  const handleLocalFilterChange = (field, value) => {
    // Actualizar localFilters inmediatamente para UI responsiva
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mostrar indicador de búsqueda pendiente
    setIsSearching(true);
    
    // Limpiar timeout anterior de filtros
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    // Programar nueva búsqueda con debounce
    filterTimeoutRef.current = setTimeout(() => {
      setSearchFilters(currentFilters => {
        const newSearchFilters = {
          ...currentFilters,
          [field]: value
        };
        
        // Solo buscar si hay al menos un filtro con valor
        const hasFilters = Object.values(newSearchFilters).some(val => val && val.toString().trim());
        
        if (hasFilters) {
          fetchPTS(null, null, newSearchFilters);
        } else {
          fetchPTS(); // Sin filtros, cargar todos
        }
        setCurrentPage(1);
        setIsSearching(false); // Ocultar indicador al completar búsqueda
        
        return newSearchFilters;
      });
    }, 1500); // Debounce de 1.5 segundos optimizado
  };

  // Manejar búsqueda rápida con debounce
  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    
    // Mostrar indicador de búsqueda pendiente
    setIsSearching(true);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Programar nueva búsqueda con debounce (mismo tiempo que filtros avanzados)
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchPTS(value, searchType);
      } else {
        fetchPTS(); // Sin término, cargar todos
      }
      setIsSearching(false); // Ocultar indicador al completar búsqueda
    }, 1500); // Debounce de 1.5 segundos consistente
  };

  // Limpiar todos los filtros de búsqueda (memoizada)
  const clearAllSearchFilters = () => {
    const emptyFilters = {
      equipo: '',
      usuario: '',
      area: '',
      estado: '',
      fechaInicio: ''
    };
    
    setSearchFilters(emptyFilters);
    setLocalFilters(emptyFilters);
    setSearchTerm('');
    setCurrentPage(1);
    
    // Limpiar ambos timeouts si existen
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    fetchPTS(); // Cargar todos sin filtros
  };

  // Manejar clic en fila
  const handleRowClick = (pts) => {
    const estado = getPtsEstado(pts);
    
    if (estado === 'Pendiente de Firma' && onSelectPtsParaFirma) {
      onSelectPtsParaFirma(pts.id);
    } else if (estado === 'Firmado (Pend. Cierre)' && onSelectPtsParaCierre) {
      onSelectPtsParaCierre(pts.id);
    }
    
    setSelectedPts(pts);
  };

  // Contar PTS por estado para badges
  const getCounts = () => {
    const counts = {
      total: ptsList.length,
      pendienteFirma: 0,
      firmadoPendienteCierre: 0,
      cerrado: 0,
      misPts: 0
    };

    ptsList.forEach(pts => {
      const estado = getPtsEstado(pts);
      
      if (estado === 'Pendiente de Firma') counts.pendienteFirma++;
      else if (estado === 'Firmado (Pend. Cierre)') counts.firmadoPendienteCierre++;
      else if (estado === 'Cerrado') counts.cerrado++;
      
      if (currentUser && pts.solicitanteLegajo === currentUser.dni) {
        counts.misPts++;
      }
    });

    return counts;
  };

  const counts = getCounts();

  // Renderizado condicional para carga y errores
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-epu-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lista de PTS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
            <div className="text-center">
            <button 
              onClick={() => fetchPTS(searchTerm, searchType)}
              className="bg-epu-primary text-white px-4 py-2 rounded hover:bg-epu-primary-dark transition-colors mr-2"
            >
              Reintentar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="bg-epu-primary text-white p-6 rounded-t-lg">
            <h1 className="text-2xl font-bold">
              {filter === 'MIS_PTS' ? 'Mis Permisos de Trabajo Seguro' : 'Dashboard de Permisos de Trabajo Seguro'}
            </h1>
            {currentUser && (
              <p className="mt-2 opacity-90">
                Usuario: {currentUser.nombre} | 
                {filter === 'MIS_PTS' ? ` Mis PTS: ${counts.misPts}` : ` Total PTS: ${counts.total}`}
              </p>
            )}
          </div>

          {/* Filtros y Búsqueda */}
          <div className="px-6 pt-6 pb-10 border-b border-gray-200">
            {/* Tabs de Filtros */}
            <div className="flex justify-center">
              <div className="flex gap-6 mb-4" style={{ minWidth: '1000px', width: 'max-content' }}>
                {Object.entries(FILTROS).map(([key, value]) => {
                  const isActive = filter === value;
                  let label = '';
                  let count = 0;

                  switch (key) {
                    case 'TODOS': label = 'Todos'; count = counts.total; break;
                    case 'PENDIENTE_FIRMA': label = 'Pend. Firma'; count = counts.pendienteFirma; break;
                    case 'FIRMADO_PENDIENTE_CIERRE': label = 'Pend. Cierre'; count = counts.firmadoPendienteCierre; break;
                    case 'CERRADO': label = 'Cerrados'; count = counts.cerrado; break;
                    case 'MIS_PTS': label = 'Mis PTS'; count = counts.misPts; break;
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(value);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isActive 
                          ? 'bg-epu-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ minWidth: '120px' }}
                    >
                      {label}
                      {count > 0 && (
                        <>
                          &nbsp;&nbsp;
                          <span className={`text-xs ${
                            isActive ? 'text-white' : 'text-gray-700'
                          }`}>
                            {count}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Barra de Búsqueda Avanzada (HU-014) */}
            <div className="space-y-4">
              {/* Búsqueda Simple */}
              <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <div className="flex-1">
                  <div className="flex gap-6">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Búsqueda rápida por ID, descripción, ubicación, solicitante..."
                        value={searchTerm}
                        onChange={(e) => handleSearchTermChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-epu-primary"></div>
                        </div>
                      )}
                    </div>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                      style={{ minWidth: '120px' }}
                    >
                      <option value="equipo">Equipo</option>
                      <option value="usuario">Usuario</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="bg-epu-primary text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    {showAdvancedSearch ? '🔼 Ocultar' : '🔽 Filtros'} Avanzados
                  </button>
                  <span className="text-sm text-gray-600">
                    {paginatedPTS.length} de {filteredAndSortedPTS.length} PTS
                  </span>
                  <button
                    onClick={() => fetchPTS(searchTerm, searchType)}
                    className="bg-epu-primary text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔄 Actualizar
                  </button>
                </div>
              </div>

              {/* Búsqueda Avanzada - Colapsable */}
              {showAdvancedSearch && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Equipo/Instalación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipo/Instalación
                      </label>
                      <input
                        type="text"
                        placeholder="ej: bomba, reactor..."
                        value={localFilters.equipo}
                        onChange={(e) => handleLocalFilterChange('equipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary text-sm"
                      />
                    </div>

                    {/* Usuario/Solicitante */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario/Solicitante
                      </label>
                      <input
                        type="text"
                        placeholder="ej: Juan, VINF..."
                        value={localFilters.usuario}
                        onChange={(e) => handleLocalFilterChange('usuario', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary text-sm"
                      />
                    </div>

                    {/* Área */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área
                      </label>
                      <input
                        type="text"
                        placeholder="ej: Mantenimiento..."
                        value={localFilters.area}
                        onChange={(e) => handleLocalFilterChange('area', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary text-sm"
                      />
                    </div>

                    {/* Estado RTO */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado RTO
                      </label>
                      <select
                        value={localFilters.estado}
                        onChange={(e) => handleLocalFilterChange('estado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary text-sm"
                      >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="CERRADO">CERRADO</option>
                      </select>
                    </div>

                    {/* Fecha de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={localFilters.fechaInicio}
                        onChange={(e) => handleLocalFilterChange('fechaInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary text-sm"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {Object.values(searchFilters).some(val => val) && (
                        <span className="text-epu-primary font-medium">
                          🔍 Filtros activos: {Object.values(searchFilters).filter(val => val).length}
                        </span>
                      )}
                      {isSearching && (
                        <div className="flex items-center gap-2 text-epu-secondary">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-epu-secondary"></div>
                          <span className="text-xs">Buscando...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearAllSearchFilters}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        🗑️ Limpiar Filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de PTS */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('descripcionTrabajo')}
                  >
                    Descripción {sortConfig.key === 'descripcionTrabajo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipos
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nombreSolicitante')}
                  >
                    Solicitante {sortConfig.key === 'nombreSolicitante' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fechaInicio')}
                  >
                    Fecha {sortConfig.key === 'fechaInicio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPTS.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        {/* Mensaje específico según tipo de búsqueda */}
                        {(!loading && filteredAndSortedPTS.length === 0 && (searchTerm || Object.values(searchFilters).some(val => val))) ? (
                          <div>
                            <div className="text-lg mb-2">🔍</div>
                            <div className="font-medium text-gray-700 mb-1">
                              No se encontraron Permisos de Trabajo Seguro que coincidan con la búsqueda
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                              {searchTerm && `Búsqueda: "${searchTerm}"`}
                              {searchTerm && Object.values(searchFilters).some(val => val) && ' • '}
                              {Object.values(searchFilters).some(val => val) && 'Filtros avanzados activos'}
                            </div>
                            <button
                              onClick={clearAllSearchFilters}
                              className="bg-epu-primary text-white px-4 py-2 rounded-md hover:bg-epu-primary-dark transition-colors text-sm"
                            >
                              🗑️ Limpiar búsqueda y filtros
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-lg mb-2">📋</div>
                            <div className="font-medium text-gray-700">
                              No hay PTS disponibles en este momento
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPTS.map((pts) => {
                    const estado = getPtsEstado(pts);
                    const estadoStyle = estadoStyles[estado];
                    const isClickable = estado === 'Pendiente de Firma' || estado === 'Firmado (Pend. Cierre)';

                    return (
                      <tr 
                        key={pts.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          isClickable ? 'cursor-pointer' : ''
                        } ${selectedPts?.id === pts.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleRowClick(pts)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link 
                            to={`/pts/${pts.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {pts.id || 'N/A'}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: estadoStyle.bgColor,
                              color: estadoStyle.textColor
                            }}
                          >
                            {estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {pts.descripcionTrabajo || 'Sin descripción'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pts.ubicacion || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {pts.equipoOInstalacion || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pts.nombreSolicitante || pts.solicitanteLegajo || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pts.fechaInicio ? new Date(pts.fechaInicio).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {isClickable && (
                            <button className="text-epu-primary hover:text-epu-primary-dark">
                              {estado === 'Pendiente de Firma' ? 'Firmar' : 'Cerrar'}
                            </button>
                          )}
                          {estado === 'Cerrado' && (
                            <span className="text-green-600">Completado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedPTS.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{filteredAndSortedPTS.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-epu-primary border-epu-primary text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaPTS;