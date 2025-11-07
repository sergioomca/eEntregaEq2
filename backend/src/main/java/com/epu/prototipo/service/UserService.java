package com.epu.prototipo.service;
import com.epu.prototipo.service.userdetails.UserDetailsImpl;
import org.springframework.stereotype.Service;
/**
 * @Service: Marca esta clase como un componente de la capa de servicio.
 * En una aplicación real, esta clase contendría la lógica para interactuar con
 * el repositorio (BD/LDAP) o un cliente de servicio externo.
 */
@Service
public class UserService {
/**
     * Busca los datos de un usuario por su legajo.
     * Esto simula la búsqueda en LDAP/MySQL.
     * @param legajo El ID del empleado.
     * @return El UserDetails con los datos o null si no se encuentra.
     */
    public UserDetailsImpl findByLegajo(String legajo) {
        
        // --- SIMULACIÓN DE DATOS LDAP/BASE DE DATOS ---
        
        // 1. Legajo: VINF011422 (Usuario de prueba)
        if ("VINF011422".equalsIgnoreCase(legajo)) {
            // Nota CRÍTICA: La contraseña debe estar cifrada con el mismo
            // algoritmo PBKDF2 que configuramos en SecurityBeans.java.
            // Genera este hash fuera y lo pegas aquí.
            // (Ejemplo: el hash de la contraseña 'miPasswordSegura' cifrado con PBKDF2)
            String encryptedPassword = "db157c3db516ecdd39f59e4bfa06b5c130346c990856a3f9e4610261bfaf507b5200640552f31a61c4de4b4058f685c7"; // Hash SIMULADO
// Si el login es exitoso, devolvemos el objeto UserDetails
            return new UserDetailsImpl("VINF011422", encryptedPassword, "EMISOR");
        }
        
        // 2. Legajo de otro rol (ejemplo para la Tarea 06 - Roles)
        if ("OPR999".equalsIgnoreCase(legajo)) {
            String encryptedPassword = "{pbkdf2@SpringSecurity}otrohash"; // Otro hash SIMULADO
            return new UserDetailsImpl("OPR999", encryptedPassword, "OPERADOR");
        }
// Si el legajo no se encuentra
        return null;
    }
/**
     * Lógica para el flag de primer ingreso (HU-001)
     * En una app real, esto verificaría un campo 'firstLogin' en la DB.
     */
    public boolean checkIfFirstLogin(String legajo) {
        // Simulación: forzamos el cambio de contraseña para un legajo específico
        return "VINF011422".equalsIgnoreCase(legajo);
    }
}
