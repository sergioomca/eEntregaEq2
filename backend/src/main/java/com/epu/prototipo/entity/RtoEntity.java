package com.epu.prototipo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "retorno_operaciones")
public class RtoEntity {

    @Id
    @Column(length = 50)
    private String id;

    @Column(length = 50)
    private String equipoTag;

    @Column(length = 30)
    private String estado;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;

    @Column(length = 500)
    private String observaciones;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "rto_pts_ids", joinColumns = @JoinColumn(name = "rto_id"))
    @Column(name = "pts_id", length = 50)
    private List<String> ptsIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "rto_especialidades", joinColumns = @JoinColumn(name = "rto_id"))
    private List<EspecialidadRtoEmb> especialidades = new ArrayList<>();

    public RtoEntity() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEquipoTag() { return equipoTag; }
    public void setEquipoTag(String equipoTag) { this.equipoTag = equipoTag; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public List<String> getPtsIds() { return ptsIds; }
    public void setPtsIds(List<String> ptsIds) { this.ptsIds = ptsIds; }
    public List<EspecialidadRtoEmb> getEspecialidades() { return especialidades; }
    public void setEspecialidades(List<EspecialidadRtoEmb> especialidades) { this.especialidades = especialidades; }
}
