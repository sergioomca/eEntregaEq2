// Maneja la selección de PTS para cierre desde fuera de AppContent
function handleSelectParaCierre(pts) {
    window.location.href = '/cierre-rto';
}
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import FirmaBiometrica from './components/FirmaDigital';
import EquipoStatusView from './components/EquipoStatusView';
import CierrePTS from './components/CierrePTS';
import CrearPTS from './components/CrearPTS';
import ListaPTS from './components/ListaPTS';
import DashboardEquipos from './components/DashboardEquipos';
import DetallePTS from './components/DetallePTS';
import AdminEquiposView from './components/AdminEquiposView';
import AgregarUsuario from './components/AgregarUsuario';
import UsuariosView from './components/UsuariosView';
import ReportesView from './components/ReportesView';
import DcsSimForm from './components/DcsSimForm';
import FormularioRTO from './components/FormularioRTO';
import CambiarContrasena from './components/CambiarContrasena';
import { ROLES, ALL_ROLES } from './constants/roles';

// Constantes de Configuracion
const API_URL = '/api/auth/login';

// Estructura de navegacion basada en roles
const getRoutes = (role) => {
    const base = [
        { id: 'inicio', title: 'Inicio', roles: ALL_ROLES, defaultView: true },
        { id: 'reportes', title: 'Reportes', roles: ALL_ROLES, content: 'reportes-view' }
    ];

    const roleSpecific = {
        [ROLES.EMISOR]: [
            { id: 'dashboard', title: 'Dashboards', roles: [ROLES.EMISOR], content: 'pts-dashboard-view' },
            { id: 'crear-pts', title: 'Crear PTS', roles: [ROLES.EMISOR], content: 'pts-form-view' },
            { id: 'mis-pts', title: 'PTS', roles: [ROLES.EMISOR], content: 'my-pts-list-view' },
            { id: 'formulario-rto', title: 'RTOs', roles: [ROLES.EMISOR], content: 'formulario-rto-view' }
        ],
        [ROLES.SUPERVISOR]: [
            { id: 'dashboard', title: 'Dashboards', roles: [ROLES.SUPERVISOR], content: 'pts-dashboard-view' },
            { id: 'aprobacion', title: 'Aprobación', roles: [ROLES.SUPERVISOR], content: 'approval-list-view' },
            { id: 'firma-biometrica', title: 'Firma Biométrica', roles: [ROLES.SUPERVISOR], content: 'firma-biometrica-view' },
            { id: 'cierre-rto', title: 'Cierre PTS', roles: [ROLES.SUPERVISOR], content: 'cierre-rto-view' },
            { id: 'formulario-rto', title: 'RTOs', roles: [ROLES.SUPERVISOR], content: 'formulario-rto-view' }
        ],
        [ROLES.EJECUTANTE]: [
            { id: 'dashboard', title: 'Dashboards', roles: [ROLES.EJECUTANTE], content: 'pts-dashboard-view' },
            { id: 'ejecucion', title: 'Tareas', roles: [ROLES.EJECUTANTE], content: 'execution-view' }
        ]
    };

    const routes = [...base, ...(roleSpecific[role] || [])];
    return routes;
};

