package com.epu.prototipo.service;


import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.EstadoDcs;
import com.epu.prototipo.model.CondicionEquipo;
import com.epu.prototipo.service.gateway.DcsGateway;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.util.*;

// Servicio in-memory para perfil test
// Simula la coleccion "equipos" de Firestore

@Service
@Primary
@Profile("test")
public class EquipoService implements IEquipoService {
    private final Map<String, Equipo> baseDeDatosEquipos = new HashMap<>();
    private final DcsGateway dcsGateway;

    public EquipoService(DcsGateway dcsGateway) {
        this.dcsGateway = dcsGateway;
        // Inicializacion de datos mock
        baseDeDatosEquipos.put("K7451", new Equipo("K7451", "Compresor de aire de instrumentos", EstadoDcs.HABILITADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("F1002A", new Equipo("F1002A", "Bomba de refrigeración Torre 1", EstadoDcs.PARADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("R301", new Equipo("R301", "Reactor Principal Polietileno", EstadoDcs.EN_MARCHA, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("P5511", new Equipo("P5511", "Bomba A de agua caliente", EstadoDcs.HABILITADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("P5512", new Equipo("P5512", "Bomba B de agua caliente", EstadoDcs.HABILITADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("P22401", new Equipo("P22401", "Bomba de inyeccion", EstadoDcs.PARADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("V5533", new Equipo("V5533", "Almacenamiento acido", EstadoDcs.DESHABILITADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("V2633", new Equipo("V2633", "Almacenamiento solvente", EstadoDcs.DESHABILITADO, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("MX2233", new Equipo("MX2233", "Mezclador en linea", EstadoDcs.EN_MARCHA, CondicionEquipo.DESBLOQUEADO));
        baseDeDatosEquipos.put("V1231", new Equipo("V1231", "Reservorio aceite", EstadoDcs.HABILITADO, CondicionEquipo.DESBLOQUEADO));
    }

    @Override
    public Equipo getEquipoByTag(String tag) {
        Equipo equipo = baseDeDatosEquipos.get(tag);
        if (equipo == null) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        return equipo;
    }

    @Override
    public List<Equipo> getAllEquipos() {
        return new ArrayList<>(baseDeDatosEquipos.values());
    }

    @Override
    public Equipo actualizarEstadoEquipo(String tag, String nuevoEstadoDcs) {
        Equipo equipo = getEquipoByTag(tag);
        switch (nuevoEstadoDcs) {
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
        baseDeDatosEquipos.put(tag, equipo);
        return equipo;
    }

    @Override
    public Equipo actualizarCondicionEquipo(String tag, String nuevaCondicion) {
        System.out.println("[DEBUG] Llamada a actualizarCondicionEquipo: tag=" + tag + ", nuevaCondicion=" + nuevaCondicion);
        Equipo equipo = getEquipoByTag(tag);
        if (CondicionEquipo.BLOQUEADO.equals(nuevaCondicion) || CondicionEquipo.DESBLOQUEADO.equals(nuevaCondicion)) {
            equipo.setCondicion(nuevaCondicion);
            System.out.println("[DEBUG] Condición actualizada: " + equipo.getCondicion());
        } else {
            throw new IllegalArgumentException("Condición no válida: " + nuevaCondicion);
        }
        baseDeDatosEquipos.put(tag, equipo);
        return equipo;
    }

    @Override
    public Equipo createEquipo(Equipo equipo) {
        if (baseDeDatosEquipos.containsKey(equipo.getTag())) {
            throw new RuntimeException("Ya existe un equipo con tag: " + equipo.getTag());
        }
        baseDeDatosEquipos.put(equipo.getTag(), equipo);
        return equipo;
    }

    @Override
    public Equipo updateEquipo(String tag, Equipo equipo) {
        if (!baseDeDatosEquipos.containsKey(tag)) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        equipo.setTag(tag);
        baseDeDatosEquipos.put(tag, equipo);
        return equipo;
    }

    @Override
    public void deleteEquipo(String tag) {
        if (!baseDeDatosEquipos.containsKey(tag)) {
            throw new RuntimeException("Equipo no encontrado con tag: " + tag);
        }
        baseDeDatosEquipos.remove(tag);
    }
}
