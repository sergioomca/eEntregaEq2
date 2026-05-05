import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// selfService=true: el usuario llega desde el login sin sesión activa
function CambiarContrasena({ legajo, onPasswordChanged, selfService = false }) {
    const navigate = useNavigate();
    const [legajoInput, setLegajoInput] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // En modo self-service se usa legajoInput; en modo forzado se usa la prop legajo
    const effectiveLegajo = selfService ? legajoInput.trim() : legajo;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selfService && !effectiveLegajo) {
            setError('Ingrese su legajo.');
            return;
        }

        const trimmedPassword = newPassword.trim();
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordPolicy.test(trimmedPassword)) {
            setError('La nueva contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo especial.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('La nueva contraseña debe ser diferente a la actual.');
            return;
        }

        setLoading(true);
        try {
            let token = localStorage.getItem('authToken');

            // En modo self-service, autenticarse primero para obtener un token temporal
            if (selfService) {
                const loginResp = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ legajo: effectiveLegajo, password: currentPassword }),
                });
                if (!loginResp.ok) {
                    const text = await loginResp.text();
                    throw new Error(text || 'Credenciales incorrectas. Verifique legajo y contraseña actual.');
                }
                const loginData = await loginResp.json();
                token = loginData.token || loginData.accessToken;
                if (!token) {
                    throw new Error('No se pudo obtener el token de autenticación.');
                }
            }

            if (!token) {
                throw new Error('Sesión inválida. Inicie sesión nuevamente.');
            }

            const response = await fetch('/api/auth/cambiar-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ legajo: effectiveLegajo, currentPassword, newPassword: trimmedPassword }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Error al cambiar la contraseña.');
            }

            setSuccess('Contraseña actualizada. Redirigiendo al login...');
            setTimeout(() => {
                if (onPasswordChanged) onPasswordChanged();
                else navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
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
                <h2>Cambiar Contraseña</h2>
                <p className="login-subtitle">
                    {selfService
                        ? 'Ingrese sus datos para actualizar su contraseña.'
                        : 'Por seguridad, debe crear una nueva contraseña para continuar.'}
                </p>
                <form onSubmit={handleSubmit}>
                    {selfService && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="legajoInput">Legajo</label>
                            <input
                                type="text"
                                id="legajoInput"
                                required
                                value={legajoInput}
                                onChange={(e) => setLegajoInput(e.target.value)}
                                disabled={loading || !!success}
                                placeholder="Ej: VINF011422"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
                        <input
                            type="password"
                            id="currentPassword"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={loading || !!success}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading || !!success}
                            placeholder="Mínimo 4 caracteres"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading || !!success}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: 8 }}
                        disabled={loading || !!success}
                    >
                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                    {selfService && !success && (
                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem', marginTop: 8 }}
                            onClick={() => { if (onPasswordChanged) onPasswordChanged(); else navigate('/login'); }}
                            disabled={loading}
                        >
                            Volver al inicio de sesión
                        </button>
                    )}
                    {error && (
                        <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: '0.875rem' }}>
                            {success}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CambiarContrasena;
