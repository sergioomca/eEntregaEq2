// ...existing code...
package com.epu.prototipo.service;

import com.epu.prototipo.dto.CerrarPtsRequest;
import com.epu.prototipo.dto.FirmaPtsRequest;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import java.util.List;

// Interface para servicio gestion PTS
 
public interface IPtsService {
    
    // Recupera todos los PTS disponibles.
    // @return Lista de todos los PTS
    
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
     * Cerrar un PTS y marcar como RTO
     * @param request Datos del cierre ... responsable y observaciones
     * @return PTS cerrado actualizado
     * @throws SecurityException si usuario no tiene permisos para cerrar el PTS
     * @throws IllegalStateException si PTS no esta en estado valido para cierre
     * @throws IllegalArgumentException si los datos de entrada son invalidos
     */
    PermisoTrabajoSeguro cerrarPts(CerrarPtsRequest request);
    /**
     * Obtiene el último número de PTS creado para una fecha dada (formato YYYY-MM-DD).
     * @param fechaInicio Fecha a consultar
     * @return Último número de PTS creado ese día, o 0 si no hay ninguno
     */
    int obtenerUltimoNumeroPtsPorFecha(String fechaInicio);
}