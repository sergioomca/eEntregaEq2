package com.epu.prototipo.service;

import com.epu.prototipo.dto.UsuarioDTO;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Servicio que simula una base de datos externa de usuarios
 * Proporciona funcionalidad de búsqueda de usuarios por legajo
 */
@Service
public class UsuarioService {

    // Base de datos externa simulada
    private static final Map<String, UsuarioDTO> baseDeDatosExterna = new HashMap<>();

    // Inicialización de datos mock en bloque estático
    static {
        baseDeDatosExterna.put("12345", new UsuarioDTO("12345", "Juan Pérez", "Operaciones Planta"));
        baseDeDatosExterna.put("54321", new UsuarioDTO("54321", "Ana Gómez", "Mantenimiento Eléctrico"));
        baseDeDatosExterna.put("98765", new UsuarioDTO("98765", "Carlos Sanchez", "Seguridad e Higiene"));
        baseDeDatosExterna.put("11111", new UsuarioDTO("11111", "María Rodriguez", "Control de Calidad"));
    }

    /**
     * Busca un usuario por su número de legajo
     * @param legajo Número de legajo del usuario a buscar
     * @return UsuarioDTO con la información del usuario
     * @throws RuntimeException si el usuario no se encuentra
     */
    public UsuarioDTO getUsuarioByLegajo(String legajo) {
        if (baseDeDatosExterna.containsKey(legajo)) {
            return baseDeDatosExterna.get(legajo);
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }

    /**
     * Método auxiliar para obtener todos los usuarios (útil para debugging)
     * @return Map con todos los usuarios disponibles
     */
    public Map<String, UsuarioDTO> getAllUsuarios() {
        return new HashMap<>(baseDeDatosExterna);
    }

    /**
     * Método auxiliar para verificar si existe un usuario
     * @param legajo Número de legajo a verificar
     * @return true si el usuario existe, false en caso contrario
     */
    public boolean existeUsuario(String legajo) {
        return baseDeDatosExterna.containsKey(legajo);
    }
}