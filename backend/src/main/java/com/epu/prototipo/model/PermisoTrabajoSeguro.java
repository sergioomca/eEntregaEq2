package com.epu.prototipo.model;

import java.util.List;

/**
 * Clase DTO (Data Transfer Object) y Modelo que representa los datos de un
 * Permiso de Trabajo Seguro (PTS).
 * * Se utiliza el constructor vacío y setters para facilitar el binding JSON/Firestore.
 */
public class PermisoTrabajoSeguro {

    private String id; // Opcional, puede ser el id del documento en Firestore
    private String area;
    private String equipoOInstalacion;
    private String descripcionTrabajo;
    private String solicitante;
    private String nombreSolicitante;
    private String supervisor;
    private String fechaInicio;
    private String fechaFin;
    private String horaInicio;
    private String horaFin;
    private String ubicacion;
    private String tareaDetallada;
    private String tipoTrabajo;
    private List<RiesgoControl> riesgosControles;
    private List<EquipoSeguridad> equiposSeguridad;

    // CONSTRUCTOR VACÍO: ESENCIAL para Spring Boot y Jackson (JSON).
    public PermisoTrabajoSeguro() {}

    public PermisoTrabajoSeguro(String id, String area, String equipoOInstalacion, String descripcionTrabajo,
        String solicitante, String nombreSolicitante, String supervisor, String fechaInicio, String fechaFin, 
        String horaInicio, String horaFin, String ubicacion, String tareaDetallada, String tipoTrabajo,
        List<RiesgoControl> riesgosControles, List<EquipoSeguridad> equiposSeguridad) {
        this.id = id;
        this.area = area;
        this.equipoOInstalacion = equipoOInstalacion;
        this.descripcionTrabajo = descripcionTrabajo;
        this.solicitante = solicitante;
        this.nombreSolicitante = nombreSolicitante;
        this.supervisor = supervisor;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.ubicacion = ubicacion;
        this.tareaDetallada = tareaDetallada;
        this.tipoTrabajo = tipoTrabajo;
        this.riesgosControles = riesgosControles;
        this.equiposSeguridad = equiposSeguridad;
    }

    // --- Clase interna para manejar la lista de Riesgos y Controles ---
    public static class RiesgoControl {
        private String peligro;
        private String consecuencia;
        private String controlRequerido;

        // Constructor
        public RiesgoControl() {}
        public RiesgoControl(String peligro, String consecuencia, String controlRequerido) {
            this.peligro = peligro;
            this.consecuencia = consecuencia;
            this.controlRequerido = controlRequerido;
        }

        // Getters y Setters
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

        // Constructor
        public EquipoSeguridad() {}
        public EquipoSeguridad(String equipo, boolean esRequerido, boolean esProporcionado, String observacion) {
            this.equipo = equipo;
            this.esRequerido = esRequerido;
            this.esProporcionado = esProporcionado;
            this.observacion = observacion;
        }

        // Getters y Setters
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getEquipoOInstalacion() { return equipoOInstalacion; }
    public void setEquipoOInstalacion(String equipoOInstalacion) { this.equipoOInstalacion = equipoOInstalacion; }
    public String getDescripcionTrabajo() { return descripcionTrabajo; }
    public void setDescripcionTrabajo(String descripcionTrabajo) { this.descripcionTrabajo = descripcionTrabajo; }
    public String getSolicitante() { return solicitante; }
    public void setSolicitante(String solicitante) { this.solicitante = solicitante; }
    public String getSupervisor() { return supervisor; }
    public void setSupervisor(String supervisor) { this.supervisor = supervisor; }
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
}