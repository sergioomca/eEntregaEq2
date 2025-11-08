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
     * Recupera todos los PTS de Firestore. (Método simulado para desarrollo)
     * En un entorno real, se aplicarían filtros de seguridad y paginación.
     */
    public List<PermisoTrabajoSeguro> getAllPts() {
        List<PermisoTrabajoSeguro> ptsList = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            for (QueryDocumentSnapshot document : documents) {
                // Mapea el documento de Firestore a la clase modelo
                PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
                pts.setId(document.getId()); // Asegura que el ID del documento esté en el objeto
                ptsList.add(pts);
            }

        } catch (InterruptedException | ExecutionException e) {
            // Si Firestore falla, devolver datos simulados para pruebas
            System.err.println("Firestore no disponible, usando datos simulados: " + e.getMessage());
            return createSimulatedPts();
        }
        return ptsList;
    }

    /**
     * Crea datos simulados para pruebas cuando Firestore no está disponible
     */
    private List<PermisoTrabajoSeguro> createSimulatedPts() {
        List<PermisoTrabajoSeguro> simulatedList = new ArrayList<>();
        
        // PTS 1
        PermisoTrabajoSeguro pts1 = new PermisoTrabajoSeguro();
        pts1.setId("PTS-SIM-001");
        pts1.setDescripcionTrabajo("Mantenimiento eléctrico simulado");
        pts1.setFechaInicio("2025-11-07");
        pts1.setUbicacion("Sala de máquinas A");
        pts1.setSolicitanteLegajo("EMISOR001");
        pts1.setSupervisorLegajo("12345678");
        pts1.setTipoTrabajo("ELECTRICO");
        pts1.setArea("Mantenimiento");
        simulatedList.add(pts1);
        
        // PTS 2
        PermisoTrabajoSeguro pts2 = new PermisoTrabajoSeguro();
        pts2.setId("PTS-SIM-002");
        pts2.setDescripcionTrabajo("Reparación de tubería simulado");
        pts2.setFechaInicio("2025-11-07");
        pts2.setUbicacion("Área de producción B");
        pts2.setSolicitanteLegajo("EMISOR002");
        pts2.setSupervisorLegajo("12345678");
        pts2.setTipoTrabajo("MECANICO");
        pts2.setArea("Producción");
        simulatedList.add(pts2);
        
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
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(request.getPtsId());
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
