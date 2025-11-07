import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Se usará en la Parte 9 (Routing)
/**
 * Componente funcional para el formulario de inicio de sesión.
 */
function Login() {
    // 1. Estados para capturar los datos del formulario y el manejo de errores.
    const [legajo, setLegajo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // const navigate = useNavigate(); // Descomentar en Parte 9
/**
     * 2. Manejador del envío del formulario (al hacer clic en "Ingresar").
     * @param {Event} e Evento de formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue por defecto
        setError(null);
        setLoading(true);
try {
            // 3. Petición POST a tu API de Spring Boot (Puerto 8080)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envía el DTO LoginRequest al backend
                body: JSON.stringify({ legajo, password }),
            });
// 4. Manejo de Errores de la API
            if (!response.ok) {
                // El backend devuelve 401 Unauthorized si las credenciales son incorrectas.
                // Esto cumple el criterio de aceptación de la HU-002.
                throw new Error('Credenciales inválidas. Verifique N° de Legajo y Contraseña.');
            }
// 5. Autenticación Exitosa (HTTP 200 OK)
            const data = await response.json(); // { token, requiresPasswordChange }
// 6. Almacenamiento y Redirección (HU-001 y HU-002)
            localStorage.setItem('jwtToken', data.token); // Guardar el token en el navegador
if (data.requiresPasswordChange) {
                // navigate('/cambiar-contrasena'); // Redirigir a cambio de contraseña
                alert("Login exitoso. ¡Primer Ingreso! Redirigiendo a cambio de contraseña. (Token: " + data.token + ")");
            } else {
                // navigate('/dashboard'); // Redirigir al Panel Principal
                alert("Login exitoso. Redirigiendo al Dashboard. (Token: " + data.token + ")");
            }
} catch (err) {
            // Manejo de errores de red o la excepción lanzada en el paso 4.
            setError(err.message || "Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };
return (
        <div className="login-container">
            <h2>Bienvenido</h2> 
            <form onSubmit={handleSubmit} className="login-form">
                
                {/* Campo N° de Legajo */}
                <div className="form-group">
                    <label htmlFor="legajo">N° de Legajo</label>
                    <input
                        type="text"
                        id="legajo"
                        value={legajo}
                        onChange={(e) => setLegajo(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
{/* Campo Contraseña */}
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
{/* Mensaje de Error */}
                {error && <p className="error-message">{error}</p>}
                
                {/* Botón de Ingreso */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
            
            {/* Opcional: Link para recuperar contraseña */}
            <a href="/recuperar-contrasena" className="forgot-password">Olvidé mi contraseña</a>
        </div>
    );
}
export default Login;
