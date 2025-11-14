package com.epu.prototipo.controller;

import com.epu.prototipo.dto.EquipoStatusDTO;
import com.epu.prototipo.service.PublicConsultaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/consulta")
public class PublicConsultaController {

    private final PublicConsultaService publicConsultaService;

    public PublicConsultaController(PublicConsultaService publicConsultaService) {
        this.publicConsultaService = publicConsultaService;
    }

    @GetMapping("/equipo/{tag}")
    public ResponseEntity<EquipoStatusDTO> getStatusPorTag(@PathVariable String tag) {
        EquipoStatusDTO dto = publicConsultaService.getEquipoStatus(tag);
        return ResponseEntity.ok(dto);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
