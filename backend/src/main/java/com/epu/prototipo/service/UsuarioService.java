package com.epu.prototipo.service;

import com.epu.prototipo.dto.UsuarioDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Servicio in-memory para perfil test
// Simula la coleccion "usuarios" de Firestore

@Service
@Primary
@Profile("test")
public class UsuarioService implements IUsuarioService {

    // Base de datos en memoria
    private final Map<String, UsuarioDTO> baseDeDatosUsuarios = new HashMap<>();

    // Inicializacion de datos mock
    public UsuarioService() {
        baseDeDatosUsuarios.put("VINF011422", new UsuarioDTO("VINF011422", "Sergio Capella", "Control de Proceso", "EMISOR"));
        baseDeDatosUsuarios.put("SUP222", new UsuarioDTO("SUP222", "Carlos Supervisión", "Supervisión de Planta", "SUPERVISOR"));
        baseDeDatosUsuarios.put("EJE444", new UsuarioDTO("EJE444", "Ana Ejecutante", "Mantenimiento Eléctrico", "EJECUTANTE"));
        baseDeDatosUsuarios.put("ADM999", new UsuarioDTO("ADM999", "Admin Sistema", "IT", "ADMIN"));
        baseDeDatosUsuarios.put("RTO001", new UsuarioDTO("RTO001", "Pedro Mantenimiento", "Mantenimiento Mecánico", "RTO MANT"));
        baseDeDatosUsuarios.put("12345", new UsuarioDTO("12345", "Juan Pérez", "Operaciones Planta", "EMISOR"));
        baseDeDatosUsuarios.put("54321", new UsuarioDTO("54321", "Ana Gómez", "Mantenimiento Eléctrico", "EJECUTANTE"));
        baseDeDatosUsuarios.put("98765", new UsuarioDTO("98765", "Carlos Sanchez", "Seguridad e Higiene", "SUPERVISOR", "EMISOR"));
        baseDeDatosUsuarios.put("11111", new UsuarioDTO("11111", "María Rodriguez", "Control de Calidad", "EMISOR"));
    }

    @Override
    public UsuarioDTO getUsuarioByLegajo(String legajo) {
        UsuarioDTO usuario = baseDeDatosUsuarios.get(legajo);
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        return usuario;
    }

    @Override
    public List<UsuarioDTO> getAllUsuarios() {
        return new java.util.ArrayList<>(baseDeDatosUsuarios.values());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRol(String rol) {
        return baseDeDatosUsuarios.values().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> rol.equalsIgnoreCase(r)))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existeUsuario(String legajo) {
        return baseDeDatosUsuarios.containsKey(legajo);
    }

    @Override
    public UsuarioDTO createUsuario(UsuarioDTO usuario) {
        if (baseDeDatosUsuarios.containsKey(usuario.getLegajo())) {
            throw new RuntimeException("Ya existe un usuario con legajo: " + usuario.getLegajo());
        }
        baseDeDatosUsuarios.put(usuario.getLegajo(), usuario);
        return usuario;
    }

    @Override
    public UsuarioDTO updateUsuario(String legajo, UsuarioDTO usuario) {
        if (!baseDeDatosUsuarios.containsKey(legajo)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuario.setLegajo(legajo);
        baseDeDatosUsuarios.put(legajo, usuario);
        return usuario;
    }

    @Override
    public void deleteUsuario(String legajo) {
        if (!baseDeDatosUsuarios.containsKey(legajo)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        baseDeDatosUsuarios.remove(legajo);
    }
}