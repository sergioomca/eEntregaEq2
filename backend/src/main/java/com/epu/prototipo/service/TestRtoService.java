package com.epu.prototipo.service;

import com.epu.prototipo.model.CondicionEquipo;
import com.epu.prototipo.model.EstadoRto;
import com.epu.prototipo.model.RetornoOperaciones;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Primary
@Profile("test")
public class TestRtoService implements IRtoService {

    private final Map<String, RetornoOperaciones> rtosInMemory = new LinkedHashMap<>();
    private final IEquipoService equipoService;

    public TestRtoService(IEquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @Override
    public RetornoOperaciones createRto(RetornoOperaciones rto) {
        // Generar ID: RTO-YYMMDD-###
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        long count = rtosInMemory.keySet().stream()
                .filter(k -> k.startsWith("RTO-" + fecha))
                .count();
        String id = String.format("RTO-%s-%03d", fecha, count + 1);
        rto.setId(id);
        rto.setFechaCreacion(LocalDateTime.now());
        rto.setEstado(EstadoRto.ABIERTO);
        rtosInMemory.put(id, rto);
        System.out.println("[TEST] RTO creado: " + id + " para equipo: " + rto.getEquipoTag());
        return rto;
    }

    @Override
    public RetornoOperaciones getRtoById(String id) {
        return rtosInMemory.get(id);
    }

    @Override
    public List<RetornoOperaciones> getAllRtos() {
        return new ArrayList<>(rtosInMemory.values());
    }

    @Override
    public RetornoOperaciones getRtoByEquipoTag(String equipoTag) {
        return rtosInMemory.values().stream()
                .filter(r -> equipoTag.equals(r.getEquipoTag()) && EstadoRto.ABIERTO.equals(r.getEstado()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public RetornoOperaciones agregarPtsAlRto(String rtoId, String ptsId) {
        RetornoOperaciones rto = rtosInMemory.get(rtoId);
        if (rto == null) {
            throw new RuntimeException("RTO no encontrado: " + rtoId);
        }
        rto.agregarPtsId(ptsId);
        System.out.println("[TEST] PTS " + ptsId + " agregado al RTO " + rtoId);
        return rto;
    }

    @Override
    public RetornoOperaciones agregarEspecialidades(String rtoId, java.util.List<RetornoOperaciones.EspecialidadRTO> especialidades) {
        RetornoOperaciones rto = rtosInMemory.get(rtoId);
        if (rto == null) {
            throw new RuntimeException("RTO no encontrado: " + rtoId);
        }
        rto.setEspecialidades(especialidades);
        System.out.println("[TEST] Especialidades actualizadas en RTO " + rtoId);
        return rto;
    }

    @Override
    public RetornoOperaciones cerrarEspecialidad(String rtoId, String especialidadNombre, String responsableLegajo, String observaciones) {
        RetornoOperaciones rto = rtosInMemory.get(rtoId);
        if (rto == null) {
            throw new RuntimeException("RTO no encontrado: " + rtoId);
        }
        if (EstadoRto.CERRADO.equals(rto.getEstado())) {
            throw new IllegalStateException("El RTO ya está cerrado.");
        }

        RetornoOperaciones.EspecialidadRTO especialidad = rto.getEspecialidades().stream()
                .filter(e -> especialidadNombre.equals(e.getNombre()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + especialidadNombre));

        if (especialidad.isCerrada()) {
            throw new IllegalStateException("La especialidad '" + especialidadNombre + "' ya fue cerrada.");
        }

        // Verificar que el responsable sea el correcto
        if (especialidad.getResponsableLegajo() != null &&
                !especialidad.getResponsableLegajo().equals(responsableLegajo)) {
            throw new SecurityException("Solo el responsable asignado puede cerrar esta especialidad.");
        }

        especialidad.setCerrada(true);
        especialidad.setFechaCierre(LocalDateTime.now());
        especialidad.setObservaciones(observaciones);
        System.out.println("[TEST] Especialidad '" + especialidadNombre + "' cerrada en RTO " + rtoId);

        // Si todas las especialidades están cerradas, cerrar el RTO y desbloquear equipo
        if (rto.todasEspecialidadesCerradas()) {
            rto.setEstado(EstadoRto.CERRADO);
            rto.setFechaCierre(LocalDateTime.now());
            System.out.println("[TEST] RTO " + rtoId + " CERRADO - Todas las especialidades completadas");

            // Desbloquear el equipo asociado
            try {
                equipoService.actualizarCondicionEquipo(rto.getEquipoTag(), CondicionEquipo.DESBLOQUEADO);
                System.out.println("[TEST] Equipo " + rto.getEquipoTag() + " DESBLOQUEADO tras cierre completo del RTO");
            } catch (Exception e) {
                System.err.println("[ERROR][TEST] No se pudo desbloquear el equipo: " + e.getMessage());
            }
        }

        return rto;
    }

    @Override
    public List<RetornoOperaciones> getRtosAbiertos() {
        return rtosInMemory.values().stream()
                .filter(r -> EstadoRto.ABIERTO.equals(r.getEstado()))
                .collect(Collectors.toList());
    }
}
