import React, { useState } from 'react';

/**
 * Componente que SIMULA la lectura de Huella Digital para firmar un PTS.
 *
 * NOTA: En un entorno real, la lectura biométrica (huella) se gestionaría 
 * con librerías nativas o APIs de dispositivo, inaccesibles en web/React.
 * Aquí simulamos la acción de validación del usuario logueado.
 * * @param {object} props
 * @param {string} props.ptsId - ID del Permiso de Trabajo Seguro a firmar.
 * @param {function} props.onFirmaExitosa - Callback al finalizar la firma.
 */
function FirmaBiometrica({ ptsId, dniFirmante, onFirmaExitosa }) {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [biometricoValidado, setBiometricoValidado] = useState(false);
    
    // DNI/Legajo del usuario logueado recibido como prop
    const nombreFirmante = `Supervisor ${dniFirmante}`; 

    /**
     * Simula la lectura de la huella digital.
     * En este prototipo, simplemente valida que el PTS ID esté presente.
     */
    const simularValidacionBiometrica = () => {
        if (!ptsId) {
            setError('Debe seleccionar un PTS válido para simular la validación.');
            return;
        }

        setError(null);
        setLoading(true);

        // Simulación de latencia de lectura de huella
        setTimeout(() => {
            setBiometricoValidado(true);
            setLoading(false);
            // Mostrar una notificación de éxito simulada
            setTimeout(() => {
                alert(`Validación biométrica exitosa. DNI/Legajo: ${dniFirmante}`);
            }, 100);
        }, 1500); 
    };

    /**
     * Envía la confirmación de la firma biométrica al backend.
     */
    const handleConfirmarFirma = async () => {
        if (!biometricoValidado) {
            setError('Debe completar la validación biométrica primero.');
            return;
        }

        setLoading(true);
        setError(null);

        // Generamos un placeholder Base64 para guardar en Firestore
        // En el backend se guardará este marcador en lugar de un trazo de firma
        const firmaPlaceholderBase64 = btoa(`FIRMADO_BIOMETRICAMENTE_POR_${dniFirmante}_${new Date().toISOString()}`);

        // 1. Preparar el payload
        const firmaData = {
            ptsId: ptsId,
            dniFirmante: dniFirmante, 
            firmaBase64: firmaPlaceholderBase64,
        };

        // 2. Obtener el token de autenticación
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Error de autenticación. No se encontró el token.');
            setLoading(false);
            return;
        }

        try {
            console.log('DEBUG FIRMA - Datos enviados al backend:', firmaData);
            console.log('DEBUG FIRMA - Token:', token ? 'Presente' : 'Ausente');
            
            // 3. Petición PUT al endpoint del PtsController
            const response = await fetch('http://localhost:8080/api/pts/firmar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(firmaData),
            });
            
            console.log('DEBUG FIRMA - Response status:', response.status);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error al guardar la firma: ${response.status} - ${errorBody}`);
            }

            // 4. Éxito
            alert('Firma biométrica registrada con éxito. PTS aprobado.');
            onFirmaExitosa(); // Notificar al componente padre
            setBiometricoValidado(false);
            
        } catch (err) {
            console.error("Error de firma:", err);
            setError(err.message || 'Error de conexión o datos al firmar.');
        } finally {
            setLoading(false);
        }
    };

    // --- Estilos ---
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: '#e6eef7', // Fondo azul claro para módulo de seguridad
        borderRadius: '12px',
        maxWidth: '450px',
        margin: '20px auto',
        boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
    };
    const buttonStyle = (color) => ({
        padding: '12px 20px',
        margin: '8px 4px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '16px',
        border: 'none',
        transition: 'background-color 0.3s',
        backgroundColor: color,
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    });
    const successStyle = {
        color: '#1a7a28',
        fontWeight: 'bold',
        marginTop: '15px',
        backgroundColor: '#d4edda',
        padding: '10px',
        borderRadius: '6px'
    };
    const errorStyle = {
        color: '#842029',
        fontWeight: 'bold',
        marginTop: '15px',
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '6px'
    }
    const iconStyle = {
        fontSize: '60px',
        color: biometricoValidado ? '#1a7a28' : '#007bff',
        marginBottom: '10px'
    };
    
    return (
        <div style={containerStyle}>
            <h3>Validación Biometrica de Supervisor (HU-005)</h3>
            <p style={{textAlign: 'center', color: '#555'}}>
                PTS: **{ptsId ? ptsId : 'Pendiente'}**
            </p>
            <div style={iconStyle}>
                {biometricoValidado 
                    ? <span role="img" aria-label="Aprobado">✅</span> 
                    : <span role="img" aria-label="Huella">👆</span>
                }
            </div>
            
            <p style={{fontSize: '1.1em', fontWeight: 'bold'}}>
                {biometricoValidado ? 'Validación Exitosa' : `Supervisor: ${nombreFirmante} (DNI/Legajo: ${dniFirmante})`}
            </p>

            {!biometricoValidado && (
                <button 
                    onClick={simularValidacionBiometrica} 
                    disabled={loading || !ptsId} 
                    style={buttonStyle('#007bff')}
                >
                    {loading ? 'Leyendo Huella...' : 'Simular Lectura de Huella'}
                </button>
            )}

            {biometricoValidado && (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p style={successStyle}>
                        Huella validada. Presione confirmar para firmar el documento.
                    </p>
                    <button 
                        onClick={handleConfirmarFirma} 
                        disabled={loading} 
                        style={buttonStyle('#28a745')}
                    >
                        {loading ? 'Firmando Documento...' : 'Confirmar Firma Biometrica'}
                    </button>
                </div>
            )}

            {error && <p style={errorStyle}>{error}</p>}
        </div>
    );
}

export default FirmaBiometrica;