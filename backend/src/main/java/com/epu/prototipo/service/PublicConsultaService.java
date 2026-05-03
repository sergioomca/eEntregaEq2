package com.epu.prototipo.service;

import com.epu.prototipo.dto.EquipoStatusDTO;
import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.model.EstadoPts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.epu.prototipo.service.IPtsService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicConsultaService {

    @Autowired
    private IEquipoService equipoService;

    @Autowired
    private IPtsService ptsService;

    public EquipoStatusDTO getEquipoStatus(String tag) {
        Equipo equipo = equipoService.getEquipoByTag(tag);
        List<PermisoTrabajoSeguro> permisosActivos = ptsService.getAllPts().stream()
            .filter(pts -> pts.getEquipoOInstalacion() != null)
            .filter(pts -> pts.getEquipoOInstalacion().equalsIgnoreCase(tag))
                .filter(pts -> pts.getRtoEstado() == null || !EstadoPts.CERRADO.equals(pts.getRtoEstado()))
                .collect(Collectors.toList());
        return new EquipoStatusDTO(equipo, permisosActivos);
    }
}
