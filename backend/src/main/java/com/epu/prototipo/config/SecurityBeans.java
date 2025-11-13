package com.epu.prototipo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // Se usa para desarrollo/prototipado

import java.util.HashMap;
import java.util.Map;

/**
 * Se define el PasswordEncoder para la aplicacion.
 * Temporalmente configurado para usar NoOpPasswordEncoder ({noop}) para fines de prototipado,
 * para que permita continuar sin problemas de hash. 
 * !!! Luego reemplazar por BCrypt o PBKDF2.
 */
@Configuration
public class SecurityBeans {

    /**
     * Se configura un DelegatingPasswordEncoder que usa {noop} como codificador por defecto.
     * El {noop} es el NoOpPasswordEncoder, que no hace hashing (texto plano),
     * !!! se usa solo para desarrollo.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Mapeo de codificadores
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        // Configuración temporal de prototipado: {noop} = NoOpPasswordEncoder
        encoders.put("noop", NoOpPasswordEncoder.getInstance());
        
        // Se creas el DelegatingPasswordEncoder y se define {noop} como ID por defecto
        DelegatingPasswordEncoder delegatingPasswordEncoder = new DelegatingPasswordEncoder("noop", encoders);
        
        return delegatingPasswordEncoder;
    }
}