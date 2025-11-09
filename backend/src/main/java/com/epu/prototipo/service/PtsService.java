package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ExecutionException;
import java.time.LocalDateTime;
import javax.annotation.Nullable;

/**
 * Servicio principal para la gestión de Permisos de Trabajo Seguro (PTS) en Firestore.
 */
@Service
@Profile("default")
public class PtsService implements IPtsService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    // Inyección de la instancia de Firestore configurada
    public PtsService(Firestore firestore) {
        this.firestore = firestore;
    }

    /**
     * Busca PTS aplicando filtros opcionales por equipo, usuario, área, estado y fecha.
     * Implementa búsqueda avanzada con filtros Firestore y procesamiento en memoria.
     * 
     * @param equipo Filtro por nombre de equipo (búsqueda parcial)
     * @param usuario Filtro por nombre de solicitante o legajo (búsqueda parcial) 
     * @param area Filtro por área (búsqueda parcial)
     * @param estado Filtro por estado RTO (búsqueda exacta)
     * @param fechaInicio Filtro por fecha de inicio (búsqueda exacta)
     * @return Lista filtrada de PTS
     */
    public List<PermisoTrabajoSeguro> buscarPts(@Nullable String equipo, @Nullable String usuario, @Nullable String area, @Nullable String estado, @Nullable String fechaInicio) {
        List<PermisoTrabajoSeguro> ptsList = new ArrayList<>();
        
        try {
            // 1. Construir query base de Firestore
            Query baseQuery = firestore.collection(COLLECTION_NAME);
            
            // 2. Aplicar filtro de equipo (si existe) - procesaremos en memoria para mayor flexibilidad
            // Nota: Firestore requiere índices para range queries, por lo que aplicaremos este filtro en memoria
            
            // 3. Aplicar filtro de estado RTO (si existe) - búsqueda exacta
            if (estado != null && !estado.trim().isEmpty()) {
                baseQuery = baseQuery.whereEqualTo("rtoEstado", estado.trim().toUpperCase());
            }
            
            // 4. Aplicar filtro de fecha de inicio (si existe) - búsqueda exacta
            if (fechaInicio != null && !fechaInicio.trim().isEmpty()) {
                baseQuery = baseQuery.whereEqualTo("fechaInicio", fechaInicio.trim());
            }
            
            // 5. Ejecutar query
            ApiFuture<QuerySnapshot> future = baseQuery.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            // 6. Mapear documentos a objetos
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
        
        // 7. Aplicar filtros en memoria (para campos que no soportan query Firestore eficiente)
        return aplicarFiltrosEnMemoria(ptsList, equipo, usuario, area);
    }
    
    /**
     * Método de compatibilidad: mantiene la funcionalidad del método original getAllPts()
     * @return Lista completa de PTS sin filtros
     */
    public List<PermisoTrabajoSeguro> getAllPts() {
        return buscarPts(null, null, null, null, null);
    }
    
    /**
     * Aplica filtros que requieren procesamiento en memoria después de la consulta Firestore.
     * Esto es necesario para campos que no tienen índices o para búsquedas OR complejas.
     * 
     * @param ptsList Lista base de PTS a filtrar
     * @param equipo Filtro por nombre de equipo (búsqueda parcial e insensible)
     * @param usuario Filtro por nombre o legajo de solicitante (búsqueda parcial e insensible)
     * @param area Filtro por área (búsqueda parcial e insensible) 
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
     * Filtro en memoria para usuario: busca en legajo y nombre del solicitante
     * @param pts PTS a evaluar
     * @param usuario Texto a buscar (puede ser null)
     * @return true si el PTS coincide con el filtro o si no hay filtro
     */
    private boolean filtrarPorUsuario(PermisoTrabajoSeguro pts, String usuario) {
        if (usuario == null || usuario.trim().isEmpty()) {
            return true; // Sin filtro, incluir todos
        }
        
        String usuarioLower = usuario.trim().toLowerCase();
        
        // Buscar en legajo del solicitante
        if (pts.getSolicitanteLegajo() != null && 
            pts.getSolicitanteLegajo().toLowerCase().contains(usuarioLower)) {
            return true;
        }
        
        // Buscar en nombre del solicitante
        if (pts.getNombreSolicitante() != null && 
            pts.getNombreSolicitante().toLowerCase().contains(usuarioLower)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Filtro en memoria para equipo: búsqueda parcial e insensible a mayúsculas
     * @param pts PTS a evaluar
     * @param equipo Texto a buscar (puede ser null)
     * @return true si el PTS coincide con el filtro o si no hay filtro
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
     * Filtro en memoria para área: búsqueda parcial e insensible a mayúsculas
     * @param pts PTS a evaluar
     * @param area Texto a buscar (puede ser null)
     * @return true si el PTS coincide con el filtro o si no hay filtro
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

    /**
     * Crea datos simulados para pruebas cuando Firestore no está disponible
     * Datos enriquecidos para probar filtros de búsqueda
     */
    private List<PermisoTrabajoSeguro> createSimulatedPts() {
        List<PermisoTrabajoSeguro> simulatedList = new ArrayList<>();
        
        // PTS 1 - Mantenimiento eléctrico
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
        
        // PTS 2 - Reparación mecánica
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
        
        // PTS 4 - Control de calidad
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

    /**
     * Crea un nuevo PTS y lo guarda en Firestore.
     */
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        if (pts.getSolicitanteLegajo() == null || pts.getSupervisorLegajo() == null) {
             throw new RuntimeException("Legajo de solicitante o supervisor no pueden ser nulos.");
        }
        
        try {
            // El ID será generado por Firestore
            ApiFuture<DocumentReference> future = firestore.collection(COLLECTION_NAME).add(pts);
            DocumentReference docRef = future.get();
            pts.setId(docRef.getId()); // Asignar el ID generado al objeto de retorno
            System.out.println("PTS creado con ID: " + docRef.getId());
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            // Si Firestore falla, simular creación
            System.err.println("Firestore no disponible para creación, simulando: " + e.getMessage());
            pts.setId("PTS-SIM-" + System.currentTimeMillis());
            System.out.println("PTS simulado creado con ID: " + pts.getId());
            return pts;
        }
    }

    // *******************************************************************
    // 3. IMPLEMENTACIÓN DE FIRMA BIOMÉTRICA (HU-005)
    // *******************************************************************
    /**
     * Actualiza un PTS para registrar la firma (biométrica simulada) del supervisor.
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
            // 1. Obtener el PTS actual
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                // Retornamos null para que el Controller devuelva NOT_FOUND
                return null; 
            }

            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al deserializar el documento PTS");
            }

            // 2. Validación de Seguridad: ¿El firmante es el supervisor asignado?
            // (Asumimos que el DNI/Legajo del request viene del JWT/Usuario logueado)
            if (!request.getDniFirmante().equals(pts.getSupervisorLegajo())) {
                throw new SecurityException("El DNI/Legajo del firmante no corresponde al supervisor asignado para este PTS (" + pts.getSupervisorLegajo() + ").");
            }
            
            // 3. Validación de Estado: ¿Ya está firmado?
            if (pts.getFirmaSupervisorBase64() != null) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido firmado.");
            }

            // 4. Actualizar el documento con los datos de la firma
            docRef.update(
                "firmaSupervisorBase64", request.getFirmaBase64(),
                "dniSupervisorFirmante", request.getDniFirmante(),
                "fechaHoraFirmaSupervisor", LocalDateTime.now()
            ).get(); // El .get() bloquea hasta que la actualización esté completa

            // 5. Devolver el objeto actualizado (opcional, pero útil para frontend)
            pts.setFirmaSupervisorBase64(request.getFirmaBase64());
            pts.setDniSupervisorFirmante(request.getDniFirmante());
            pts.setFechaHoraFirmaSupervisor(LocalDateTime.now());
            pts.setId(document.getId());

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al firmar el PTS ID: " + request.getPtsId(), e);
        }
    }

    /**
     * Obtiene un PTS específico por su ID.
     */
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
     * Cierra un PTS y lo marca como "Retorno a Operaciones" (RTO).
     * 
     * @param request Datos del cierre incluyendo responsable y observaciones
     * @return El PTS cerrado y actualizado
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
            // 1. Obtener referencia del documento
            String ptsId = request.getPtsId();
            if (ptsId == null) {
                throw new IllegalArgumentException("PTS ID no puede ser nulo");
            }
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(ptsId);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            // 2. Verificar si el documento existe
            if (!document.exists()) {
                return null; // El controlador manejará el 404
            }

            // 3. Convertir a objeto para validaciones
            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al procesar el PTS ID: " + request.getPtsId());
            }

            // 4. Validaciones de estado del PTS
            if ("CERRADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
            }
            
            if ("CANCELADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
            }

            // 5. Validación de seguridad: verificar que el PTS esté firmado antes del cierre
            if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty()) {
                throw new IllegalStateException("El PTS debe estar firmado antes de ser cerrado. Use /api/pts/firmar primero.");
            }

            // 6. Actualizar el documento con los datos de cierre
            docRef.update(
                "rtoEstado", "CERRADO",
                "rtoResponsableCierreLegajo", request.getRtoResponsableCierreLegajo(),
                "rtoObservaciones", request.getRtoObservaciones(),
                "rtoFechaHoraCierre", LocalDateTime.now()
            ).get(); // El .get() bloquea hasta que la actualización esté completa

            // 7. Devolver el objeto actualizado
            pts.setRtoEstado("CERRADO");
            pts.setRtoResponsableCierreLegajo(request.getRtoResponsableCierreLegajo());
            pts.setRtoObservaciones(request.getRtoObservaciones());
            pts.setRtoFechaHoraCierre(LocalDateTime.now());
            pts.setId(document.getId());

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al cerrar el PTS ID: " + request.getPtsId(), e);
        }
    }
}