// Navegacion (Sidebar lateral)
const Navigation = ({ role, onInicioClick, onLogout, user }) => {
    const routes = getRoutes(role);
    const location = useLocation();
    
    const getRouterPath = (route) => {
        switch (route.id) {
            case 'crear-pts': return '/pts/nuevo';
            case 'mis-pts': return '/mis-pts';
            case 'aprobacion': return '/aprobacion';
            case 'firma-biometrica': return '/firma-biometrica';
            case 'cierre-rto': return '/cierre-rto';
            case 'formulario-rto': return '/formulario-rto';
            case 'reportes': return '/reportes';
            case 'dashboard': return '/?view=dashboard';
            case 'inicio': return '/';
            default: return '/?view=dashboard';
        }
    };

    const getIcon = (id) => {
        switch (id) {
            case 'inicio': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
            case 'dashboard': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
            case 'crear-pts': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
            case 'mis-pts': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
            case 'aprobacion': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
            case 'cierre-rto': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
            case 'formulario-rto': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>;
            case 'reportes': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
            default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
        }
    };
    
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>eEEq</span>
            </div>
            <nav className="sidebar-nav">
                {routes.map(route => {
                    if (route.id === 'firma-biometrica') return null;
                    const path = getRouterPath(route);
                    const isActive = location.pathname === path || (route.id === 'inicio' && location.pathname === '/');
                    return (
                        <Link
                            key={route.id}
                            to={path}
                            onClick={route.id === 'inicio' ? onInicioClick : undefined}
                            className={`sidebar-link${isActive ? ' active' : ''}`}
                        >
                            {getIcon(route.id)}
                            {route.title}
                        </Link>
                    );
                })}
                <Link to="/admin/equipos" className="sidebar-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                    QR Equipos
                </Link>
                {role === ROLES.ADMIN && (
                    <Link to="/admin/usuarios" className="sidebar-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        Usuarios
                    </Link>
                )}
            </nav>
            <div style={{ marginTop: 'auto', padding: '16px 12px' }}>
                <button
                    onClick={onLogout}
                    className="sidebar-link"
                    style={{ color: '#f87171', width: '100%' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Salir
                </button>
            </div>
        </aside>
    );
};

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

// Componente de Login (HU-001)
const LoginView = ({ handleLogin }) => {
    const navigate = useNavigate();
    const [legajo, setLegajo] = useState('VINF011422');
    const [password, setPassword] = useState('VINF011422');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!legajo || !password) {
            setError("Por favor ingrese legajo y contraseña.");
            return;
        }
        await handleLogin(legajo, password, setError);
    };

    return (
        <div className="login-page">
            <div className="login-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>eEEq</span>
            </div>
            <div className="login-card">
                <h2>Bienvenido de Nuevo</h2>
                <p className="login-subtitle">Ingrese sus credenciales para acceder al sistema de Entrega de equipos.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="legajo">Usuario</label>
                        <input
                            type="text" id="legajo" required
                            value={legajo}
                            onChange={(e) => setLegajo(e.target.value)}
                            placeholder="ej: operador@eeeq.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <input
                            type="password" id="password" required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: 8 }}>
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem', marginTop: 8 }}
                        onClick={() => navigate('/cambiar-contrasena')}
                    >
                        Cambiar Contraseña
                    </button>
                    {error && <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: '0.875rem' }}>{error}</div>}
                </form>
                <div className="login-demo">
                    <div className="login-demo-buttons">
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de selección de rol (cuando el usuario tiene múltiples roles)
const RoleSelector = ({ roles, onSelect, onCancel }) => {
    const roleLabels = {
        'EMISOR': { label: 'Emisor', desc: 'Crear y gestionar Permisos de Trabajo Seguro' },
        'SUPERVISOR': { label: 'Supervisor', desc: 'Aprobar, firmar y cerrar PTS' },
        'EJECUTANTE': { label: 'Ejecutante', desc: 'Ver y ejecutar tareas asignadas' },
        'ADMIN': { label: 'Administrador', desc: 'Gestión completa del sistema' },
        'RTO_MANT': { label: 'RTO Mantenimiento', desc: 'Gestión de cierre PTS' },
        'EHS': { label: 'EH&S', desc: 'Seguridad, Salud y Medio Ambiente' },
        'LIDER': { label: 'Líder', desc: 'Liderazgo y coordinación de equipos' },
    };

    return (
        <div className="login-page">
            <div className="login-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>eEEq</span>
            </div>
            <div className="login-card">
                <h2 style={{ textAlign: 'center' }}>Seleccionar Rol</h2>
                <p className="login-subtitle" style={{ textAlign: 'center' }}>
                    Tu usuario tiene múltiples roles. Seleccioná con cuál querés ingresar.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {roles.map(role => {
                            const info = roleLabels[role] || { label: role, desc: '' };
                            return (
                                <button
                                    key={role}
                                    onClick={() => onSelect(role)}
                                    className="btn btn-outline"
                                    style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', gap: 12 }}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', display: 'block' }}>{info.label}</span>
                                        {info.desc && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{info.desc}</span>}
                                    </div>
                                </button>
                            );
                        })}
                </div>
                <button
                    onClick={onCancel}
                    style={{ width: '100%', marginTop: 16, background: 'none', color: '#6b7280', fontSize: '0.875rem', textDecoration: 'underline' }}
                >
                    Cancelar y volver al login
                </button>
            </div>
        </div>
    );
};

