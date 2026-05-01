package com.epu.prototipo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class EquipoSeguridadEmb {

    @Column(length = 200)
    private String equipo;

    private boolean esRequerido;
    private boolean esProporcionado;

    @Column(length = 500)
    private String observacion;

    public EquipoSeguridadEmb() {}

    public EquipoSeguridadEmb(String equipo, boolean esRequerido, boolean esProporcionado, String observacion) {
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
