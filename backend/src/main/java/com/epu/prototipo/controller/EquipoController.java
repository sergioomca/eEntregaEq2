package com.epu.prototipo.controller;

import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.service.EquipoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {
    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    // Endpoint 1: Obtener todos los equipos
    @GetMapping
    public ResponseEntity<List<Equipo>> getAllEquipos() {
        return ResponseEntity.ok(equipoService.getAllEquipos());
    }

    // Endpoint 2: Obtener un equipo por tag
    @GetMapping("/{tag}")
    public ResponseEntity<Equipo> getEquipo(@PathVariable String tag) {
        return ResponseEntity.ok(equipoService.getEquipoByTag(tag));
    }

    // Manejo de errores: Equipo no encontrado
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleEquipoNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
