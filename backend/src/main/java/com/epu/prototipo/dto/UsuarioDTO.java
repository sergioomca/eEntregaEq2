package com.epu.prototipo.dto;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// DTO para representar la informacion basica de usuario

public class UsuarioDTO {
    private String legajo;
    private String nombreCompleto;
    private String sector;
    // Roles posibles: "EMISOR" | "SUPERVISOR" | "RTO MANT" | "EJECUTANTE" | "ADMIN"
    private List<String> roles;

    // Constructor vacio para JSON
    public UsuarioDTO() {
        this.roles = new ArrayList<>();
    }

    // Constructor con parametros (sin roles)
    public UsuarioDTO(String legajo, String nombreCompleto, String sector) {
        this.legajo = legajo;
        this.nombreCompleto = nombreCompleto;
        this.sector = sector;
        this.roles = new ArrayList<>();
    }

    // Constructor completo con roles
    public UsuarioDTO(String legajo, String nombreCompleto, String sector, String... roles) {
        this.legajo = legajo;
        this.nombreCompleto = nombreCompleto;
        this.sector = sector;
        this.roles = new ArrayList<>(Arrays.asList(roles));
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    @Override
    public String toString() {
        return "UsuarioDTO{" +
                "legajo='" + legajo + '\'' +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", sector='" + sector + '\'' +
                ", roles=" + roles +
                '}';
    }
}