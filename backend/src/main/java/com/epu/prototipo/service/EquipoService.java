package com.epu.prototipo.service;


import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.service.gateway.DcsGateway;
import org.springframework.stereotype.Service;
import java.util.*;

@Service

public class EquipoService {
    private static final Map<String, Equipo> baseDeDatosEquipos = new HashMap<>();
    private final DcsGateway dcsGateway;

    public EquipoService(DcsGateway dcsGateway) {
        this.dcsGateway = dcsGateway;
    }

    static {
        baseDeDatosEquipos.put("K7451", new Equipo("K7451", "Compresor de aire de instrumentos", "HABILITADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("F1002A", new Equipo("F1002A", "Bomba de refrigeración Torre 1", "PARADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("R301", new Equipo("R301", "Reactor Principal Polietileno", "EN_MARCHA", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("P5511", new Equipo("P5511", "Bomba A de agua caliente", "HABILITADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("P5512", new Equipo("P5512", "Bomba B de agua caliente", "HABILITADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("P22401", new Equipo("P22401", "Bomba de inyeccion", "PARADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("V5533", new Equipo("V5533", "Almacenamiento acido", "DESHABILITADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("V2633", new Equipo("V2633", "Almacenamiento solvente", "DESHABILITADO", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("MX2233", new Equipo("MX2233", "Mezclador en linea", "EN_MARCHA", "DESBLOQUEADO"));
        baseDeDatosEquipos.put("V1231", new Equipo("V1231", "Reservorio aceite", "HABILITADO", "DESBLOQUEADO"));
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

    public Equipo actualizarEstadoEquipo(String tag, String nuevoEstadoDcs) {
        Equipo equipo = getEquipoByTag(tag);
        // Permitir los 4 estados DCS
        switch (nuevoEstadoDcs) {
            case "HABILITADO":
                dcsGateway.habilitarEquipo(tag);
                equipo.setEstadoDcs("HABILITADO");
                break;
            case "DESHABILITADO":
                dcsGateway.deshabilitarEquipo(tag);
                equipo.setEstadoDcs("DESHABILITADO");
                break;
            case "PARADO":
            case "EN_MARCHA":
                equipo.setEstadoDcs(nuevoEstadoDcs);
                break;
            default:
                throw new IllegalArgumentException("Estado DCS no válido: " + nuevoEstadoDcs);
        }
        baseDeDatosEquipos.put(tag, equipo);
        return equipo;
    }

    // Métodos para actualizar la condición del equipo
    public Equipo actualizarCondicionEquipo(String tag, String nuevaCondicion) {
        System.out.println("[DEBUG] Llamada a actualizarCondicionEquipo: tag=" + tag + ", nuevaCondicion=" + nuevaCondicion);
        Equipo equipo = getEquipoByTag(tag);
        if ("BLOQUEADO".equals(nuevaCondicion) || "DESBLOQUEADO".equals(nuevaCondicion)) {
            equipo.setCondicion(nuevaCondicion);
            System.out.println("[DEBUG] Condición actualizada: " + equipo.getCondicion());
        } else {
            throw new IllegalArgumentException("Condición no válida: " + nuevaCondicion);
        }
        baseDeDatosEquipos.put(tag, equipo);
        return equipo;
    }
}
