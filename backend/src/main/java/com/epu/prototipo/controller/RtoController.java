package com.epu.prototipo.controller;

import com.epu.prototipo.model.RetornoOperaciones;
import com.epu.prototipo.service.IRtoService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rto")
@Profile({"prod", "test"})
public class RtoController {

    private final IRtoService rtoService;

    public RtoController(IRtoService rtoService) {
        this.rtoService = rtoService;
    }

    // Crear un nuevo RTO
    @PostMapping
    public ResponseEntity<?> createRto(@RequestBody RetornoOperaciones rto) {
        try {
            RetornoOperaciones created = rtoService.createRto(rto);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error al crear RTO: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener todos los RTOs
    @GetMapping
    public ResponseEntity<List<RetornoOperaciones>> getAllRtos() {
        return ResponseEntity.ok(rtoService.getAllRtos());
    }

    // Obtener RTOs abiertos
    @GetMapping("/abiertos")
    public ResponseEntity<List<RetornoOperaciones>> getRtosAbiertos() {
        return ResponseEntity.ok(rtoService.getRtosAbiertos());
    }

    // Obtener un RTO por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getRtoById(@PathVariable String id) {
        RetornoOperaciones rto = rtoService.getRtoById(id);
        if (rto == null) {
            return new ResponseEntity<>("RTO no encontrado", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(rto);
    }

    // Obtener RTO abierto por tag de equipo
    @GetMapping("/equipo/{tag}")
    public ResponseEntity<?> getRtoByEquipoTag(@PathVariable String tag) {
        RetornoOperaciones rto = rtoService.getRtoByEquipoTag(tag);
        if (rto == null) {
            return new ResponseEntity<>("No hay RTO abierto para el equipo: " + tag, HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(rto);
    }

    // Agregar un PTS a un RTO existente
    @PostMapping("/{rtoId}/pts/{ptsId}")
    public ResponseEntity<?> agregarPtsAlRto(@PathVariable String rtoId, @PathVariable String ptsId) {
        try {
            RetornoOperaciones rto = rtoService.agregarPtsAlRto(rtoId, ptsId);
            return ResponseEntity.ok(rto);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Cerrar una especialidad del RTO
    @PutMapping("/{rtoId}/especialidad/{nombre}/cerrar")
    public ResponseEntity<?> cerrarEspecialidad(
            @PathVariable String rtoId,
            @PathVariable String nombre,
            @RequestBody Map<String, String> body) {
        try {
            String responsableLegajo = body.get("responsableLegajo");
            String observaciones = body.get("observaciones");

            if (responsableLegajo == null || responsableLegajo.trim().isEmpty()) {
                return new ResponseEntity<>("El legajo del responsable es requerido", HttpStatus.BAD_REQUEST);
            }

            RetornoOperaciones rto = rtoService.cerrarEspecialidad(rtoId, nombre, responsableLegajo, observaciones);
            return ResponseEntity.ok(rto);
        } catch (SecurityException e) {
            return new ResponseEntity<>("Error de autorización: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>("Estado inválido: " + e.getMessage(), HttpStatus.CONFLICT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
