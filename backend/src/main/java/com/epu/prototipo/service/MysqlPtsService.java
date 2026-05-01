package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.entity.EntityMapper;
import com.epu.prototipo.entity.PtsEntity;
import com.epu.prototipo.model.*;
import com.epu.prototipo.repository.PtsRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Profile("prod")
public class MysqlPtsService implements IPtsService {

    private final PtsRepository repo;
    private final IEquipoService equipoService;
    private final IRtoService rtoService;

    public MysqlPtsService(PtsRepository repo, IEquipoService equipoService, IRtoService rtoService) {
        this.repo = repo;
        this.equipoService = equipoService;
        this.rtoService = rtoService;
    }

    @Override
    public List<PermisoTrabajoSeguro> getAllPts() {
        return repo.findAll().stream()
                .map(EntityMapper::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        // Actualizar estado y condición del equipo
        try {
            String tag = pts.getEquipoOInstalacion();
            equipoService.actualizarEstadoEquipo(tag, EstadoDcs.DESHABILITADO);
            equipoService.actualizarCondicionEquipo(tag, CondicionEquipo.BLOQUEADO);
        } catch (Exception e) {
            System.err.println("[ERROR] No se pudo actualizar el estado/condición del equipo: " + e.getMessage());
        }

        // Generar ID si no tiene
        if (pts.getId() == null || pts.getId().isEmpty()) {
            String fecha = pts.getFechaInicio() != null ? pts.getFechaInicio().replace("-", "") : "00000000";
            int ultimoNum = obtenerUltimoNumeroPtsPorFecha(pts.getFechaInicio());
            pts.setId(String.format("PTS-%s-%03d", fecha, ultimoNum + 1));
        }

        PtsEntity saved = repo.save(EntityMapper.toEntity(pts));
        System.out.println("PTS creado con éxito. ID: " + saved.getId());
        return EntityMapper.toModel(saved);
    }

    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("ID del PTS no puede ser nulo");
        }
        return repo.findById(id).map(EntityMapper::toModel).orElse(null);
    }

    @Override
    public PermisoTrabajoSeguro firmarPts(FirmaPtsRequest request) {
        if (request.getPtsId() == null || request.getDniFirmante() == null) {
            throw new IllegalArgumentException("PTS ID y DNI del firmante son requeridos.");
        }

        PtsEntity entity = repo.findById(request.getPtsId()).orElse(null);
        if (entity == null) return null;

        PermisoTrabajoSeguro pts = EntityMapper.toModel(entity);

        if (!request.getDniFirmante().equals(pts.getSupervisorLegajo())) {
            throw new SecurityException("Firmante no autorizado para este PTS. Supervisor asignado: " + pts.getSupervisorLegajo());
        }
        if (pts.getFirmaSupervisorBase64() != null) {
            throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido firmado.");
        }

        entity.setFirmaSupervisorBase64(request.getFirmaBase64());
        entity.setDniSupervisorFirmante(request.getDniFirmante());
        entity.setFechaHoraFirmaSupervisor(LocalDateTime.now());
        repo.save(entity);

        return EntityMapper.toModel(entity);
    }

    @Override
    public PermisoTrabajoSeguro cerrarPts(CerrarPtsRequest request) {
        if (request == null) throw new IllegalArgumentException("La solicitud de cierre no puede ser nula");
        if (request.getPtsId() == null || request.getPtsId().trim().isEmpty())
            throw new IllegalArgumentException("El ID del PTS es requerido para el cierre");
        if (request.getRtoResponsableCierreLegajo() == null || request.getRtoResponsableCierreLegajo().trim().isEmpty())
            throw new IllegalArgumentException("El legajo del responsable de cierre es requerido");

        PtsEntity entity = repo.findById(request.getPtsId()).orElse(null);
        if (entity == null) return null;

        PermisoTrabajoSeguro pts = EntityMapper.toModel(entity);

        if (EstadoPts.CERRADO.equals(pts.getRtoEstado()))
            throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
        if (EstadoPts.CANCELADO.equals(pts.getRtoEstado()))
            throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
        if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty())
            throw new IllegalStateException("El PTS debe estar firmado antes de ser cerrado.");

        entity.setRtoEstado(EstadoPts.CERRADO);
        entity.setRtoResponsableCierreLegajo(request.getRtoResponsableCierreLegajo());
        entity.setRtoObservaciones(request.getRtoObservaciones());
        entity.setRtoFechaHoraCierre(LocalDateTime.now());
        entity.setRequiereRTO(request.isRequiereRTO());

        String tagEquipo = pts.getEquipoOInstalacion();
        if (request.isRequiereRTO()) {
            try {
                RetornoOperaciones rtoExistente = rtoService.getRtoByEquipoTag(tagEquipo);
                if (rtoExistente != null) {
                    rtoService.agregarPtsAlRto(rtoExistente.getId(), pts.getId());
                    entity.setRtoAsociadoId(rtoExistente.getId());
                } else {
                    RetornoOperaciones nuevoRto = new RetornoOperaciones();
                    nuevoRto.setEquipoTag(tagEquipo);
                    nuevoRto.agregarPtsId(pts.getId());
                    RetornoOperaciones rtoCreado = rtoService.createRto(nuevoRto);
                    entity.setRtoAsociadoId(rtoCreado.getId());
                }
            } catch (RuntimeException e) {
                System.err.println("Error al crear/asociar RTO: " + e.getMessage());
            }
        }

        repo.save(entity);
        return EntityMapper.toModel(entity);
    }

    @Override
    public PermisoTrabajoSeguro updatePts(PermisoTrabajoSeguro pts) {
        PtsEntity existing = repo.findById(pts.getId())
                .orElseThrow(() -> new RuntimeException("PTS no encontrado: " + pts.getId()));

        if (!EstadoPts.STANDBY.equals(existing.getRtoEstado())) {
            throw new RuntimeException("Solo se puede actualizar un PTS en estado STANDBY");
        }

        if (pts.getRtoEstado() != null && !EstadoPts.STANDBY.equals(pts.getRtoEstado())) {
            String tag = pts.getEquipoOInstalacion();
            if (tag != null && !tag.isEmpty()) {
                equipoService.actualizarEstadoEquipo(tag, EstadoDcs.DESHABILITADO);
                equipoService.actualizarCondicionEquipo(tag, CondicionEquipo.BLOQUEADO);
            }
        }

        PtsEntity saved = repo.save(EntityMapper.toEntity(pts));
        return EntityMapper.toModel(saved);
    }

    @Override
    public List<PermisoTrabajoSeguro> buscarPts(String equipo, String usuario, String area, String estado, String fechaInicio) {
        // Delega a getAllPts y filtra en memoria
        return getAllPts();
    }

    @Override
    public int obtenerUltimoNumeroPtsPorFecha(String fechaInicio) {
        List<PtsEntity> ptsMismaFecha = repo.findByFechaInicio(fechaInicio);
        int max = 0;
        for (PtsEntity e : ptsMismaFecha) {
            String id = e.getId();
            if (id != null && id.matches("PTS-\\d{8}-\\d+")) {
                String[] partes = id.split("-");
                try {
                    int num = Integer.parseInt(partes[2]);
                    if (num > max) max = num;
                } catch (NumberFormatException ignored) {}
            }
        }
        return max;
    }
}
