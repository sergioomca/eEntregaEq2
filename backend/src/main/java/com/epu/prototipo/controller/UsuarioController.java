package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestionar operaciones relacionadas con usuarios
 * Proporciona endpoints publicos para consultar informacion de usuarios externos
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Para inyectar dependencias vía constructor
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Obtiene la informacion de un usuario por su numero de legajo
     * @param legajo 
     * @return ResponseEntity con UsuarioDTO si se encuentra, o error 404 si no existe
     */
    @GetMapping("/{legajo}")
    public ResponseEntity<UsuarioDTO> getUsuario(@PathVariable String legajo) {
        UsuarioDTO usuarioDTO = usuarioService.getUsuarioByLegajo(legajo);
        return ResponseEntity.ok(usuarioDTO);
    }

    /**
     * Endpoint de prueba para verificar que el controlador funciona
     * @return 
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("UsuarioController está funcionando correctamente");
    }

    /**
     * Maneja las excepciones cuando un usuario no es encontrado
     * retorna 404 NOT_FOUND
     * @param ex RuntimeException enviada por el servicio
     * @return ResponseEntity con mensaje de error y status 404
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleUsuarioNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}