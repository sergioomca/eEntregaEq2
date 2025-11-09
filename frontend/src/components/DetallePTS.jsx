import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Función para decodificar JWT
const decodeToken = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) { base64 += '='; }

        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decodificando JWT:", e);
        return null;
    }
};

const DetallePTS = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pts, setPts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [user, setUser] = useState(null);

    // Obtener usuario del token al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const claims = decodeToken(token);
            if (claims && claims.exp * 1000 > Date.now()) {
                const roleWithPrefix = claims.roles && claims.roles[0];
                const role = roleWithPrefix ? roleWithPrefix.replace('ROLE_', '') : null;
                setUser({
                    legajo: claims.sub,
                    role: role,
                    username: claims.sub
                });
            }
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchPtsDetail(id);
        }
    }, [id]);

    const fetchPtsDetail = async (ptsId) => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/api/pts/${ptsId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setPts(data);
            console.log('PTS cargado para detalle:', data);
        } catch (err) {
            setError(err.message);
            console.error('Error al cargar PTS:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función canPrint() - Validar si el PTS puede ser impreso
     * Lógica de autorización:
     * - EMISOR: Puede imprimir sus propios PTS en cualquier estado
     * - SUPERVISOR: Puede imprimir cualquier PTS
     * - ADMIN: Puede imprimir cualquier PTS
     * - EJECUTANTE: No puede imprimir
     */
    const canPrint = () => {
        if (!pts || !user) return false;
        
        const userRole = user.role || user.authorities?.[0]?.authority;
        const userLegajo = user.legajo || user.username;
        
        // Admins y Supervisores pueden imprimir cualquier PTS
        if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
            return true;
        }
        
        // Emisores pueden imprimir solo sus propios PTS
        if (userRole === 'EMISOR') {
            return pts.solicitanteLegajo === userLegajo;
        }
        
        // Ejecutantes no pueden imprimir
        return false;
    };

    /**
     * Función handlePrint() - Manejar la descarga del PDF del PTS
     * Llama al endpoint GET /api/reportes/pdf/{pts.id}
     */
    const handlePrint = async () => {
        if (!pts || !canPrint()) {
            const userRole = user?.role || user?.authorities?.[0]?.authority;
            let errorMessage = 'No tienes permisos para imprimir este PTS.';
            
            if (userRole === 'EMISOR') {
                errorMessage = 'Solo puedes imprimir PTS que hayas creado tú.';
            } else if (userRole === 'EJECUTANTE') {
                errorMessage = 'Los ejecutantes no tienen permisos para imprimir PTS.';
            }
            
            alert(errorMessage);
            return;
        }

        setIsPrinting(true);
        
        try {
            const token = localStorage.getItem('authToken');
            console.log(`Iniciando descarga de PDF para PTS: ${pts.id}`);
            
            // Llamada al endpoint de reportes
            const response = await fetch(`http://localhost:8080/api/reportes/pdf/${pts.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al generar PDF: ${response.status} ${response.statusText}`);
            }

            // Obtener el Blob del PDF
            const blob = await response.blob();
            console.log('PDF recibido, tamaño del blob:', blob.size, 'bytes');

            // Crear URL de objeto para iniciar la descarga
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PTS-${pts.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpiar el URL del objeto
            window.URL.revokeObjectURL(url);
            
            console.log(`Descarga de PDF completada para PTS: ${pts.id}`);
            
            // TODO: Llamar al servicio/función para registrar el evento de impresión con el userId y la fecha actual
            // Ejemplo: await registrarEventoImpresion(pts.id, user.legajo, new Date().toISOString());
            
        } catch (err) {
            console.error('Error en la impresión del PTS:', err);
            alert(`Error al imprimir: ${err.message}`);
        } finally {
            setIsPrinting(false);
        }
    };

    // Estados de carga y error
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando detalles del PTS...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar PTS</h3>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/mis-pts')}
                        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                        Volver a Lista PTS
                    </button>
                </div>
            </div>
        );
    }

    if (!pts) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">PTS no encontrado</h3>
                    <p className="text-yellow-700">El PTS con ID "{id}" no fue encontrado.</p>
                    <button
                        onClick={() => navigate('/mis-pts')}
                        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                        Volver a Lista PTS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Encabezado */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detalle PTS</h1>
                        <p className="text-gray-600 mt-1">ID: {pts.id}</p>
                    </div>
                    <button
                        onClick={() => navigate('/mis-pts')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                    >
                        ← Volver
                    </button>
                </div>
            </div>

            {/* Información principal del PTS */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header con estado */}
                <div className={`px-6 py-4 ${
                    pts.rtoEstado === 'AUTORIZADO' ? 'bg-green-100 border-l-4 border-green-500' :
                    pts.rtoEstado === 'PENDIENTE' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                    pts.rtoEstado === 'CERRADO' ? 'bg-gray-100 border-l-4 border-gray-500' :
                    'bg-blue-100 border-l-4 border-blue-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{pts.titulo}</h2>
                            <p className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                pts.rtoEstado === 'AUTORIZADO' ? 'bg-green-200 text-green-800' :
                                pts.rtoEstado === 'PENDIENTE' ? 'bg-yellow-200 text-yellow-800' :
                                pts.rtoEstado === 'CERRADO' ? 'bg-gray-200 text-gray-800' :
                                'bg-blue-200 text-blue-800'
                            }`}>
                                Estado: {pts.rtoEstado}
                            </p>
                        </div>
                        {/* Indicador visual del estado de impresión */}
                        <div className="text-right">
                            {canPrint() ? (
                                <div className="flex items-center text-green-600">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">Listo para imprimir</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-500">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">Impresión bloqueada</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">{pts.descripcion || 'Sin descripción'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Equipo</label>
                                <p className="mt-1 text-gray-900">{pts.equipo || 'No especificado'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario Responsable</label>
                                <p className="mt-1 text-gray-900">{pts.usuario || 'No asignado'}</p>
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Área</label>
                                <p className="mt-1 text-gray-900">{pts.area || 'No especificada'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                <p className="mt-1 text-gray-900">
                                    {pts.fechaInicio ? new Date(pts.fechaInicio).toLocaleDateString('es-ES') : 'No definida'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                                <p className="mt-1 text-gray-900">{pts.supervisorLegajo || 'No asignado'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de acciones */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        {/* Mensaje de estado de impresión */}
                        <div className="flex-1">
                            {!canPrint() && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm text-yellow-800">
                                            <strong>Impresión bloqueada.</strong> {(() => {
                                                const userRole = user?.role || user?.authorities?.[0]?.authority;
                                                if (userRole === 'EMISOR' && pts?.solicitanteLegajo !== user?.legajo && pts?.solicitanteLegajo !== user?.username) {
                                                    return 'Solo puedes imprimir PTS que hayas creado.';
                                                } else if (userRole === 'EJECUTANTE') {
                                                    return 'Los ejecutantes no pueden imprimir PTS.';
                                                }
                                                return 'No tienes permisos para imprimir este PTS.';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón de impresión */}
                        <div className="ml-4">
                            <button
                                onClick={handlePrint}
                                disabled={!canPrint() || isPrinting}
                                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                                    canPrint() && !isPrinting
                                        ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-[1.02]'
                                        : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                                }`}
                            >
                                {isPrinting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando PDF...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd" />
                                        </svg>
                                        Imprimir Permiso (PDF)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            {pts.fechaHoraFirmaSupervisor && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Información de Firma</h3>
                    <div className="text-sm text-green-800">
                        <p><strong>Firmado por:</strong> {pts.dniSupervisorFirmante || 'No disponible'}</p>
                        <p><strong>Fecha de firma:</strong> {new Date(pts.fechaHoraFirmaSupervisor).toLocaleString('es-ES')}</p>
                    </div>
                </div>
            )}

            {/* Información de cierre RTO */}
            {pts.rtoEstado === 'CERRADO' && pts.rtoFechaHoraCierre && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Información de Cierre RTO</h3>
                    <div className="text-sm text-gray-800">
                        <p><strong>Estado RTO:</strong> {pts.rtoEstado}</p>
                        <p><strong>Cerrado por:</strong> {pts.rtoResponsableCierreLegajo || 'No disponible'}</p>
                        <p><strong>Fecha de cierre:</strong> {new Date(pts.rtoFechaHoraCierre).toLocaleString('es-ES')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetallePTS;