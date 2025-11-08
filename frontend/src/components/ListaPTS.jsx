import React, { useState, useEffect, useMemo } from 'react';

const ListaPTS = ({ onSelectPtsParaFirma, onSelectPtsParaCierre, defaultFilter = 'TODOS' }) => {
  // Estados principales
  const [ptsList, setPtsList] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInicio', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPts, setSelectedPts] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      icon: '✍️',
      textColor: '#92400e' 
    },
    'Firmado (Pend. Cierre)': { 
      color: '#3b82f6', 
      bgColor: '#dbeafe', 
      icon: '⏳',
      textColor: '#1e40af' 
    },
    'Cerrado': { 
      color: '#10b981', 
      bgColor: '#d1fae5', 
      icon: '✅',
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

  // Cargar PTS al montar componente
  useEffect(() => {
    fetchPTS();
  }, []);

  const fetchPTS = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      console.log('Obteniendo lista de PTS...');
      
      const response = await fetch('http://localhost:8080/api/pts', {
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

    // Aplicar filtro por estado
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

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pts => 
        (pts.id && pts.id.toLowerCase().includes(term)) ||
        (pts.descripcionTrabajo && pts.descripcionTrabajo.toLowerCase().includes(term)) ||
        (pts.ubicacion && pts.ubicacion.toLowerCase().includes(term)) ||
        (pts.nombreSolicitante && pts.nombreSolicitante.toLowerCase().includes(term)) ||
        (pts.equipoOInstalacion && pts.equipoOInstalacion.toLowerCase().includes(term))
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
              onClick={fetchPTS}
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
          <div className="p-6 border-b border-gray-200">
            {/* Tabs de Filtros */}
            <div className="flex flex-wrap gap-2 mb-4">
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
                  >
                    {label} 
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        isActive ? 'bg-white text-epu-primary' : 'bg-epu-secondary text-white'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Barra de Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por ID, descripción, ubicación, solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Mostrando {paginatedPTS.length} de {filteredAndSortedPTS.length} PTS
                </span>
                <button
                  onClick={fetchPTS}
                  className="bg-epu-secondary text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm"
                >
                  🔄 Actualizar
                </button>
              </div>
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
                {paginatedPTS.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No se encontraron PTS que coincidan con la búsqueda.' : 'No hay PTS disponibles.'}
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
                          {pts.id || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: estadoStyle.bgColor,
                              color: estadoStyle.textColor
                            }}
                          >
                            {estadoStyle.icon} {estado}
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
                              {estado === 'Pendiente de Firma' ? '✍️ Firmar' : '🔒 Cerrar'}
                            </button>
                          )}
                          {estado === 'Cerrado' && (
                            <span className="text-green-600">✅ Completado</span>
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