// Maneja la selección de PTS para cierre desde fuera de AppContent
function handleSelectParaCierre(pts) {
    window.location.href = '/cierre-rto';
}
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import FirmaBiometrica from './components/FirmaDigital';
import EquipoStatusView from './components/EquipoStatusView';
import CierreRTO from './components/CierreRTO';
import CrearPTS from './components/CrearPTS';
import ListaPTS from './components/ListaPTS';
import DashboardEquipos from './components/DashboardEquipos';
import DetallePTS from './components/DetallePTS';
import AdminEquiposView from './components/AdminEquiposView';
import AgregarUsuario from './components/AgregarUsuario';
import ReportesView from './components/ReportesView';
import DcsSimForm from './components/DcsSimForm';
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
            { id: 'mis-pts', title: 'Mis PTS', roles: [ROLES.EMISOR], content: 'my-pts-list-view' }
        ],
        [ROLES.SUPERVISOR]: [
            { id: 'dashboard', title: 'Dashboards', roles: [ROLES.SUPERVISOR], content: 'pts-dashboard-view' },
            { id: 'aprobacion', title: 'Aprobación', roles: [ROLES.SUPERVISOR], content: 'approval-list-view' },
            { id: 'firma-biometrica', title: 'Firma Biométrica', roles: [ROLES.SUPERVISOR], content: 'firma-biometrica-view' },
            { id: 'cierre-rto', title: 'Cierre RTO', roles: [ROLES.SUPERVISOR], content: 'cierre-rto-view' }
        ],
        [ROLES.EJECUTANTE]: [
            { id: 'dashboard', title: 'Dashboards', roles: [ROLES.EJECUTANTE], content: 'pts-dashboard-view' },
            { id: 'ejecucion', title: 'Tareas', roles: [ROLES.EJECUTANTE], content: 'execution-view' }
        ]
    };

    const routes = [...base, ...(roleSpecific[role] || [])];
    return routes;
};

