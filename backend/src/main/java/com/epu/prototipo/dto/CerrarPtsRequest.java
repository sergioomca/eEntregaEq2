package com.epu.prototipo.dto;

/**
 * DTO para manejar solicitud (RTO) de un (PTS).
 * 
 * Lo uso cuando un supervisor o responsable necesita cerrar un PTS
 * 
 */
public class CerrarPtsRequest {

    private String ptsId; 
    private String rtoResponsableCierreLegajo; // Legajo 
    private String rtoObservaciones; 

    /**
     * Constructor vacio por defecto.
     * Para el binding automatico de JSON en Spring Boot.
     */
    public CerrarPtsRequest() {}

    /**
     * Constructor con parametros para crear DTO.
     * 
     * @param ptsId 
     * @param rtoResponsableCierreLegajo 
     * @param rtoObservaciones Observaciones (puede ser null)
     */
    public CerrarPtsRequest(String ptsId, String rtoResponsableCierreLegajo, String rtoObservaciones) {
        this.ptsId = ptsId;
        this.rtoResponsableCierreLegajo = rtoResponsableCierreLegajo;
        this.rtoObservaciones = rtoObservaciones;
    }

    // --- GETTERS Y SETTERS ---

    // Obtener el ID del PTS que se va a cerrar.
      
     // @return ID del PTS
     
    public String getPtsId() {
        return ptsId;
    }

    // Establecer ID del PTS a cerrar.
     
     // @param ptsId ID del PTS
     
    public void setPtsId(String ptsId) {
        this.ptsId = ptsId;
    }

    // Obtener legajo del responsable pra cierre.
      
    // @return Legajo del responsable del cierre
     
    public String getRtoResponsableCierreLegajo() {
        return rtoResponsableCierreLegajo;
    }

    // Establecer legajo del responsable del cierre.
    
    // @param rtoResponsableCierreLegajo Legajo del responsable del cierre
    
    public void setRtoResponsableCierreLegajo(String rtoResponsableCierreLegajo) {
        this.rtoResponsableCierreLegajo = rtoResponsableCierreLegajo;
    }

    // Obtener observaciones finales o estado de la zona.
    // @return Observaciones finales (puede ser null)
    
    public String getRtoObservaciones() {
        return rtoObservaciones;
    }

    // Establecer observaciones finales o estado de la zona.
      
    // @param rtoObservaciones Observaciones finales (opcional)
     
    public void setRtoObservaciones(String rtoObservaciones) {
        this.rtoObservaciones = rtoObservaciones;
    }

    // para representacion en cadena del objeto limpieza.
      
    // @return String con los valores del DTO
     
    @Override
    public String toString() {
        return "CerrarPtsRequest{" +
                "ptsId='" + ptsId + '\'' +
                ", rtoResponsableCierreLegajo='" + rtoResponsableCierreLegajo + '\'' +
                ", rtoObservaciones='" + rtoObservaciones + '\'' +
                '}';
    }
}