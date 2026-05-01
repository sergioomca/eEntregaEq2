package com.epu.prototipo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "equipos")
public class EquipoEntity {

    @Id
    @Column(length = 50)
    private String tag;

    @Column(length = 200)
    private String descripcion;

    @Column(length = 30)
    private String estadoDcs;

    @Column(length = 30)
    private String condicion;

    public EquipoEntity() {}

    // Getters y Setters
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstadoDcs() { return estadoDcs; }
    public void setEstadoDcs(String estadoDcs) { this.estadoDcs = estadoDcs; }
    public String getCondicion() { return condicion; }
    public void setCondicion(String condicion) { this.condicion = condicion; }
}
