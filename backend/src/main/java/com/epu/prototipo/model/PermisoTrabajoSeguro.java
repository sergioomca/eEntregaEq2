package com.epu.prototipo.model;

import java.util.List;
import java.time.LocalDateTime;

/**
 * Clase DTO (Data Transfer Object) y Modelo que representa los datos de un
 * Permiso de Trabajo Seguro (PTS).
 *
 * * Se han añadido campos para la Firma Digital (HU-005) y para la gestión del RTO (HU-019).
 */
public class PermisoTrabajoSeguro {

    private String id;
    private String area;
    private String equipoOInstalacion;
    private String descripcionTrabajo;
    private String solicitanteLegajo; // Usamos Legajo para la autenticación
    private String nombreSolicitante;
    private String supervisorLegajo;  // Usamos Legajo para la autenticación
    private String fechaInicio;
    private String fechaFin;
    private String horaInicio;
    private String horaFin;
    private String ubicacion;
    private String tareaDetallada;
    private String tipoTrabajo;
    private List<RiesgoControl> riesgosControles;
    private List<EquipoSeguridad> equiposSeguridad;

    // --- NUEVOS CAMPOS PARA FIRMA DIGITAL (HU-005) ---
    private String firmaSupervisorBase64; // Firma del supervisor como string Base64
    private String dniSupervisorFirmante;
    private LocalDateTime fechaHoraFirmaSupervisor;
    
    // --- NUEVOS CAMPOS PARA RTO (Retorno a Operaciones) (HU-019) ---
    private String rtoEstado; // PENDIENTE, CERRADO, CANCELADO
    private String rtoObservaciones;
    private String rtoResponsableCierreLegajo;
    private LocalDateTime rtoFechaHoraCierre;


    // CONSTRUCTOR VACÍO: ESENCIAL para Spring Boot y Jackson (JSON).
    public PermisoTrabajoSeguro() {}

    // Constructor completo (simplificado para no hacer un constructor enorme)
    // Se recomienda usar el constructor vacío y setters.
    public PermisoTrabajoSeguro(String id, String area, String equipoOInstalacion, String descripcionTrabajo,
        String solicitanteLegajo, String nombreSolicitante, String supervisorLegajo, String fechaInicio, String fechaFin,
        String horaInicio, String horaFin, String ubicacion, String tareaDetallada, String tipoTrabajo,
        List<RiesgoControl> riesgosControles, List<EquipoSeguridad> equiposSeguridad) {
        this.id = id;
        this.area = area;
        this.equipoOInstalacion = equipoOInstalacion;
        this.descripcionTrabajo = descripcionTrabajo;
        this.solicitanteLegajo = solicitanteLegajo;
        this.nombreSolicitante = nombreSolicitante;
        this.supervisorLegajo = supervisorLegajo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.ubicacion = ubicacion;
        this.tareaDetallada = tareaDetallada;
        this.tipoTrabajo = tipoTrabajo;
        this.riesgosControles = riesgosControles;
        this.equiposSeguridad = equiposSeguridad;
        
        // Inicializar campos de firma/RTO
        this.rtoEstado = "PENDIENTE";
    }

    // --- Clase interna para manejar la lista de Riesgos y Controles ---
    public static class RiesgoControl {
        private String peligro;
        private String consecuencia;
        private String controlRequerido;

        // Constructor y Getters/Setters (omito por brevedad, asumo que son los mismos)
        public RiesgoControl() {}
        public RiesgoControl(String peligro, String consecuencia, String controlRequerido) {
            this.peligro = peligro;
            this.consecuencia = consecuencia;
            this.controlRequerido = controlRequerido;
        }

        public String getPeligro() { return peligro; }
        public void setPeligro(String peligro) { this.peligro = peligro; }
        public String getConsecuencia() { return consecuencia; }
        public void setConsecuencia(String consecuencia) { this.consecuencia = consecuencia; }
        public String getControlRequerido() { return controlRequerido; }
        public void setControlRequerido(String controlRequerido) { this.controlRequerido = controlRequerido; }
    }

    // --- Clase interna para manejar la lista de Equipos de Seguridad ---
    public static class EquipoSeguridad {
        private String equipo;
        private boolean esRequerido;
        private boolean esProporcionado;
        private String observacion;

