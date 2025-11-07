package com.epu.prototipo.controller.test;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // P1: /api/test/emisor (Acceso para EMISOR)
    @GetMapping("/emisor")
    @PreAuthorize("hasRole('EMISOR')")
    public ResponseEntity<String> emisorEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para EMISORES.");
    }

    // P2 & P5: /api/test/admin (Solo para ADMINISTRADOR - Deniega a EMISOR y EJECUTANTE)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para ADMINISTRADORES.");
    }

    // P3: /api/test/auditoria (Acceso para SUPERVISOR)
    @GetMapping("/auditoria")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<String> supervisorEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para SUPERVISORES (Rol de Auditoría).");
    }

    // P4: /api/test/ejecucion (Acceso para EJECUTANTE)
    @GetMapping("/ejecucion")
    @PreAuthorize("hasRole('EJECUTANTE')")
    public ResponseEntity<String> ejecutanteEndpoint() {
        return ResponseEntity.ok("Acceso Exitoso: Solo para EJECUTANTES.");
    }
}