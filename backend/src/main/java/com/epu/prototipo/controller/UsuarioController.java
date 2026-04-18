package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.service.IUsuarioService;
import com.epu.prototipo.service.IPtsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

// Controlador REST para gestionar operaciones relacionadas con usuarios
// Soporta CRUD y consulta por rol (ej: supervisores)

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final IUsuarioService usuarioService;
    private final IPtsService ptsService;
    private final Random random = new Random();

    public UsuarioController(IUsuarioService usuarioService, IPtsService ptsService) {
        this.usuarioService = usuarioService;
        this.ptsService = ptsService;
    }

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.getAllUsuarios());
    }

    // Obtener usuarios filtrados por rol (ej: /api/usuarios/rol/SUPERVISOR)
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByRol(@PathVariable String rol) {
        return ResponseEntity.ok(usuarioService.getUsuariosByRol(rol));
    }

    // Simulación de lectura de huella: devuelve un receptor aleatorio con validación
    @GetMapping("/receptor-aleatorio")
    public ResponseEntity<Map<String, Object>> getReceptorAleatorio() {
        Map<String, Object> resultado = new HashMap<>();

        // Obtener todos los usuarios con rol RECEPTOR
        List<UsuarioDTO> receptores = usuarioService.getUsuariosByRol("RECEPTOR");
        if (receptores.isEmpty()) {
            resultado.put("error", true);
            resultado.put("mensaje", "El receptor no tiene los permisos correspondientes");
            return ResponseEntity.ok(resultado);
        }

        // Seleccionar uno al azar
        UsuarioDTO receptor = receptores.get(random.nextInt(receptores.size()));

        // Verificar si tiene un PTS abierto (estado PENDIENTE o FIRMADO_PEND_CIERRE)
        List<PermisoTrabajoSeguro> todosLosPts = ptsService.getAllPts();
        boolean tienePermisoAbierto = todosLosPts.stream().anyMatch(pts -> {
            String estado = pts.getRtoEstado();
            boolean estaAbierto = "PENDIENTE".equals(estado) || "FIRMADO_PEND_CIERRE".equals(estado);
            boolean esReceptor = receptor.getLegajo().equals(pts.getReceptorLegajo());
            return estaAbierto && esReceptor;
        });

        resultado.put("legajo", receptor.getLegajo());
        resultado.put("nombreCompleto", receptor.getNombreCompleto());
        resultado.put("sector", receptor.getSector());
        resultado.put("roles", receptor.getRoles());

        if (tienePermisoAbierto) {
            resultado.put("error", true);
            resultado.put("mensaje", "El receptor tiene un permiso abierto");
        } else {
            resultado.put("error", false);
            resultado.put("mensaje", "Receptor validado correctamente");
        }

        return ResponseEntity.ok(resultado);
    }

    // Obtener un usuario por legajo
    @GetMapping("/{legajo}")
    public ResponseEntity<UsuarioDTO> getUsuario(@PathVariable String legajo) {
        UsuarioDTO usuarioDTO = usuarioService.getUsuarioByLegajo(legajo);
        return ResponseEntity.ok(usuarioDTO);
    }

    // Crear un nuevo usuario
    @PostMapping
    public ResponseEntity<UsuarioDTO> createUsuario(@RequestBody UsuarioDTO usuario) {
        UsuarioDTO created = usuarioService.createUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Actualizar un usuario existente
    @PutMapping("/{legajo}")
    public ResponseEntity<UsuarioDTO> updateUsuario(@PathVariable String legajo, @RequestBody UsuarioDTO usuario) {
        UsuarioDTO updated = usuarioService.updateUsuario(legajo, usuario);
        return ResponseEntity.ok(updated);
    }

    // Eliminar un usuario
    @DeleteMapping("/{legajo}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable String legajo) {
        usuarioService.deleteUsuario(legajo);
        return ResponseEntity.noContent().build();
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("UsuarioController está funcionando correctamente");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleUsuarioNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}