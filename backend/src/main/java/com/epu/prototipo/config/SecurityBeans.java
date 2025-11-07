package com.epu.prototipo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // Se usa para desarrollo/prototipado

import java.util.HashMap;
import java.util.Map;

/**
 * Define el PasswordEncoder para la aplicación.
 * Temporalmente configurado para usar NoOpPasswordEncoder ({noop}) para fines de prototipado,
 * permitiendo avanzar sin problemas de hash. DEBE ser reemplazado por BCrypt o PBKDF2 en producción.
 */
@Configuration
public class SecurityBeans {

    /**
     * Configura un DelegatingPasswordEncoder que usa {noop} como codificador por defecto.
     * El {noop} es el NoOpPasswordEncoder, que no hace hashing (texto plano),
     * y se usa solo para desarrollo.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Mapeo de codificadores
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        // 🚨 Configuración temporal de prototipado: {noop} = NoOpPasswordEncoder
        encoders.put("noop", NoOpPasswordEncoder.getInstance());
        
        // Creamos el DelegatingPasswordEncoder y definimos {noop} como el ID por defecto
        DelegatingPasswordEncoder delegatingPasswordEncoder = new DelegatingPasswordEncoder("noop", encoders);
        
        return delegatingPasswordEncoder;
    }
}