        // Constructor y Getters/Setters (omito por brevedad, asumo que son los mismos)
        public EquipoSeguridad() {}
        public EquipoSeguridad(String equipo, boolean esRequerido, boolean esProporcionado, String observacion) {
            this.equipo = equipo;
            this.esRequerido = esRequerido;
            this.esProporcionado = esProporcionado;
            this.observacion = observacion;
        }

        public String getEquipo() { return equipo; }
        public void setEquipo(String equipo) { this.equipo = equipo; }
        public boolean isEsRequerido() { return esRequerido; }
        public void setEsRequerido(boolean esRequerido) { this.esRequerido = esRequerido; }
        public boolean isEsProporcionado() { return esProporcionado; }
        public void setEsProporcionado(boolean esProporcionado) { this.esProporcionado = esProporcionado; }
        public String getObservacion() { return observacion; }
        public void setObservacion(String observacion) { this.observacion = observacion; }
    }


    // --- Getters y Setters del Modelo Principal (PermisoTrabajoSeguro) ---

    // ** EXISTENTES **
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getEquipoOInstalacion() { return equipoOInstalacion; }
    public void setEquipoOInstalacion(String equipoOInstalacion) { this.equipoOInstalacion = equipoOInstalacion; }
    public String getDescripcionTrabajo() { return descripcionTrabajo; }
    public void setDescripcionTrabajo(String descripcionTrabajo) { this.descripcionTrabajo = descripcionTrabajo; }
    public String getSolicitanteLegajo() { return solicitanteLegajo; }
    public void setSolicitanteLegajo(String solicitanteLegajo) { this.solicitanteLegajo = solicitanteLegajo; }
    public String getSupervisorLegajo() { return supervisorLegajo; }
    public void setSupervisorLegajo(String supervisorLegajo) { this.supervisorLegajo = supervisorLegajo; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }
    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }
    public String getNombreSolicitante() { return nombreSolicitante; }
    public void setNombreSolicitante(String nombreSolicitante) { this.nombreSolicitante = nombreSolicitante; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getTareaDetallada() { return tareaDetallada; }
    public void setTareaDetallada(String tareaDetallada) { this.tareaDetallada = tareaDetallada; }
    public String getTipoTrabajo() { return tipoTrabajo; }
    public void setTipoTrabajo(String tipoTrabajo) { this.tipoTrabajo = tipoTrabajo; }
    public List<RiesgoControl> getRiesgosControles() { return riesgosControles; }
    public void setRiesgosControles(List<RiesgoControl> riesgosControles) { this.riesgosControles = riesgosControles; }
    public List<EquipoSeguridad> getEquiposSeguridad() { return equiposSeguridad; }
    public void setEquiposSeguridad(List<EquipoSeguridad> equiposSeguridad) { this.equiposSeguridad = equiposSeguridad; }

    // ** NUEVOS GETTERS/SETTERS PARA FIRMA Y RTO **

    public String getFirmaSupervisorBase64() { return firmaSupervisorBase64; }
    public void setFirmaSupervisorBase64(String firmaSupervisorBase64) { this.firmaSupervisorBase64 = firmaSupervisorBase64; }

    public String getDniSupervisorFirmante() { return dniSupervisorFirmante; }
    public void setDniSupervisorFirmante(String dniSupervisorFirmante) { this.dniSupervisorFirmante = dniSupervisorFirmante; }

    public LocalDateTime getFechaHoraFirmaSupervisor() { return fechaHoraFirmaSupervisor; }
    public void setFechaHoraFirmaSupervisor(LocalDateTime fechaHoraFirmaSupervisor) { this.fechaHoraFirmaSupervisor = fechaHoraFirmaSupervisor; }

    public String getRtoEstado() { return rtoEstado; }
    public void setRtoEstado(String rtoEstado) { this.rtoEstado = rtoEstado; }

    public String getRtoObservaciones() { return rtoObservaciones; }
    public void setRtoObservaciones(String rtoObservaciones) { this.rtoObservaciones = rtoObservaciones; }

    public String getRtoResponsableCierreLegajo() { return rtoResponsableCierreLegajo; }
    public void setRtoResponsableCierreLegajo(String rtoResponsableCierreLegajo) { this.rtoResponsableCierreLegajo = rtoResponsableCierreLegajo; }

    public LocalDateTime getRtoFechaHoraCierre() { return rtoFechaHoraCierre; }
    public void setRtoFechaHoraCierre(LocalDateTime rtoFechaHoraCierre) { this.rtoFechaHoraCierre = rtoFechaHoraCierre; }
}