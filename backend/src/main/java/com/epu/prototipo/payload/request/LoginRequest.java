package com.epu.prototipo.payload.request;
// LoginRequest DTO - Para mapear el JSON entrante. (payload de la petición POST) a un objeto Java.

public class LoginRequest {
// Los nombres de estas variables DEBEN coincidir con las claves del JSON esperado
    private String legajo;
    private String password;
    public LoginRequest() {
    }
// --- Getters y Setters ---
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

