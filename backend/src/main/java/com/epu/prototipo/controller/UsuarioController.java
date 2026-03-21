package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.service.IUsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controlador REST para gestionar operaciones relacionadas con usuarios
// Soporta CRUD y consulta por rol (ej: supervisores)

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final IUsuarioService usuarioService;

    public UsuarioController(IUsuarioService usuarioService) {
        this.usuarioService = usuarioService;
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