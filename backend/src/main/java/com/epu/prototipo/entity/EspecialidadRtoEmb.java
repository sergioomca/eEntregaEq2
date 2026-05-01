package com.epu.prototipo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;

@Embeddable
public class EspecialidadRtoEmb {

    @Column(length = 100)
    private String nombre;

    @Column(length = 50)
    private String responsableLegajo;

    private boolean cerrada;

    private LocalDateTime fechaCierre;

    @Column(length = 500)
    private String observaciones;

    public EspecialidadRtoEmb() {}

    public EspecialidadRtoEmb(String nombre, String responsableLegajo) {
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
