package com.epu.prototipo.controller;

import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.service.IEquipoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {
    private final IEquipoService equipoService;

    public EquipoController(IEquipoService equipoService) {
        this.equipoService = equipoService;
    }

    //  Obtener todos los equipos
    @GetMapping
    public ResponseEntity<List<Equipo>> getAllEquipos() {
        return ResponseEntity.ok(equipoService.getAllEquipos());
    }

    // Obtener un equipo por tag
    @GetMapping("/{tag}")
    public ResponseEntity<Equipo> getEquipo(@PathVariable String tag) {
        return ResponseEntity.ok(equipoService.getEquipoByTag(tag));
    }

    // Crear un nuevo equipo
    @PostMapping
    public ResponseEntity<Equipo> createEquipo(@RequestBody Equipo equipo) {
        Equipo created = equipoService.createEquipo(equipo);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Actualizar un equipo
    @PutMapping("/{tag}")
    public ResponseEntity<Equipo> updateEquipo(@PathVariable String tag, @RequestBody Equipo equipo) {
        Equipo updated = equipoService.updateEquipo(tag, equipo);
        return ResponseEntity.ok(updated);
    }

    // Eliminar un equipo
    @DeleteMapping("/{tag}")
    public ResponseEntity<Void> deleteEquipo(@PathVariable String tag) {
        equipoService.deleteEquipo(tag);
        return ResponseEntity.noContent().build();
    }

    // Actualizar estadoDcs de un equipo
    @PostMapping("/{tag}/estado")
    public ResponseEntity<Equipo> actualizarEstadoDcs(@PathVariable String tag, @RequestBody String nuevoEstadoDcs) {
        Equipo equipo = equipoService.actualizarEstadoEquipo(tag, nuevoEstadoDcs.replaceAll("\"", ""));
        return ResponseEntity.ok(equipo);
    }

    // Actualizar condicion de un equipo
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
