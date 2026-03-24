import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const ListaPTS = ({ onSelectPtsParaFirma, onSelectPtsParaCierre, defaultFilter = 'TODOS' }) => {
  const navigate = useNavigate();
  // Estados principales
  const [ptsList, setPtsList] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [searchType, setSearchType] = useState('equipo');
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInicio', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPts, setSelectedPts] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;

  // Estados de busqueda avanzada 
  const [searchFilters, setSearchFilters] = useState({
    equipo: '',
    usuario: '',
    area: '',
    estado: '',
    fechaInicio: ''
  });
  // Estados locales 
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
    STANDBY: 'STANDBY',
    PENDIENTE_FIRMA: 'PENDIENTE_FIRMA',
    FIRMADO_PENDIENTE_CIERRE: 'FIRMADO_PENDIENTE_CIERRE', 
    CERRADO: 'CERRADO',
    MIS_PTS: 'MIS_PTS'
  };

  // Estilos para estados
  const estadoStyles = {
    'Stand by': {
      color: '#94a3b8',
      bgColor: '#f1f5f9',
      icon: '',
      textColor: '#475569'
    },
    'Pendiente de Firma': { 
      color: '#f59e0b', 
      bgColor: '#fef9c3', 
      icon: '',
      textColor: '#92400e' 
    },
    'Firmado (Pend. Cierre)': { 
      color: '#0d7377', 
      bgColor: '#e0f5f5', 
      icon: '',
      textColor: '#0d7377' 
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

  // Refs para timeouts 
  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);

  // Cargar PTS inicio y cuando cambie el filtro principal
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

    
      const filters = customFilters || searchFilters;

      const queryParams = [];

      if (term && term.toString().trim()) {
        const q = type === 'usuario' ? `usuario=${encodeURIComponent(term.trim())}` : `equipo=${encodeURIComponent(term.trim())}`;
        queryParams.push(q);
      }

      // Añadir filtros avanzados si existen (no sobreescriben term/type)
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          
          if ((key === 'equipo' || key === 'usuario') && term && term.toString().trim()) return;
          queryParams.push(`${key}=${encodeURIComponent(value.toString().trim())}`);
        }
      });

      const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
      const url = `/api/pts${queryString}`;
      
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
    if (pts.rtoEstado === 'STANDBY') {
      return 'Stand by';
    }
    if (pts.rtoEstado === 'CERRADO') {
      return 'Cerrado';
    }
    if (pts.rtoEstado === 'FIRMADO_PEND_CIERRE') {
      return 'Firmado (Pend. Cierre)';
    }
    // Si está pendiente y tiene firma, o no requiere supervisor
    if (pts.rtoEstado === 'PENDIENTE' && (pts.firmaSupervisorBase64 || !pts.supervisorLegajo)) {
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
          case 'STANDBY':
            return estado === 'Stand by';
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

    // Aplicar busqueda simple por texto 
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

  // Paginacion
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

  // Manejar filtros locales 
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mostrar indicador de busqueda pendiente
    setIsSearching(true);
    
    // Limpiar timeout anterior de filtros
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    
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
    }, 1500); // Debounce de 1.5 segundos 
  };

  
  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    
    // Mostrar indicador de búsqueda pendiente
    setIsSearching(true);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Programar nueva busqueda
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchPTS(value, searchType);
      } else {
        fetchPTS(); // Sin término, cargar todos
      }
      setIsSearching(false); 
    }, 1500); // Debounce de 1.5 segundos
  };

  // Limpiar todos los filtros 
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
    if (estado === 'Stand by') {
      navigate('/pts/nuevo', { state: { editingPts: pts } });
      return;
    }
    if (estado === 'Pendiente de Firma' && onSelectPtsParaFirma && currentUser && pts.supervisorLegajo === currentUser.dni) {
      onSelectPtsParaFirma(pts);
    } else if (
      estado === 'Firmado (Pend. Cierre)'
      && onSelectPtsParaCierre
      && currentUser
      && (pts.supervisorLegajo === currentUser.dni || pts.solicitanteLegajo === currentUser.dni)
    ) {
      onSelectPtsParaCierre(pts);
    }
    setSelectedPts(pts);
  };

  // Contar PTS por estado 
  const getCounts = () => {
    const counts = {
      total: ptsList.length,
      standby: 0,
      pendienteFirma: 0,
      firmadoPendienteCierre: 0,
      cerrado: 0,
      misPts: 0
    };

    ptsList.forEach(pts => {
      const estado = getPtsEstado(pts);
      
      if (estado === 'Stand by') counts.standby++;
      else if (estado === 'Pendiente de Firma') counts.pendienteFirma++;
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b' }}>Cargando lista de PTS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: 12 }}>Error</h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => fetchPTS(searchTerm, searchType)} className="btn btn-primary">Reintentar</button>
            <button onClick={() => window.location.reload()} className="btn btn-outline">Recargar Página</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <div>
        {/* Header */}
        <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#0d7377', color: '#fff', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {filter === 'MIS_PTS' ? 'Mis Permisos de Trabajo Seguro' : 'Dashboard de Permisos de Trabajo Seguro'}
            </h1>
            {currentUser && (
              <p style={{ marginTop: 6, opacity: 0.9, fontSize: '0.85rem' }}>
                Usuario: {currentUser.nombre} | 
                {filter === 'MIS_PTS' ? ` Mis PTS: ${counts.misPts}` : ` Total PTS: ${counts.total}`}
              </p>
            )}
          </div>

          {/* Filtros y Busqueda */}
          <div style={{ padding: '20px 24px 28px' }}>
            {/* Tabs de Filtros */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {Object.entries(FILTROS).map(([key, value]) => {
                  const isActive = filter === value;
                  let label = '';
                  let count = 0;

                  switch (key) {
                    case 'TODOS': label = 'Todos'; count = counts.total; break;
                    case 'STANDBY': label = 'Stand by'; count = counts.standby; break;
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
                      className={isActive ? 'btn btn-primary' : 'btn btn-outline'}
                      style={{ minWidth: 100, padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {label}
                      {count > 0 && (
                        <>
                          &nbsp;&nbsp;
                          <span style={{ fontSize: '0.75rem' }}>
                            {count}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Barra de Busqueda Avanzada (HU-014) */}
            <div>
              {/* Búsqueda Simple */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Búsqueda rápida por ID, descripción, ubicación, solicitante..."
                        value={searchTerm}
                        onChange={(e) => handleSearchTermChange(e.target.value)}
                        className="form-input"
                        style={{ width: '100%' }}
                      />
                      {isSearching && (
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                          <div className="spinner" style={{ width: 16, height: 16 }}></div>
                        </div>
                      )}
                    </div>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="form-input"
                      style={{ minWidth: 120, width: 'auto' }}
                    >
                      <option value="equipo">Equipo</option>
                      <option value="usuario">Usuario</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                  >
                    {showAdvancedSearch ? 'Ocultar' : 'Filtros Avanzados'}
                  </button>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {paginatedPTS.length} de {filteredAndSortedPTS.length} PTS
                  </span>
                  <button
                    onClick={() => fetchPTS(searchTerm, searchType)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                  >
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Búsqueda Avanzada - Colapsable */}
              {showAdvancedSearch && (
                <div style={{ background: '#f0fafa', padding: 16, borderRadius: 12, border: '1px solid #d1e9ea' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Equipo/Instalación</label>
                      <input type="text" placeholder="ej: bomba, reactor..." value={localFilters.equipo} onChange={(e) => handleLocalFilterChange('equipo', e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Usuario/Solicitante</label>
                      <input type="text" placeholder="ej: Juan, VINF..." value={localFilters.usuario} onChange={(e) => handleLocalFilterChange('usuario', e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Área</label>
                      <input type="text" placeholder="ej: Mantenimiento..." value={localFilters.area} onChange={(e) => handleLocalFilterChange('area', e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Estado RTO</label>
                      <select value={localFilters.estado} onChange={(e) => handleLocalFilterChange('estado', e.target.value)} className="form-input">
                        <option value="">Todos los estados</option>
                        <option value="STANDBY">STAND BY</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="CERRADO">CERRADO</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Fecha de Inicio</label>
                      <input type="date" value={localFilters.fechaInicio} onChange={(e) => handleLocalFilterChange('fechaInicio', e.target.value)} className="form-input" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #d1e9ea' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                      {Object.values(searchFilters).some(val => val) && (
                        <span style={{ color: '#0d7377', fontWeight: 600 }}>
                          Filtros activos: {Object.values(searchFilters).filter(val => val).length}
                        </span>
                      )}
                      {isSearching && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="spinner" style={{ width: 12, height: 12 }}></div>
                          <span style={{ fontSize: '0.75rem' }}>Buscando...</span>
                        </div>
                      )}
                    </div>
                    <button onClick={clearAllSearchFilters} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Limpiar Filtros</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de PTS */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Estado</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('descripcionTrabajo')}>
                    Descripción {sortConfig.key === 'descripcionTrabajo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Ubicación</th>
                  <th>Equipos</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nombreSolicitante')}>
                    Solicitante {sortConfig.key === 'nombreSolicitante' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fechaInicio')}>
                    Fecha {sortConfig.key === 'fechaInicio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPTS.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b' }}>
                        {(!loading && filteredAndSortedPTS.length === 0 && (searchTerm || Object.values(searchFilters).some(val => val))) ? (
                          <div>
                            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</div>
                            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                              No se encontraron Permisos de Trabajo Seguro que coincidan con la búsqueda
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
                              {searchTerm && `Búsqueda: "${searchTerm}"`}
                              {searchTerm && Object.values(searchFilters).some(val => val) && ' • '}
                              {Object.values(searchFilters).some(val => val) && 'Filtros avanzados activos'}
                            </div>
                            <button onClick={clearAllSearchFilters} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Limpiar búsqueda y filtros</button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📋</div>
                            <div style={{ fontWeight: 600, color: '#334155' }}>No hay PTS disponibles en este momento</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPTS.map((pts) => {
                    const estado = getPtsEstado(pts);
                    const estadoStyle = estadoStyles[estado] || estadoStyles['Stand by'];
                    const isClickable = estado === 'Pendiente de Firma' || estado === 'Firmado (Pend. Cierre)' || estado === 'Stand by';

                    return (
                      <tr 
                        key={pts.id} 
                        style={{ cursor: isClickable ? 'pointer' : 'default', background: selectedPts?.id === pts.id ? '#f0fafa' : 'transparent' }}
                        onClick={() => handleRowClick(pts)}
                      >
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                          <Link 
                            to={`/pts/${pts.id}`}
                            style={{ color: '#0d7377', textDecoration: 'none' }}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                          >
                            {pts.id || 'N/A'}
                          </Link>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="badge" style={{ backgroundColor: estadoStyle.bgColor, color: estadoStyle.textColor }}>
                            {estado}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pts.descripcionTrabajo || 'Sin descripción'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>
                          {pts.ubicacion || 'N/A'}
                        </td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>
                          {pts.equipoOInstalacion || 'N/A'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>
                          {pts.nombreSolicitante || pts.solicitanteLegajo || 'N/A'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>
                          {pts.fechaInicio ? new Date(pts.fechaInicio).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {estado === 'Stand by' && (
                            <button
                              style={{ color: '#f59e0b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={e => {
                                e.stopPropagation();
                                navigate('/pts/nuevo', { state: { editingPts: pts } });
                              }}
                            >
                              Continuar PTS
                            </button>
                          )}
                          {(estado === 'Pendiente de Firma' || estado === 'Firmado (Pend. Cierre)') && 
                           currentUser && (pts.supervisorLegajo === currentUser.dni || pts.solicitanteLegajo === currentUser.dni) && (
                            <button
                              style={{ color: '#0d7377', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={e => {
                                e.stopPropagation();
                                if (estado === 'Pendiente de Firma' && onSelectPtsParaFirma) {
                                  onSelectPtsParaFirma(pts);
                                } else if (estado === 'Firmado (Pend. Cierre)' && onSelectPtsParaCierre) {
                                  onSelectPtsParaCierre(pts);
                                }
                              }}
                            >
                              {estado === 'Pendiente de Firma' ? 'Firmar' : 'Cerrar'}
                            </button>
                          )}
                          {estado === 'Cerrado' && (
                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Completado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          {totalPages > 1 && (
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2eff1', background: '#f8fdfd' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Mostrando{' '}
                <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>
                {' '}a{' '}
                <strong>{Math.min(currentPage * itemsPerPage, filteredAndSortedPTS.length)}</strong>
                {' '}de{' '}
                <strong>{filteredAndSortedPTS.length}</strong>
                {' '}resultados
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: 36 }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaPTS;