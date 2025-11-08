package com.epu.prototipo.controller;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.service.IPtsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.util.List;

@RestController
@RequestMapping("/api/pts")
@Profile("prod")
public class PtsController {

    private final IPtsService ptsService;

    // Inyección del servicio para manejar la lógica de Firestore
    public PtsController(IPtsService ptsService) {
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

    // *******************************************************************
    // 3. ENDPOINT: FIRMAR PTS (HU-005 - Firma Biométrica)
    // *******************************************************************
    @PutMapping("/firmar")
    public ResponseEntity<?> firmarPts(@RequestBody FirmaPtsRequest request) {
        try {
            // Llama al servicio para firmar el PTS
            PermisoTrabajoSeguro ptsActualizado = ptsService.firmarPts(request);
            
            if (ptsActualizado == null) {
                return new ResponseEntity<>("PTS no encontrado", HttpStatus.NOT_FOUND);
            }
            
            return ResponseEntity.ok(ptsActualizado);
        } catch (SecurityException e) {
            return new ResponseEntity<>("Error de autorización: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Datos inválidos: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>("Estado inválido: " + e.getMessage(), HttpStatus.CONFLICT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // *******************************************************************
    // 4. ENDPOINT: CERRAR PTS (HU-019 - Retorno a Operaciones)
    // *******************************************************************
    @PutMapping("/cerrar")
    public ResponseEntity<?> cerrarPts(@RequestBody CerrarPtsRequest request) {
        try {
            // Validar que los datos requeridos estén presentes
            if (request.getPtsId() == null || request.getPtsId().trim().isEmpty()) {
                return new ResponseEntity<>("El ID del PTS es requerido", HttpStatus.BAD_REQUEST);
            }
            
            if (request.getRtoResponsableCierreLegajo() == null || request.getRtoResponsableCierreLegajo().trim().isEmpty()) {
                return new ResponseEntity<>("El legajo del responsable de cierre es requerido", HttpStatus.BAD_REQUEST);
            }
            
            // Llama al servicio para cerrar el PTS
            PermisoTrabajoSeguro ptsCerrado = ptsService.cerrarPts(request);
            
            if (ptsCerrado == null) {
                return new ResponseEntity<>("PTS no encontrado", HttpStatus.NOT_FOUND);
            }
            
            return ResponseEntity.ok(ptsCerrado);
        } catch (SecurityException e) {
            return new ResponseEntity<>("Error de autorización: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Datos inválidos: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>("Estado inválido del PTS: " + e.getMessage(), HttpStatus.CONFLICT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error interno al cerrar PTS: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}