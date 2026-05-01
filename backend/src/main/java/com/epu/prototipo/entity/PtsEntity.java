package com.epu.prototipo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "permisos_trabajo_seguro")
public class PtsEntity {

    @Id
    @Column(length = 50)
    private String id;

    @Column(length = 50)
    private String equipoOInstalacion;

    @Column(length = 500)
    private String descripcionTrabajo;

    @Column(length = 50)
    private String solicitanteLegajo;

    @Column(length = 200)
    private String nombreSolicitante;

    @Column(length = 50)
    private String supervisorLegajo;

    @Column(length = 50)
    private String receptorLegajo;

    @Column(length = 200)
    private String nombreReceptor;

    @Column(length = 20)
    private String fechaInicio;

    @Column(length = 20)
    private String fechaFin;

    @Column(length = 10)
    private String horaInicio;

    @Column(length = 10)
    private String horaFin;

    @Column(length = 200)
    private String ubicacion;

    @Column(columnDefinition = "TEXT")
    private String tareaDetallada;

    @Column(length = 100)
    private String tipoTrabajo;

    private boolean requiereAnalisisRiesgoAdicional;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String firmaSupervisorBase64;

    @Column(length = 50)
    private String dniSupervisorFirmante;

    private LocalDateTime fechaHoraFirmaSupervisor;

    @Column(length = 30)
    private String rtoEstado;

    @Column(length = 500)
    private String rtoObservaciones;

    @Column(length = 50)
    private String rtoResponsableCierreLegajo;

    private LocalDateTime rtoFechaHoraCierre;

    private boolean requiereRTO;

    @Column(length = 50)
    private String rtoAsociadoId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pts_riesgos_controles", joinColumns = @JoinColumn(name = "pts_id"))
    private List<RiesgoControlEmb> riesgosControles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pts_equipos_seguridad", joinColumns = @JoinColumn(name = "pts_id"))
    private List<EquipoSeguridadEmb> equiposSeguridad = new ArrayList<>();

    public PtsEntity() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEquipoOInstalacion() { return equipoOInstalacion; }
    public void setEquipoOInstalacion(String equipoOInstalacion) { this.equipoOInstalacion = equipoOInstalacion; }
    public String getDescripcionTrabajo() { return descripcionTrabajo; }
    public void setDescripcionTrabajo(String descripcionTrabajo) { this.descripcionTrabajo = descripcionTrabajo; }
    public String getSolicitanteLegajo() { return solicitanteLegajo; }
    public void setSolicitanteLegajo(String solicitanteLegajo) { this.solicitanteLegajo = solicitanteLegajo; }
    public String getNombreSolicitante() { return nombreSolicitante; }
    public void setNombreSolicitante(String nombreSolicitante) { this.nombreSolicitante = nombreSolicitante; }
    public String getSupervisorLegajo() { return supervisorLegajo; }
    public void setSupervisorLegajo(String supervisorLegajo) { this.supervisorLegajo = supervisorLegajo; }
    public String getReceptorLegajo() { return receptorLegajo; }
    public void setReceptorLegajo(String receptorLegajo) { this.receptorLegajo = receptorLegajo; }
    public String getNombreReceptor() { return nombreReceptor; }
    public void setNombreReceptor(String nombreReceptor) { this.nombreReceptor = nombreReceptor; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }
    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getTareaDetallada() { return tareaDetallada; }
    public void setTareaDetallada(String tareaDetallada) { this.tareaDetallada = tareaDetallada; }
    public String getTipoTrabajo() { return tipoTrabajo; }
    public void setTipoTrabajo(String tipoTrabajo) { this.tipoTrabajo = tipoTrabajo; }
    public boolean isRequiereAnalisisRiesgoAdicional() { return requiereAnalisisRiesgoAdicional; }
    public void setRequiereAnalisisRiesgoAdicional(boolean v) { this.requiereAnalisisRiesgoAdicional = v; }
    public String getFirmaSupervisorBase64() { return firmaSupervisorBase64; }
    public void setFirmaSupervisorBase64(String firmaSupervisorBase64) { this.firmaSupervisorBase64 = firmaSupervisorBase64; }
    public String getDniSupervisorFirmante() { return dniSupervisorFirmante; }
    public void setDniSupervisorFirmante(String dniSupervisorFirmante) { this.dniSupervisorFirmante = dniSupervisorFirmante; }
    public LocalDateTime getFechaHoraFirmaSupervisor() { return fechaHoraFirmaSupervisor; }
    public void setFechaHoraFirmaSupervisor(LocalDateTime v) { this.fechaHoraFirmaSupervisor = v; }
    public String getRtoEstado() { return rtoEstado; }
    public void setRtoEstado(String rtoEstado) { this.rtoEstado = rtoEstado; }
    public String getRtoObservaciones() { return rtoObservaciones; }
    public void setRtoObservaciones(String rtoObservaciones) { this.rtoObservaciones = rtoObservaciones; }
    public String getRtoResponsableCierreLegajo() { return rtoResponsableCierreLegajo; }
    public void setRtoResponsableCierreLegajo(String v) { this.rtoResponsableCierreLegajo = v; }
    public LocalDateTime getRtoFechaHoraCierre() { return rtoFechaHoraCierre; }
    public void setRtoFechaHoraCierre(LocalDateTime v) { this.rtoFechaHoraCierre = v; }
    public boolean isRequiereRTO() { return requiereRTO; }
    public void setRequiereRTO(boolean requiereRTO) { this.requiereRTO = requiereRTO; }
    public String getRtoAsociadoId() { return rtoAsociadoId; }
    public void setRtoAsociadoId(String rtoAsociadoId) { this.rtoAsociadoId = rtoAsociadoId; }
    public List<RiesgoControlEmb> getRiesgosControles() { return riesgosControles; }
    public void setRiesgosControles(List<RiesgoControlEmb> riesgosControles) { this.riesgosControles = riesgosControles; }
    public List<EquipoSeguridadEmb> getEquiposSeguridad() { return equiposSeguridad; }
    public void setEquiposSeguridad(List<EquipoSeguridadEmb> equiposSeguridad) { this.equiposSeguridad = equiposSeguridad; }
}
