package com.epu.prototipo.config;

import com.google.cloud.firestore.Firestore;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuración para desarrollo/local: provee un mock de Firestore cuando se activa
 * el perfil 'local'. Esto permite arrancar la app sin el archivo de credenciales de Firebase.
 */
@Configuration
@Profile("local")
public class LocalFirestoreConfig {

    @Bean
    public Firestore firestore() {
        // Mockito se usa aquí para devolver un mock ligero de Firestore en entorno local.
        return Mockito.mock(Firestore.class);
    }
}
