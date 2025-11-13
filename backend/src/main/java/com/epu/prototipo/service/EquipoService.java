package com.epu.prototipo.service;

import com.epu.prototipo.model.Equipo;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EquipoService {
    private static final Map<String, Equipo> baseDeDatosEquipos = new HashMap<>();

    static {
        baseDeDatosEquipos.put("K7451", new Equipo("K7451", "Compresor de aire de instrumentos", "HABILITADO"));
        baseDeDatosEquipos.put("F1002A", new Equipo("F1002A", "Bomba de refrigeración Torre 1", "HABILITADO"));
        baseDeDatosEquipos.put("R301", new Equipo("R301", "Reactor Principal Polietileno", "HABILITADO"));
    }

    public Equipo getEquipoByTag(String tag) {
        Equipo equipo = baseDeDatosEquipos.get(tag);
        if (equipo == null) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        return equipo;
    }

    public List<Equipo> getAllEquipos() {
        return new ArrayList<>(baseDeDatosEquipos.values());
    }

    public Equipo actualizarEstadoEquipo(String tag, String nuevoEstado) {
        Equipo equipo = getEquipoByTag(tag);
        if (!"HABILITADO".equals(nuevoEstado) && !"DESHABILITADO".equals(nuevoEstado)) {
            throw new IllegalArgumentException("Estado inválido: " + nuevoEstado);
        }
        equipo.setEstado(nuevoEstado);
        System.out.println("LOG: Estado del equipo " + tag + " actualizado a: " + nuevoEstado);
        return equipo;
    }
}
