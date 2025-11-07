package com.epu.prototipo.payload.request;
/**
 * LoginRequest DTO: Usado para mapear el cuerpo JSON entrante
 * (el payload de la petición POST) a un objeto Java.
 */
public class LoginRequest {
// Los nombres de estas variables DEBEN coincidir con las claves del JSON esperado
    private String legajo;
    private String password;
/**
     * Constructor vacío. Requerido por la librería Jackson de Spring
     * para deserializar (convertir JSON a objeto Java).
     */
    public LoginRequest() {
    }
// --- Getters y Setters ---
    // Son necesarios para que Jackson pueda acceder y modificar los campos privados.
public String getLegajo() {
        return legajo;
    }
public void setLegajo(String legajo) {
        this.legajo = legajo;
    }
public String getPassword() {
        return password;
    }
public void setPassword(String password) {
        this.password = password;
    }
}

