package com.epu.prototipo.dto;
// JwtResponse DTO - para construir el cuerpo JSON de la respuesta
 // (lo que el servidor envia de vuelta al frontend).
 
public class JwtResponse {
private String token; // Token Web JSON (credencial)
    private boolean requiresPasswordChange; // Flag sobre primer ingreso

    // Constructor usado por AuthController para genrerar la respuesta.
    
    public JwtResponse(String token, boolean requiresPasswordChange) {
        this.token = token;
        this.requiresPasswordChange = requiresPasswordChange;
    }
// --- Getters y Setters ---
public String getToken() {
        return token;
    }
public void setToken(String token) {
        this.token = token;
    }
public boolean isRequiresPasswordChange() {
        return requiresPasswordChange;
    }
public void setRequiresPasswordChange(boolean requiresPasswordChange) {
        this.requiresPasswordChange = requiresPasswordChange;
    }
}
