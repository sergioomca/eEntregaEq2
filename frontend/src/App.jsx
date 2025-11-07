import React, { useState, useEffect, useCallback } from 'react';

// Constantes de Configuración
const API_URL = 'http://localhost:8080/api/auth/login';

// Estructura de navegación basada en roles
const getRoutes = (role) => {
    const base = [
        { id: 'inicio', title: 'Inicio', roles: ['EMISOR', 'SUPERVISOR', 'EJECUTANTE', 'ADMIN'], defaultView: true }
    ];

    const roleSpecific = {
        'EMISOR': [
            { id: 'crear-pts', title: 'Crear PTS', roles: ['EMISOR'], content: 'pts-form-view' },
            { id: 'mis-pts', title: 'Mis PTS', roles: ['EMISOR'], content: 'my-pts-list-view' }
        ],
        'SUPERVISOR': [
            { id: 'aprobacion', title: 'Aprobación', roles: ['SUPERVISOR'], content: 'approval-list-view' },
            { id: 'auditoria', title: 'Auditoría', roles: ['SUPERVISOR'], content: 'auditoria-view' }
        ],
        'EJECUTANTE': [
            { id: 'ejecucion', title: 'Tareas', roles: ['EJECUTANTE'], content: 'execution-view' }
        ]
    };

    const routes = [...base, ...(roleSpecific[role] || [])];
    return routes;
};

// Componente para la Navegación (Menú superior)
const Navigation = ({ role, handleNavigate }) => {
    const routes = getRoutes(role);
    return (
        <nav className="flex items-center space-x-4">
            {routes.map(route => (
                <button
                    key={route.id}
                    onClick={() => handleNavigate(route.title, route.content || route.id + '-view')}
                    className="text-white hover:text-secondary-epu font-medium transition duration-150"
                >
                    {route.title}
                </button>
            ))}
        </nav>
    );
};

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
            <h2 className="text-3xl font-bold text-primary-epu mb-6 text-center">Inicio de Sesión EPU</h2>
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

// Componente para el contenido de la aplicación
const AppContent = ({ user, currentView, setCurrentView }) => {
    const { legajo, role } = user;

    // Lógica para cargar el contenido simulado (HU-002)
    const loadContent = (viewId) => {
        switch (viewId) {
            case 'pts-form-view':
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Formulario: Creación de PTS (HU-003)</h3>
                        <p className="text-gray-700">Aquí se desarrollará el formulario para que el Emisor complete la información necesaria para un Permiso de Trabajo Seguro.</p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-secondary-epu">
                            <p className="font-semibold text-primary-epu">Requisitos de la HU-003:</p>
                            <ul className="list-disc ml-6 text-gray-600">
                                <li>Registro de datos de la tarea (tipo, ubicación, equipos).</li>
                                <li>Evaluación de riesgos inicial.</li>
                                <li>Definición de barreras de seguridad.</li>
                            </ul>
                        </div>
                    </>
                );
            case 'approval-list-view':
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Aprobación de PTS (SUPERVISOR)</h3>
                        <p className="text-gray-700">Listado de Permisos pendientes de su revisión y firma.</p>
                    </>
                );
            case 'execution-view':
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Mis Tareas de Ejecución (EJECUTANTE)</h3>
                        <p className="text-gray-700">Tareas asignadas por el PTS para inicio, pausa y finalización.</p>
                    </>
                );
            case 'inicio-view':
            default:
                return (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-primary-epu">Dashboard Principal</h3>
                        <p className="text-gray-700">Vista general de la aplicación, adaptable según los permisos de **{role}**.</p>
                    </>
                );
        }
    };

    return (
        <section className="mt-8">
            <h2 className="text-4xl font-extrabold text-primary-epu mb-8 text-center">
                Bienvenido, {legajo}
                <span className="block text-xl font-medium text-secondary-epu mt-1">({role})</span>
            </h2>

            <div className="bg-white p-8 rounded-xl shadow-2xl border-l-8 border-secondary-epu">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">{currentView.title}</h3>
                <div id="content-container">
                    {loadContent(currentView.content)}
                </div>
            </div>

            {/* Botones de Acción Rápida (Control de Roles) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {role === 'EMISOR' && (
                    <button
                        onClick={() => setCurrentView({ title: 'Crear PTS', content: 'pts-form-view' })}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]">
                        + Crear Nuevo PTS
                    </button>
                )}
                {role === 'SUPERVISOR' && (
                    <button
                        onClick={() => setCurrentView({ title: 'Aprobación', content: 'approval-list-view' })}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]">
                        Revisar Aprobaciones
                    </button>
                )}
                {role === 'EJECUTANTE' && (
                    <button
                        onClick={() => setCurrentView({ title: 'Tareas', content: 'execution-view' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]">
                        Ver Tareas Asignadas
                    </button>
                )}
            </div>
        </section>
    );
};

// Componente Principal de la Aplicación
const App = () => {
    // Definición de colores para Tailwind (Asume que está configurado)
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

    // Función para manejar la navegación interna
    const handleNavigate = useCallback((title, content) => {
        setCurrentView({ title, content });
    }, []);

    // Función para procesar el token y establecer el usuario
    const processAuthToken = useCallback((token) => {
        if (!token) {
            setUser(null);
            return;
        }

        const claims = decodeToken(token);
        if (claims && claims.exp * 1000 > Date.now()) { // Verificar expiración
            setUser({
                legajo: claims.sub,
                role: claims.rol_principal, // EMISOR, SUPERVISOR, EJECUTANTE
            });
            return true;
        } else {
            // Token expirado o inválido
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
            processAuthToken(newToken); // Procesa el nuevo token para establecer el usuario

            // Establece la vista por defecto basada en el rol recién logueado
            const claims = decodeToken(newToken);
            const role = claims?.rol_principal;
            const routes = getRoutes(role);
            const defaultRoute = routes.find(r => r.defaultView) || routes[0];
            handleNavigate(defaultRoute.title, defaultRoute.content || defaultRoute.id + '-view');

        } catch (error) {
            console.error("Login fallido:", error);
            setError(error.message.includes('401') ? "Legajo o contraseña inválidos." : "Error de conexión. Asegúrese de que el backend esté corriendo y se haya REINICIADO con la configuración CORS.");
        }
    };

    // Lógica de Logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
        handleNavigate('Inicio', 'inicio-view');
    };

    return (
        // Contenedor principal de la aplicación, usa Flexbox para sticky footer
        <div className="bg-gray-100 min-h-screen flex flex-col">
            
            {/* Encabezado (Header) */}
            <header className="bg-[#003366] text-white shadow-lg p-4 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">PTS Prototipo EPU</h1>
                    <div className="flex items-center space-x-6">
                        {user && <Navigation role={user.role} handleNavigate={handleNavigate} />}
                        <div className="text-sm flex items-center">
                            {user ? (
                                <>
                                    <span className="font-semibold mr-4 hidden sm:inline">Usuario: {user.legajo} ({user.role})</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition duration-150"
                                    >
                                        Salir
                                    </button>
                                </>
                            ) : (
                                <span className="text-gray-300">Desconectado</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="container mx-auto p-4 flex-grow">
                {user ? (
                    <AppContent user={user} currentView={currentView} setCurrentView={setCurrentView} />
                ) : (
                    <LoginView handleLogin={handleLogin} />
                )}
            </main>

            {/* Pie de Página (Footer) */}
            <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
                <p className="text-sm">&copy; 2025 EPU Prototipo Tecnológico - Sergio Omar Capella</p>
            </footer>
        </div>
    );
};

export default App;