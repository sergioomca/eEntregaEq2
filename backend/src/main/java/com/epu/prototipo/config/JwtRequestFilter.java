package com.epu.prototipo.config;

import com.epu.prototipo.security.service.UserDetailsServiceCustom;
import com.epu.prototipo.util.JwtTokenUtil;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull; // Import para @NonNull
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que se ejecuta UNA VEZ por cada petición.
 * Intercepta la petición, busca el token JWT, lo valida,
 * y establece la autenticación en el contexto de Spring Security.
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

        // 1. Obtener el encabezado 'Authorization'
        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // 2. Validar el encabezado y extraer el token
        // El token JWT se envía en el formato "Bearer <token>"
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7); // Extrae solo el token
            try {
                // 3. Obtener el legajo (username) del token
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

        // 4. Una vez que tenemos el username (del token) y no hay autenticación en el contexto...
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Cargar los detalles del usuario desde nuestro servicio
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 6. Validar el token
            // Compara el username del token con el UserDetails y verifica la firma (usando la clave secreta)
            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {

                // 7. AUTENTICACIÓN EXITOSA
                // Si el token es válido, creamos la autenticación para Spring Security
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 8. Establecemos la autenticación en el Contexto de Seguridad
                // ¡Esto es lo que le dice a @PreAuthorize que el usuario está logueado!
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        
        // 9. Continuar con el resto de los filtros de Spring
        chain.doFilter(request, response);
    }
}