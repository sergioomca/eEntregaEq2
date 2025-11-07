package com.epu.prototipo.storage; 

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.model.PermisoTrabajoSeguro.RiesgoControl; // Importar correctamente RiesgoControl
import com.epu.prototipo.model.PermisoTrabajoSeguro.EquipoSeguridad; // Importar correctamente EquipoSeguridad
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Clase que simula la capa de persistencia (Base de Datos) usando una lista estática en memoria.
 * Esta clase se inyecta como un servicio en el controlador.
 * UBICACION: backend/src/main/java/com/epu/prototipo/storage/PTSStorage.java
 */
@Service
public class PTSStorage {

    // Lista estática que simula la base de datos para almacenar los PTS
    private static final List<PermisoTrabajoSeguro> ALMACEN = new ArrayList<>();

    // Inicialización de datos de prueba
    static {
        // PTS-001 (Aprobado/Activo)
        PermisoTrabajoSeguro pts001 = new PermisoTrabajoSeguro();
        pts001.setId("PTS-001");
        pts001.setDescripcionTrabajo("Mantenimiento de bomba P-101");
        pts001.setSolicitanteLegajo("VINF011422"); // ID Solicitante
        pts001.setNombreSolicitante("Sergio Capella"); // Nombre Solicitante
        pts001.setFechaInicio("2025-11-06");
        pts001.setHoraInicio("10:00");
        pts001.setHoraFin("14:00");
        pts001.setUbicacion("Sala de bombas B");
        pts001.setTareaDetallada("Se requiere reemplazar el sello mecánico de la bomba.");
        pts001.setTipoTrabajo("Trabajo en caliente (soldadura)");
        
        // Riesgos y Controles
        List<RiesgoControl> riesgos1 = List.of(
             new RiesgoControl("Caída a distinto nivel", "Lesión grave", "Uso de arnés de seguridad."),
             new RiesgoControl("Contacto eléctrico", "Electrocución", "Desenergizar y bloquear equipos.")
        );
        pts001.setRiesgosControles(riesgos1);
        
        // Equipos de Seguridad
        List<EquipoSeguridad> equipos1 = List.of(
             new EquipoSeguridad("Andamio tubular", true, true, "Estado OK"),
             new EquipoSeguridad("Kit de bloqueo", true, true, "Candados y etiquetas completos")
        );
        pts001.setEquiposSeguridad(equipos1);
        ALMACEN.add(pts001);

         
        // PTS-002 (Pendiente/Borrador)
        PermisoTrabajoSeguro pts002 = new PermisoTrabajoSeguro();
        pts002.setId("PTS-002");
        pts002.setDescripcionTrabajo("Inspección tanque T-305");
        pts002.setSolicitanteLegajo("SUP222"); // ID Solicitante
        pts002.setNombreSolicitante("Supervisor Dos"); // Nombre Solicitante
        pts002.setFechaInicio("2025-11-07");
        pts002.setHoraInicio("08:00");
        pts002.setHoraFin("11:00");
        pts002.setUbicacion("Plataforma superior del tanque 305");
        pts002.setTareaDetallada("Revisión visual de corrosión y espesores.");
        pts002.setTipoTrabajo("Trabajo en altura (>1.8m)");
        
        // Riesgos y Controles
        List<RiesgoControl> riesgos2 = List.of(
             new RiesgoControl("Atmósfera deficiente", "Asfixia", "Medición de gases antes y durante la entrada."),
             new RiesgoControl("Espacios confinados", "Atrapamiento", "Procedimiento de entrada y vigía en el exterior.")
        );
        pts002.setRiesgosControles(riesgos2);
        
        // Equipos de Seguridad
        List<EquipoSeguridad> equipos2 = List.of(
             new EquipoSeguridad("Equipo de medición de gases", true, true, "Calibrado"),
             new EquipoSeguridad("Trípode de rescate", true, true, "Inspeccionado")
        );
        pts002.setEquiposSeguridad(equipos2);
        ALMACEN.add(pts002);
    }

    /**
     * Guarda un nuevo PTS en el almacén simulado.
     * @param pts El objeto PermisoTrabajoSeguro a guardar.
     */
    public void save(PermisoTrabajoSeguro pts) {
        ALMACEN.add(pts);
    }

    /**
     * Devuelve todos los Permisos de Trabajo Seguro almacenados.
     * @return Una lista inmutable de PermisoTrabajoSeguro.
     */
    public List<PermisoTrabajoSeguro> findAll() {
        return Collections.unmodifiableList(ALMACEN);
    }
}