// Componente para mostrar PTS listos para cierre PTS
const RTOClosureList = ({ onSelectPts }) => {
    const [ptsList, setPtsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllPTS = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                // Obtener legajo del usuario logueado
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userLegajo = payload.sub;

                const response = await fetch('/api/pts', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                // Filtrar PTS firmados pero no cerrados, asignados al supervisor logueado
                const readyForRTO = data.filter(pts => {
                    const hasFirma = pts.firmaSupervisorBase64;
                    const notClosed = (!pts.rtoEstado || pts.rtoEstado !== 'CERRADO');
                    const isAssignedSupervisor = pts.supervisorLegajo === userLegajo;
                    return hasFirma && notClosed && isAssignedSupervisor;
                });
                setPtsList(readyForRTO);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPTS();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 16, color: '#64748b' }}>Cargando PTS listos para cierre...</div>;
    if (error) return <div style={{ color: '#dc2626', padding: 16 }}>Error: {error}</div>;
    if (ptsList.length === 0) return <div style={{ color: '#64748b', padding: 16 }}>No hay PTS listos para cierre PTS.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2332', marginBottom: 8 }}>PTS Firmados - Listos para Cierre PTS</h4>
            {ptsList.map(pts => (
                <div key={pts.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5 style={{ fontWeight: 600, color: '#1a2332' }}>PTS: {pts.id}</h5>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{pts.descripcionTrabajo}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Firmado por: {pts.dniSupervisorFirmante} | Ubicación: {pts.ubicacion}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#059669' }}>
                                Firmado el: {pts.fechaHoraFirmaSupervisor ? new Date(pts.fechaHoraFirmaSupervisor).toLocaleString() : 'Fecha no disponible'}
                            </p>
                        </div>
                        <button
                            onClick={() => onSelectPts(pts)}
                            className="btn"
                            style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                        >
                            Cerrar RTO
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Componente para listar RTOs existentes
const RTOListView = ({ onSelectRto }) => {
    const [rtoList, setRtoList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRtos = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/rto', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`Error ${response.status}`);
                const data = await response.json();
                setRtoList(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRtos();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 16, color: '#64748b' }}>Cargando RTOs...</div>;
    if (error) return <div style={{ color: '#dc2626', padding: 16 }}>Error: {error}</div>;
    if (rtoList.length === 0) return (
        <div style={{ textAlign: 'center', padding: 32, background: '#fffbf5', borderRadius: 10, border: '1px solid #fed7aa' }}>
            <p style={{ color: '#92400e', fontSize: '1rem', fontWeight: 600 }}>No hay RTOs generados aún.</p>
            <p style={{ color: '#b45309', fontSize: '0.85rem', marginTop: 8 }}>Los RTOs se crean automáticamente al cerrar un PTS con la opción "Requiere Formulario RTO = Sí".</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2332', marginBottom: 8 }}>RTOs Generados</h4>
            {rtoList.map(rto => (
                <div key={rto.id} className="card" style={{ padding: 16, borderLeft: `4px solid ${rto.estado === 'ABIERTO' ? '#f59e0b' : '#16a34a'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5 style={{ fontWeight: 600, color: '#1a2332' }}>{rto.id}</h5>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Equipo: {rto.equipoTag}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                PTS asociados: {(rto.ptsIds || []).join(', ') || 'Ninguno'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Especialidades: {(rto.especialidades || []).map(e => `${e.nombre}${e.cerrada ? ' -' : ''}`).join(', ') || 'Sin definir'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Creado: {rto.fechaCreacion ? new Date(rto.fechaCreacion).toLocaleString() : 'N/D'}
                            </p>
                            <span style={{
                                display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                background: rto.estado === 'ABIERTO' ? '#fef3c7' : '#dcfce7',
                                color: rto.estado === 'ABIERTO' ? '#92400e' : '#166534'
                            }}>
                                {rto.estado === 'ABIERTO' ? 'Abierto' : 'Cerrado'}
                            </span>
                        </div>
                        <button
                            onClick={() => onSelectRto(rto)}
                            className="btn"
                            style={{ background: '#7c2d12', color: '#fff', border: 'none' }}
                        >
                            {rto.estado === 'ABIERTO' ? 'Completar RTO' : 'Ver RTO'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Para mostrar PTS pendientes de firma
const PendingApprovalList = ({ onFirmar }) => {
    const [ptsList, setPtsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingPTS();
    }, []);

    const fetchPendingPTS = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/pts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // Obtener legajo del usuario logueado
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userLegajo = payload.sub;
            // Filtrar solo PTS sin firmar asignados al supervisor logueado
            const pendingPts = data.filter(pts => !pts.firmaSupervisorBase64 && pts.supervisorLegajo === userLegajo);
            setPtsList(pendingPts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 16, color: '#64748b' }}>Cargando PTS pendientes...</div>;
    if (error) return <div style={{ color: '#dc2626', padding: 16 }}>Error: {error}</div>;
    if (ptsList.length === 0) return <div style={{ color: '#64748b', padding: 16 }}>No hay PTS pendientes de aprobación.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2332', marginBottom: 8 }}>PTS Pendientes de Firma</h4>
            {ptsList.map(pts => (
                <div key={pts.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5 style={{ fontWeight: 600, color: '#1a2332' }}>PTS: {pts.id}</h5>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{pts.descripcionTrabajo}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Supervisor asignado: {pts.supervisorLegajo} | Ubicación: {pts.ubicacion}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                onFirmar(pts);
                            }}
                            className="btn btn-primary"
                        >
                            Firmar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Aca para el contenido de la aplicacion
const AppContent = ({ user, currentView, setCurrentView, onSwitchRole, availableRoles }) => {
    // Validar que user no sea null
    if (!user) {
        return null; // o un componente de loading
    }
    
    const { legajo, role } = user;
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedPts, setSelectedPts] = useState(null);
    const [showFirmaComponent, setShowFirmaComponent] = useState(false);
    const [selectedPtsForRTO, setSelectedPtsForRTO] = useState(null);
    const [showRTOComponent, setShowRTOComponent] = useState(false);
    const [selectedRto, setSelectedRto] = useState(null);
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    
    // Detectar parametro view en la URL
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');

    // Permitir que activeView.content sea 'pts-dashboard-view' o 'equipos-dashboard-view'
    let activeView = currentView;
    if (viewParam === 'dashboard') {
        // Si el usuario navega a /?view=dashboard, por defecto mostrar permisos
        activeView = { title: 'Dashboards', content: currentView && currentView.content === 'equipos-dashboard-view' ? 'equipos-dashboard-view' : 'pts-dashboard-view' };
    }

    useEffect(() => {
        setShowRoleMenu(false);
    }, [role]);

    // Funcion para manejar la seleccion de PTS para firmar
    const handleFirmar = (pts) => {
        setSelectedPts(pts);
        setShowFirmaComponent(true);
        setCurrentView({ title: 'Firma Biométrica', content: 'firma-biometrica-view' });
        navigate('/firma-biometrica');
    };

    // Funcion para manejar la seleccion de PTS para cerrar RTO
    const handleSelectPtsForRTO = (pts) => {
        setSelectedPtsForRTO(pts);
        setShowRTOComponent(true);
        setCurrentView({ title: 'Cierre PTS', content: 'cierre-rto-view' });
        navigate('/cierre-rto');
    };

    // Funcion para manejar el exito de la firma
    const handleFirmaExitosa = () => {
        setSelectedPts(null);
        setShowFirmaComponent(false);
        // Refrescar la vista de aprobacion y forzar recarga
        setCurrentView({ title: 'Aprobación', content: 'approval-list-view', refresh: Date.now() });
    };

    // Funcion para manejar el exito del cierre PTS
    const handleRTOExitoso = (responseData) => {
        setSelectedPtsForRTO(null);
        setShowRTOComponent(false);
        // Si el PTS generó un RTO, navegar al formulario RTO
        if (responseData && responseData.rtoAsociadoId) {
            setSelectedRto({
                id: responseData.rtoAsociadoId,
                equipoTag: responseData.equipoOInstalacion,
                ptsIds: [responseData.id],
            });
            setCurrentView({ title: 'Formulario RTO', content: 'formulario-rto-view' });
            navigate('/formulario-rto');
        } else {
            setCurrentView({ title: 'Cierre PTS', content: 'cierre-rto-view' });
        }
    };

    // Funcion para seleccionar un RTO de la lista
    const handleSelectRto = (rto) => {
        setSelectedRto(rto);
        setCurrentView({ title: 'Formulario RTO', content: 'formulario-rto-view' });
    };

    // Logica para cargar el contenido simulado (HU-002)
    const loadContent = (viewId) => {
        switch (viewId) {
                        case 'pts-dashboard-view':
                                return (
                                    <>
                                        <ListaPTS />
                                        <DashboardEquipos />
                                    </>
                                );
            case 'pts-form-view':
                return <CrearPTS />;
            case 'approval-list-view':
                return (
                    <>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, color: '#0d7377' }}>Aprobación de PTS (SUPERVISOR)</h3>
                        <p style={{ color: '#64748b', marginBottom: 24 }}>Listado de Permisos pendientes de su revisión y firma.</p>
                        <PendingApprovalList onFirmar={handleFirmar} />
                    </>
                );
            case 'firma-biometrica-view':
                return (
                    <>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, color: '#0d7377' }}>Firma Biométrica de PTS</h3>
                        {showFirmaComponent && selectedPts ? (
                            <div>
                                <div style={{ marginBottom: 16, padding: 16, background: '#f0fafa', borderRadius: 10, border: '1px solid #b2dfdb' }}>
                                    <h4 style={{ fontWeight: 600, color: '#0d7377' }}>PTS Seleccionado:</h4>
                                    <p style={{ color: '#0a5c5f' }}>{selectedPts.id} - {selectedPts.descripcionTrabajo}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#0d7377' }}>Supervisor asignado: {selectedPts.supervisorLegajo}</p>
                                </div>
                                <FirmaBiometrica 
                                    ptsId={selectedPts.id} 
                                    dniFirmante={legajo}
                                    onFirmaExitosa={handleFirmaExitosa}
                                />
                                <button 
                                    onClick={() => { setSelectedPts(null); setShowFirmaComponent(false); }}
                                    className="btn btn-outline"
                                    style={{ marginTop: 16 }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 32, background: '#f0fafa', borderRadius: 10 }}>
                                <p style={{ color: '#64748b', marginBottom: 16 }}>No hay PTS seleccionado para firmar.</p>
                                <button 
                                    onClick={() => setCurrentView({ title: 'Aprobación', content: 'approval-list-view' })}
                                    className="btn btn-primary"
                                >
                                    Ir a Lista de Aprobaciones
                                </button>
                            </div>
                        )}
                    </>
                );
            case 'cierre-rto-view':
                return (
                    <>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, color: '#0d7377' }}>Cerrar Permiso de Trabajo Seguro</h3>
                        {showRTOComponent && selectedPtsForRTO ? (
                            <div>
                                <div style={{ marginBottom: 16, padding: 16, background: '#fef2f2', borderRadius: 10, border: '1px solid #fca5a5' }}>
                                    <h4 style={{ fontWeight: 600, color: '#991b1b' }}>PTS Seleccionado para Cierre:</h4>
                                    <p style={{ color: '#b91c1c' }}>{selectedPtsForRTO.id} - {selectedPtsForRTO.descripcionTrabajo}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626' }}>Firmado por: {selectedPtsForRTO.dniSupervisorFirmante}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626' }}>Fecha de firma: {selectedPtsForRTO.fechaHoraFirmaSupervisor ? new Date(selectedPtsForRTO.fechaHoraFirmaSupervisor).toLocaleString() : 'No disponible'}</p>
                                </div>
                                <CierrePTS 
                                    ptsId={selectedPtsForRTO.id} 
                                    responsableLegajo={legajo}
                                    onSuccess={handleRTOExitoso}
                                    onCancel={() => { setSelectedPtsForRTO(null); setShowRTOComponent(false); }}
                                />
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: '#64748b', marginBottom: 24 }}>Listado de PTS firmados y listos para cierre (Retorno a Operaciones).</p>
                                <RTOClosureList onSelectPts={handleSelectPtsForRTO} />
                            </div>
                        )}
                    </>
                );
            case 'my-pts-list-view':
                return (
                    <ListaPTS
                        defaultFilter="MIS_PTS"
                        onSelectPtsParaFirma={handleFirmar}
                        onSelectPtsParaCierre={handleSelectPtsForRTO}
                    />
                );
            case 'formulario-rto-view':
                return (
                    <>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, color: '#7c2d12' }}>Formulario RTO (Retorno a Operaciones)</h3>
                        {selectedRto ? (
                            <FormularioRTO
                                rtoId={selectedRto.id}
                                ptsIds={selectedRto.ptsIds || []}
                                equipoTag={selectedRto.equipoTag}
                                onSuccess={() => { setSelectedRto(null); setCurrentView({ title: 'Formulario RTO', content: 'formulario-rto-view', refresh: Date.now() }); }}
                                onCancel={() => { setSelectedRto(null); }}
                            />
                        ) : (
                            <div>
                                <p style={{ color: '#64748b', marginBottom: 24 }}>Listado de RTOs generados a partir del cierre de PTS.</p>
                                <RTOListView onSelectRto={handleSelectRto} />
                            </div>
                        )}
                    </>
                );
            case 'execution-view':
                return (
                    <>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, color: '#0d7377' }}>Mis Tareas de Ejecución (EJECUTANTE)</h3>
                        <p style={{ color: '#64748b' }}>Tareas asignadas por el PTS para inicio, pausa y finalización.</p>
                    </>
                );
            case 'reportes-view':
                return <ReportesView />;
            case 'inicio-view':
                return (
                    <div style={{ textAlign: 'center' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a2332', marginBottom: 16 }}>Panel de Control</h4>
                        <p style={{ color: '#64748b' }}>Selecciona una opción para comenzar</p>
                    </div>
                );
            default:
                return <ListaPTS />;
        }
    };

    return (
        <section>
            {/* Selector de Dashboards */}
            {activeView.title === 'Dashboards' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button
                        className={`btn ${activeView.content === 'pts-dashboard-view' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentView({ title: 'Dashboards', content: 'pts-dashboard-view' })}
                    >
                        Permisos
                    </button>
                    <button
                        className={`btn ${activeView.content === 'equipos-dashboard-view' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentView({ title: 'Dashboards', content: 'equipos-dashboard-view' })}
                    >
                        Equipos
                    </button>
                </div>
            )}

            <div className="card">
                {activeView.title === 'Dashboards' ? (
                    <>
                        <div id="content-container">
                            {activeView.content === 'pts-dashboard-view' && (
                                <ListaPTS 
                                    onSelectPtsParaFirma={handleFirmar}
                                    onSelectPtsParaCierre={handleSelectPtsForRTO}
                                />
                            )}
                            {activeView.content === 'equipos-dashboard-view' && <DashboardEquipos />}
                        </div>
                        {activeView.content === 'equipos-dashboard-view' && <DcsSimForm />}
                    </>
                ) : (
                    <>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: '#1a2332' }}>{activeView.title}</h3>
                        <div id="content-container">
                            {loadContent(activeView.content)}
                        </div>
                    </>
                )}
            </div>

            {/* Botones de Accion Rapida */}
            <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
                {role === ROLES.EMISOR && (
                    <button
                        onClick={() => {
                            navigate('/pts/nuevo');
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new Event('resetCrearPTS'));
                            }
                        }}
                        className="btn btn-primary"
                        style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                    >
                        + Crear Nuevo PTS
                    </button>
                )}
                {role === ROLES.SUPERVISOR && (
                    <>
                        <button
                            onClick={() => { setCurrentView({ title: 'Aprobación', content: 'approval-list-view' }); navigate('/aprobacion'); }}
                            className="btn btn-primary"
                            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                        >
                            Revisar Aprobaciones
                        </button>
                        <button
                            onClick={() => { setCurrentView({ title: 'Cierre PTS', content: 'cierre-rto-view' }); navigate('/cierre-rto'); }}
                            className="btn btn-primary"
                            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                        >
                            Cierre PTS
                        </button>
                    </>
                )}
                {role === ROLES.EJECUTANTE && (
                    <button
                        onClick={() => setCurrentView({ title: 'Tareas', content: 'execution-view' })}
                        className="btn btn-primary"
                        style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                    >
                        Ver Tareas Asignadas
                    </button>
                )}
            </div>

            {/* Botón Cambiar Rol */}
            {availableRoles && availableRoles.length > 1 && onSwitchRole && (
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                    <div className="relative">
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowRoleMenu(prev => !prev)}
                        >
                            Cambiar Rol (actual: {role})
                        </button>
                        <div className={`${showRoleMenu ? '' : 'hidden'} absolute`} style={{ left: '50%', transform: 'translateX(-50%)', marginTop: 8, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2eff1', zIndex: 20, minWidth: 220 }}>
                            {availableRoles.filter(r => r !== role).map(r => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setShowRoleMenu(false);
                                        onSwitchRole(r);
                                    }}
                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#1a2332', fontSize: '0.9rem' }}
                                    onMouseOver={(e) => e.target.style.background = '#f5fbfb'}
                                    onMouseOut={(e) => e.target.style.background = 'none'}
                                >
                                    Ingresar como {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

// Ruta protegida
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente Principal de la Aplicacion
const App = () => {
    // Definición de colores para Tailwind (!!!si esta configurado revisar)
    // Esto se incluye aquí solo como recordatorio, la configuración real debe estar en tailwind.config.js
    /*
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'primary-epu': '#003366', // Azul oscuro
                    'secondary-epu': '#f0b323', // Amarillo/Naranja de contraste
                }
            }
        }
    }
    */

    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState({ title: 'Inicio', content: 'inicio-view' });
    const [selectedPtsId, setSelectedPtsId] = useState(null);
    const [pendingRoles, setPendingRoles] = useState(null); // Para selección de rol cuando hay múltiples
    const [pendingPasswordChange, setPendingPasswordChange] = useState(null); // Legajo del usuario que debe cambiar contraseña

    // Función para manejar la navegación interna
    const handleNavigate = useCallback((title, content) => {
        setCurrentView({ title, content });
    }, []);

    // Función especial para manejar el clic en "Inicio"
    const handleInicioClick = () => {
        setCurrentView({ title: 'Inicio', content: 'inicio-view' });
    };

    // Función para procesar el token y establecer el usuario
    const processAuthToken = useCallback((token, selectedRole) => {
        if (!token) {
            setUser(null);
            return;
        }

        const claims = decodeToken(token);
        if (claims && claims.exp * 1000 > Date.now()) {
            // Obtener todos los roles sin prefijo "ROLE_"
            const allRoles = (claims.roles || []).map(r => r.replace('ROLE_', ''));
            const role = selectedRole || allRoles[0];
            
            setUser({
                legajo: claims.sub,
                role: role,
            });
            return true;
        } else {
            localStorage.removeItem('authToken');
            setAuthToken(null);
            setUser(null);
            return false;
        }
    }, []);

    // Inicialización y chequeo de token al cargar
    useEffect(() => {
        processAuthToken(authToken);
    }, [authToken, processAuthToken]);

    // Lógica de Login
    const handleLogin = async (legajo, password, setError) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ legajo, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error de Legajo o Contraseña.");
            }

            const data = await response.json();
            const newToken = data.token;

            // Guardar token siempre para poder autorizar endpoints protegidos
            localStorage.setItem('authToken', newToken);
            setAuthToken(newToken);

            // Verificar si debe cambiar contraseña antes de continuar
            console.log('[LOGIN] requiresPasswordChange:', data.requiresPasswordChange, '| response:', data);
            if (data.requiresPasswordChange) {
                setPendingPasswordChange(legajo);
                return;
            }

            // Verificar si tiene múltiples roles
            const claims = decodeToken(newToken);
            const allRoles = (claims?.roles || []).map(r => r.replace('ROLE_', ''));

            if (allRoles.length > 1) {
                // Múltiples roles: mostrar selector
                setPendingRoles(allRoles);
            } else {
                // Un solo rol: continuar directamente
                completeLogin(newToken, allRoles[0]);
            }

        } catch (error) {
            console.error("Login fallido:", error);
            const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
            setError(isNetworkError ? "Error de conexión. Verifique que el servidor esté disponible." : (error.message || "Legajo o contraseña inválidos."));
        }
    };

    // Completar login con el rol seleccionado
    const completeLogin = (token, selectedRole) => {
        processAuthToken(token, selectedRole);
        setPendingRoles(null);
        const routes = getRoutes(selectedRole);
        const defaultRoute = routes.find(r => r.defaultView) || routes[0];
        handleNavigate(defaultRoute.title, defaultRoute.content || defaultRoute.id + '-view');
    };

    // Callback cuando el usuario selecciona un rol
    const handleRoleSelect = (selectedRole) => {
        completeLogin(authToken, selectedRole);
    };

    // Obtener todos los roles del token actual
    const getUserRoles = useCallback(() => {
        if (!authToken) return [];
        const claims = decodeToken(authToken);
        if (!claims) return [];
        return (claims.roles || []).map(r => r.replace('ROLE_', ''));
    }, [authToken]);

    // Cambiar de rol sin cerrar sesión
    const handleSwitchRole = (newRole) => {
        processAuthToken(authToken, newRole);
        const routes = getRoutes(newRole);
        const defaultRoute = routes.find(r => r.defaultView) || routes[0];
        handleNavigate(defaultRoute.title, defaultRoute.content || defaultRoute.id + '-view');
    };

    // Lógica de Logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
        setSelectedPtsId(null);
        setPendingRoles(null);
        handleNavigate('Inicio', 'inicio-view');
    };

    // Funciones de navegación para React Router
    const handleSelectParaFirma = (id) => {
        setSelectedPtsId(id);
    };



    const handleSuccess = () => {
        setSelectedPtsId(null);
    };

    return (
        <BrowserRouter>
            <div className={user ? 'app-shell' : ''}>
            
            {/* Sidebar - solo cuando está autenticado */}
            {user && (
                <Navigation 
                    role={user.role} 
                    onInicioClick={handleInicioClick} 
                    onLogout={handleLogout} 
                    user={user} 
                />
            )}

            {/* Contenido Principal */}
            <div className={user ? 'main-content' : ''}>
                {/* Top Bar - solo cuando está autenticado */}
                {user && (
                    <div className="top-bar">
                        <h1 className="top-bar-title">eEEq — Entrega de Equipos</h1>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {user.legajo} &middot; {user.role}
                        </span>
                    </div>
                )}

                <div className={user ? 'page-content' : ''}>
                <Routes>
                                        {/* Ruta protegida para administración de equipos y QR */}
                                        <Route 
                                            path="/admin/equipos" 
                                            element={
                                                <ProtectedRoute>
                                                    <AdminEquiposView />
                                                </ProtectedRoute>
                                            }
                                        />
                                        {/* Ruta protegida para gestión de usuarios */}
                                        <Route 
                                            path="/admin/usuarios" 
                                            element={
                                                <ProtectedRoute>
                                                    <UsuariosView />
                                                </ProtectedRoute>
                                            }
                                        />
                    {/* Ruta pública para estado de equipo por QR */}
                    <Route 
                        path="/equipo/:tag" 
                        element={<EquipoStatusView />} 
                    />
                    {/* Ruta de login */}
                    <Route 
                        path="/login" 
                        element={
                            pendingPasswordChange ? (
                                <Navigate to="/cambiar-contrasena" replace />
                            ) : pendingRoles ? (
                                <RoleSelector 
                                    roles={pendingRoles} 
                                    onSelect={handleRoleSelect} 
                                    onCancel={() => { setPendingRoles(null); handleLogout(); }}
                                />
                            ) : authToken && user ? (
                                <Navigate to="/" replace />
                            ) : (
                                <LoginView handleLogin={handleLogin} />
                            )
                        } 
                    />
                    {/* Ruta de cambio de contraseña (primer ingreso o voluntario) */}
                    <Route 
                        path="/cambiar-contrasena" 
                        element={
                            pendingPasswordChange ? (
                                <CambiarContrasena 
                                    legajo={pendingPasswordChange} 
                                    onPasswordChanged={() => {
                                        setPendingPasswordChange(null);
                                        localStorage.removeItem('authToken');
                                        setAuthToken(null);
                                        setUser(null);
                                    }}
                                />
                            ) : authToken && user ? (
                                <CambiarContrasena
                                    legajo={user.legajo || user.sub || user.username}
                                    onPasswordChanged={() => {
                                        localStorage.removeItem('authToken');
                                        setAuthToken(null);
                                        setUser(null);
                                    }}
                                />
                            ) : (
                                <CambiarContrasena
                                    selfService
                                />
                            )
                        } 
                    />
                    
                    {/* Ruta principal - Dashboard */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Ruta mis PTS */}
                    <Route 
                        path="/mis-pts" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={{ title: 'Mis PTS', content: 'my-pts-list-view' }}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Ruta crear nuevo PTS */}
                    <Route 
                        path="/pts/nuevo" 
                        element={
                            <ProtectedRoute>
                                <CrearPTS onPtsCreado={handleSuccess} />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Ruta detalle de PTS */}
                    <Route 
                        path="/pts/:id" 
                        element={
                            <ProtectedRoute>
                                <DetallePTS />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Ruta de reportes */}
                    <Route 
                        path="/reportes" 
                        element={
                            <ProtectedRoute>
                                <ReportesView />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Rutas específicas del SUPERVISOR */}
                    <Route 
                        path="/aprobacion" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={{ title: 'Aprobación', content: 'approval-list-view' }}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/firma-biometrica" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={{ title: 'Firma Biométrica', content: 'firma-biometrica-view' }}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/cierre-rto" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={{ title: 'Cierre PTS', content: 'cierre-rto-view' }}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/formulario-rto" 
                        element={
                            <ProtectedRoute>
                                <AppContent 
                                    user={user}
                                    currentView={{ title: 'Formulario RTO', content: 'formulario-rto-view' }}
                                    setCurrentView={setCurrentView}
                                    onSwitchRole={handleSwitchRole}
                                    availableRoles={getUserRoles()}
                                />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Catch-all - redirigir según autenticación */}
                    <Route 
                        path="*" 
                        element={
                            authToken ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
                        } 
                    />
                </Routes>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: 32, paddingBottom: 16 }}>&copy; 2025 eEEq - Sergio Omar Capella</p>
                </div>
            </div>
            </div>
        </BrowserRouter>
    );
};

export default App;