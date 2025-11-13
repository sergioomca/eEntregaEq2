import React, { useState, useEffect, useRef } from 'react';

/**
 * SIM para lectura de Huella Digital para firmar un PTS.
 *
 * NOTA: En entorno real, la lectura huella se gestiona 
 * con librerías nativas o APIs de dispositivo, inaccesibles en web/React.
 * Aca se simula la accion de validacion del usuario logueado.
 * * @param {object} props
 * @param {string} props.ptsId - ID del Permiso de Trabajo Seguro a firmar.
 * @param {function} props.onFirmaExitosa - LLsmada al finalizar la firma.
 */
function FirmaBiometrica({ ptsId, dniFirmante, onFirmaExitosa }) {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [biometricoValidado, setBiometricoValidado] = useState(false);
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const printButtonRef = useRef(null);
    
    // Enfocar automaticamente el botón "Sí, Imprimir" 
    useEffect(() => {
        if (showPrintDialog && printButtonRef.current) {
            printButtonRef.current.focus();
        }
    }, [showPrintDialog]);
    
    // DNI/Legajo del usuario logueado recibido como prop
    const nombreFirmante = `Supervisor ${dniFirmante}`;

    // Función para imprimir el PTS después de la firma
    const handlePrintPTS = async () => {
        setIsPrinting(true);
        
        try {
            const token = localStorage.getItem('authToken');
            console.log(`Iniciando descarga de PDF para PTS firmado: ${ptsId}`);
            
            // Llamada al endpoint de reportes
            const response = await fetch(`http://localhost:8080/api/reportes/pdf/${ptsId}`, {
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
            link.setAttribute('download', `PTS-${ptsId}-FIRMADO.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpiar URL del objeto
            window.URL.revokeObjectURL(url);
            
            console.log(`PDF del PTS ${ptsId} descargado exitosamente`);
            setShowPrintDialog(false);
            
            // Notificar exito y cerrar
            alert(`PDF del PTS ${ptsId} generado exitosamente`);
            onFirmaExitosa(); 
            setBiometricoValidado(false);
            
        } catch (error) {
            console.error('Error al imprimir PTS:', error);
            alert(`Error al generar el PDF: ${error.message}`);
        } finally {
            setIsPrinting(false);
        }
    }; 

    // SIM de la lectura de la huella digital
    // En el prototipo, solo se valida que el PTS ID este presente.
     
    const simularValidacionBiometrica = () => {
        if (!ptsId) {
            setError('Debe seleccionar un PTS válido para simular la validación.');
            return;
        }

        setError(null);
        setLoading(true);

        // Simulacion de latencia de lectura de huella
        setTimeout(() => {
            setBiometricoValidado(true);
            setLoading(false);
            // Mostrar notificacion de exito simulada
            setTimeout(() => {
                alert(`Validación biométrica exitosa. DNI/Legajo: ${dniFirmante}`);
            }, 100);
        }, 1500); 
    };

    // Envía la confirmacion de la firma biometrica al backend.
     
    const handleConfirmarFirma = async () => {
        if (!biometricoValidado) {
            setError('Debe completar la validación biométrica primero.');
            return;
        }

        setLoading(true);
        setError(null);

        // Generamos un placeholder Base64 para guardar en Firestore
        // En el backend se guarda este marcador en lugar de la firma
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

            // Exito en firma
            alert('Firma biométrica registrada con éxito. PTS aprobado.');
            
            // Mostrar dialogo de impresion 
            setShowPrintDialog(true);
            
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
        backgroundColor: '#e6eef7', 
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
    
    const dialogStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000'
    };
    
    const dialogContentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
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

            {/* Diálogo de impresión automático después de firmar */}
            {showPrintDialog && (
                <div style={dialogStyle}>
                    <div style={dialogContentStyle}>
                        <h3 style={{marginBottom: '20px', color: '#28a745'}}>
                            ✅ PTS Firmado Exitosamente
                        </h3>
                        <p style={{marginBottom: '20px', fontSize: '16px'}}>
                            ¿Desea imprimir el PTS <strong>{ptsId}</strong> ahora?
                        </p>
                        <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                            <button 
                                ref={printButtonRef}
                                onClick={handlePrintPTS}
                                disabled={isPrinting}
                                style={{
                                    ...buttonStyle('#28a745'),
                                    fontSize: '14px',
                                    padding: '10px 20px'
                                }}
                            >
                                {isPrinting ? 'Generando PDF...' : '🖨️ Sí, Imprimir'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPrintDialog(false);
                                    onFirmaExitosa(); 
                                    setBiometricoValidado(false);
                                }}
                                disabled={isPrinting}
                                style={{
                                    ...buttonStyle('#6c757d'),
                                    fontSize: '14px',
                                    padding: '10px 20px'
                                }}
                            >
                                No, Continuar
                            </button>
                        </div>
                        <p style={{marginTop: '15px', fontSize: '12px', color: '#666'}}>
                            💡 Recomendado: Imprimir para tener una copia física del PTS firmado
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FirmaBiometrica;