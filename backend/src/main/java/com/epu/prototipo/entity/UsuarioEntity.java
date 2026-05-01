package com.epu.prototipo.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class UsuarioEntity {

    @Id
    @Column(length = 50)
    private String legajo;

    @Column(length = 200)
    private String nombreCompleto;

    @Column(length = 100)
    private String sector;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_roles", joinColumns = @JoinColumn(name = "legajo"))
    @Column(name = "rol", length = 50)
    private List<String> roles = new ArrayList<>();

    @Column(length = 200)
    private String password;

    private boolean mustChangePassword;

    @Column(length = 500)
    private String huellaDigital;

    private int failedLoginAttempts = 0;

    private boolean isAccountLocked = false;

    public UsuarioEntity() {}

    // Getters y Setters
    public String getLegajo() { return legajo; }
    public void setLegajo(String legajo) { this.legajo = legajo; }
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }
    public String getHuellaDigital() { return huellaDigital; }
    public void setHuellaDigital(String huellaDigital) { this.huellaDigital = huellaDigital; }
    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
    public boolean isAccountLocked() { return isAccountLocked; }
    public void setAccountLocked(boolean accountLocked) { isAccountLocked = accountLocked; }
}
