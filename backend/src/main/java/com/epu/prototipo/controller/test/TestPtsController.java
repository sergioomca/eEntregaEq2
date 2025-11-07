package com.epu.prototipo.controller.test;

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        pts1.setSolicitante("USR001");
        pts1.setTipoTrabajo("ELECTRICO");
        pts1.setArea("Mantenimiento");

        PermisoTrabajoSeguro pts2 = new PermisoTrabajoSeguro();
        pts2.setId("PTS-002");
        pts2.setDescripcionTrabajo("Reparación de tubería");
        pts2.setFechaInicio("2025-11-07");
        pts2.setUbicacion("Área de producción");
        pts2.setSolicitante("USR002");
        pts2.setTipoTrabajo("MECANICO");
        pts2.setArea("Producción");

        return Arrays.asList(pts1, pts2);
    }
}