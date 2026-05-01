package com.epu.prototipo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class RiesgoControlEmb {

    @Column(length = 500)
    private String peligro;

    @Column(length = 500)
    private String consecuencia;

    @Column(length = 500)
    private String controlRequerido;

    public RiesgoControlEmb() {}

    public RiesgoControlEmb(String peligro, String consecuencia, String controlRequerido) {
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
