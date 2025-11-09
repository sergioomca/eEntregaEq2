package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import java.util.List;

/**
 * Interfaz para el servicio de gestión de Permisos de Trabajo Seguro (PTS).
 */
public interface IPtsService {
    
    /**
     * Recupera todos los PTS disponibles.
     * @return Lista de todos los PTS
     */
    List<PermisoTrabajoSeguro> getAllPts();
    
    /**
     * Busca PTS aplicando filtros opcionales.
     * Todos los parámetros son opcionales (@Nullable).
     * 
     * @param equipo Filtro por nombre de equipo (búsqueda parcial, case-insensitive)
     * @param usuario Filtro por nombre o legajo de solicitante (búsqueda parcial, case-insensitive) 
     * @param area Filtro por área (búsqueda parcial, case-insensitive)
     * @param estado Filtro por estado RTO: PENDIENTE, CERRADO (búsqueda exacta)
     * @param fechaInicio Filtro por fecha de inicio en formato YYYY-MM-DD (búsqueda exacta)
     * @return Lista filtrada de PTS que cumplen con los criterios especificados
     */
    List<PermisoTrabajoSeguro> buscarPts(String equipo, String usuario, String area, String estado, String fechaInicio);
    
    /**
     * Crea un nuevo PTS.
     * @param pts El PTS a crear
     * @return El PTS creado con su ID asignado
     */
    PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts);
    
    /**
     * Obtiene un PTS por su ID.
     * @param id ID del PTS a buscar
     * @return El PTS encontrado o null si no existe
     */
    PermisoTrabajoSeguro getPtsById(String id);
    
    /**
     * Firma un PTS con validación biométrica simulada.
     * @param request Datos de la firma
     * @return El PTS firmado actualizado
     */
    PermisoTrabajoSeguro firmarPts(FirmaPtsRequest request);
    
    /**
     * Cierra un PTS y lo marca como "Retorno a Operaciones" (RTO).
     * @param request Datos del cierre incluyendo responsable y observaciones
     * @return El PTS cerrado actualizado
     * @throws SecurityException si el usuario no tiene permisos para cerrar el PTS
     * @throws IllegalStateException si el PTS no está en estado válido para cierre
     * @throws IllegalArgumentException si los datos de entrada son inválidos
     */
    PermisoTrabajoSeguro cerrarPts(CerrarPtsRequest request);
}