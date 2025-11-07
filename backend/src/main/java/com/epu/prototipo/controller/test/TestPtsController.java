package com.epu.prototipo.controller.test;

import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/pts")
@Profile("test")
public class TestPtsController {

    @GetMapping
    public List<PermisoTrabajoSeguro> getAllPts() {
        // Crear algunos PTS de prueba
        PermisoTrabajoSeguro pts1 = new PermisoTrabajoSeguro();
        pts1.setId("PTS-001");
        pts1.setDescripcionTrabajo("Mantenimiento de equipo eléctrico");
        pts1.setFechaInicio("2025-11-07");
        pts1.setUbicacion("Sala de máquinas");
        pts1.setSolicitanteLegajo("USR001");
        pts1.setTipoTrabajo("ELECTRICO");
        pts1.setArea("Mantenimiento");

        PermisoTrabajoSeguro pts2 = new PermisoTrabajoSeguro();
        pts2.setId("PTS-002");
        pts2.setDescripcionTrabajo("Reparación de tubería");
        pts2.setFechaInicio("2025-11-07");
        pts2.setUbicacion("Área de producción");
        pts2.setSolicitanteLegajo("USR002");
        pts2.setTipoTrabajo("MECANICO");
        pts2.setArea("Producción");

        return Arrays.asList(pts1, pts2);
    }

    // *******************************************************************
    // ENDPOINT: FIRMAR PTS (HU-005 - Firma Biométrica) - VERSIÓN TEST
    // *******************************************************************
    @PutMapping("/firmar")
    public ResponseEntity<?> firmarPts(@RequestBody FirmaPtsRequest request) {
        try {
            // Simulación para pruebas: crear un PTS firmado
            PermisoTrabajoSeguro ptsFirmado = new PermisoTrabajoSeguro();
            ptsFirmado.setId(request.getPtsId());
            ptsFirmado.setDescripcionTrabajo("PTS de prueba - FIRMADO");
            ptsFirmado.setFirmaSupervisorBase64(request.getFirmaBase64());
            ptsFirmado.setDniSupervisorFirmante(request.getDniFirmante());
            ptsFirmado.setFechaHoraFirmaSupervisor(LocalDateTime.now());
            ptsFirmado.setUbicacion("Área de pruebas");
            ptsFirmado.setTipoTrabajo("TEST");
            ptsFirmado.setArea("Test");
            
            return ResponseEntity.ok(ptsFirmado);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en firma de prueba: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
