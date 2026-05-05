package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.payload.request.LoginRequest;
import com.epu.prototipo.payload.response.LoginResponse;
import com.epu.prototipo.security.service.UserDetailsServiceCustom; 
import com.epu.prototipo.service.IUsuarioService;
import com.epu.prototipo.util.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsServiceCustom userDetailsService; 

    // Pongo el PASSWORD ENCODER
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IUsuarioService usuarioService;

    // Endpoint para el login (MANUAL)
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody LoginRequest authenticationRequest) throws Exception {
        
        String legajo = authenticationRequest.getLegajo();
        
        try {
            // 1. Obtener usuario y verificar si está bloqueado
            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(legajo);
            
            if (usuario == null) {
                return ResponseEntity.status(401).body("Error: Legajo o contraseña inválidos.");
            }

            if (usuario.isAccountLocked()) {
                System.out.println("[LOGIN BLOQUEADO] Usuario: " + legajo + " intenta acceder pero su cuenta está bloqueada.");
                return ResponseEntity.status(403).body("Su cuenta está bloqueada debido a múltiples intentos fallidos. Contacte al administrador.");
            }

            // 2. Validación MANUAL de contraseña
            final UserDetails userDetails = userDetailsService.loadUserByUsername(legajo);

            if (!passwordEncoder.matches(authenticationRequest.getPassword(), userDetails.getPassword())) {
                // Contraseña incorrecta - incrementar intentos fallidos
                usuario.setFailedLoginAttempts(usuario.getFailedLoginAttempts() + 1);
                
                int remainingAttempts = 5 - usuario.getFailedLoginAttempts();
                
                if (usuario.getFailedLoginAttempts() >= 5) {
                    // Bloquear la cuenta
                    usuario.setAccountLocked(true);
                    usuarioService.updateUsuario(legajo, usuario);
                    System.out.println("[LOGIN BLOQUEADO] Usuario: " + legajo + " bloqueado por 5 intentos fallidos.");
                    return ResponseEntity.status(403).body("Su cuenta ha sido bloqueada por seguridad. Contacte al administrador.");
                } else {
                    // Actualizar intentos fallidos sin bloquear
                    usuarioService.updateUsuario(legajo, usuario);
                    System.out.println("[LOGIN FALLIDO] Usuario: " + legajo + " intento fallido. Intentos restantes: " + remainingAttempts);
                    return ResponseEntity.status(401).body("Contraseña inválida. Intentos restantes: " + remainingAttempts);
                }
            }
            
            // 3. Login exitoso - resetear intentos fallidos
            usuario.setFailedLoginAttempts(0);
            autoUpgradeLegacyPasswordIfNeeded(usuario, authenticationRequest.getPassword());
            usuarioService.updateUsuario(legajo, usuario);
            
            // 4. Generar token
            final String token = jwtTokenUtil.generateToken(userDetails);
            
            // 5. Verificar si el usuario debe cambiar su contraseña
            boolean requiresPasswordChange = usuario.isMustChangePassword();
            System.out.println("[LOGIN EXITOSO] Usuario: " + legajo + " | mustChangePassword: " + requiresPasswordChange);

            // Respuesta con el token real
            return ResponseEntity.ok(new LoginResponse(token, requiresPasswordChange));

        } catch (Exception e) {
            // Si el usuario no existe
            System.err.println("[LOGIN ERROR] Error para usuario: " + legajo + " - " + e.getMessage());
            return ResponseEntity.status(401).body("Error: Legajo o contraseña inválidos.");
        }
    }

    // Endpoint para cambiar contraseña
    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(@RequestBody Map<String, String> request) {
        try {
            String legajo = request.get("legajo");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body("Debe autenticarse para cambiar la contraseña.");
            }

            String authLegajo = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

            if (legajo == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Faltan campos requeridos.");
            }

            if (!isAdmin && !authLegajo.equals(legajo)) {
                return ResponseEntity.status(403).body("No tiene permisos para cambiar la contraseña de otro usuario.");
            }

            String trimmedPassword = newPassword.trim();
            boolean passwordPolicyValid = trimmedPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");
            if (!passwordPolicyValid) {
                return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo especial.");
            }

            // Verificar contraseña actual
            final UserDetails userDetails = userDetailsService.loadUserByUsername(legajo);
            if (!passwordEncoder.matches(currentPassword, userDetails.getPassword())) {
                return ResponseEntity.status(401).body("La contraseña actual es incorrecta.");
            }

            // Actualizar contraseña
            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(legajo);
            usuario.setPassword(passwordEncoder.encode(trimmedPassword));
            usuario.setMustChangePassword(false);
            usuarioService.updateUsuario(legajo, usuario);

            System.out.println("Contraseña cambiada exitosamente para usuario: " + legajo);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));

        } catch (Exception e) {
            System.err.println("Error al cambiar contraseña: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al cambiar la contraseña.");
        }
    }

    // Endpoint para desbloquear cuenta (solo admin)
    @PostMapping("/desbloquear-cuenta")
    public ResponseEntity<?> desbloquearCuenta(@RequestBody Map<String, String> request) {
        try {
            String legajo = request.get("legajo");

            if (legajo == null || legajo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Legajo es requerido.");
            }

            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(legajo);
            
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuario no encontrado.");
            }

            if (!usuario.isAccountLocked()) {
                return ResponseEntity.status(400).body("La cuenta no está bloqueada.");
            }

            // Desbloquear la cuenta y resetear intentos
            usuario.setAccountLocked(false);
            usuario.setFailedLoginAttempts(0);
            // Tras desbloquear, forzar cambio de contraseña por seguridad
            usuario.setMustChangePassword(true);
            usuarioService.updateUsuario(legajo, usuario);

            System.out.println("[DESBLOQUEAR] Usuario: " + legajo + " ha sido desbloqueado.");
            return ResponseEntity.ok(Map.of("message", "Cuenta desbloqueada exitosamente."));

        } catch (Exception e) {
            System.err.println("Error al desbloquear cuenta: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al desbloquear la cuenta.");
        }
    }

    // Endpoint para bloquear cuenta (solo admin)
    @PostMapping("/bloquear-cuenta")
    public ResponseEntity<?> bloquearCuenta(@RequestBody Map<String, String> request) {
        try {
            String legajo = request.get("legajo");

            if (legajo == null || legajo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Legajo es requerido.");
            }

            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(legajo);

            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuario no encontrado.");
            }

            if (usuario.isAccountLocked()) {
                return ResponseEntity.status(400).body("La cuenta ya está bloqueada.");
            }

            usuario.setAccountLocked(true);
            usuario.setFailedLoginAttempts(5);
            usuarioService.updateUsuario(legajo, usuario);

            System.out.println("[BLOQUEAR] Usuario: " + legajo + " ha sido bloqueado.");
            return ResponseEntity.ok(Map.of("message", "Cuenta bloqueada exitosamente."));

        } catch (Exception e) {
            System.err.println("Error al bloquear cuenta: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al bloquear la cuenta.");
        }
    }

    private void autoUpgradeLegacyPasswordIfNeeded(UsuarioDTO usuario, String rawPassword) {
        String storedPassword = usuario.getPassword();
        if (!isDelegatingFormat(storedPassword)) {
            usuario.setPassword(passwordEncoder.encode(rawPassword));
            System.out.println("[PASSWORD UPGRADE] Usuario: " + usuario.getLegajo() + " migrado a PBKDF2.");
        }
    }

    private boolean isDelegatingFormat(String password) {
        return password != null && password.startsWith("{") && password.contains("}");
    }
        
}