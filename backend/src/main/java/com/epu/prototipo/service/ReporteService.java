package com.epu.prototipo.service;

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private IPtsService ptsService;

    /**
     * Exporta un PTS individual a formato PDF
     * @param ptsId ID del PTS a exportar
     * @return byte[] que representa el archivo PDF generado
     */
    public byte[] exportarPtsPdf(String ptsId) {
        try {
            // Obtener el PTS por ID
            PermisoTrabajoSeguro pts = ptsService.getPtsById(ptsId);
            
            if (pts == null) {
                throw new RuntimeException("PTS no encontrado con ID: " + ptsId);
            }

            // Mock: Simulación de generación de PDF
            System.out.println("Generación de PDF mock para el PTS ID: " + ptsId);
            System.out.println("Datos del PTS: " + pts.getDescripcionTrabajo() + " - " + pts.getRtoEstado());
            
            // Simular procesamiento de datos para PDF
            StringBuilder contenidoMock = new StringBuilder();
            contenidoMock.append("=== PERMISO DE TRABAJO SEGURO ===\n");
            contenidoMock.append("ID: ").append(pts.getId()).append("\n");
            contenidoMock.append("Descripción Trabajo: ").append(pts.getDescripcionTrabajo()).append("\n");
            contenidoMock.append("Tarea Detallada: ").append(pts.getTareaDetallada()).append("\n");
            contenidoMock.append("RTO Estado: ").append(pts.getRtoEstado()).append("\n");
            contenidoMock.append("Equipo: ").append(pts.getEquipoOInstalacion()).append("\n");
            contenidoMock.append("Área: ").append(pts.getArea()).append("\n");
            contenidoMock.append("Solicitante: ").append(pts.getSolicitanteLegajo()).append("\n");
            contenidoMock.append("Fecha Inicio: ").append(pts.getFechaInicio()).append("\n");
            
            System.out.println("Contenido PDF mock generado: " + contenidoMock.length() + " caracteres");
            
            // Crear un mock de PDF más realista
            byte[] pdfMock = new byte[1024];
            // Simular cabecera PDF
            byte[] header = "%PDF-1.4\n".getBytes();
            System.arraycopy(header, 0, pdfMock, 0, Math.min(header.length, pdfMock.length));
            // Añadir contenido de fin de PDF
            byte[] footer = "\n%%EOF".getBytes();
            int footerPos = pdfMock.length - footer.length;
            System.arraycopy(footer, 0, pdfMock, footerPos, footer.length);
            return pdfMock;
            
        } catch (Exception e) {
            System.err.println("Error al generar PDF para PTS " + ptsId + ": " + e.getMessage());
            throw new RuntimeException("Error en la generación del PDF: " + e.getMessage());
        }
    }

    /**
     * Exporta múltiples PTS filtrados a formato Excel
     * @param fechaDesde Fecha de inicio del filtro (opcional)
     * @param fechaHasta Fecha de fin del filtro (opcional)
     * @param area Área para filtrar (opcional)
     * @return byte[] que representa el archivo Excel generado
     */
    public byte[] exportarPtsExcel(Date fechaDesde, Date fechaHasta, String area) {
        try {
            // Obtener lista de PTS filtrados usando PtsService
            // Convertir Date a String si no es null
            String fechaDesdeStr = fechaDesde != null ? fechaDesde.toString() : null;
            List<PermisoTrabajoSeguro> ptsList = ptsService.buscarPts(null, null, area, null, fechaDesdeStr);
            
            // Mock: Simulación de generación de Excel
            System.out.println("Generación de Excel mock con filtros:");
            System.out.println("- Fecha desde: " + fechaDesde);
            System.out.println("- Fecha hasta: " + fechaHasta);
            System.out.println("- Área: " + area);
            System.out.println("- Registros encontrados: " + ptsList.size());
            
            // Simular procesamiento de datos para Excel
            StringBuilder contenidoMock = new StringBuilder();
            contenidoMock.append("=== REPORTE DE PTS - EXCEL ===\n");
            contenidoMock.append("Filtros aplicados:\n");
            contenidoMock.append("Fecha desde: ").append(fechaDesde).append("\n");
            contenidoMock.append("Fecha hasta: ").append(fechaHasta).append("\n");
            contenidoMock.append("Área: ").append(area != null ? area : "Todas").append("\n\n");
            
            contenidoMock.append("Registros exportados:\n");
            for (int i = 0; i < ptsList.size(); i++) {
                PermisoTrabajoSeguro pts = ptsList.get(i);
                contenidoMock.append((i + 1)).append(". ")
                    .append(pts.getId()).append(" - ")
                    .append(pts.getDescripcionTrabajo()).append(" - ")
                    .append(pts.getRtoEstado()).append("\n");
            }
            
            System.out.println("Contenido Excel mock generado: " + contenidoMock.length() + " caracteres");
            System.out.println("Simulando creación de celdas, estilos y fórmulas...");
            
            // Crear un mock de Excel más realista
            // Mínimo Excel válido (cabecera)
            byte[] excelMock = new byte[2048];
            // Simular cabecera Excel
            byte[] header = "PK\u0003\u0004".getBytes();
            System.arraycopy(header, 0, excelMock, 0, Math.min(header.length, excelMock.length));
            return excelMock;
            
        } catch (Exception e) {
            System.err.println("Error al generar Excel con filtros: " + e.getMessage());
            throw new RuntimeException("Error en la generación del Excel: " + e.getMessage());
        }
    }
}