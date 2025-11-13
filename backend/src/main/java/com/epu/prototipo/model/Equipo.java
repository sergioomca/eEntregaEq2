package com.epu.prototipo.model;

public class Equipo {
    private String tag; // Clave primaria, ej: "K7451"
    private String descripcion; // Ej: "Compresor de aire de instrumentos"
    private String estadoDcs; // "HABILITADO", "DESHABILITADO", "PARADO", "EN_MARCHA"
    private String condicion; // "BLOQUEADO", "DESBLOQUEADO"

    // Constructor vacío
    public Equipo() {}

    // Constructor con todos los argumentos
    public Equipo(String tag, String descripcion, String estadoDcs, String condicion) {
        this.tag = tag;
        this.descripcion = descripcion;
        this.estadoDcs = estadoDcs;
        this.condicion = condicion;
    }

    // Getters y Setters
    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstadoDcs() {
        return estadoDcs;
    }

    public void setEstadoDcs(String estadoDcs) {
        this.estadoDcs = estadoDcs;
    }

    public String getCondicion() {
        return condicion;
    }

    public void setCondicion(String condicion) {
        this.condicion = condicion;
    }
}
