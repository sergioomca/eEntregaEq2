package com.epu.prototipo.service;

import com.epu.prototipo.entity.EntityMapper;
import com.epu.prototipo.entity.EquipoEntity;
import com.epu.prototipo.model.CondicionEquipo;
import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.EstadoDcs;
import com.epu.prototipo.repository.EquipoRepository;
import com.epu.prototipo.service.gateway.DcsGateway;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Profile("prod")
public class MysqlEquipoService implements IEquipoService {

    private final EquipoRepository repo;
    private final DcsGateway dcsGateway;

    public MysqlEquipoService(EquipoRepository repo, DcsGateway dcsGateway) {
        this.repo = repo;
        this.dcsGateway = dcsGateway;
    }

    @Override
    public Equipo getEquipoByTag(String tag) {
        EquipoEntity entity = repo.findById(tag)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado con tag: " + tag));
        return EntityMapper.toModel(entity);
    }

    @Override
    public List<Equipo> getAllEquipos() {
        return repo.findAll().stream()
                .map(EntityMapper::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Equipo actualizarEstadoEquipo(String tag, String nuevoEstadoDcs) {
        Equipo equipo = getEquipoByTag(tag);
        switch (nuevoEstadoDcs) {
            case EstadoDcs.SIN_CONEXION:
                equipo.setEstadoDcs(EstadoDcs.SIN_CONEXION);
                break;
            case EstadoDcs.HABILITADO:
                dcsGateway.habilitarEquipo(tag);
                equipo.setEstadoDcs(EstadoDcs.HABILITADO);
                break;
            case EstadoDcs.DESHABILITADO:
                dcsGateway.deshabilitarEquipo(tag);
                equipo.setEstadoDcs(EstadoDcs.DESHABILITADO);
                break;
            case EstadoDcs.PARADO:
            case EstadoDcs.EN_MARCHA:
                equipo.setEstadoDcs(nuevoEstadoDcs);
                break;
            default:
                throw new IllegalArgumentException("Estado DCS no válido: " + nuevoEstadoDcs);
        }
        repo.save(EntityMapper.toEntity(equipo));
        return equipo;
    }

    @Override
    public Equipo actualizarCondicionEquipo(String tag, String nuevaCondicion) {
        Equipo equipo = getEquipoByTag(tag);
        if (CondicionEquipo.BLOQUEADO.equals(nuevaCondicion) || CondicionEquipo.DESBLOQUEADO.equals(nuevaCondicion)) {
            equipo.setCondicion(nuevaCondicion);
        } else {
            throw new IllegalArgumentException("Condición no válida: " + nuevaCondicion);
        }
        repo.save(EntityMapper.toEntity(equipo));
        return equipo;
    }

    @Override
    public Equipo createEquipo(Equipo equipo) {
        if (repo.existsById(equipo.getTag())) {
            throw new RuntimeException("Ya existe un equipo con tag: " + equipo.getTag());
        }
        // Los equipos nuevos se crean siempre sin conexión al DCS.
        equipo.setEstadoDcs(EstadoDcs.SIN_CONEXION);
        repo.save(EntityMapper.toEntity(equipo));
        return equipo;
    }

    @Override
    public Equipo updateEquipo(String tag, Equipo equipo) {
        if (!repo.existsById(tag)) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        equipo.setTag(tag);
        repo.save(EntityMapper.toEntity(equipo));
        return equipo;
    }

    @Override
    public void deleteEquipo(String tag) {
        if (!repo.existsById(tag)) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        repo.deleteById(tag);
    }
}
