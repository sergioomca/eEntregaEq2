package com.epu.prototipo.dto;

// DTO para representar la informacion basica de usuario
// (fuente externa simulada)

public class UsuarioDTO {
    private String legajo;
    private String nombreCompleto;
    private String sector;

    // Constructor vacio para JSON
    public UsuarioDTO() {}

    // Constructor con parametros
    public UsuarioDTO(String legajo, String nombreCompleto, String sector) {
        this.legajo = legajo;
        this.nombreCompleto = nombreCompleto;
        this.sector = sector;
    }

    // Getters y Setters
    public String getLegajo() {
        return legajo;
    }

    public void setLegajo(String legajo) {
        this.legajo = legajo;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    @Override
    public String toString() {
        return "UsuarioDTO{" +
                "legajo='" + legajo + '\'' +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", sector='" + sector + '\'' +
                '}';
    }
}