package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Profile("test")
public class TestPtsService implements IPtsService {

    // Lista en memoria para almacenar PTS creados durante la sesión de prueba
    private final List<PermisoTrabajoSeguro> ptsInMemory = new ArrayList<>();

    public TestPtsService() {
        // Inicializar con datos de prueba
        initializeTestData();
    }

    private void initializeTestData() {
        PermisoTrabajoSeguro pts1 = new PermisoTrabajoSeguro();
        pts1.setId("PTS-001");
        pts1.setDescripcionTrabajo("Mantenimiento de equipo eléctrico");
        pts1.setFechaInicio("2025-11-07");
        pts1.setUbicacion("Sala de máquinas");
        pts1.setSolicitanteLegajo("USR001");
        pts1.setNombreSolicitante("Juan Pérez");
        pts1.setTipoTrabajo("ELECTRICO");
        pts1.setArea("Mantenimiento");
        pts1.setEquipoOInstalacion("Bomba Principal A1");
        pts1.setRtoEstado("PENDIENTE");

        PermisoTrabajoSeguro pts2 = new PermisoTrabajoSeguro();
        pts2.setId("PTS-002");
        pts2.setDescripcionTrabajo("Reparación de tubería");
        pts2.setFechaInicio("2025-11-08");
        pts2.setUbicacion("Área de producción");
        pts2.setSolicitanteLegajo("USR002");
        pts2.setNombreSolicitante("María González");
        pts2.setTipoTrabajo("MECANICO");
        pts2.setArea("Producción");
        pts2.setEquipoOInstalacion("Reactor Principal B2");
        pts2.setRtoEstado("CERRADO");

        // Agregar un tercer PTS para probar mejor los filtros
        PermisoTrabajoSeguro pts3 = new PermisoTrabajoSeguro();
        pts3.setId("PTS-003");
        pts3.setDescripcionTrabajo("Inspección de bomba secundaria");
        pts3.setFechaInicio("2025-11-07");
        pts3.setUbicacion("Planta de tratamiento");
        pts3.setSolicitanteLegajo("VINF011422");
        pts3.setNombreSolicitante("Carlos Martínez");
        pts3.setTipoTrabajo("INSPECCION");
        pts3.setArea("Mantenimiento");
        pts3.setEquipoOInstalacion("Bomba Secundaria C3");
        pts3.setRtoEstado("PENDIENTE");

        ptsInMemory.add(pts1);
        ptsInMemory.add(pts2);
        ptsInMemory.add(pts3);
    }

    @Override
    public List<PermisoTrabajoSeguro> getAllPts() {
        // Retornar copia de la lista para evitar modificaciones externas
        return new ArrayList<>(ptsInMemory);
    }

