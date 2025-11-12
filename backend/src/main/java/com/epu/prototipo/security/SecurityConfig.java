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
                // Permite acceso libre a la ruta de autenticacion y al listado de PTS
                .requestMatchers("/api/auth/**", "/api/pts", "/api/pts/**").permitAll()
                // Endpoint de prueba de usuarios
                .requestMatchers("/api/usuarios/test").permitAll()
                // Endpoint de usuarios requiere autenticacion
                .requestMatchers("/api/usuarios/**").authenticated()
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
        
        // !!! revisar Importante para que funcione el HTML 
        // Permitir el origen de Vite (5173, 5174), Live Server (5500) y 'null' (para abrir el archivo directo)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5500", "http://localhost:3000", "null")); 
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Access-Control-Allow-Origin"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar la configuracion CORS a todas las rutas
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}
