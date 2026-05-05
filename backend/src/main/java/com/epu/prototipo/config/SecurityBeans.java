package com.epu.prototipo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // Se usa para desarrollo/prototipado
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

// Se define el PasswordEncoder para la aplicacion.
// Configuracion de transicion: PBKDF2 por defecto + {noop} temporal para compatibilidad
// con contraseñas legacy en texto plano.

@Configuration
public class SecurityBeans {

    // DelegatingPasswordEncoder con PBKDF2 por defecto.
    // {noop} queda temporalmente para permitir login de usuarios legacy.
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        Pbkdf2PasswordEncoder pbkdf2Encoder = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();

        Map<String, PasswordEncoder> encoders = new HashMap<>();
        encoders.put("pbkdf2", pbkdf2Encoder);
        encoders.put("noop", NoOpPasswordEncoder.getInstance());
        
        DelegatingPasswordEncoder delegatingPasswordEncoder = new DelegatingPasswordEncoder("pbkdf2", encoders);
        
        return delegatingPasswordEncoder;
    }
}