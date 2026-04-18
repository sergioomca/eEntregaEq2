
import React, { useState, useEffect, useRef } from 'react';

const ReportesView = () => {
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    // Eliminado filtro de área/sector
    const [exportType, setExportType] = useState('excel'); 
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    // Estados para filtro de equipo con autocompletado
    const [equipoInput, setEquipoInput] = useState('');
    const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
    const [todosEquipos, setTodosEquipos] = useState([]);
    const [equiposFiltrados, setEquiposFiltrados] = useState([]);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const equipoRef = useRef(null);
    
    // Estados para estadisticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        autorizados: 0,
        pendientes: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    // Carga las estadísticas de PTS desde el backend
    const loadEstadisticas = async () => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/pts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar PTS: ${response.status}`);
            }

            const allPts = await response.json();
            
            // Calcular estadisticas
            const total = allPts.length;
            const autorizados = allPts.filter(pts => pts.rtoEstado === 'CERRADO').length;
            const pendientes = allPts.filter(pts => pts.rtoEstado === 'PENDIENTE').length;
            
            setEstadisticas({
                total,
                autorizados,
                pendientes
            });
            
            console.log('Estadisticas cargadas:', { total, autorizados, pendientes });
        } catch (error) {
            console.error('Error al cargar estadisticas:', error);
            // Mantener valores en 0 en caso de error
            setEstadisticas({ total: 0, autorizados: 0, pendientes: 0 });
        } finally {
            setLoadingStats(false);
        }
    };

    
    // Cargar lista de equipos al montar
    useEffect(() => {
        const cargarEquipos = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/equipos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTodosEquipos(data);
                }
            } catch (error) {
                console.error('Error al cargar equipos:', error);
            }
        };
        cargarEquipos();
        loadEstadisticas();
    }, []);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (equipoRef.current && !equipoRef.current.contains(e.target)) {
                setMostrarDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEquipoInputChange = (e) => {
        const valor = e.target.value;
        setEquipoInput(valor);
        setEquipoSeleccionado('');
        if (valor.trim().length > 0) {
            const filtrados = todosEquipos.filter(eq =>
                (eq.tag || eq.id || '').toLowerCase().includes(valor.toLowerCase()) ||
                (eq.descripcion || eq.nombre || '').toLowerCase().includes(valor.toLowerCase())
            );
            setEquiposFiltrados(filtrados);
            setMostrarDropdown(true);
        } else {
            setEquiposFiltrados([]);
            setMostrarDropdown(false);
        }
    };

    const handleSeleccionarEquipo = (equipo) => {
        const identificador = equipo.tag || equipo.id || '';
        setEquipoInput(identificador);
        setEquipoSeleccionado(identificador);
        setMostrarDropdown(false);
    };

    // Para manejar la exportacion a Excel - URL con parametros de consulta y descarga el archivo
    
    const handleExportExcel = async () => {
        setIsExporting(true);
        
        try {
            // Construir la URL de la API con parametros de consulta
            const baseUrl = '/api/reportes/excel';
            const params = new URLSearchParams();
            
            // Añadir parametros solo si no estan vacios
            if (fechaDesde) {
                params.append('fechaDesde', fechaDesde);
            }
            if (fechaHasta) {
                params.append('fechaHasta', fechaHasta);
            }
            // Eliminado filtro de área/sector
            if (equipoSeleccionado && equipoSeleccionado.trim()) {
                params.append('equipo', equipoSeleccionado.trim());
            } else if (equipoInput && equipoInput.trim()) {
                params.append('equipo', equipoInput.trim());
            }
            
            const urlWithParams = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            
            console.log('Exportando Excel con URL:', urlWithParams);
            console.log('Filtros aplicados:', { fechaDesde, fechaHasta });
            
            // Llamada fetch
            const token = localStorage.getItem('authToken');
            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al generar Excel: ${response.status} ${response.statusText}`);
            }

            // Manejar la respuesta como Blob
            const blob = await response.blob();
            console.log('Excel recibido, tamaño del blob:', blob.size, 'bytes');
            
            // Patron de descarga con URL.createObjectURL
            const url = window.URL.createObjectURL(new Blob([blob], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Reporte_PTS.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpiar el URL del objeto
            window.URL.revokeObjectURL(url);
            
            console.log('Descarga de Excel completada: Reporte_PTS.xlsx');
            
        } catch (err) {
            console.error('Error en la exportación Excel:', err);
            alert(`Error al exportar: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        try {
            const baseUrl = '/api/reportes/pdf-lista';
            const params = new URLSearchParams();
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);
            // Eliminado filtro de área/sector
            if (equipoSeleccionado && equipoSeleccionado.trim()) params.append('equipo', equipoSeleccionado.trim());
            else if (equipoInput && equipoInput.trim()) params.append('equipo', equipoInput.trim());

            const urlWithParams = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            const token = localStorage.getItem('authToken');
            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' }
            });

            if (!response.ok) throw new Error(`Error al generar PDF: ${response.status} ${response.statusText}`);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Reporte_PTS.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error en la exportación PDF:', err);
            alert(`Error al exportar PDF: ${err.message}`);
        } finally {
            setIsExportingPdf(false);
        }
    };

    // Para limpiar filtros
    const handleLimpiarFiltros = () => {
        setFechaDesde('');
        setFechaHasta('');
        setEquipoInput('');
        setEquipoSeleccionado('');
        setEquiposFiltrados([]);
        setMostrarDropdown(false);
    };

    // Validar que fechaDesde < fechaHasta
    const validarFechas = () => {
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            return false;
        }
        return true;
    };

    return (
        <div>
            {/* Encabezado */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d7377', marginBottom: 8 }}>Exportación de Reportes</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Configure los filtros y genere reportes de PTS en diferentes formatos.
                </p>
            </div>

            {/* Panel de Control Principal */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header del panel */}
                <div style={{ background: '#f0fafa', padding: '16px 24px', borderBottom: '1px solid #d1e7e7' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a2332' }}>Configuración de Filtros</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                        Seleccione los criterios para filtrar los PTS en el reporte
                    </p>
                </div>

                {/* Formulario de filtros */}
                <div style={{ padding: 24 }}>
                    {/* Primera fila: Fechas separadas en 2 columnas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>
                        {/* Input Fecha Desde */}
                        <div className="form-group">
                            <label htmlFor="fechaDesde" className="form-label">
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                id="fechaDesde"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="form-input"
                                placeholder="Seleccione fecha inicial"
                            />
                        </div>

                        {/* Input Fecha Hasta */}
                        <div className="form-group">
                            <label htmlFor="fechaHasta" className="form-label">
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                id="fechaHasta"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="form-input"
                                placeholder="Seleccione fecha final"
                                min={fechaDesde}
                            />
                        </div>
                    </div>

                    {/* Segunda fila: solo Limpiar Filtros */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>

                        {/* Autocomplete de Equipo */}
                        <div className="form-group" style={{ margin: 0, position: 'relative' }} ref={equipoRef}>
                            <label htmlFor="equipo" className="form-label">
                                Equipo
                            </label>
                            <input
                                type="text"
                                id="equipo"
                                value={equipoInput}
                                onChange={handleEquipoInputChange}
                                onFocus={() => equipoInput.trim() && setMostrarDropdown(true)}
                                autoComplete="off"
                                placeholder="Buscar por tag o descripción..."
                                className="form-input"
                                style={{ width: 280 }}
                            />
                            {mostrarDropdown && equiposFiltrados.length > 0 && (
                                <ul
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '280px',
                                        zIndex: 50,
                                        background: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        margin: 0,
                                        padding: 0,
                                        listStyle: 'none'
                                    }}
                                >
                                    {equiposFiltrados.map((eq, idx) => (
                                        <li
                                            key={eq.id || eq.tag || idx}
                                            onMouseDown={() => handleSeleccionarEquipo(eq)}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f0fafa'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontWeight: 600, color: '#1a2332' }}>{eq.tag || eq.id}</span>
                                            {(eq.descripcion || eq.nombre) && (
                                                <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 8 }}>{eq.descripcion || eq.nombre}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {mostrarDropdown && equipoInput.trim() && equiposFiltrados.length === 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '280px',
                                        zIndex: 50,
                                        background: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }}
                                >
                                    Sin coincidencias
                                </div>
                            )}
                        </div>
                        
                        {/* para crear separacion */}
                        <div style={{ flex: 1 }}></div>
                        
                        {/* Boton Limpiar Filtros */}
                        <div>
                            <button
                            onClick={handleLimpiarFiltros}
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                            <svg style={{ width: '18px', height: '18px', marginRight: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Validacion de fechas */}
                    {!validarFechas() && (
                        <div style={{ marginBottom: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="20" height="20" fill="#ef4444" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                                <strong>Error:</strong> La fecha "Desde" debe ser anterior a la fecha "Hasta".
                            </p>
                        </div>
                    )}

                    {/* Resumen de filtros activos */}
                    {(fechaDesde || fechaHasta || equipoInput) && validarFechas() && (
                        <div style={{ marginBottom: 24, background: '#f0fafa', border: '1px solid #b2dfdb', borderRadius: 10, padding: 16 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d7377', marginBottom: 8 }}>📋 Filtros Activos:</h4>
                            <ul style={{ fontSize: '0.85rem', color: '#0a5c5f', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {fechaDesde && <li>• Desde: {new Date(fechaDesde).toLocaleDateString('es-ES')}</li>}
                                {fechaHasta && <li>• Hasta: {new Date(fechaHasta).toLocaleDateString('es-ES')}</li>}
                                {equipoInput && <li>• Equipo: {equipoInput}</li>}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Seccion de Acciones */}
                <div style={{ background: '#f0fafa', padding: '16px 24px', borderTop: '1px solid #d1e7e7', borderRadius: '0 0 16px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                        {/* Botones de exportacion */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2332' }}>Exportar:</span>
                            
                            {/* Boton Excel */}
                            <button
                                onClick={handleExportExcel}
                                disabled={isExporting || !validarFechas()}
                                className="btn btn-primary"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: (isExporting || !validarFechas()) ? '#ccc' : '#059669',
                                    ...(isExporting || !validarFechas() ? { color: '#888', cursor: 'not-allowed' } : {})
                                }}
                                title="Exportar a Excel"
                            >
                                {isExporting ? (
                                    <span className="spinner" style={{ width: 16, height: 16 }}></span>
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Excel
                                    </>
                                )}
                            </button>

                            {/* Boton PDF */}
                            <button
                                onClick={handleExportPdf}
                                disabled={isExportingPdf || !validarFechas()}
                                className="btn"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: (isExportingPdf || !validarFechas()) ? '#eee' : '#dc2626',
                                    color: (isExportingPdf || !validarFechas()) ? '#888' : '#fff',
                                    border: 'none',
                                    ...(isExportingPdf || !validarFechas() ? { cursor: 'not-allowed' } : {})
                                }}
                                title={validarFechas() ? 'Exportar lista a PDF' : 'Seleccione un rango de fechas válido'}
                            >
                                {isExportingPdf ? (
                                    <>
                                        <span className="spinner" style={{ width: 16, height: 16 }}></span>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                        PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informacion adicional */}
            <div className="card" style={{ marginTop: 24, padding: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2332', marginBottom: 8 }}>Información del Reporte</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p><strong>Formato Excel:</strong> Incluye todos los campos del PTS con filtros aplicados → <em>Reporte_PTS.xlsx</em></p>
                    <p><strong>Formato PDF:</strong> Tabla resumen en hoja A4 apaisada con los registros filtrados → <em>Reporte_PTS.pdf</em></p>
                    <p><strong>Filtros disponibles:</strong> Rango de fechas y equipo</p>
                    <p><strong>Sin filtros:</strong> Se exportarán todos los PTS disponibles</p>
                </div>
            </div>

            {/* Estadisticas en tiempo real */}
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0d7377' }}>
                        {loadingStats ? '...' : estadisticas.total}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>PTS Totales</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#059669' }}>
                        {loadingStats ? '...' : estadisticas.autorizados}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Cerrados/Completados</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
                        {loadingStats ? '...' : estadisticas.pendientes}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pendientes</div>
                </div>
            </div>
        </div>
    );
};

export default ReportesView;