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
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    public FirestorePtsService(Firestore firestore) {
        this.firestore = firestore;
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
            // 1. Obtener el PTS actual
            var future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return null; 
            }

            PermisoTrabajoSeguro pts = document.toObject(PermisoTrabajoSeguro.class);
            if (pts == null) {
                throw new RuntimeException("Error al deserializar el documento PTS");
            }

            // 2. Validación de Seguridad: ¿El firmante es el supervisor asignado?
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

            // 5. Devolver el objeto actualizado
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
            // 1. Obtener referencia del documento
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(ptsId);
            var future = docRef.get();
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