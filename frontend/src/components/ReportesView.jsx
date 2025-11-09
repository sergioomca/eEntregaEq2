import React, { useState, useEffect } from 'react';

const ReportesView = () => {
    // Estados según especificaciones
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [area, setArea] = useState('');
    const [exportType, setExportType] = useState('excel'); // Para futuras expansiones
    const [isExporting, setIsExporting] = useState(false);
    
    // Estados para estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        autorizados: 0,
        pendientes: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    /**
     * Función loadEstadisticas() - Carga las estadísticas de PTS desde el backend
     */
    const loadEstadisticas = async () => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/pts', {
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
            
            // Calcular estadísticas
            const total = allPts.length;
            const autorizados = allPts.filter(pts => pts.rtoEstado === 'CERRADO').length;
            const pendientes = allPts.filter(pts => pts.rtoEstado === 'PENDIENTE').length;
            
            setEstadisticas({
                total,
                autorizados,
                pendientes
            });
            
            console.log('Estadísticas cargadas:', { total, autorizados, pendientes });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // Mantener valores en 0 en caso de error
            setEstadisticas({ total: 0, autorizados: 0, pendientes: 0 });
        } finally {
            setLoadingStats(false);
        }
    };

    // Cargar estadísticas al montar el componente
    useEffect(() => {
        loadEstadisticas();
    }, []);

    /**
     * Función handleExportExcel() - Maneja la exportación a Excel
     * Construye la URL con parámetros de consulta y descarga el archivo
     */
    const handleExportExcel = async () => {
        setIsExporting(true);
        
        try {
            // Construir la URL de la API con parámetros de consulta
            const baseUrl = 'http://localhost:8080/api/reportes/excel';
            const params = new URLSearchParams();
            
            // Añadir parámetros solo si no están vacíos
            if (fechaDesde) {
                params.append('fechaDesde', fechaDesde);
            }
            if (fechaHasta) {
                params.append('fechaHasta', fechaHasta);
            }
            if (area && area.trim()) {
                params.append('area', area.trim());
            }
            
            const urlWithParams = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            
            console.log('Exportando Excel con URL:', urlWithParams);
            console.log('Filtros aplicados:', { fechaDesde, fechaHasta, area });
            
            // Realizar la llamada fetch
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
            
            // Patrón de descarga con URL.createObjectURL
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

    // Función para limpiar filtros
    const handleLimpiarFiltros = () => {
        setFechaDesde('');
        setFechaHasta('');
        setArea('');
    };

    // Validar que fechaDesde < fechaHasta
    const validarFechas = () => {
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            return false;
        }
        return true;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Encabezado */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-epu mb-2">Exportación de Reportes</h1>
                <p className="text-gray-600">
                    Configure los filtros y genere reportes de PTS en diferentes formatos.
                </p>
            </div>

            {/* Panel de Control Principal */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header del panel */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Configuración de Filtros</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Seleccione los criterios para filtrar los PTS en el reporte
                    </p>
                </div>

                {/* Formulario de filtros */}
                <div className="p-6">
                    {/* Grid responsivo para los filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {/* Input Fecha Desde */}
                        <div>
                            <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 mb-2">
                                📅 Fecha Desde
                            </label>
                            <input
                                type="date"
                                id="fechaDesde"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Seleccione fecha inicial"
                            />
                        </div>

                        {/* Input Fecha Hasta */}
                        <div>
                            <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 mb-2">
                                📅 Fecha Hasta
                            </label>
                            <input
                                type="date"
                                id="fechaHasta"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Seleccione fecha final"
                                min={fechaDesde} // Validación en el frontend
                            />
                        </div>

                        {/* Input Área/Sector */}
                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                                🏢 Área/Sector
                            </label>
                            <select
                                id="area"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Todas las áreas</option>
                                <option value="Producción">Producción</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Calidad">Calidad</option>
                                <option value="Logística">Logística</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Administración">Administración</option>
                            </select>
                        </div>
                    </div>

                    {/* Validación de fechas */}
                    {!validarFechas() && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-800">
                                    <strong>Error:</strong> La fecha "Desde" debe ser anterior a la fecha "Hasta".
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resumen de filtros activos */}
                    {(fechaDesde || fechaHasta || area) && validarFechas() && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Filtros Activos:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {fechaDesde && <li>• Desde: {new Date(fechaDesde).toLocaleDateString('es-ES')}</li>}
                                {fechaHasta && <li>• Hasta: {new Date(fechaHasta).toLocaleDateString('es-ES')}</li>}
                                {area && <li>• Área: {area}</li>}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Sección de Acciones */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        {/* Botones de acción principales */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            {/* Botón principal - Exportar Excel */}
                            <button
                                onClick={handleExportExcel}
                                disabled={isExporting || !validarFechas()}
                                className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                                    isExporting || !validarFechas()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 transform hover:scale-[1.02]'
                                }`}
                            >
                                {isExporting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando Excel...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        📊 Exportar Excel
                                    </>
                                )}
                            </button>

                            {/* Botón secundario mock - PDF Individual */}
                            <button
                                disabled
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                                title="Funcionalidad disponible próximamente"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                📄 Exportar PDF (Individuales)
                            </button>
                        </div>

                        {/* Botón limpiar filtros */}
                        <button
                            onClick={handleLimpiarFiltros}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">📋 Información del Reporte</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Formato Excel:</strong> Incluye todos los campos del PTS con filtros aplicados</p>
                    <p><strong>Nombre del archivo:</strong> Reporte_PTS.xlsx</p>
                    <p><strong>Filtros disponibles:</strong> Rango de fechas y área/sector</p>
                    <p><strong>Sin filtros:</strong> Se exportarán todos los PTS disponibles</p>
                </div>
            </div>

            {/* Estadísticas en tiempo real */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {loadingStats ? '...' : estadisticas.total}
                    </div>
                    <div className="text-sm text-gray-600">PTS Totales</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {loadingStats ? '...' : estadisticas.autorizados}
                    </div>
                    <div className="text-sm text-gray-600">Cerrados/Completados</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {loadingStats ? '...' : estadisticas.pendientes}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes</div>
                </div>
            </div>
        </div>
    );
};

export default ReportesView;