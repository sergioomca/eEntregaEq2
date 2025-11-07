package com.epu.prototipo.service;

import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Profile("test")
public class TestPtsService implements IPtsService {

    @Override
    public List<PermisoTrabajoSeguro> getAllPts() {
        // Retornar datos de prueba
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

    @Override
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        // En modo de prueba, solo devolvemos el mismo PTS con un ID asignado
        pts.setId("PTS-" + System.currentTimeMillis());
        return pts;
    }

    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        // En modo de prueba, devolvemos un PTS simulado si el ID coincide
        if ("PTS-001".equals(id) || "PTS-002".equals(id)) {
            PermisoTrabajoSeguro pts = new PermisoTrabajoSeguro();
            pts.setId(id);
            pts.setDescripcionTrabajo("PTS de prueba");
            pts.setFechaInicio("2025-11-07");
            pts.setUbicacion("Ubicación de prueba");
            pts.setSupervisorLegajo("12345678"); // Supervisor de prueba
            return pts;
        }
        return null;
    }

    @Override
    public PermisoTrabajoSeguro firmarPts(FirmaPtsRequest request) {
        // En modo de prueba, simulamos la firma sin validaciones complejas
        if (request.getPtsId() == null || request.getDniFirmante() == null) {
            throw new IllegalArgumentException("PTS ID y DNI del firmante son requeridos.");
        }

        // Simular que encontramos el PTS
        PermisoTrabajoSeguro pts = getPtsById(request.getPtsId());
        if (pts == null) {
            return null; // PTS no encontrado
        }

        // Validación básica en modo test
        if (!"12345678".equals(request.getDniFirmante())) {
            throw new SecurityException("DNI del firmante no autorizado en modo test.");
        }

        // Simular que ya está firmado
        if (pts.getFirmaSupervisorBase64() != null) {
            throw new IllegalStateException("El PTS ya ha sido firmado.");
        }

        // Aplicar la firma simulada
        pts.setFirmaSupervisorBase64(request.getFirmaBase64());
        pts.setDniSupervisorFirmante(request.getDniFirmante());
        pts.setFechaHoraFirmaSupervisor(LocalDateTime.now());

        System.out.println("PTS firmado en modo test: " + request.getPtsId());
        return pts;
    }
}