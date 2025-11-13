// ...existing code...
package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
// ...existing code...
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ExecutionException;
import java.time.LocalDateTime;
import javax.annotation.Nullable;

// Servicio principal para la gestión de Permisos de Trabajo Seguro (PTS) en Firestore.
@Service
@Profile("default")
public class PtsService implements IPtsService {

    private final Firestore firestore;
    private final EquipoService equipoService;
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    // Para inyectar la instancia de Firestore y EquipoService configurada
    public PtsService(Firestore firestore, EquipoService equipoService) {
        this.firestore = firestore;
        this.equipoService = equipoService;
    }

    /**
     * Buscar PTS con filtros opcionales por equipo, usuario, area, estado y fecha.
     * Busqueda avanzada con filtros Firestore y procesamiento en memoria.
     * 
     * @param equipo Filtro por nombre de equipo
     * @param usuario Filtro por nombre o legajo 
     * @param area Filtro por area 
     * @param estado Filtro por estado RTO 
     * @param fechaInicio Filtro por fecha de inicio
     * @return Lista filtrada de PTS
     */
    public List<PermisoTrabajoSeguro> buscarPts(@Nullable String equipo, @Nullable String usuario, @Nullable String area, @Nullable String estado, @Nullable String fechaInicio) {
        List<PermisoTrabajoSeguro> ptsList = new ArrayList<>();
        
        try {
            // Query base de Firestore
            Query baseQuery = firestore.collection(COLLECTION_NAME);
            
            // Filtro de equipo (si existe) (en memoria)
            
            // Filtro de estado RTO (si existe)
            if (estado != null && !estado.trim().isEmpty()) {
                baseQuery = baseQuery.whereEqualTo("rtoEstado", estado.trim().toUpperCase());
            }
            
            // Filtro de fecha de inicio (si existe)
            if (fechaInicio != null && !fechaInicio.trim().isEmpty()) {
                baseQuery = baseQuery.whereEqualTo("fechaInicio", fechaInicio.trim());
            }
            
            // Ejecuta query
            ApiFuture<QuerySnapshot> future = baseQuery.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            // Mapear documentos a objetos
            for (QueryDocumentSnapshot document : documents) {
                PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
                pts.setId(document.getId());
                ptsList.add(pts);
            }
            
        } catch (InterruptedException | ExecutionException e) {
            // Si Firestore falla, usar datos simulados
            System.err.println("Firestore no disponible, usando datos simulados: " + e.getMessage());
            ptsList = createSimulatedPts();
        }
        
        // Filtros en memoria (para campos que no soportan query Firestore)
        return aplicarFiltrosEnMemoria(ptsList, equipo, usuario, area);
    }
    
    /**
     * Por compatibilidad: para mantener la funcionalidad del metodo original getAllPts()
     * @return Lista completa de PTS sin filtros
     */
    public List<PermisoTrabajoSeguro> getAllPts() {
        return buscarPts(null, null, null, null, null);
    }
    
