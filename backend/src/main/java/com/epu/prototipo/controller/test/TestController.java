package com.epu.prototipo.controller.test;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // /api/test/emisor (Acceso EMISOR)
    @GetMapping("/emisor")
    @PreAuthorize("hasRole('EMISOR')")
    public ResponseEntity<String> emisorEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para EMISORES.");
    }

    // /api/test/admin (Solo ADMINISTRADOR - Deniega a EMISOR y EJECUTANTE)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para ADMINISTRADORES.");
    }

    // /api/test/auditoria (Acceso SUPERVISOR)     !!! ver
    @GetMapping("/auditoria")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<String> supervisorEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para SUPERVISORES (Rol de Auditoría).");
    }

    // /api/test/ejecucion (Acceso EJECUTANTE)
    @GetMapping("/ejecucion")
    @PreAuthorize("hasRole('EJECUTANTE')")
    public ResponseEntity<String> ejecutanteEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para EJECUTANTES.");
    }
}