// Navegacion (Menu superior)
const Navigation = ({ role, onInicioClick }) => {
    const routes = getRoutes(role);
    
    // Funcion para mapear las rutas internas a URLs de React Router
    const getRouterPath = (route) => {
        switch (route.id) {
            case 'crear-pts':
                return '/pts/nuevo';
            case 'mis-pts':
                return '/mis-pts';
            case 'aprobacion':
                return '/aprobacion';
            case 'firma-biometrica':
                return '/firma-biometrica';
            case 'cierre-rto':
                return '/cierre-rto';
            case 'reportes':
                return '/reportes';
            case 'dashboard':
                return '/?view=dashboard';
            case 'inicio':
                return '/'; // Inicio va a la pantalla principal
            default:
                return '/?view=dashboard'; // Dashboards por defecto
        }
    };
    
    return (
        <nav className="flex items-center space-x-6">
            {routes.map(route => {
                // Eliminar el botón de Firma Biométrica del header
                if (route.id === 'firma-biometrica') return null;
                if (route.id === 'inicio') {
                    return (
                        <Link
                            key={route.id}
                            to={getRouterPath(route)}
                            onClick={onInicioClick}
                            className="text-primary-epu hover:text-primary-epu font-bold transition-all duration-300 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 border-b-6 border-yellow-700 hover:border-yellow-800 active:translate-y-1 active:shadow-lg relative overflow-hidden no-underline flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, #f4c042, #e6b030, #d49e20)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                textDecoration: 'none',
                                width: '150px',
                                height: '60px'
                            }}
                        >
                            {route.title}
                        </Link>
                    );
                }
                return (
                    <Link
                        key={route.id}
                        to={getRouterPath(route)}
                        className="text-primary-epu hover:text-primary-epu font-bold transition-all duration-300 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 border-b-6 border-yellow-700 hover:border-yellow-800 active:translate-y-1 active:shadow-lg relative overflow-hidden no-underline flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(145deg, #f4c042, #e6b030, #d49e20)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            textDecoration: 'none',
                            width: '150px',
                            height: '60px'
                        }}
                    >
                        {route.title}
                    </Link>
                );
            })}
            {/* Link a la administración de equipos y QR */}
            <Link
                to="/admin/equipos"
                className="text-primary-epu hover:text-primary-epu font-bold transition-all duration-300 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 border-b-6 border-yellow-700 hover:border-yellow-800 active:translate-y-1 active:shadow-lg relative overflow-hidden no-underline flex items-center justify-center"
                style={{
                    background: 'linear-gradient(145deg, #f4c042, #e6b030, #d49e20)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    textDecoration: 'none',
                    width: '150px',
                    height: '60px',
                    marginLeft: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                <span style={{ width: '100%', textAlign: 'center', display: 'block' }}>Generar QRs Equipos</span>
            </Link>
            {/* Link a agregar usuario (solo ADMIN) */}
            {role === ROLES.ADMIN && <Link
                to="/admin/usuarios/nuevo"
                className="text-primary-epu hover:text-primary-epu font-bold transition-all duration-300 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 border-b-6 border-yellow-700 hover:border-yellow-800 active:translate-y-1 active:shadow-lg relative overflow-hidden no-underline flex items-center justify-center"
                style={{
                    background: 'linear-gradient(145deg, #f4c042, #e6b030, #d49e20)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    textDecoration: 'none',
                    width: '150px',
                    height: '60px',
                    marginLeft: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                <span style={{ width: '100%', textAlign: 'center', display: 'block' }}>Agregar Usuario</span>
            </Link>}
        </nav>
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
        <section className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-16">
            <h2 className="text-3xl font-bold text-primary-epu mb-6 text-center">Inicio de Sesión eEEq</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="legajo" className="block text-sm font-medium text-gray-700 mb-1">Legajo (Usuario)</label>
                    <input
                        type="text" id="legajo" required
                        value={legajo}
                        onChange={(e) => setLegajo(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-secondary-epu focus:border-secondary-epu transition duration-150"
                        placeholder="Ej: VINF011422"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                        type="password" id="password" required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-secondary-epu focus:border-secondary-epu transition duration-150"
                        placeholder="Contraseña"
                    />
                </div>
                <button type="submit"
                        className="w-full bg-secondary-epu hover:bg-yellow-600 text-primary-epu font-bold py-3 rounded-lg shadow-lg transition duration-150 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-secondary-epu focus:ring-opacity-50">
                    Ingresar
                </button>
                {error && <div className="text-red-500 text-center mt-3">{error}</div>}
                <p className="text-sm text-center text-gray-500 mt-4">
                    Usuarios de prueba: VINF011422 (EMISOR), SUP222 (SUPERVISOR), EJE444 (EJECUTANTE). Contraseña es el Legajo.
                </p>
            </form>
        </section>
    );
};

// Componente de selección de rol (cuando el usuario tiene múltiples roles)
const RoleSelector = ({ roles, onSelect, onCancel }) => {
    const roleLabels = {
        'EMISOR': { label: 'Emisor', desc: 'Crear y gestionar Permisos de Trabajo Seguro', icon: '📝' },
        'SUPERVISOR': { label: 'Supervisor', desc: 'Aprobar, firmar y cerrar PTS', icon: '✅' },
        'EJECUTANTE': { label: 'Ejecutante', desc: 'Ver y ejecutar tareas asignadas', icon: '🔧' },
        'ADMIN': { label: 'Administrador', desc: 'Gestión completa del sistema', icon: '⚙️' },
        'RTO_MANT': { label: 'RTO Mantenimiento', desc: 'Gestión de cierre RTO', icon: '🔒' },
    };

    return (
        <section className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-16">
            <h2 className="text-2xl font-bold text-primary-epu mb-2 text-center">Seleccionar Rol</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Tu usuario tiene múltiples roles. Seleccioná con cuál querés ingresar.
            </p>
            <div className="space-y-3">
                {roles.map(role => {
                    const info = roleLabels[role] || { label: role, desc: '', icon: '👤' };
                    return (
                        <button
                            key={role}
                            onClick={() => onSelect(role)}
                            className="w-full text-left px-5 py-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{info.icon}</span>
                                <div>
                                    <span className="font-bold text-gray-800 group-hover:text-primary-epu text-lg">{info.label}</span>
                                    {info.desc && <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <button
                onClick={onCancel}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
                Cancelar y volver al login
            </button>
        </section>
    );
};

// Componente para mostrar PTS listos para cierre RTO
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

    if (loading) return <div className="text-center p-4">Cargando PTS listos para cierre...</div>;
    if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
    if (ptsList.length === 0) return <div className="text-gray-600 p-4">No hay PTS listos para cierre RTO.</div>;

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">PTS Firmados - Listos para Cierre RTO</h4>
            {ptsList.map(pts => (
                <div key={pts.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-medium text-gray-900">PTS: {pts.id}</h5>
                            <p className="text-sm text-gray-600">{pts.descripcionTrabajo}</p>
                            <p className="text-xs text-gray-500">
                                Firmado por: {pts.dniSupervisorFirmante} | Ubicación: {pts.ubicacion}
                            </p>
                            <p className="text-xs text-green-600">
                                ✅ Firmado el: {pts.fechaHoraFirmaSupervisor ? new Date(pts.fechaHoraFirmaSupervisor).toLocaleString() : 'Fecha no disponible'}
                            </p>
                        </div>
                        <button
                            onClick={() => onSelectPts(pts)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            🔒 Cerrar RTO
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

    if (loading) return <div className="text-center p-4">Cargando PTS pendientes...</div>;
    if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
    if (ptsList.length === 0) return <div className="text-gray-600 p-4">No hay PTS pendientes de aprobación.</div>;

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">PTS Pendientes de Firma</h4>
            {ptsList.map(pts => (
                <div key={pts.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-medium text-gray-900">PTS: {pts.id}</h5>
                            <p className="text-sm text-gray-600">{pts.descripcionTrabajo}</p>
                            <p className="text-xs text-gray-500">
                                Supervisor asignado: {pts.supervisorLegajo} | Ubicación: {pts.ubicacion}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                onFirmar(pts);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
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
    
    // Detectar parametro view en la URL
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');

    // Permitir que activeView.content sea 'pts-dashboard-view' o 'equipos-dashboard-view'
    let activeView = currentView;
    if (viewParam === 'dashboard') {
        // Si el usuario navega a /?view=dashboard, por defecto mostrar permisos
        activeView = { title: 'Dashboards', content: currentView && currentView.content === 'equipos-dashboard-view' ? 'equipos-dashboard-view' : 'pts-dashboard-view' };
    }

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
        setCurrentView({ title: 'Cierre RTO', content: 'cierre-rto-view' });
        navigate('/cierre-rto');
    };

    // Funcion para manejar el exito de la firma
    const handleFirmaExitosa = () => {
        setSelectedPts(null);
        setShowFirmaComponent(false);
        // Refrescar la vista de aprobacion y forzar recarga
        setCurrentView({ title: 'Aprobación', content: 'approval-list-view', refresh: Date.now() });
    };

    // Funcion para manejar el exito del cierre RTO
    const handleRTOExitoso = () => {
        setSelectedPtsForRTO(null);
        setShowRTOComponent(false);
        // Refrescar la vista de cierre RTO
        setCurrentView({ title: 'Cierre RTO', content: 'cierre-rto-view' });
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
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Aprobación de PTS (SUPERVISOR)</h3>
                        <p className="text-gray-700 mb-6">Listado de Permisos pendientes de su revisión y firma.</p>
                        <PendingApprovalList onFirmar={handleFirmar} />
                    </>
                );
            case 'firma-biometrica-view':
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Firma Biométrica de PTS</h3>
                        {showFirmaComponent && selectedPts ? (
                            <div>
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900">PTS Seleccionado:</h4>
                                    <p className="text-blue-800">{selectedPts.id} - {selectedPts.descripcionTrabajo}</p>
                                    <p className="text-sm text-blue-600">Supervisor asignado: {selectedPts.supervisorLegajo}</p>
                                </div>
                                <FirmaBiometrica 
                                    ptsId={selectedPts.id} 
                                    dniFirmante={legajo}
                                    onFirmaExitosa={handleFirmaExitosa}
                                />
                                <button 
                                    onClick={() => { setSelectedPts(null); setShowFirmaComponent(false); }}
                                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    style={{ backgroundColor: '#6b7280', color: 'white' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-4">No hay PTS seleccionado para firmar.</p>
                                <button 
                                    onClick={() => setCurrentView({ title: 'Aprobación', content: 'approval-list-view' })}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
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
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Cierre RTO - Retorno a Operaciones</h3>
                        {showRTOComponent && selectedPtsForRTO ? (
                            <div>
                                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="font-semibold text-red-900">PTS Seleccionado para Cierre:</h4>
                                    <p className="text-red-800">{selectedPtsForRTO.id} - {selectedPtsForRTO.descripcionTrabajo}</p>
                                    <p className="text-sm text-red-600">Firmado por: {selectedPtsForRTO.dniSupervisorFirmante}</p>
                                    <p className="text-sm text-red-600">Fecha de firma: {selectedPtsForRTO.fechaHoraFirmaSupervisor ? new Date(selectedPtsForRTO.fechaHoraFirmaSupervisor).toLocaleString() : 'No disponible'}</p>
                                </div>
                                <CierreRTO 
                                    ptsId={selectedPtsForRTO.id} 
                                    responsableLegajo={legajo}
                                    onSuccess={handleRTOExitoso}
                                    onCancel={() => { setSelectedPtsForRTO(null); setShowRTOComponent(false); }}
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-700 mb-6">Listado de PTS firmados y listos para cierre (Retorno a Operaciones).</p>
                                <RTOClosureList onSelectPts={handleSelectPtsForRTO} />
                            </div>
                        )}
                    </>
                );
            case 'my-pts-list-view':
                return <ListaPTS defaultFilter="MIS_PTS" onSelectPtsParaFirma={handleFirmar} />;
            case 'execution-view':
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Mis Tareas de Ejecución (EJECUTANTE)</h3>
                        <p className="text-gray-700">Tareas asignadas por el PTS para inicio, pausa y finalización.</p>
                    </>
                );
            case 'reportes-view':
                return <ReportesView />;
            case 'inicio-view':
                return (
                    <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-700 mb-4">Panel de Control</h4>
                        <p className="text-gray-600">Selecciona una opción para comenzar</p>
                    </div>
                );
            default:
                return <ListaPTS />;
        }
    };

    return (
        <section className="mt-8">
            <h2 className="text-4xl font-extrabold text-primary-epu mb-8 text-center">
                Bienvenido, {legajo}
                <span className="block text-xl font-medium text-secondary-epu mt-1">({role})</span>
            </h2>

            {/* Selector de Dashboards */}
            {activeView.title === 'Dashboards' && (
                <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Dashboards</h3>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeView.content === 'pts-dashboard-view' ? 'bg-epu-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        onClick={() => setCurrentView({ title: 'Dashboards', content: 'pts-dashboard-view' })}
                    >
                        Permisos
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeView.content === 'equipos-dashboard-view' ? 'bg-epu-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        onClick={() => setCurrentView({ title: 'Dashboards', content: 'equipos-dashboard-view' })}
                    >
                        Equipos
                    </button>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-2xl border-l-8 border-secondary-epu">
                {/* Si estamos en Dashboards, mostrar el dashboard correspondiente */}
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
                        <DcsSimForm />
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">{activeView.title}</h3>
                        <div id="content-container">
                            {loadContent(activeView.content)}
                        </div>
                    </>
                )}
            </div>

            {/* Botones de Accion Rapida (Control de Roles) */}
            <div className={`mt-8 ${role === ROLES.SUPERVISOR ? 'flex justify-center gap-6' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}`}>
                {role === ROLES.EMISOR && (
                    <button
                        onClick={() => setCurrentView({ title: 'Crear PTS', content: 'pts-form-view' })}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]">
                        + Crear Nuevo PTS
                    </button>
                )}
                {role === ROLES.SUPERVISOR && (
                    <>
                        <button
                            onClick={() => setCurrentView({ title: 'Aprobación', content: 'approval-list-view' })}
                            className="bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]"
                            style={{ backgroundColor: '#111827', color: 'white' }}>
                            Revisar Aprobaciones
                        </button>
                        <button
                            onClick={() => setCurrentView({ title: 'Cierre RTO', content: 'cierre-rto-view' })}
                            className="bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]"
                            style={{ backgroundColor: '#111827', color: 'white' }}>
                            Cierre RTO
                        </button>
                    </>
                )}
                {role === ROLES.EJECUTANTE && (
                    <button
                        onClick={() => setCurrentView({ title: 'Tareas', content: 'execution-view' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]">
                        Ver Tareas Asignadas
                    </button>
                )}
            </div>

            {/* Botón Cambiar Rol (solo si el usuario tiene múltiples roles) */}
            {availableRoles && availableRoles.length > 1 && onSwitchRole && (
                <div className="mt-6 flex justify-center">
                    <div className="relative group">
                        <button
                            className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02] peer"
                            style={{ backgroundColor: '#111827', color: 'white' }}
                            onClick={(e) => {
                                const menu = e.currentTarget.nextElementSibling;
                                menu.classList.toggle('hidden');
                            }}
                        >
                            🔄 Cambiar Rol (actual: {role})
                        </button>
                        <div className="hidden absolute left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 min-w-[220px]">
                            {availableRoles.filter(r => r !== role).map(r => (
                                <button
                                    key={r}
                                    onClick={() => onSwitchRole(r)}
                                    className="block w-full text-left px-5 py-3 hover:bg-yellow-50 text-gray-800 font-semibold first:rounded-t-xl last:rounded-b-xl transition-colors"
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
            localStorage.setItem('authToken', newToken);
            setAuthToken(newToken);

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
            setError(error.message.includes('401') ? "Legajo o contraseña inválidos." : "Error de conexión. Asegúrese de que el backend esté corriendo y se haya REINICIADO con la configuración CORS.");
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
            {/* Contenedor principal de la aplicación, usa Flexbox para sticky footer */}
            <div className="bg-gray-100 min-h-screen flex flex-col">
            
            {/* Encabezado (Header) */}
            <header style={{backgroundColor: '#003366'}} className="text-white shadow-lg py-4 px-6 sticky top-0 z-10">
                <div className="container mx-auto">
                    {/* Línea Superior: Título y Usuario */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-white">eEntrega de Equipos - Prototipo</h1>
                        </div>
                        <div className="text-sm flex items-center">
                            {user ? (
                                <>
                                    <span className="font-semibold mr-12 text-white">Usuario: {user.legajo} ({user.role})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-green-600 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border-b-3 border-green-700 hover:border-red-700 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center relative overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(145deg, #16a34a, #15803d)',
                                            boxShadow: '0 6px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                            width: '100px',
                                            height: '45px'
                                        }}
                                    >
                                        Salir
                                    </button>
                                </>
                            ) : (
                                <span className="text-gray-300">Desconectado</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Línea Inferior: Solo Navegación Centrada */}
                    <div className="flex justify-center">
                        {user && <Navigation role={user.role} onInicioClick={handleInicioClick} />}
                    </div>
                </div>
            </header>

            {/* Contenido Principal con Rutas */}
            <main className="container mx-auto p-4 flex-grow">
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
                                        {/* Ruta protegida para agregar usuarios */}
                                        <Route 
                                            path="/admin/usuarios/nuevo" 
                                            element={
                                                <ProtectedRoute>
                                                    <AgregarUsuario />
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
                            pendingRoles ? (
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
                                    currentView={{ title: 'Cierre RTO', content: 'cierre-rto-view' }}
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
                    <p className="text-sm">&copy; 2025 eEEq Prototipo Tecnológico - Sergio Omar Capella</p>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;