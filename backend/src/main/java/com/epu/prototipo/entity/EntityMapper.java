package com.epu.prototipo.entity;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.model.RetornoOperaciones;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utilidad para convertir entre modelos/DTOs del dominio y entidades JPA.
 */
public final class EntityMapper {

    private EntityMapper() {}

    // ==================== USUARIO ====================

    public static UsuarioEntity toEntity(UsuarioDTO dto) {
        UsuarioEntity e = new UsuarioEntity();
        e.setLegajo(dto.getLegajo());
        e.setNombreCompleto(dto.getNombreCompleto());
        e.setSector(dto.getSector());
        e.setRoles(dto.getRoles() != null ? new ArrayList<>(dto.getRoles()) : new ArrayList<>());
        e.setPassword(dto.getPassword());
        e.setMustChangePassword(dto.isMustChangePassword());
        e.setHuellaDigital(dto.getHuellaDigital());
        return e;
    }

    public static UsuarioDTO toDTO(UsuarioEntity e) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setLegajo(e.getLegajo());
        dto.setNombreCompleto(e.getNombreCompleto());
        dto.setSector(e.getSector());
        dto.setRoles(e.getRoles() != null ? new ArrayList<>(e.getRoles()) : new ArrayList<>());
        dto.setPassword(e.getPassword());
        dto.setMustChangePassword(e.isMustChangePassword());
        dto.setHuellaDigital(e.getHuellaDigital());
        return dto;
    }

    // ==================== EQUIPO ====================

    public static EquipoEntity toEntity(Equipo model) {
        EquipoEntity e = new EquipoEntity();
        e.setTag(model.getTag());
        e.setDescripcion(model.getDescripcion());
        e.setEstadoDcs(model.getEstadoDcs());
        e.setCondicion(model.getCondicion());
        return e;
    }

    public static Equipo toModel(EquipoEntity e) {
        return new Equipo(e.getTag(), e.getDescripcion(), e.getEstadoDcs(), e.getCondicion());
    }

    // ==================== PTS ====================

    public static PtsEntity toEntity(PermisoTrabajoSeguro pts) {
        PtsEntity e = new PtsEntity();
        e.setId(pts.getId());
        e.setEquipoOInstalacion(pts.getEquipoOInstalacion());
        e.setDescripcionTrabajo(pts.getDescripcionTrabajo());
        e.setSolicitanteLegajo(pts.getSolicitanteLegajo());
        e.setNombreSolicitante(pts.getNombreSolicitante());
        e.setSupervisorLegajo(pts.getSupervisorLegajo());
        e.setReceptorLegajo(pts.getReceptorLegajo());
        e.setNombreReceptor(pts.getNombreReceptor());
        e.setFechaInicio(pts.getFechaInicio());
        e.setFechaFin(pts.getFechaFin());
        e.setHoraInicio(pts.getHoraInicio());
        e.setHoraFin(pts.getHoraFin());
        e.setUbicacion(pts.getUbicacion());
        e.setTareaDetallada(pts.getTareaDetallada());
        e.setTipoTrabajo(pts.getTipoTrabajo());
        e.setRequiereAnalisisRiesgoAdicional(pts.isRequiereAnalisisRiesgoAdicional());
        e.setFirmaSupervisorBase64(pts.getFirmaSupervisorBase64());
        e.setDniSupervisorFirmante(pts.getDniSupervisorFirmante());
        e.setFechaHoraFirmaSupervisor(pts.getFechaHoraFirmaSupervisor());
        e.setRtoEstado(pts.getRtoEstado());
        e.setRtoObservaciones(pts.getRtoObservaciones());
        e.setRtoResponsableCierreLegajo(pts.getRtoResponsableCierreLegajo());
        e.setRtoFechaHoraCierre(pts.getRtoFechaHoraCierre());
        e.setRequiereRTO(pts.isRequiereRTO());
        e.setRtoAsociadoId(pts.getRtoAsociadoId());

        if (pts.getRiesgosControles() != null) {
            e.setRiesgosControles(pts.getRiesgosControles().stream()
                    .map(r -> new RiesgoControlEmb(r.getPeligro(), r.getConsecuencia(), r.getControlRequerido()))
                    .collect(Collectors.toList()));
        }
        if (pts.getEquiposSeguridad() != null) {
            e.setEquiposSeguridad(pts.getEquiposSeguridad().stream()
                    .map(es -> new EquipoSeguridadEmb(es.getEquipo(), es.isEsRequerido(), es.isEsProporcionado(), es.getObservacion()))
                    .collect(Collectors.toList()));
        }
        return e;
    }

    public static PermisoTrabajoSeguro toModel(PtsEntity e) {
        PermisoTrabajoSeguro pts = new PermisoTrabajoSeguro();
        pts.setId(e.getId());
        pts.setEquipoOInstalacion(e.getEquipoOInstalacion());
        pts.setDescripcionTrabajo(e.getDescripcionTrabajo());
        pts.setSolicitanteLegajo(e.getSolicitanteLegajo());
        pts.setNombreSolicitante(e.getNombreSolicitante());
        pts.setSupervisorLegajo(e.getSupervisorLegajo());
        pts.setReceptorLegajo(e.getReceptorLegajo());
        pts.setNombreReceptor(e.getNombreReceptor());
        pts.setFechaInicio(e.getFechaInicio());
        pts.setFechaFin(e.getFechaFin());
        pts.setHoraInicio(e.getHoraInicio());
        pts.setHoraFin(e.getHoraFin());
        pts.setUbicacion(e.getUbicacion());
        pts.setTareaDetallada(e.getTareaDetallada());
        pts.setTipoTrabajo(e.getTipoTrabajo());
        pts.setRequiereAnalisisRiesgoAdicional(e.isRequiereAnalisisRiesgoAdicional());
        pts.setFirmaSupervisorBase64(e.getFirmaSupervisorBase64());
        pts.setDniSupervisorFirmante(e.getDniSupervisorFirmante());
        pts.setFechaHoraFirmaSupervisor(e.getFechaHoraFirmaSupervisor());
        pts.setRtoEstado(e.getRtoEstado());
        pts.setRtoObservaciones(e.getRtoObservaciones());
        pts.setRtoResponsableCierreLegajo(e.getRtoResponsableCierreLegajo());
        pts.setRtoFechaHoraCierre(e.getRtoFechaHoraCierre());
        pts.setRequiereRTO(e.isRequiereRTO());
        pts.setRtoAsociadoId(e.getRtoAsociadoId());

        if (e.getRiesgosControles() != null) {
            pts.setRiesgosControles(e.getRiesgosControles().stream()
                    .map(r -> new PermisoTrabajoSeguro.RiesgoControl(r.getPeligro(), r.getConsecuencia(), r.getControlRequerido()))
                    .collect(Collectors.toList()));
        }
        if (e.getEquiposSeguridad() != null) {
            pts.setEquiposSeguridad(e.getEquiposSeguridad().stream()
                    .map(es -> new PermisoTrabajoSeguro.EquipoSeguridad(es.getEquipo(), es.isEsRequerido(), es.isEsProporcionado(), es.getObservacion()))
                    .collect(Collectors.toList()));
        }
        return pts;
    }

    // ==================== RTO ====================

    public static RtoEntity toEntity(RetornoOperaciones rto) {
        RtoEntity e = new RtoEntity();
        e.setId(rto.getId());
        e.setEquipoTag(rto.getEquipoTag());
        e.setEstado(rto.getEstado());
        e.setFechaCreacion(rto.getFechaCreacion());
        e.setFechaCierre(rto.getFechaCierre());
        e.setObservaciones(rto.getObservaciones());
        e.setPtsIds(rto.getPtsIds() != null ? new ArrayList<>(rto.getPtsIds()) : new ArrayList<>());

        if (rto.getEspecialidades() != null) {
            e.setEspecialidades(rto.getEspecialidades().stream().map(esp -> {
                EspecialidadRtoEmb emb = new EspecialidadRtoEmb(esp.getNombre(), esp.getResponsableLegajo());
                emb.setCerrada(esp.isCerrada());
                emb.setFechaCierre(esp.getFechaCierre());
                emb.setObservaciones(esp.getObservaciones());
                return emb;
            }).collect(Collectors.toList()));
        }
        return e;
    }

    public static RetornoOperaciones toModel(RtoEntity e) {
        RetornoOperaciones rto = new RetornoOperaciones();
        rto.setId(e.getId());
        rto.setEquipoTag(e.getEquipoTag());
        rto.setEstado(e.getEstado());
        rto.setFechaCreacion(e.getFechaCreacion());
        rto.setFechaCierre(e.getFechaCierre());
        rto.setObservaciones(e.getObservaciones());
        rto.setPtsIds(e.getPtsIds() != null ? new ArrayList<>(e.getPtsIds()) : new ArrayList<>());

        if (e.getEspecialidades() != null) {
            rto.setEspecialidades(e.getEspecialidades().stream().map(emb -> {
                RetornoOperaciones.EspecialidadRTO esp = new RetornoOperaciones.EspecialidadRTO(emb.getNombre(), emb.getResponsableLegajo());
                esp.setCerrada(emb.isCerrada());
                esp.setFechaCierre(emb.getFechaCierre());
                esp.setObservaciones(emb.getObservaciones());
                return esp;
            }).collect(Collectors.toList()));
        }
        return rto;
    }
}
