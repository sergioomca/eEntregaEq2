package com.epu.prototipo.controller;

import com.epu.prototipo.payload.request.LoginRequest;
import com.epu.prototipo.payload.response.LoginResponse;
import com.epu.prototipo.security.service.UserDetailsServiceCustom; 
import com.epu.prototipo.util.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
// Se eliminan AuthenticationManager y AuthenticationConfiguration
import org.springframework.security.crypto.password.PasswordEncoder; // NUEVO IMPORT
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 💡 NOTA: Eliminamos AuthenticationManager.
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsServiceCustom userDetailsService; 

    // 1. INYECTAMOS EL PASSWORD ENCODER
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 💡 NOTA: Eliminamos el constructor que usaba AuthenticationConfiguration.
    
    // Endpoint para el login (MANUAL)
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody LoginRequest authenticationRequest) throws Exception {
        
        try {
            // 2. VALIDACIÓN MANUAL
            
            // Paso A: Cargar el usuario
            final UserDetails userDetails = userDetailsService
                    .loadUserByUsername(authenticationRequest.getLegajo());

            // Paso B: Verificar la contraseña manualmente
            // (Usamos el PasswordEncoder de SecurityBeans.java, que manejará el prefijo {noop})
            if (!passwordEncoder.matches(authenticationRequest.getPassword(), userDetails.getPassword())) {
                // Si la contraseña no coincide
                throw new Exception("INVALID_CREDENTIALS");
            }
            
            // 3. GENERACIÓN DE TOKEN (Si la validación manual fue exitosa)
            final String token = jwtTokenUtil.generateToken(userDetails);
            
            boolean requiresPasswordChange = false; // Lógica de prototipo

            // 4. Devolver la respuesta con el token real
            return ResponseEntity.ok(new LoginResponse(token, requiresPasswordChange));

        } catch (Exception e) {
            // Si el usuario no existe o la contraseña falló
            // Devolvemos un 401 (Unauthorized) manualmente
            return ResponseEntity.status(401).body("Error: Legajo o contraseña inválidos.");
        }
    }
    
    // 💡 NOTA: Eliminamos el método authenticate() que usaba el AuthenticationManager.
}