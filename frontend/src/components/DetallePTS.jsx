import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Funcion para decodificar JWT
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
            const response = await fetch(`/api/pts/${ptsId}`, {
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
     * 
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

    // Función handlePrint() - Manejar la descarga del PDF del PTS - Llama al endpoint GET /api/reportes/pdf/{pts.id}
    
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
            const response = await fetch(`/api/reportes/pdf/${pts.id}`, {
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
            
            // !!! ver hacer: Llamar al servicio/función para registrar el evento de impresión con el userId y la fecha actual
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
            <div style={{ padding: 24, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                <p style={{ color: '#64748b' }}>Cargando detalles del PTS...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Error al cargar PTS</h3>
                    <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>
                    <button onClick={() => navigate('/mis-pts')} className="btn btn-outline" style={{ marginTop: 12 }}>Volver a Lista PTS</button>
                </div>
            </div>
        );
    }

    if (!pts) {
        return (
            <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
                <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#92400e', marginBottom: 8 }}>PTS no encontrado</h3>
                    <p style={{ color: '#a16207', fontSize: '0.9rem' }}>El PTS con ID "{id}" no fue encontrado.</p>
                    <button onClick={() => navigate('/mis-pts')} className="btn btn-outline" style={{ marginTop: 12 }}>Volver a Lista PTS</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Encabezado */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>Detalle PTS</h1>
                    <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.9rem' }}>ID: {pts.id}</p>
                </div>
                <button onClick={() => navigate('/mis-pts')} className="btn btn-outline">← Volver</button>
            </div>

            {/* Información principal del PTS */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header con estado */}
                <div style={{
                    padding: '16px 24px',
                    background: pts.rtoEstado === 'AUTORIZADO' ? '#d1fae5' :
                                pts.rtoEstado === 'STANDBY' ? '#f1f5f9' :
                                pts.rtoEstado === 'PENDIENTE' ? '#fef9c3' :
                                pts.rtoEstado === 'CERRADO' ? '#f1f5f9' :
                                '#e0f5f5',
                    borderLeft: `4px solid ${
                        pts.rtoEstado === 'AUTORIZADO' ? '#10b981' :
                        pts.rtoEstado === 'STANDBY' ? '#94a3b8' :
                        pts.rtoEstado === 'PENDIENTE' ? '#f59e0b' :
                        pts.rtoEstado === 'CERRADO' ? '#64748b' :
                        '#0d7377'
                    }`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1a2332' }}>{pts.titulo}</h2>
                            <span className="badge" style={{
                                marginTop: 6,
                                display: 'inline-block',
                                background: pts.rtoEstado === 'AUTORIZADO' ? '#d1fae5' :
                                            pts.rtoEstado === 'STANDBY' ? '#e2e8f0' :
                                            pts.rtoEstado === 'PENDIENTE' ? '#fef9c3' :
                                            pts.rtoEstado === 'CERRADO' ? '#e2e8f0' :
                                            '#e0f5f5',
                                color: pts.rtoEstado === 'AUTORIZADO' ? '#047857' :
                                       pts.rtoEstado === 'STANDBY' ? '#475569' :
                                       pts.rtoEstado === 'PENDIENTE' ? '#92400e' :
                                       pts.rtoEstado === 'CERRADO' ? '#334155' :
                                       '#0d7377'
                            }}>
                                Estado: {pts.rtoEstado === 'STANDBY' ? 'Stand by' : pts.rtoEstado}
                            </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {canPrint() ? (
                                <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                                    <svg style={{ width: 20, height: 20, marginRight: 4 }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd" />
                                    </svg>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Listo para imprimir</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                                    <svg style={{ width: 20, height: 20, marginRight: 4 }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                    </svg>
                                    <span style={{ fontSize: '0.85rem' }}>Impresión bloqueada</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="form-label">Descripción</label>
                                <p style={{ background: '#f0fafa', padding: 12, borderRadius: 10, color: '#1a2332', fontSize: '0.9rem' }}>{pts.descripcion || 'Sin descripción'}</p>
                            </div>
                            
                            <div>
                                <label className="form-label">Equipo</label>
                                <p style={{ color: '#1a2332', fontSize: '0.9rem' }}>{pts.equipo || 'No especificado'}</p>
                            </div>
                            
                            <div>
                                <label className="form-label">Usuario Responsable</label>
                                <p style={{ color: '#1a2332', fontSize: '0.9rem' }}>{pts.usuario || 'No asignado'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="form-label">Fecha de Inicio</label>
                                <p style={{ color: '#1a2332', fontSize: '0.9rem' }}>
                                    {pts.fechaInicio ? new Date(pts.fechaInicio).toLocaleDateString('es-ES') : 'No definida'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="form-label">Supervisor</label>
                                <p style={{ color: '#1a2332', fontSize: '0.9rem' }}>{pts.supervisorLegajo || 'No asignado'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de acciones */}
                <div style={{ padding: '16px 24px', background: '#f0fafa', borderTop: '1px solid #d1e7e7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderRadius: '0 0 16px 16px' }}>
                    <div style={{ flex: 1 }}>
                        {!canPrint() && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="20" height="20" fill="#f59e0b" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p style={{ fontSize: '0.85rem', color: '#92400e' }}>
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
                        )}
                    </div>

                    <button
                        onClick={handlePrint}
                        disabled={!canPrint() || isPrinting}
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            ...((!canPrint() || isPrinting) ? { background: '#ccc', color: '#888', cursor: 'not-allowed', border: 'none' } : {})
                        }}
                    >
                        {isPrinting ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18 }}></span>
                                Generando PDF...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd" />
                                </svg>
                                Imprimir Permiso (PDF)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {pts.fechaHoraFirmaSupervisor && (
                <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #0d7377', padding: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d7377', marginBottom: 8 }}>Información de Firma</h3>
                    <div style={{ fontSize: '0.9rem', color: '#1a2332' }}>
                        <p><strong>Firmado por:</strong> {pts.dniSupervisorFirmante || 'No disponible'}</p>
                        <p><strong>Fecha de firma:</strong> {new Date(pts.fechaHoraFirmaSupervisor).toLocaleString('es-ES')}</p>
                    </div>
                </div>
            )}

            {pts.rtoEstado === 'CERRADO' && pts.rtoFechaHoraCierre && (
                <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #64748b', padding: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2332', marginBottom: 8 }}>Información de Cierre PTS</h3>
                    <div style={{ fontSize: '0.9rem', color: '#1a2332' }}>
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