package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestionar operaciones relacionadas con usuarios
 * Proporciona endpoints públicos para consultar información de usuarios externos
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Inyección de dependencias vía constructor
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Obtiene la información de un usuario por su número de legajo
     * @param legajo Número de legajo del usuario a buscar
     * @return ResponseEntity con UsuarioDTO si se encuentra, o error 404 si no existe
     */
    @GetMapping("/{legajo}")
    public ResponseEntity<UsuarioDTO> getUsuario(@PathVariable String legajo) {
        UsuarioDTO usuarioDTO = usuarioService.getUsuarioByLegajo(legajo);
        return ResponseEntity.ok(usuarioDTO);
    }

    /**
     * Endpoint de prueba para verificar que el controlador funciona
     * @return mensaje de confirmación
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("UsuarioController está funcionando correctamente");
    }

    /**
     * Maneja las excepciones cuando un usuario no es encontrado
     * Cumple con el Criterio de Aceptación 2: retorna 404 NOT_FOUND
     * @param ex RuntimeException lanzada por el servicio
     * @return ResponseEntity con mensaje de error y status 404
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleUsuarioNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}