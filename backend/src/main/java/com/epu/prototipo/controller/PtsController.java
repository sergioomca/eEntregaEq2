package com.epu.prototipo.controller;

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.service.PtsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/pts")
@Profile("prod")
public class PtsController {

    private final PtsService ptsService;

    // Inyección del servicio para manejar la lógica de Firestore
    public PtsController(PtsService ptsService) {
        this.ptsService = ptsService;
    }

    // *******************************************************************
    // 1. ENDPOINT: LISTADO DE PTS (ya lo tenías, mantenemos el @GetMapping)
    // *******************************************************************
    @GetMapping
    public ResponseEntity<List<PermisoTrabajoSeguro>> getAllPts() {
        return ResponseEntity.ok(ptsService.getAllPts());
    }

    // *******************************************************************
    // 2. ENDPOINT: CREAR NUEVO PTS (Nuevo método para el formulario)
    // *******************************************************************
    @PostMapping
    public ResponseEntity<?> createPts(@RequestBody PermisoTrabajoSeguro pts) {
        try {
            // El objeto PermisoTrabajoSeguro se recibe del cuerpo de la solicitud (JSON)
            // Llama al servicio para persistir el objeto en Firestore
            PermisoTrabajoSeguro newPts = ptsService.createPts(pts);
            
            // Retorna el objeto creado (con el ID de Firestore) y el estado 201 Created
            return new ResponseEntity<>(newPts, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Manejo de errores de Firestore
            return new ResponseEntity<>("Error al crear el PTS: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}