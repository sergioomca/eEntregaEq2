package com.epu.prototipo.controller;

import com.epu.prototipo.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:5173")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    /**
     * Endpoint 1: Exportar PDF de un PTS individual (Impresión - HU-015)
     * GET /api/reportes/pdf/{ptsId}
     */
    @GetMapping("/pdf/{ptsId}")
    public ResponseEntity<byte[]> exportarPtsPdf(@PathVariable String ptsId) {
        try {
            System.out.println("Solicitud de exportación PDF para PTS ID: " + ptsId);
            
            // Generar PDF usando el servicio
            byte[] pdfBytes = reporteService.exportarPtsPdf(ptsId);
            
            // Configurar headers para descarga de PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "PTS-" + ptsId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            System.out.println("PDF generado exitosamente. Tamaño: " + pdfBytes.length + " bytes");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al exportar PDF para PTS " + ptsId + ": " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint 2: Exportar Excel de Múltiples PTS (Reporte - HU-008)
     * GET /api/reportes/excel
     */
    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportarPtsExcel(
            @RequestParam(required = false) 
            @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaDesde,
            
            @RequestParam(required = false) 
            @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaHasta,
            
            @RequestParam(required = false) String area) {
        
        try {
            System.out.println("Solicitud de exportación Excel con filtros:");
            System.out.println("- fechaDesde: " + fechaDesde);
            System.out.println("- fechaHasta: " + fechaHasta);
            System.out.println("- area: " + area);
            
            // Generar Excel usando el servicio
            byte[] excelBytes = reporteService.exportarPtsExcel(fechaDesde, fechaHasta, area);
            
            // Configurar headers para descarga de Excel
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "Reporte_PTS.xlsx");
            headers.setContentLength(excelBytes.length);
            
            System.out.println("Excel generado exitosamente. Tamaño: " + excelBytes.length + " bytes");
            
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al exportar Excel: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint adicional: Información sobre tipos de reportes disponibles
     * GET /api/reportes/info
     */
    @GetMapping("/info")
    public ResponseEntity<Object> obtenerInfoReportes() {
        try {
            return ResponseEntity.ok(new Object() {
                public final String[] formatosDisponibles = {"PDF", "Excel"};
                public final String pdfEndpoint = "/api/reportes/pdf/{ptsId}";
                public final String excelEndpoint = "/api/reportes/excel?fechaDesde=yyyy-MM-dd&fechaHasta=yyyy-MM-dd&area=string";
                public final String descripcion = "Servicio de generación de reportes para PTS";
                public final String version = "1.0.0";
            });
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}