    /**
     * Aplica filtros que requieren procesamiento en memoria despues de la consulta Firestore.
     * 
     * @param ptsList Lista base de PTS a filtrar
     * @param equipo Filtro por nombre de equipo 
     * @param usuario Filtro por nombre o legajo 
     * @param area Filtro por area
     * @return Lista filtrada
     */
    private List<PermisoTrabajoSeguro> aplicarFiltrosEnMemoria(List<PermisoTrabajoSeguro> ptsList, String equipo, String usuario, String area) {
        if (ptsList == null || ptsList.isEmpty()) {
            return ptsList;
        }
        
        return ptsList.stream()
                .filter(pts -> filtrarPorEquipo(pts, equipo))
                .filter(pts -> filtrarPorUsuario(pts, usuario))
                .filter(pts -> filtrarPorArea(pts, area))
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Filtro en memoria para usuario: busca en legajo y nombre
     * @param pts PTS a evaluar
     * @param usuario Texto a buscar (puede ser null)
     * @return true si el PTS = filtro o si no hay filtro
     */
    private boolean filtrarPorUsuario(PermisoTrabajoSeguro pts, String usuario) {
        if (usuario == null || usuario.trim().isEmpty()) {
            return true; // Sin filtro, incluir todos
        }
        
        String usuarioLower = usuario.trim().toLowerCase();
        
        // Buscar legajo
        if (pts.getSolicitanteLegajo() != null && 
            pts.getSolicitanteLegajo().toLowerCase().contains(usuarioLower)) {
            return true;
        }
        
        // Buscar nombre
        if (pts.getNombreSolicitante() != null && 
            pts.getNombreSolicitante().toLowerCase().contains(usuarioLower)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Filtro en memoria para equipo
     * @param pts PTS a evaluar
     * @param equipo Texto a buscar (puede ser null)
     * @return true si el PTS = filtro o si no hay filtro
     */
    private boolean filtrarPorEquipo(PermisoTrabajoSeguro pts, String equipo) {
        if (equipo == null || equipo.trim().isEmpty()) {
            return true; // Sin filtro, incluir todos
        }
        
        if (pts.getEquipoOInstalacion() == null) {
            return false; // No hay equipo definido en el PTS
        }
        
        return pts.getEquipoOInstalacion().toLowerCase().contains(equipo.trim().toLowerCase());
    }
    
    /**
     * Filtro en memoria para areae
     * @param pts PTS a evaluar
     * @param area Texto a buscar (puede ser null)
     * @return true si el PTS = filtro o si no hay filtro
     */
    private boolean filtrarPorArea(PermisoTrabajoSeguro pts, String area) {
        if (area == null || area.trim().isEmpty()) {
            return true; // Sin filtro, incluir todos
        }
        
        if (pts.getArea() == null) {
            return false; // No hay área definida en el PTS
        }
        
        return pts.getArea().toLowerCase().contains(area.trim().toLowerCase());
    }

    // Para crear datos simulados para pruebas cuando Firestore no está disponible
    
    private List<PermisoTrabajoSeguro> createSimulatedPts() {
        List<PermisoTrabajoSeguro> simulatedList = new ArrayList<>();
        
        // PTS 1 - Mantenimiento electrico
        PermisoTrabajoSeguro pts1 = new PermisoTrabajoSeguro();
        pts1.setId("PTS-SIM-001");
        pts1.setDescripcionTrabajo("Mantenimiento eléctrico en tablero principal");
        pts1.setFechaInicio("2025-11-07");
        pts1.setUbicacion("Sala de máquinas A");
        pts1.setSolicitanteLegajo("VINF011422");
        pts1.setNombreSolicitante("Juan Pérez");
        pts1.setSupervisorLegajo("SUP222");
        pts1.setTipoTrabajo("ELECTRICO");
        pts1.setArea("Mantenimiento");
        pts1.setEquipoOInstalacion("Tablero Eléctrico Principal TP-001");
        pts1.setRtoEstado("PENDIENTE");
        simulatedList.add(pts1);
        
        // PTS 2 - Reparacion mecanica
        PermisoTrabajoSeguro pts2 = new PermisoTrabajoSeguro();
        pts2.setId("PTS-SIM-002");
        pts2.setDescripcionTrabajo("Reparación de tubería de vapor");
        pts2.setFechaInicio("2025-11-07");
        pts2.setUbicacion("Área de producción B");
        pts2.setSolicitanteLegajo("EJE444");
        pts2.setNombreSolicitante("Ana Gómez");
        pts2.setSupervisorLegajo("SUP222");
        pts2.setTipoTrabajo("MECANICO");
        pts2.setArea("Producción");
        pts2.setEquipoOInstalacion("Bomba Centrífuga BC-205");
        pts2.setRtoEstado("CERRADO");
        simulatedList.add(pts2);
        
        // PTS 3 - Mantenimiento preventivo
        PermisoTrabajoSeguro pts3 = new PermisoTrabajoSeguro();
        pts3.setId("PTS-SIM-003");
        pts3.setDescripcionTrabajo("Inspección de compresores");
        pts3.setFechaInicio("2025-11-08");
        pts3.setUbicacion("Planta de aire comprimido");
        pts3.setSolicitanteLegajo("VINF011422");
        pts3.setNombreSolicitante("Juan Pérez");
        pts3.setSupervisorLegajo("ADM999");
        pts3.setTipoTrabajo("PREVENTIVO");
        pts3.setArea("Mantenimiento");
        pts3.setEquipoOInstalacion("Compresor Atlas Copco AC-301");
        pts3.setRtoEstado("PENDIENTE");
        simulatedList.add(pts3);
        
        // PTS 4 - Control de intrumento
        PermisoTrabajoSeguro pts4 = new PermisoTrabajoSeguro();
        pts4.setId("PTS-SIM-004");
        pts4.setDescripcionTrabajo("Calibración de instrumentos de medición");
        pts4.setFechaInicio("2025-11-08");
        pts4.setUbicacion("Laboratorio de calidad");
        pts4.setSolicitanteLegajo("ADM999");
        pts4.setNombreSolicitante("María Rodriguez");
        pts4.setSupervisorLegajo("SUP222");
        pts4.setTipoTrabajo("CALIBRACION");
        pts4.setArea("Control de Calidad");
        pts4.setEquipoOInstalacion("Balanza Analítica BA-150");
        pts4.setRtoEstado("PENDIENTE");
        simulatedList.add(pts4);
        
        return simulatedList;
    }

    // Para crear un nuevo PTS y guardar en Firestore.
     
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        if (pts.getSolicitanteLegajo() == null || pts.getSupervisorLegajo() == null) {
            throw new RuntimeException("Legajo de solicitante o supervisor no pueden ser nulos.");
        }

        // Validar que el equipo exista antes de crear el PTS y deshabilitarlo
        try {
            String tag = pts.getEquipoOInstalacion();
            equipoService.actualizarEstadoEquipo(tag, "DESHABILITADO");
            equipoService.actualizarCondicionEquipo(tag, "BLOQUEADO");
        } catch (RuntimeException e) {
            throw new RuntimeException("Error al crear PTS: " + e.getMessage());
        }

        // Generar ID único en formato PTS-YYMMDD-###
        String fechaInicio = pts.getFechaInicio();
        if (fechaInicio == null || fechaInicio.length() < 10) {
            throw new RuntimeException("La fecha de inicio debe estar en formato YYYY-MM-DD");
        }
        String yymmdd = fechaInicio.replaceAll("-", "").substring(2, 8); // YYMMDD
        int ultimoNumero = obtenerUltimoNumeroPtsPorFecha(fechaInicio);
        int nuevoNumero = ultimoNumero + 1;
        String idGenerado = String.format("PTS-%s-%03d", yymmdd, nuevoNumero);
        pts.setId(idGenerado);

        try {
            // Guardar el PTS con el ID generado como clave
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(idGenerado).set(pts);
            future.get();
            System.out.println("PTS creado con ID: " + idGenerado);
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            // Si Firestore falla, simula creado
            System.err.println("Firestore no disponible para creación, simulando: " + e.getMessage());
            pts.setId("PTS-SIM-" + System.currentTimeMillis());
            System.out.println("PTS simulado creado con ID: " + pts.getId());
            return pts;
        }
    }

    // *******************************************************************
    // !!! revisar IMPLEMENTACION DE FIRMA BIOMETRICA (HU-005)
    // *******************************************************************
    /**
     * Actualizar un PTS para registrar la firma simulada del supervisor.
     * @param request Datos de la firma: ptsId, dniFirmante y firmaBase64 (placeholder).
     * @return El PTS actualizado.
     */
    public PermisoTrabajoSeguro firmarPts(FirmaPtsRequest request) {
        if (request.getPtsId() == null || request.getDniFirmante() == null) {
            throw new IllegalArgumentException("PTS ID y DNI del firmante son requeridos.");
        }

        String ptsId = request.getPtsId();
        if (ptsId == null) {
            throw new IllegalArgumentException("PTS ID no puede ser nulo");
        }
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(ptsId);

        try {
            // Para obtener el PTS actual
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                // Para retornar null y que el Controller de NOT_FOUND
                return null; 
            }

            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al deserializar el documento PTS");
            }

            // Validación de Seguridad si firmante es supervisor asignado o un supervisor autorizado
            boolean isAuthorizedSupervisor = "SUP222".equals(request.getDniFirmante()) || 
                                           request.getDniFirmante().equals(pts.getSupervisorLegajo());
            if (!isAuthorizedSupervisor) {
                throw new SecurityException("DNI del firmante no autorizado para este PTS. Supervisor asignado: " + pts.getSupervisorLegajo());
            }
            // Validación de Estado "firmado"
            if (pts.getFirmaSupervisorBase64() != null) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido firmado.");
            }

            // Para actualizar el documento con los datos de la firma
            docRef.update(
                "firmaSupervisorBase64", request.getFirmaBase64(),
                "dniSupervisorFirmante", request.getDniFirmante(),
                "fechaHoraFirmaSupervisor", LocalDateTime.now()
            ).get();

            // Para devolver el objeto actualizado 
            pts.setFirmaSupervisorBase64(request.getFirmaBase64());
            pts.setDniSupervisorFirmante(request.getDniFirmante());
            pts.setFechaHoraFirmaSupervisor(LocalDateTime.now());
            pts.setId(document.getId());

            // Actualizar estado del equipo a DESHABILITADO
            String tagEquipo = pts.getEquipoOInstalacion();
            try {
                equipoService.actualizarEstadoEquipo(tagEquipo, "DESHABILITADO");
            } catch (RuntimeException e) {
                System.out.println("ADVERTENCIA: PTS firmado, pero el equipo " + tagEquipo + " no se encontró para actualizar su estado.");
            }

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al firmar el PTS ID: " + request.getPtsId(), e);
        }
    }

    // Para obtener un PTS específico por su ID.
    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("ID del PTS no puede ser nulo");
        }
        
        try {
            ApiFuture<DocumentSnapshot> future = firestore.collection(COLLECTION_NAME).document(id).get();
            DocumentSnapshot document = future.get();
            
            if (!document.exists()) {
                return null;
            }
            
            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts != null) {
                pts.setId(document.getId());
            }
            return pts;
            
        } catch (InterruptedException | ExecutionException e) {
            // Si Firestore falla, buscar en datos simulados
            System.err.println("Firestore no disponible para búsqueda, buscando en datos simulados: " + e.getMessage());
            List<PermisoTrabajoSeguro> simulatedData = createSimulatedPts();
            return simulatedData.stream()
                    .filter(pts -> id.equals(pts.getId()))
                    .findFirst()
                    .orElse(null);
        }
    }

    /**
     * Cierra  PTS y lo marca como RTO
     * 
     * @param request 
     * @return PTS cerrado y actualizado
     */
    @Override
    public PermisoTrabajoSeguro cerrarPts(CerrarPtsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La solicitud de cierre no puede ser nula");
        }
        
        if (request.getPtsId() == null || request.getPtsId().trim().isEmpty()) {
            throw new IllegalArgumentException("El ID del PTS es requerido para el cierre");
        }
        
        if (request.getRtoResponsableCierreLegajo() == null || request.getRtoResponsableCierreLegajo().trim().isEmpty()) {
            throw new IllegalArgumentException("El legajo del responsable de cierre es requerido");
        }

        try {
            // Para tener referencia del documento
            String ptsId = request.getPtsId();
            if (ptsId == null) {
                throw new IllegalArgumentException("PTS ID no puede ser nulo");
            }
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(ptsId);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            // Para verificar si el documento existe
            if (!document.exists()) {
                return null; // El controlador maneja el 404
            }

            // Para convertir a objeto para validaciones
            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al procesar el PTS ID: " + request.getPtsId());
            }

            // Para validar estado del PTS
            if ("CERRADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
            }
            if ("CANCELADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
            }

            // Para validar seguridad, que el PTS este firmado antes del cierre
            if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty()) {
                throw new IllegalStateException("El PTS debe estar firmado antes de ser cerrado. Use /api/pts/firmar primero.");
            }

            // Para actualizar el documento con los datos de cierre
            docRef.update(
                "rtoEstado", "CERRADO",
                "rtoResponsableCierreLegajo", request.getRtoResponsableCierreLegajo(),
                "rtoObservaciones", request.getRtoObservaciones(),
                "rtoFechaHoraCierre", LocalDateTime.now()
            ).get(); 

            // Para devolver el objeto actualizado
            pts.setRtoEstado("CERRADO");
            pts.setRtoResponsableCierreLegajo(request.getRtoResponsableCierreLegajo());
            pts.setRtoObservaciones(request.getRtoObservaciones());
            pts.setRtoFechaHoraCierre(LocalDateTime.now());
            pts.setId(document.getId());

            // Actualizar estado del equipo a HABILITADO
            String tagEquipo = pts.getEquipoOInstalacion();
            try {
                equipoService.actualizarEstadoEquipo(tagEquipo, "HABILITADO");
            } catch (RuntimeException e) {
                System.out.println("ADVERTENCIA: PTS cerrado, pero el equipo " + tagEquipo + " no se encontró para actualizar su estado.");
            }

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al cerrar el PTS ID: " + request.getPtsId(), e);
        }
    }

    /**
     * Obtiene el último número de PTS creado para una fecha dada (formato YYYY-MM-DD).
     * Busca los PTS de esa fecha y extrae el mayor número correlativo.
     * Si no hay ninguno, retorna 0.
     */
    @Override
    public int obtenerUltimoNumeroPtsPorFecha(String fechaInicio) {
        List<PermisoTrabajoSeguro> ptsList = buscarPts(null, null, null, null, fechaInicio);
        int max = 0;
        for (PermisoTrabajoSeguro pts : ptsList) {
            // Se asume que el ID tiene formato "PTS-YYYYMMDD-###" o similar
            String id = pts.getId();
            if (id != null && id.matches("PTS-\\d{8}-\\d+")) {
                String[] partes = id.split("-");
                try {
                    int num = Integer.parseInt(partes[2]);
                    if (num > max) max = num;
                } catch (NumberFormatException ignored) {}
            }
        }
        return max;
    }
}
