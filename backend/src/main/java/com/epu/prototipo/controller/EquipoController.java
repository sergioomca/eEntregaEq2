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

    // Endpoint: Actualizar estadoDcs de un equipo
    @PostMapping("/{tag}/estado")
    public ResponseEntity<Equipo> actualizarEstadoDcs(@PathVariable String tag, @RequestBody String nuevoEstadoDcs) {
        Equipo equipo = equipoService.actualizarEstadoEquipo(tag, nuevoEstadoDcs.replaceAll("\"", ""));
        return ResponseEntity.ok(equipo);
    }

    // Endpoint: Actualizar condicion de un equipo
    @PostMapping("/{tag}/condicion")
    public ResponseEntity<Equipo> actualizarCondicion(@PathVariable String tag, @RequestBody String nuevaCondicion) {
        Equipo equipo = equipoService.actualizarCondicionEquipo(tag, nuevaCondicion.replaceAll("\"", ""));
        return ResponseEntity.ok(equipo);
    }

    // Manejo de errores: Equipo no encontrado
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleEquipoNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
