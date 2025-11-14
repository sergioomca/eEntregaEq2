package com.epu.prototipo.dto;

import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import java.util.List;

public class EquipoStatusDTO {
    private Equipo equipo;
    private List<PermisoTrabajoSeguro> permisosActivos;

    // Constructor vacío
    public EquipoStatusDTO() {
    }

    // Constructor con parámetros
    public EquipoStatusDTO(Equipo equipo, List<PermisoTrabajoSeguro> permisosActivos) {
        this.equipo = equipo;
        this.permisosActivos = permisosActivos;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    public List<PermisoTrabajoSeguro> getPermisosActivos() {
        return permisosActivos;
    }

    public void setPermisosActivos(List<PermisoTrabajoSeguro> permisosActivos) {
        this.permisosActivos = permisosActivos;
    }
}
