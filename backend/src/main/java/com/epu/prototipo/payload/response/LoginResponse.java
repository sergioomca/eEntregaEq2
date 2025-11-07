package com.epu.prototipo.payload.response;

import java.io.Serializable;

/**
 * DTO para la respuesta del endpoint de autenticación.
 * Contiene el token JWT y el estado de cambio de contraseña.
 */
public class LoginResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String token;
    private final boolean requiresPasswordChange;

    public LoginResponse(String token, boolean requiresPasswordChange) {
        this.token = token;
        this.requiresPasswordChange = requiresPasswordChange;
    }

    public String getToken() {
        return token;
    }

    public boolean isRequiresPasswordChange() {
        return requiresPasswordChange;
    }
}