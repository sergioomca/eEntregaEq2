package com.epu.prototipo.dto;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// DTO para representar la informacion basica de usuario

public class UsuarioDTO {
    private String legajo;
    private String nombreCompleto;
    private String sector;
    // Roles posibles: "EMISOR" | "SUPERVISOR" | "EJECUTANTE" | "RECEPTOR" | "ADMIN" | "RTO_MANT" | "EHS" | "LIDER"
    private List<String> roles;
    private String password;              // Contraseña del usuario (texto plano con {noop})
    private boolean mustChangePassword;   // true si debe cambiar contraseña en primer ingreso
    private String huellaDigital;          // Hash de huella digital del usuario (simulado)
    private int failedLoginAttempts;      // Número de intentos fallidos de login
    private boolean isAccountLocked;      // true si la cuenta está bloqueada

    // Constructor vacio para JSON
    public UsuarioDTO() {
        this.roles = new ArrayList<>();
        this.mustChangePassword = false;
        this.failedLoginAttempts = 0;
        this.isAccountLocked = false;
    }

    // Constructor con parametros (sin roles)
    public UsuarioDTO(String legajo, String nombreCompleto, String sector) {
        this.legajo = legajo;
        this.nombreCompleto = nombreCompleto;
        this.sector = sector;
        this.roles = new ArrayList<>();
        this.password = legajo; // contraseña por defecto = legajo
        this.mustChangePassword = false;
        this.failedLoginAttempts = 0;
        this.isAccountLocked = false;
    }

    // Constructor completo con roles
    public UsuarioDTO(String legajo, String nombreCompleto, String sector, String... roles) {
        this.legajo = legajo;
        this.nombreCompleto = nombreCompleto;
        this.sector = sector;
        this.roles = new ArrayList<>(Arrays.asList(roles));
        this.password = legajo; // contraseña por defecto = legajo
        this.mustChangePassword = false;
        this.failedLoginAttempts = 0;
        this.isAccountLocked = false;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }

    public String getHuellaDigital() {
        return huellaDigital;
    }

    public void setHuellaDigital(String huellaDigital) {
        this.huellaDigital = huellaDigital;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public boolean isAccountLocked() {
        return isAccountLocked;
    }

    public void setAccountLocked(boolean accountLocked) {
        isAccountLocked = accountLocked;
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