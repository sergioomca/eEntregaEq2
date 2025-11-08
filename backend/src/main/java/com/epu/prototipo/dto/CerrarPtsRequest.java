package com.epu.prototipo.dto;

/**
 * DTO para manejar la solicitud de "Retorno a Operaciones" (RTO) de un Permiso de Trabajo Seguro (PTS).
 * 
 * Este DTO se utiliza cuando un supervisor o responsable necesita cerrar un PTS
 * indicando que el trabajo ha sido completado y la zona puede retornar a operaciones normales.
 */
public class CerrarPtsRequest {

    private String ptsId; // ID del Permiso de Trabajo Seguro que se va a cerrar
    private String rtoResponsableCierreLegajo; // Legajo del usuario que realiza el cierre
    private String rtoObservaciones; // Observaciones finales sobre el trabajo o la zona (opcional)

    /**
     * Constructor vacío por defecto.
     * Necesario para el binding automático de JSON en Spring Boot.
     */
    public CerrarPtsRequest() {}

    /**
     * Constructor con parámetros para facilitar la creación del DTO.
     * 
     * @param ptsId ID del PTS a cerrar
     * @param rtoResponsableCierreLegajo Legajo del responsable del cierre
     * @param rtoObservaciones Observaciones finales (puede ser null)
     */
    public CerrarPtsRequest(String ptsId, String rtoResponsableCierreLegajo, String rtoObservaciones) {
        this.ptsId = ptsId;
        this.rtoResponsableCierreLegajo = rtoResponsableCierreLegajo;
        this.rtoObservaciones = rtoObservaciones;
    }

    // --- GETTERS Y SETTERS ---

    /**
     * Obtiene el ID del PTS que se va a cerrar.
     * 
     * @return ID del PTS
     */
    public String getPtsId() {
        return ptsId;
    }

    /**
     * Establece el ID del PTS que se va a cerrar.
     * 
     * @param ptsId ID del PTS
     */
    public void setPtsId(String ptsId) {
        this.ptsId = ptsId;
    }

    /**
     * Obtiene el legajo del responsable que realiza el cierre.
     * 
     * @return Legajo del responsable del cierre
     */
    public String getRtoResponsableCierreLegajo() {
        return rtoResponsableCierreLegajo;
    }

    /**
     * Establece el legajo del responsable que realiza el cierre.
     * 
     * @param rtoResponsableCierreLegajo Legajo del responsable del cierre
     */
    public void setRtoResponsableCierreLegajo(String rtoResponsableCierreLegajo) {
        this.rtoResponsableCierreLegajo = rtoResponsableCierreLegajo;
    }

    /**
     * Obtiene las observaciones finales sobre el trabajo realizado o el estado de la zona.
     * 
     * @return Observaciones finales (puede ser null)
     */
    public String getRtoObservaciones() {
        return rtoObservaciones;
    }

    /**
     * Establece las observaciones finales sobre el trabajo realizado o el estado de la zona.
     * 
     * @param rtoObservaciones Observaciones finales (opcional)
     */
    public void setRtoObservaciones(String rtoObservaciones) {
        this.rtoObservaciones = rtoObservaciones;
    }

    /**
     * Representación en cadena del objeto para depuración.
     * 
     * @return String con los valores del DTO
     */
    @Override
    public String toString() {
        return "CerrarPtsRequest{" +
                "ptsId='" + ptsId + '\'' +
                ", rtoResponsableCierreLegajo='" + rtoResponsableCierreLegajo + '\'' +
                ", rtoObservaciones='" + rtoObservaciones + '\'' +
                '}';
    }
}