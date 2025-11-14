package com.epu.prototipo.service;

import com.epu.prototipo.dto.EquipoStatusDTO;
import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.epu.prototipo.service.IPtsService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicConsultaService {

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private IPtsService ptsService;

    public EquipoStatusDTO getEquipoStatus(String tag) {
        Equipo equipo = equipoService.getEquipoByTag(tag); // Puede lanzar excepción si no existe
        List<PermisoTrabajoSeguro> permisos = ptsService.buscarPts(tag, null, null, null, null);
        List<PermisoTrabajoSeguro> permisosActivos = permisos.stream()
                .filter(pts -> pts.getRtoEstado() == null || !"CERRADO".equals(pts.getRtoEstado()))
                .collect(Collectors.toList());
        return new EquipoStatusDTO(equipo, permisosActivos);
    }
}
