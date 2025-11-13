// ...existing code...
package com.epu.prototipo.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Service
@Profile("prod")
public class FirestorePtsService implements IPtsService {

    private final Firestore firestore;
    private final EquipoService equipoService;
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    public FirestorePtsService(Firestore firestore, EquipoService equipoService) {
        this.firestore = firestore;
        this.equipoService = equipoService;
    }

    @Override
    public List<PermisoTrabajoSeguro> getAllPts() {
        try {
            var future = firestore.collection(COLLECTION_NAME).get();
            var querySnapshot = future.get();
            List<PermisoTrabajoSeguro> result = new ArrayList<>();
            
            querySnapshot.forEach(document -> {
                var pts = document.toObject(PermisoTrabajoSeguro.class);
                pts.setId(document.getId());
                result.add(pts);
            });
            
            return result;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener los Permisos de Trabajo Seguro.", e);
        }
    }

    @Override
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        // Actualizar estado y condición del equipo antes de guardar el PTS
        try {
            String tag = pts.getEquipoOInstalacion();
            equipoService.actualizarEstadoEquipo(tag, "DESHABILITADO");
            equipoService.actualizarCondicionEquipo(tag, "BLOQUEADO");
        } catch (Exception e) {
            System.err.println("[ERROR] No se pudo actualizar el estado/condición del equipo: " + e.getMessage());
        }
        try {
            var future = firestore.collection(COLLECTION_NAME).add(pts);
            var writeResult = future.get();
            pts.setId(writeResult.getId());
            System.out.println("PTS creado con éxito. ID de Firestore: " + writeResult.getId());
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al crear PTS en Firestore: " + e.getMessage());
            throw new RuntimeException("Error al guardar el Permiso de Trabajo Seguro.", e);
        }
    }

    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("ID del PTS no puede ser nulo");
        }
        
        try {
            var future = firestore.collection(COLLECTION_NAME).document(id).get();
            var document = future.get();
            if (document.exists()) {
                var pts = document.toObject(PermisoTrabajoSeguro.class);
                if (pts != null) {
                    pts.setId(document.getId());
                }
                return pts;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener el Permiso de Trabajo Seguro.", e);
        }
    }

    @Override
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
            // Obtener el PTS actual
            var future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return null; 
            }

            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al deserializar el documento PTS");
            }

            // Validacion de Seguridad: verifica si el firmante es el supervisor asignado o un supervisor autorizado
            // !!! para pruebas -- SUP222 como supervisor geerico
            boolean isAuthorizedSupervisor = "SUP222".equals(request.getDniFirmante()) || 
                                           request.getDniFirmante().equals(pts.getSupervisorLegajo());
            
            if (!isAuthorizedSupervisor) {
                throw new SecurityException("Firmante no autorizado para este PTS. Supervisor asignado: " + pts.getSupervisorLegajo());
            }
            
            // Validación de Estado: Ya esta firmado?
            if (pts.getFirmaSupervisorBase64() != null) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido firmado.");
            }

            // !!! ELIMINAR? Actualizar el documento con los datos de la firma
            docRef.update(
                "firmaSupervisorBase64", request.getFirmaBase64(),
                "dniSupervisorFirmante", request.getDniFirmante(),
                "fechaHoraFirmaSupervisor", LocalDateTime.now()
            ).get(); 

            // Devolver objeto actualizado
            pts.setFirmaSupervisorBase64(request.getFirmaBase64());
            pts.setDniSupervisorFirmante(request.getDniFirmante());
            pts.setFechaHoraFirmaSupervisor(LocalDateTime.now());
            pts.setId(document.getId());

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al firmar el PTS ID: " + request.getPtsId(), e);
        }
    }

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

        String ptsId = request.getPtsId();
        if (ptsId == null) {
            throw new IllegalArgumentException("PTS ID no puede ser nulo");
        }
        
        try {
            // Para obtener referencia del documento
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(ptsId);
            var future = docRef.get();
            DocumentSnapshot document = future.get();

            // Para verificar si el documento existe
            if (!document.exists()) {
                return null; // El controlador manejará el 404
            }

            // Convertir a objeto para validaciones
            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al procesar el PTS ID: " + request.getPtsId());
            }

            // Validaciones de estado del PTS
            if ("CERRADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
            }
            
            if ("CANCELADO".equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
            }

            // Validacion de seguridad: verificar que el PTS esta firmado antes del cierre
            if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty()) {
                throw new IllegalStateException("El PTS debe estar firmado antes de ser cerrado. Use /api/pts/firmar primero.");
            }

            // Actualizar el documento con los datos de cierre
            docRef.update(
                "rtoEstado", "CERRADO",
                "rtoResponsableCierreLegajo", request.getRtoResponsableCierreLegajo(),
                "rtoObservaciones", request.getRtoObservaciones(),
                "rtoFechaHoraCierre", LocalDateTime.now()
            ).get(); 

            // Devolver el objeto actualizado
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

    @Override
    public List<PermisoTrabajoSeguro> buscarPts(String equipo, String usuario, String area, String estado, String fechaInicio) {
        // En entorno de producción, por ahora delegamos a getAllPts()
        // En una implementación completa, se implementarían queries de Firestore optimizadas
        System.out.println("Búsqueda de PTS en Firestore - parámetros: equipo=" + equipo + 
                          ", usuario=" + usuario + ", area=" + area + 
                          ", estado=" + estado + ", fechaInicio=" + fechaInicio);
        
        return getAllPts();
    }
    @Override
    public int obtenerUltimoNumeroPtsPorFecha(String fechaInicio) {
        try {
            var future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("fechaInicio", fechaInicio)
                .get();
            var querySnapshot = future.get();
            int max = 0;
            for (var document : querySnapshot.getDocuments()) {
                String id = document.getId();
                if (id != null && id.matches("PTS-\\d{8}-\\d+")) {
                    String[] partes = id.split("-");
                    try {
                        int num = Integer.parseInt(partes[2]);
                        if (num > max) max = num;
                    } catch (NumberFormatException ignored) {}
                }
            }
            return max;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al obtener último número de PTS: " + e.getMessage());
            throw new RuntimeException("Error al obtener el último número de PTS.", e);
        }
    }
}