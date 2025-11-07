package com.epu.prototipo.service;

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import java.util.List;

public interface PtsService {
    List<PermisoTrabajoSeguro> getAllPts();
    PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts);
    PermisoTrabajoSeguro getPtsById(String id);
}
