package com.epu.prototipo.dto;
/**
 * JwtResponse DTO: Usado para construir el cuerpo JSON de la respuesta
 * (lo que el servidor envía de vuelta al frontend).
 */
public class JwtResponse {
private String token; // Contiene el Token Web JSON (la credencial)
    private boolean requiresPasswordChange; // Flag de la HU-001/002 sobre primer ingreso
/**
     * Constructor utilizado por el AuthController para poblar la respuesta.
     */
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
// El getter para booleanos suele ser 'is' en lugar de 'get'
    public boolean isRequiresPasswordChange() {
        return requiresPasswordChange;
    }
public void setRequiresPasswordChange(boolean requiresPasswordChange) {
        this.requiresPasswordChange = requiresPasswordChange;
    }
}
