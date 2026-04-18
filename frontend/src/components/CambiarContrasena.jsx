import React, { useState } from 'react';

function CambiarContrasena({ legajo, onPasswordChanged }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.trim().length < 4) {
            setError('La nueva contraseña debe tener al menos 4 caracteres.');
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
            const response = await fetch('/api/auth/cambiar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ legajo, currentPassword, newPassword: newPassword.trim() }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Error al cambiar la contraseña.');
            }

            setSuccess('Contraseña actualizada. Redirigiendo al login...');
            setTimeout(() => {
                if (onPasswordChanged) onPasswordChanged();
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
                    Por seguridad, debe crear una nueva contraseña para continuar.
                </p>
                <form onSubmit={handleSubmit}>
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
