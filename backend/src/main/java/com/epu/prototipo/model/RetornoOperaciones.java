package com.epu.prototipo.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo RTO (Retorno a Operaciones).
 * Un RTO agrupa uno o más PTS asociados a un mismo equipo.
 * Tiene especialidades con responsables; al cerrar todas, el equipo pasa a DESBLOQUEADO.
 */
public class RetornoOperaciones {

    private String id;                          // RTO-YYMMDD-###
    private String equipoTag;                   // Tag del equipo asociado
    private List<String> ptsIds;                // Lista de IDs de PTS asociados
    private String estado;                      // ABIERTO, CERRADO
    private List<EspecialidadRTO> especialidades; // Especialidades con responsables
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;
    private String observaciones;

    public RetornoOperaciones() {
        this.ptsIds = new ArrayList<>();
        this.especialidades = new ArrayList<>();
        this.estado = EstadoRto.ABIERTO;
    }

    // Clase interna: cada especialidad requerida para cerrar el RTO
    public static class EspecialidadRTO {
        private String nombre;              // Ej: "Electricidad", "Instrumentos", "Mecánica"
        private String responsableLegajo;   // Legajo del responsable de cerrar esta especialidad
        private boolean cerrada;
        private LocalDateTime fechaCierre;
        private String observaciones;

        public EspecialidadRTO() {}

        public EspecialidadRTO(String nombre, String responsableLegajo) {
            this.nombre = nombre;
            this.responsableLegajo = responsableLegajo;
            this.cerrada = false;
        }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getResponsableLegajo() { return responsableLegajo; }
        public void setResponsableLegajo(String responsableLegajo) { this.responsableLegajo = responsableLegajo; }
        public boolean isCerrada() { return cerrada; }
        public void setCerrada(boolean cerrada) { this.cerrada = cerrada; }
        public LocalDateTime getFechaCierre() { return fechaCierre; }
        public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }

    // Getters y Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEquipoTag() { return equipoTag; }
    public void setEquipoTag(String equipoTag) { this.equipoTag = equipoTag; }
    public List<String> getPtsIds() { return ptsIds; }
    public void setPtsIds(List<String> ptsIds) { this.ptsIds = ptsIds; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public List<EspecialidadRTO> getEspecialidades() { return especialidades; }
    public void setEspecialidades(List<EspecialidadRTO> especialidades) { this.especialidades = especialidades; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    /**
     * Verifica si todas las especialidades han sido cerradas.
     */
    public boolean todasEspecialidadesCerradas() {
        if (especialidades == null || especialidades.isEmpty()) {
            return false;
        }
        return especialidades.stream().allMatch(EspecialidadRTO::isCerrada);
    }

    /**
     * Agrega un PTS ID a la lista si no existe ya.
     */
    public void agregarPtsId(String ptsId) {
        if (ptsIds == null) {
            ptsIds = new ArrayList<>();
        }
        if (!ptsIds.contains(ptsId)) {
            ptsIds.add(ptsId);
        }
    }
}
