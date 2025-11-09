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
@Profile({"prod", "test"})
public class PtsController {

    private final IPtsService ptsService;

    // Inyección del servicio para manejar la lógica de Firestore
    public PtsController(IPtsService ptsService) {
        this.ptsService = ptsService;
    }

    // *******************************************************************
    // 1. ENDPOINT: BÚSQUEDA DE PTS CON FILTROS OPCIONALES
    // *******************************************************************
    /**
     * Busca PTS aplicando filtros opcionales.
     * Todos los parámetros son opcionales - sin parámetros devuelve todos los PTS.
     * 
     * @param equipo Filtro por nombre de equipo (búsqueda parcial)
     * @param usuario Filtro por nombre o legajo de solicitante (búsqueda parcial)
     * @param area Filtro por área (búsqueda parcial)
     * @param estado Filtro por estado RTO: PENDIENTE, CERRADO (búsqueda exacta)
     * @param fechaInicio Filtro por fecha de inicio en formato YYYY-MM-DD (búsqueda exacta)
     * @return Lista filtrada de PTS
     * 
     * Ejemplos de uso:
     * GET /api/pts - Todos los PTS
     * GET /api/pts?equipo=bomba - PTS que contengan "bomba" en equipoOInstalacion
     * GET /api/pts?usuario=juan - PTS del solicitante que contenga "juan"
     * GET /api/pts?estado=PENDIENTE - Solo PTS pendientes
     * GET /api/pts?area=mantenimiento&estado=CERRADO - PTS cerrados del área mantenimiento
     */
    @GetMapping
    public ResponseEntity<List<PermisoTrabajoSeguro>> searchPts(
            @RequestParam(required = false) String equipo,
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaInicio) {
        
        try {
            // Llama al nuevo método de búsqueda del servicio
            List<PermisoTrabajoSeguro> resultados = ptsService.buscarPts(equipo, usuario, area, estado, fechaInicio);
            return ResponseEntity.ok(resultados);
        } catch (RuntimeException e) {
            // En caso de error, devolver lista vacía y log del error
            System.err.println("Error en búsqueda de PTS: " + e.getMessage());
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    // *******************************************************************
    // 2. ENDPOINT: OBTENER PTS POR ID (Para DetallePTS)
    // *******************************************************************
    @GetMapping("/{id}")
    public ResponseEntity<?> getPtsById(@PathVariable String id) {
        try {
            System.out.println("Buscando PTS con ID: " + id);
            
            PermisoTrabajoSeguro pts = ptsService.getPtsById(id);
            
            if (pts == null) {
                System.out.println("PTS no encontrado: " + id);
                return new ResponseEntity<>("PTS no encontrado", HttpStatus.NOT_FOUND);
            }
            
            System.out.println("PTS encontrado: " + pts.getId() + " - " + pts.getDescripcionTrabajo());
            return ResponseEntity.ok(pts);
        } catch (RuntimeException e) {
            System.err.println("Error al buscar PTS " + id + ": " + e.getMessage());
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // *******************************************************************
    // 3. ENDPOINT: CREAR NUEVO PTS (Nuevo método para el formulario)
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