package com.epu.prototipo.service;

import com.epu.prototipo.entity.EntityMapper;
import com.epu.prototipo.entity.EspecialidadRtoEmb;
import com.epu.prototipo.entity.RtoEntity;
import com.epu.prototipo.model.CondicionEquipo;
import com.epu.prototipo.model.EstadoRto;
import com.epu.prototipo.model.RetornoOperaciones;
import com.epu.prototipo.repository.RtoRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Profile("prod")
public class MysqlRtoService implements IRtoService {

    private final RtoRepository repo;
    private final IEquipoService equipoService;

    public MysqlRtoService(RtoRepository repo, IEquipoService equipoService) {
        this.repo = repo;
        this.equipoService = equipoService;
    }

    @Override
    public RetornoOperaciones createRto(RetornoOperaciones rto) {
        // Generar ID: RTO-YYMMDD-###
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        long count = repo.findAll().stream()
                .filter(e -> e.getId().startsWith("RTO-" + fecha))
                .count();
        String id = String.format("RTO-%s-%03d", fecha, count + 1);
        rto.setId(id);
        rto.setFechaCreacion(LocalDateTime.now());
        rto.setEstado(EstadoRto.ABIERTO);
        repo.save(EntityMapper.toEntity(rto));
        System.out.println("[MYSQL] RTO creado: " + id + " para equipo: " + rto.getEquipoTag());
        return rto;
    }

    @Override
    public RetornoOperaciones getRtoById(String id) {
        return repo.findById(id).map(EntityMapper::toModel).orElse(null);
    }

    @Override
    public List<RetornoOperaciones> getAllRtos() {
        return repo.findAll().stream()
                .map(EntityMapper::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public RetornoOperaciones getRtoByEquipoTag(String equipoTag) {
        return repo.findByEquipoTagAndEstado(equipoTag, EstadoRto.ABIERTO)
                .map(EntityMapper::toModel)
                .orElse(null);
    }

    @Override
    public RetornoOperaciones agregarPtsAlRto(String rtoId, String ptsId) {
        RtoEntity entity = repo.findById(rtoId)
                .orElseThrow(() -> new RuntimeException("RTO no encontrado: " + rtoId));
        RetornoOperaciones rto = EntityMapper.toModel(entity);
        rto.agregarPtsId(ptsId);
        repo.save(EntityMapper.toEntity(rto));
        return rto;
    }

    @Override
    public RetornoOperaciones agregarEspecialidades(String rtoId, java.util.List<RetornoOperaciones.EspecialidadRTO> especialidades) {
        RtoEntity entity = repo.findById(rtoId)
                .orElseThrow(() -> new RuntimeException("RTO no encontrado: " + rtoId));
        java.util.List<EspecialidadRtoEmb> embs = especialidades.stream().map(esp -> {
            EspecialidadRtoEmb emb = new EspecialidadRtoEmb(esp.getNombre(), esp.getResponsableLegajo());
            emb.setCerrada(esp.isCerrada());
            emb.setFechaCierre(esp.getFechaCierre());
            emb.setObservaciones(esp.getObservaciones());
            return emb;
        }).collect(Collectors.toList());
        entity.setEspecialidades(embs);
        repo.save(entity);
        return EntityMapper.toModel(entity);
    }

    @Override
    public RetornoOperaciones cerrarEspecialidad(String rtoId, String especialidadNombre, String responsableLegajo, String observaciones) {
        RtoEntity entity = repo.findById(rtoId)
                .orElseThrow(() -> new RuntimeException("RTO no encontrado: " + rtoId));

        if (EstadoRto.CERRADO.equals(entity.getEstado())) {
            throw new IllegalStateException("El RTO ya está cerrado.");
        }

        EspecialidadRtoEmb especialidad = entity.getEspecialidades().stream()
                .filter(e -> especialidadNombre.equals(e.getNombre()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + especialidadNombre));

        if (especialidad.isCerrada()) {
            throw new IllegalStateException("La especialidad '" + especialidadNombre + "' ya fue cerrada.");
        }
        if (especialidad.getResponsableLegajo() != null &&
                !especialidad.getResponsableLegajo().equals(responsableLegajo)) {
            throw new SecurityException("Solo el responsable asignado puede cerrar esta especialidad.");
        }

        especialidad.setCerrada(true);
        especialidad.setFechaCierre(LocalDateTime.now());
        especialidad.setObservaciones(observaciones);

        // Verificar si todas cerradas
        boolean todasCerradas = entity.getEspecialidades().stream().allMatch(EspecialidadRtoEmb::isCerrada);
        if (todasCerradas) {
            entity.setEstado(EstadoRto.CERRADO);
            entity.setFechaCierre(LocalDateTime.now());
            try {
                equipoService.actualizarCondicionEquipo(entity.getEquipoTag(), CondicionEquipo.DESBLOQUEADO);
            } catch (Exception e) {
                System.err.println("[ERROR] No se pudo desbloquear el equipo: " + e.getMessage());
            }
        }

        repo.save(entity);
        return EntityMapper.toModel(entity);
    }

    @Override
    public List<RetornoOperaciones> getRtosAbiertos() {
        return repo.findByEstado(EstadoRto.ABIERTO).stream()
                .map(EntityMapper::toModel)
                .collect(Collectors.toList());
    }
}
