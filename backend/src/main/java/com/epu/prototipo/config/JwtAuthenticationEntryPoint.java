package com.epu.prototipo.config;

import java.io.IOException;
import java.io.Serializable;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Maneja el 'No Autorizado' (401) cuando se intenta acceder a un recurso 
 * protegido sin credenciales (JWT) validas o sin token.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint, Serializable {

    private static final long serialVersionUID = 1L;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        // Devuelve un error 401 (Unauthorized) con un mensaje de error claro
        // Esto se activa cuando el usuario intenta acceder a un recurso protegido sin un token valido
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: " + authException.getMessage());
    }
}