    @Override
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        // Generar ID único y agregar a la lista en memoria
        pts.setId("PTS-" + System.currentTimeMillis());
        ptsInMemory.add(pts);
        System.out.println("PTS creado en modo test: " + pts.getId() + " - " + pts.getDescripcionTrabajo());
        return pts;
    }

    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        // Buscar en la lista en memoria
        return ptsInMemory.stream()
                .filter(pts -> id.equals(pts.getId()))
                .findFirst()
                .orElse(null);
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

    @Override
    public PermisoTrabajoSeguro cerrarPts(CerrarPtsRequest request) {
        // En modo de prueba, simulamos el cierre del PTS sin validaciones complejas
        if (request == null) {
            throw new IllegalArgumentException("La solicitud de cierre no puede ser nula");
        }
        
        if (request.getPtsId() == null || request.getPtsId().trim().isEmpty()) {
            throw new IllegalArgumentException("El ID del PTS es requerido para el cierre");
        }
        
        if (request.getRtoResponsableCierreLegajo() == null || request.getRtoResponsableCierreLegajo().trim().isEmpty()) {
            throw new IllegalArgumentException("El legajo del responsable de cierre es requerido");
        }

        // Simular que encontramos el PTS
        PermisoTrabajoSeguro pts = getPtsById(request.getPtsId());
        if (pts == null) {
            return null; // PTS no encontrado
        }

        // Validaciones básicas en modo test
        if ("CERRADO".equals(pts.getRtoEstado())) {
            throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
        }
        
        if ("CANCELADO".equals(pts.getRtoEstado())) {
            throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
        }

        // Simular que el PTS debe estar firmado (en test mode, agregamos firma si no existe)
        if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty()) {
            // En modo test, simulamos que hay una firma para permitir el cierre
            pts.setFirmaSupervisorBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
            pts.setDniSupervisorFirmante("12345678");
            pts.setFechaHoraFirmaSupervisor(LocalDateTime.now().minusMinutes(5)); // Firmado hace 5 minutos
        }

        // Aplicar el cierre simulado
        pts.setRtoEstado("CERRADO");
        pts.setRtoResponsableCierreLegajo(request.getRtoResponsableCierreLegajo());
        pts.setRtoObservaciones(request.getRtoObservaciones());
        pts.setRtoFechaHoraCierre(LocalDateTime.now());

        System.out.println("PTS cerrado en modo test: " + request.getPtsId() + " por responsable: " + request.getRtoResponsableCierreLegajo());
        return pts;
    }

    @Override
    public List<PermisoTrabajoSeguro> buscarPts(String equipo, String usuario, String area, String estado, String fechaInicio) {
        System.out.println("Búsqueda de PTS en modo test - parámetros: equipo=" + equipo + 
                          ", usuario=" + usuario + ", area=" + area + 
                          ", estado=" + estado + ", fechaInicio=" + fechaInicio);
        
        // Obtener todos los PTS y aplicar filtros en memoria
        List<PermisoTrabajoSeguro> todosLosPts = getAllPts();
        List<PermisoTrabajoSeguro> resultado = new ArrayList<>(todosLosPts);
        
        // Aplicar filtros solo si los parámetros no están vacíos
        if (equipo != null && !equipo.trim().isEmpty()) {
            System.out.println("Filtrando por equipo: '" + equipo + "'");
            int antesDelFiltro = resultado.size();
            resultado = resultado.stream()
                .filter(pts -> {
                    boolean coincide = pts.getEquipoOInstalacion() != null && 
                                     pts.getEquipoOInstalacion().toLowerCase().contains(equipo.toLowerCase());
                    System.out.println("PTS " + pts.getId() + " - Equipo: '" + pts.getEquipoOInstalacion() + "' - Coincide: " + coincide);
                    return coincide;
                })
                .collect(java.util.stream.Collectors.toList());
            System.out.println("Resultados después del filtro equipo: " + antesDelFiltro + " -> " + resultado.size());
        }
        
        if (usuario != null && !usuario.trim().isEmpty()) {
            resultado = resultado.stream()
                .filter(pts -> (pts.getSolicitanteLegajo() != null && 
                               pts.getSolicitanteLegajo().toLowerCase().contains(usuario.toLowerCase())) ||
                              (pts.getNombreSolicitante() != null &&
                               pts.getNombreSolicitante().toLowerCase().contains(usuario.toLowerCase())))
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (area != null && !area.trim().isEmpty()) {
            resultado = resultado.stream()
                .filter(pts -> pts.getArea() != null && 
                             pts.getArea().toLowerCase().contains(area.toLowerCase()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (estado != null && !estado.trim().isEmpty()) {
            resultado = resultado.stream()
                .filter(pts -> estado.equals(pts.getRtoEstado()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (fechaInicio != null && !fechaInicio.trim().isEmpty()) {
            resultado = resultado.stream()
                .filter(pts -> fechaInicio.equals(pts.getFechaInicio()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        System.out.println("Resultados encontrados en modo test: " + resultado.size());
        return resultado;
    }
}