package com.epu.prototipo.controller;

import com.epu.prototipo.payload.request.LoginRequest;
import com.epu.prototipo.payload.response.LoginResponse;
import com.epu.prototipo.security.service.UserDetailsServiceCustom; 
import com.epu.prototipo.util.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
            
            boolean requiresPasswordChange = false; // !!! para pruebas del prototipo

            // Respuesta con el token real
            return ResponseEntity.ok(new LoginResponse(token, requiresPasswordChange));

        } catch (Exception e) {
            // Si el usuario no existe o la contraseña fallo
            // se devuelve un 401 (Unauthorized) manualmente
            return ResponseEntity.status(401).body("Error: Legajo o contraseña inválidos.");
        }
    }
        
}