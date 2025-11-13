package com.epu.prototipo.controller;

import com.epu.prototipo.service.EquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dcs")
public class DcsSimController {

    private final EquipoService equipoService;

    @Autowired
    public DcsSimController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @PostMapping("/update")
    public ResponseEntity<?> recibirActualizacionDcs(@RequestBody Map<String, String> payload) {
        String tag = payload.get("tag");
        String estado = payload.get("estado");
        if (tag == null || estado == null) {
            return ResponseEntity.badRequest().body("Faltan parámetros: tag y estado son requeridos");
        }
        try {
            equipoService.actualizarEstadoEquipo(tag, estado);
            System.out.println(">>> [MOCK_DCS_GATEWAY] Señal recibida desde DCS: TAG=" + tag + ", ESTADO=" + estado);
            return ResponseEntity.ok("Estado actualizado correctamente desde DCS");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
