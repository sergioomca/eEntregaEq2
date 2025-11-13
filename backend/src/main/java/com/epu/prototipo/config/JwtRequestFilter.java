package com.epu.prototipo.config;

import com.epu.prototipo.security.service.UserDetailsServiceCustom;
import com.epu.prototipo.util.JwtTokenUtil;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull; 
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que se ejecuta UNA VEZ por cada peticion.
 * Intercepta peticion, busca el token JWT, lo valida,
 * y establece la autenticación en Spring Security.
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceCustom userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        // Para obtener el encabezado 'Authorization'
        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // Para validar el encabezado y extraer el token
        // El token JWT se envia en el formato "Bearer <token>"
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7); // Extrae solo el token
            try {
                // Para obtener el legajo (username) del token
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                System.err.println("No se pudo obtener el legajo del token JWT.");
            } catch (ExpiredJwtException e) {
                System.err.println("El token JWT ha expirado.");
            }
        } else {
            // Si el encabezado no existe o no es Bearer
            logger.warn("El token JWT no comienza con 'Bearer ' o no existe.");
        }

        // Una vez que tenemos el username (del token) y no hay autenticacion
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Para cargar los detalles del usuario 
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Para validar el token, compara el username del token con el UserDetails y verifica la firma (usando la clave secreta)
            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {

                // AUTENTICACION OK
                // Si el token es válido, se crea la autenticacion para Spring Security
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Se establece la autenticacion en el Contexto de Seguridad
                // Esto confirma a @PreAuthorize que el usuario esta logueado
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        
        //Otros filtros de Spring
        chain.doFilter(request, response);
    }
}