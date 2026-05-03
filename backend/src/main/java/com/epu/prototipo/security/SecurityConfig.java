package com.epu.prototipo.security;

import com.epu.prototipo.config.JwtRequestFilter; 
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@Profile("!test")
public class SecurityConfig { 

    private final JwtRequestFilter jwtRequestFilter;

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins}")
    private String allowedOrigins;

    // Aca el filtro JWT
    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    // Bean principal de la cadena de filtros de seguridad
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configuracion de CORS (usado importante para el HTML/Frontend)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Deshabilitado CSRF (usado para APIs REST sin sesiones)
            .csrf(csrf -> csrf.disable())
            
            // Configuracion de autorizacion de rutas
            .authorizeHttpRequests(auth -> auth
                    // Login público
                    .requestMatchers("/api/auth/login").permitAll()
                    // Cambio de contraseña requiere token
                    .requestMatchers("/api/auth/cambiar-contrasena").authenticated()
                    // Desbloqueo de cuenta solo para ADMIN
                    .requestMatchers("/api/auth/desbloquear-cuenta").hasRole("ADMIN")
                    // Bloqueo de cuenta solo para ADMIN
                    .requestMatchers("/api/auth/bloquear-cuenta").hasRole("ADMIN")
                    // Endpoints PTS públicos
                    .requestMatchers("/api/pts", "/api/pts/**").permitAll()
                    .requestMatchers("/public/consulta/**").permitAll()
                // PAra prueba de usuarios
                .requestMatchers("/api/usuarios/test").permitAll()
                // Endpoint de usuarios requiere autenticacion
                .requestMatchers("/api/usuarios", "/api/usuarios/**").authenticated()
                // Endpoints de equipos requieren autenticacion
                .requestMatchers("/api/equipos/**").authenticated()
                // Cualquier otra solicitud debe estar autenticada
                .anyRequest().authenticated()
            )
            
            // Configuracion de sesion Stateless (para JWT)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Agregado de filtro JWT personalizado antes del filtro de autenticacion estandar
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Bean configuracion de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origenes permitidos desde application.properties
        List<String> origins = new java.util.ArrayList<>(Arrays.asList(allowedOrigins.split(",")));
        origins.add("null"); // Para abrir archivos locales directamente
        configuration.setAllowedOrigins(origins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Access-Control-Allow-Origin"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar la configuracion CORS a todas las rutas
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}
