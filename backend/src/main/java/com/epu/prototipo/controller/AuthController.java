package com.epu.prototipo.controller;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.payload.request.LoginRequest;
import com.epu.prototipo.payload.response.LoginResponse;
import com.epu.prototipo.security.service.UserDetailsServiceCustom; 
import com.epu.prototipo.service.IUsuarioService;
import com.epu.prototipo.util.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
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
        
        try {
            // Validacion MANUAL
            
            // Carga usuario
            final UserDetails userDetails = userDetailsService
                    .loadUserByUsername(authenticationRequest.getLegajo());

            // Verifica contraseña manualmente
            // (!!! Prueba el PasswordEncoder de SecurityBeans.java, que maneja el prefijo {noop})
            if (!passwordEncoder.matches(authenticationRequest.getPassword(), userDetails.getPassword())) {
                // Si la contraseña no coincide
                throw new Exception("INVALID_CREDENTIALS");
            }
            
            // Genera el TOKEN (Si la validacion manual fue exitosa)
            final String token = jwtTokenUtil.generateToken(userDetails);
            
            // Verificar si el usuario debe cambiar su contraseña
            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(authenticationRequest.getLegajo());
            boolean requiresPasswordChange = usuario.isMustChangePassword();
            System.out.println("[LOGIN] Usuario: " + authenticationRequest.getLegajo() + " | mustChangePassword: " + requiresPasswordChange);

            // Respuesta con el token real
            return ResponseEntity.ok(new LoginResponse(token, requiresPasswordChange));

        } catch (Exception e) {
            // Si el usuario no existe o la contraseña fallo
            // se devuelve un 401 (Unauthorized) manualmente
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

            if (legajo == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Faltan campos requeridos.");
            }

            if (newPassword.trim().length() < 4) {
                return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 4 caracteres.");
            }

            // Verificar contraseña actual
            final UserDetails userDetails = userDetailsService.loadUserByUsername(legajo);
            if (!passwordEncoder.matches(currentPassword, userDetails.getPassword())) {
                return ResponseEntity.status(401).body("La contraseña actual es incorrecta.");
            }

            // Actualizar contraseña
            UsuarioDTO usuario = usuarioService.getUsuarioByLegajo(legajo);
            usuario.setPassword(newPassword.trim());
            usuario.setMustChangePassword(false);
            usuarioService.updateUsuario(legajo, usuario);

            System.out.println("Contraseña cambiada exitosamente para usuario: " + legajo);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));

        } catch (Exception e) {
            System.err.println("Error al cambiar contraseña: " + e.getMessage());
            return ResponseEntity.status(500).body("Error al cambiar la contraseña.");
        }
    }
        
}