import React, { useState } from 'react';

/**
 * Componente CierreRTO - Formulario para registrar el Retorno a Operaciones (RTO) de un PTS
 * Corresponde a la Historia de Usuario HU-019
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.ptsId - ID del PTS a cerrar (requerido)
 * @param {string} [props.responsableLegajo] - Legajo del responsable (opcional, usa valor por defecto)
 * @param {function} [props.onSuccess] - Callback ejecutado al cerrar exitosamente
 * @param {function} [props.onCancel] - Callback para cancelar la operación
 */
const CierreRTO = ({ 
  ptsId, 
  responsableLegajo = 'LEG-CIERRE-001', 
  onSuccess, 
  onCancel 
}) => {
  // Estados del componente
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para validaciones

  /**
   * Función de validación del formulario RTO
   * Verifica campos obligatorios y reglas de negocio
   */
  const validateForm = () => {
    const newErrors = {};

    // Validaciones obligatorias
    if (!ptsId || ptsId.toString().trim() === '') {
      newErrors.ptsId = 'El ID del PTS es obligatorio';
    }

    if (!responsableLegajo || responsableLegajo.toString().trim() === '') {
      newErrors.responsableLegajo = 'El legajo del responsable es obligatorio';
    }

    // Validaciones opcionales para observaciones
    if (observaciones && observaciones.length > 500) {
      newErrors.observaciones = 'Las observaciones no pueden exceder los 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja cambios en el campo de observaciones con limpieza de errores
   */
  const handleObservacionesChange = (e) => {
    const value = e.target.value;
    setObservaciones(value);

    // Limpiar error de observaciones si existe
    if (errors.observaciones) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.observaciones;
        return newErrors;
      });
    }
  };

  /**
   * Maneja el cierre del PTS (RTO)
   * Envía una petición PUT al endpoint /api/pts/cerrar
   */
  const handleCierreRTO = async () => {
    // Validación del formulario
    if (!validateForm()) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    // Obtener token de autenticación
    const jwtToken = localStorage.getItem('authToken');
    if (!jwtToken) {
      setError('No se encontró token de autenticación');
      alert('Error: Debe iniciar sesión para cerrar un PTS');
      return;
    }

    // Confirmación del usuario
    const confirmacion = window.confirm(
      `¿Está seguro que desea cerrar el PTS ${ptsId}?\n\n` +
      'Esta acción no se puede deshacer y marcará el PTS como "Retorno a Operaciones".'
    );
    
    if (!confirmacion) {
      return;
    }

    // Preparar datos para el request
    const cerrarPtsRequest = {
      ptsId: ptsId,
      rtoResponsableCierreLegajo: responsableLegajo,
      rtoObservaciones: observaciones.trim() || null
    };

    setLoading(true);
    setError(null);
    setSuccess(false);
    setErrors({}); // Limpiar errores de validación

    try {
      console.log('DEBUG CIERRE - Enviando petición de cierre RTO:', cerrarPtsRequest);
      console.log('DEBUG CIERRE - Token:', jwtToken ? 'Presente' : 'Ausente');

      const response = await fetch('http://localhost:8080/api/pts/cerrar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(cerrarPtsRequest)
      });

      console.log('DEBUG CIERRE - Response status:', response.status);
      const responseData = await response.json();
      console.log('DEBUG CIERRE - Response data:', responseData);

      if (response.ok) {
        // SIMULACIÓN: Marcar PTS como cerrado en sessionStorage
        const closedPtsIds = JSON.parse(sessionStorage.getItem('closedPtsIds') || '[]');
        if (!closedPtsIds.includes(ptsId)) {
          closedPtsIds.push(ptsId);
          sessionStorage.setItem('closedPtsIds', JSON.stringify(closedPtsIds));
          console.log('DEBUG CIERRE - PTS marcado como cerrado:', ptsId);
        }
        
        // Éxito
        setSuccess(true);
        setError(null);
        
        const mensaje = `✅ PTS ${ptsId} cerrado exitosamente\n\n` +
                       `Estado: ${responseData.rtoEstado}\n` +
                       `Responsable: ${responseData.rtoResponsableCierreLegajo}\n` +
                       `Fecha de cierre: ${new Date(responseData.rtoFechaHoraCierre).toLocaleString()}`;
        
        alert(mensaje);
        
        // Limpiar formulario
        setObservaciones('');
        
        // Ejecutar callback de éxito si existe
        if (onSuccess) {
          onSuccess(responseData);
        }
        
      } else {
        // Error del servidor
        let errorMessage = 'Error desconocido al cerrar el PTS';
        
        // Manejo específico según código de estado HTTP
        switch (response.status) {
          case 400:
            errorMessage = responseData.error || 'Datos de entrada inválidos';
            break;
          case 403:
            errorMessage = 'No tiene permisos para cerrar este PTS';
            break;
          case 404:
            errorMessage = `PTS ${ptsId} no encontrado`;
            break;
          case 409:
            errorMessage = responseData.error || 'El PTS ya está cerrado o no puede cerrarse';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${response.status}: ${responseData.error || 'Error desconocido'}`;
        }
        
        setError(errorMessage);
        alert(`❌ Error: ${errorMessage}`);
      }

    } catch (networkError) {
      // Error de red o conexión
      const errorMessage = 'Error de conexión con el servidor';
      setError(errorMessage);
      alert(`❌ ${errorMessage}: ${networkError.message}`);
      console.error('Error de red:', networkError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="cierre-rto-container">
      <div className="cierre-rto-card">
        <h3>🔒 Cerrar PTS - Retorno a Operaciones (RTO)</h3>
        
        <div className="pts-info">
          <p><strong>PTS ID:</strong> {ptsId}</p>
          <p><strong>Responsable de Cierre:</strong> {responsableLegajo}</p>
        </div>

        {/* Área de texto para observaciones */}
        <div className="form-group">
          <label htmlFor="rtoObservaciones">
            <strong>Observaciones del Cierre (Opcional):</strong>
          </label>
          <textarea
            id="rtoObservaciones"
            value={observaciones}
            onChange={handleObservacionesChange}
            placeholder="Ingrese observaciones finales sobre el cierre del PTS..."
            rows={4}
            cols={50}
            maxLength={500}
            disabled={loading}
            className={`observaciones-textarea ${errors.observaciones ? 'error-border' : ''}`}
          />
          <small className="char-count">
            {observaciones.length}/500 caracteres
          </small>
          {errors.observaciones && (
            <p className="error-validacion">{errors.observaciones}</p>
          )}
        </div>

        {/* Errores de validación generales */}
        {errors.ptsId && (
          <div className="error-validacion">
            ❌ {errors.ptsId}
          </div>
        )}
        {errors.responsableLegajo && (
          <div className="error-validacion">
            ❌ {errors.responsableLegajo}
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ PTS cerrado exitosamente
          </div>
        )}

        {/* Botones de acción */}
        <div className="button-group">
          <button
            onClick={handleCierreRTO}
            disabled={loading || !ptsId}
            className={`btn-cerrar-pts ${loading ? 'loading' : ''}`}
          >
            {loading ? '🔄 Cerrando PTS...' : '🔒 Cerrar PTS (RTO)'}
          </button>

          {onCancel && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Información adicional */}
        <div className="info-note">
          <small>
            ⚠️ <strong>Importante:</strong> Una vez cerrado, el PTS no podrá ser modificado.
            Asegúrese de que todas las tareas estén completadas antes del cierre.
          </small>
        </div>
      </div>

      <style jsx>{`
        .cierre-rto-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }

        .cierre-rto-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 24px;
          max-width: 600px;
          width: 100%;
        }

        .cierre-rto-card h3 {
          color: #d32f2f;
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .pts-info {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .pts-info p {
          margin: 4px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }

        .observaciones-textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          resize: vertical;
          box-sizing: border-box;
        }

        .observaciones-textarea:focus {
          border-color: #2196f3;
          outline: none;
        }

        .observaciones-textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .char-count {
          display: block;
          text-align: right;
          color: #666;
          margin-top: 4px;
        }

        .error-message {
          background: #ffebee;
          color: #d32f2f;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #ffcdd2;
          margin-bottom: 16px;
        }

        .success-message {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #c8e6c9;
          margin-bottom: 16px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .btn-cerrar-pts {
          background: #d32f2f;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }

        .btn-cerrar-pts:hover:not(:disabled) {
          background: #b71c1c;
        }

        .btn-cerrar-pts:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-cerrar-pts.loading {
          background: #ff9800;
        }

        .btn-cancelar {
          background: #666;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-cancelar:hover:not(:disabled) {
          background: #444;
        }

        .btn-cancelar:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .info-note {
          background: #fff3e0;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #ffcc02;
          text-align: center;
        }

        .info-note small {
          color: #e65100;
        }

        /* Estilos para validación */
        .error-validacion {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .error-border {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CierreRTO;