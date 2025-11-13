package com.epu.prototipo.model;

public class Equipo {
    private String tag; // Clave primaria, ej: "K7451"
    private String descripcion; // Ej: "Compresor de aire de instrumentos"
    private String estado; // "HABILITADO" o "DESHABILITADO"

    // Constructor vacío
    public Equipo() {}

    // Constructor con todos los argumentos
    public Equipo(String tag, String descripcion, String estado) {
        this.tag = tag;
        this.descripcion = descripcion;
        this.estado = estado;
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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
