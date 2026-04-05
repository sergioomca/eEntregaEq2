// ...existing code...
package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import com.epu.prototipo.model.RetornoOperaciones;
import com.epu.prototipo.model.EstadoPts;
import com.epu.prototipo.model.EstadoDcs;
import com.epu.prototipo.model.EstadoRto;
import com.epu.prototipo.model.CondicionEquipo;
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

// Servicio principal para la gestion de PTS en Firestore.
@Service
@Profile("default")
public class PtsService implements IPtsService {

    private final Firestore firestore;
    private final IEquipoService equipoService;
    private final IRtoService rtoService;
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    // Para inyectar la instancia de Firestore y IEquipoService configurada
    public PtsService(Firestore firestore, IEquipoService equipoService, IRtoService rtoService) {
        this.firestore = firestore;
        this.equipoService = equipoService;
        this.rtoService = rtoService;
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
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener los Permisos de Trabajo Seguro.", e);
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
            return true; 
        }
        
        if (pts.getEquipoOInstalacion() == null) {
            return false; 
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
            return true; 
        }
        
        if (pts.getArea() == null) {
            return false;
        }
        
        return pts.getArea().toLowerCase().contains(area.trim().toLowerCase());
    }



    // Para crear un nuevo PTS y guardar en Firestore.
     
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        if (pts.getSolicitanteLegajo() == null) {
            throw new RuntimeException("Legajo de solicitante no puede ser nulo.");
        }

        boolean isStandby = EstadoPts.STANDBY.equals(pts.getRtoEstado());

        // Solo validar supervisor si requiere analisis de riesgo adicional y NO es standby
        if (!isStandby && pts.isRequiereAnalisisRiesgoAdicional() && (pts.getSupervisorLegajo() == null || pts.getSupervisorLegajo().trim().isEmpty())) {
            throw new RuntimeException("Debe definir un supervisor si requiere análisis de riesgo adicional.");
        }

        // Validar que el equipo exista antes de crear el PTS y deshabilitarlo (solo si no es standby)
        if (!isStandby) {
            try {
                String tag = pts.getEquipoOInstalacion();
                equipoService.actualizarEstadoEquipo(tag, EstadoDcs.DESHABILITADO);
                equipoService.actualizarCondicionEquipo(tag, CondicionEquipo.BLOQUEADO);
            } catch (RuntimeException e) {
                throw new RuntimeException("Error al crear PTS: " + e.getMessage());
            }
        }

        // Generar ID unico en formato PTS-YYMMDD-###
        String fechaInicio = pts.getFechaInicio();
        if (fechaInicio == null || fechaInicio.length() < 10) {
            throw new RuntimeException("La fecha de inicio debe estar en formato YYYY-MM-DD");
        }
        String yymmdd = fechaInicio.replaceAll("-", "").substring(2, 8); // YYMMDD
        int ultimoNumero = obtenerUltimoNumeroPtsPorFecha(fechaInicio);
        int nuevoNumero = ultimoNumero + 1;
        String idGenerado = String.format("PTS-%s-%03d", yymmdd, nuevoNumero);
        pts.setId(idGenerado);

        // Si es standby, mantener ese estado
        if (isStandby) {
            pts.setRtoEstado(EstadoPts.STANDBY);
        } else {
            // Logica para estado inicial por requiereAnalisisRiesgoAdicional
            if (!pts.isRequiereAnalisisRiesgoAdicional()) {
                pts.setRtoEstado(EstadoPts.FIRMADO_PEND_CIERRE);
                pts.setFirmaSupervisorBase64("data:image/png;base64,");
                pts.setDniSupervisorFirmante("AUTOMATICO");
                pts.setFechaHoraFirmaSupervisor(java.time.LocalDateTime.now());
            } else {
                pts.setRtoEstado(EstadoPts.PENDIENTE);
                pts.setFirmaSupervisorBase64(null);
                pts.setDniSupervisorFirmante(null);
                pts.setFechaHoraFirmaSupervisor(null);
            }
        }

        try {
            // Guardar el PTS con el ID generado como clave
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(idGenerado).set(pts);
            future.get();
            System.out.println("PTS creado con ID: " + idGenerado);
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al crear PTS en Firestore: " + e.getMessage());
            throw new RuntimeException("Error al guardar el Permiso de Trabajo Seguro.", e);
        }
    }

    // Actualizar un PTS existente (para retomar un PTS en Stand by)
    @Override
    public PermisoTrabajoSeguro updatePts(PermisoTrabajoSeguro pts) {
        if (pts.getId() == null || pts.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("El ID del PTS es requerido para actualizar.");
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(pts.getId());
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return null;
            }

            PermisoTrabajoSeguro existing = document.toObject(PermisoTrabajoSeguro.class);
            if (existing == null || !EstadoPts.STANDBY.equals(existing.getRtoEstado())) {
                throw new IllegalStateException("Solo se pueden actualizar PTS en estado STANDBY.");
            }

            // Si el nuevo estado NO es STANDBY, aplicar validaciones y lógica de equipo
            if (!EstadoPts.STANDBY.equals(pts.getRtoEstado())) {
                try {
                    String tag = pts.getEquipoOInstalacion();
                    equipoService.actualizarEstadoEquipo(tag, EstadoDcs.DESHABILITADO);
                    equipoService.actualizarCondicionEquipo(tag, CondicionEquipo.BLOQUEADO);
                } catch (RuntimeException e) {
                    throw new RuntimeException("Error al actualizar PTS: " + e.getMessage());
                }

                if (!pts.isRequiereAnalisisRiesgoAdicional()) {
                    pts.setRtoEstado(EstadoPts.FIRMADO_PEND_CIERRE);
                    pts.setFirmaSupervisorBase64("data:image/png;base64,");
                    pts.setDniSupervisorFirmante("AUTOMATICO");
                    pts.setFechaHoraFirmaSupervisor(java.time.LocalDateTime.now());
                } else {
                    pts.setRtoEstado(EstadoPts.PENDIENTE);
                }
            }

            // Guardar el PTS actualizado
            ApiFuture<WriteResult> writeFuture = docRef.set(pts);
            writeFuture.get();
            System.out.println("PTS actualizado con ID: " + pts.getId());
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al actualizar el PTS: " + e.getMessage(), e);
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

            // Validacion de Seguridad: verifica si el firmante es el supervisor asignado al PTS
            if (!request.getDniFirmante().equals(pts.getSupervisorLegajo())) {
                throw new SecurityException("DNI del firmante no autorizado para este PTS. Supervisor asignado: " + pts.getSupervisorLegajo());
            }
            // Validacion de Estado "firmado"
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
                equipoService.actualizarEstadoEquipo(tagEquipo, EstadoDcs.DESHABILITADO);
            } catch (RuntimeException e) {
                System.out.println("ADVERTENCIA: PTS firmado, pero el equipo " + tagEquipo + " no se encontró para actualizar su estado.");
            }

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al firmar el PTS ID: " + request.getPtsId(), e);
        }
    }

    // Para obtener un PTS especifico por su ID.
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
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener el Permiso de Trabajo Seguro.", e);
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
            if (EstadoPts.CERRADO.equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " ya ha sido cerrado.");
            }
            if (EstadoPts.CANCELADO.equals(pts.getRtoEstado())) {
                throw new IllegalStateException("El PTS ID " + request.getPtsId() + " está cancelado y no puede ser cerrado.");
            }

            // Solo exigir firma de supervisor si requiereAnalisisRiesgoAdicional es true
            if (pts.isRequiereAnalisisRiesgoAdicional()) {
                if (pts.getFirmaSupervisorBase64() == null || pts.getFirmaSupervisorBase64().trim().isEmpty()) {
                    throw new IllegalStateException("El PTS debe estar firmado antes de ser cerrado. Use /api/pts/firmar primero.");
                }
                // Si requiere analisis, solo el supervisor puede cerrar
                if (pts.getSupervisorLegajo() != null && !pts.getSupervisorLegajo().trim().isEmpty()) {
                    if (!request.getRtoResponsableCierreLegajo().equals(pts.getSupervisorLegajo())) {
                        throw new SecurityException("Solo el supervisor asignado puede cerrar este PTS.");
                    }
                }
            } else {
                // Si NO requiere analisis y NO hay supervisor, permitir que el solicitante cierre
                if (pts.getSupervisorLegajo() == null || pts.getSupervisorLegajo().trim().isEmpty()) {
                    if (!request.getRtoResponsableCierreLegajo().equals(pts.getSolicitanteLegajo())) {
                        throw new SecurityException("Solo el emisor puede cerrar este PTS.");
                    }
                }
            }

            // Para actualizar el documento con los datos de cierre
            docRef.update(
                "rtoEstado", EstadoPts.CERRADO,
                "rtoResponsableCierreLegajo", request.getRtoResponsableCierreLegajo(),
                "rtoObservaciones", request.getRtoObservaciones(),
                "rtoFechaHoraCierre", LocalDateTime.now(),
                "requiereRTO", request.isRequiereRTO()
            ).get(); 

            // Para devolver el objeto actualizado
            pts.setRtoEstado(EstadoPts.CERRADO);
            pts.setRtoResponsableCierreLegajo(request.getRtoResponsableCierreLegajo());
            pts.setRtoObservaciones(request.getRtoObservaciones());
            pts.setRtoFechaHoraCierre(LocalDateTime.now());
            pts.setId(document.getId());
            pts.setRequiereRTO(request.isRequiereRTO());

            // Para actualizar estado del equipo
            String tagEquipo = pts.getEquipoOInstalacion();
            if (request.isRequiereRTO()) {
                // Si requiere RTO: el equipo permanece BLOQUEADO, se crea/asocia un RTO
                try {
                    RetornoOperaciones rtoExistente = rtoService.getRtoByEquipoTag(tagEquipo);
                    if (rtoExistente != null) {
                        rtoService.agregarPtsAlRto(rtoExistente.getId(), pts.getId());
                        pts.setRtoAsociadoId(rtoExistente.getId());
                    } else {
                        RetornoOperaciones nuevoRto = new RetornoOperaciones();
                        nuevoRto.setEquipoTag(tagEquipo);
                        nuevoRto.agregarPtsId(pts.getId());
                        RetornoOperaciones rtoCreado = rtoService.createRto(nuevoRto);
                        pts.setRtoAsociadoId(rtoCreado.getId());
                    }
                    // Guardar el rtoAsociadoId en Firestore
                    docRef.update("rtoAsociadoId", pts.getRtoAsociadoId()).get();
                    System.out.println("PTS " + pts.getId() + " cerrado con RTO asociado: " + pts.getRtoAsociadoId() + ". Equipo " + tagEquipo + " permanece BLOQUEADO.");
                } catch (RuntimeException e) {
                    System.err.println("ADVERTENCIA: Error al crear/asociar RTO para equipo " + tagEquipo + ": " + e.getMessage());
                }
            } else {
                // Si NO requiere RTO: habilitar equipo normalmente
                try {
                    equipoService.actualizarEstadoEquipo(tagEquipo, EstadoDcs.HABILITADO);
                } catch (RuntimeException e) {
                    System.out.println("ADVERTENCIA: PTS cerrado, pero el equipo " + tagEquipo + " no se encontró para actualizar su estado.");
                }
            }

            return pts;

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error al cerrar el PTS ID: " + request.getPtsId(), e);
        }
    }

    
    // Obtiene el ultimo numero de PTS creado para una fecha dada (formato YYYY-MM-DD).
    // Busca los PTS de esa fecha y extrae el mayor numero correlativo.
    // Si no hay ninguno, retorna 0.
    
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
