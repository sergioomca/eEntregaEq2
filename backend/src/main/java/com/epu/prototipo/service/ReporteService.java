package com.epu.prototipo.service;

import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;

@Service
public class ReporteService {

    @Autowired
    private IPtsService ptsService;

    // Fuentes reutilizables
    private static final PDType1Font FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT_NORMAL = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font FONT_ITALIC = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

    // Márgenes y tamaños
    private static final float MARGIN = 50;
    private static final float LINE_HEIGHT = 16;
    private static final float SECTION_GAP = 10;

    /**
     * Exportar un PTS individual a formato PDF real usando Apache PDFBox
     * @param ptsId ID del PTS a exportar
     * @return byte[] que representa el archivo PDF generado
     */
    public byte[] exportarPtsPdf(String ptsId) {
        try {
            PermisoTrabajoSeguro pts = ptsService.getPtsById(ptsId);

            if (pts == null) {
                throw new RuntimeException("PTS no encontrado con ID: " + ptsId);
            }

            System.out.println("Generando PDF real para PTS ID: " + ptsId);

            try (PDDocument document = new PDDocument();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

                float[] yRef = new float[1]; // referencia mutable para posición Y
                PDPage currentPage = addNewPage(document);
                yRef[0] = currentPage.getMediaBox().getHeight() - MARGIN;

                // === ENCABEZADO ===
                yRef[0] = writeTitle(document, currentPage, yRef[0], "PERMISO DE TRABAJO SEGURO (PTS)");
                yRef[0] -= 5;
                yRef[0] = writeCenteredText(document, currentPage, yRef[0], "N°: " + safe(pts.getId()), FONT_BOLD, 12);
                yRef[0] -= SECTION_GAP;

                // Línea separadora
                yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                yRef[0] -= SECTION_GAP;

                // === DATOS GENERALES ===
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "DATOS GENERALES");

                String[][] datosGenerales = {
                    {"Área:", safe(pts.getArea())},
                    {"Equipo / Instalación:", safe(pts.getEquipoOInstalacion())},
                    {"Ubicación:", safe(pts.getUbicacion())},
                    {"Tipo de Trabajo:", safe(pts.getTipoTrabajo())},
                    {"Solicitante (Legajo):", safe(pts.getSolicitanteLegajo())},
                    {"Nombre Solicitante:", safe(pts.getNombreSolicitante())},
                    {"Supervisor (Legajo):", safe(pts.getSupervisorLegajo())},
                    {"Fecha Inicio:", safe(pts.getFechaInicio())},
                    {"Fecha Fin:", safe(pts.getFechaFin())},
                    {"Hora Inicio:", safe(pts.getHoraInicio())},
                    {"Hora Fin:", safe(pts.getHoraFin())}
                };

                for (String[] pair : datosGenerales) {
                    if (yRef[0] < MARGIN + 30) {
                        currentPage = addNewPage(document);
                        yRef[0] = currentPage.getMediaBox().getHeight() - MARGIN;
                    }
                    yRef[0] = writeLabelValue(document, currentPage, yRef[0], pair[0], pair[1]);
                }

                yRef[0] -= SECTION_GAP;
                currentPage = checkPageBreak(document, currentPage, yRef, 60);
                yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                yRef[0] -= SECTION_GAP;

                // === DESCRIPCIÓN DEL TRABAJO ===
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "DESCRIPCIÓN DEL TRABAJO");
                currentPage = checkPageBreak(document, currentPage, yRef, 40);
                yRef[0] = writeWrappedText(document, currentPage, yRef[0], safe(pts.getDescripcionTrabajo()), FONT_NORMAL, 10);

                yRef[0] -= SECTION_GAP;
                currentPage = checkPageBreak(document, currentPage, yRef, 60);

                // === TAREA DETALLADA ===
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "TAREA DETALLADA");
                currentPage = checkPageBreak(document, currentPage, yRef, 40);
                yRef[0] = writeWrappedText(document, currentPage, yRef[0], safe(pts.getTareaDetallada()), FONT_NORMAL, 10);

                yRef[0] -= SECTION_GAP;

                // === ANÁLISIS DE RIESGO ADICIONAL ===
                currentPage = checkPageBreak(document, currentPage, yRef, 30);
                yRef[0] = writeLabelValue(document, currentPage, yRef[0],
                    "Requiere Análisis de Riesgo Adicional:",
                    pts.isRequiereAnalisisRiesgoAdicional() ? "SÍ" : "NO");

                yRef[0] -= SECTION_GAP;
                currentPage = checkPageBreak(document, currentPage, yRef, 40);
                yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                yRef[0] -= SECTION_GAP;

                // === RIESGOS Y CONTROLES ===
                List<PermisoTrabajoSeguro.RiesgoControl> riesgos = pts.getRiesgosControles();
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "RIESGOS Y CONTROLES");

                if (riesgos != null && !riesgos.isEmpty()) {
                    // Encabezados de tabla
                    currentPage = checkPageBreak(document, currentPage, yRef, 30);
                    yRef[0] = writeTableRow(document, currentPage, yRef[0],
                        new String[]{"Peligro", "Consecuencia", "Control Requerido"}, FONT_BOLD, 9);

                    for (PermisoTrabajoSeguro.RiesgoControl rc : riesgos) {
                        currentPage = checkPageBreak(document, currentPage, yRef, 30);
                        yRef[0] = writeTableRow(document, currentPage, yRef[0],
                            new String[]{safe(rc.getPeligro()), safe(rc.getConsecuencia()), safe(rc.getControlRequerido())},
                            FONT_NORMAL, 9);
                    }
                } else {
                    currentPage = checkPageBreak(document, currentPage, yRef, 20);
                    yRef[0] = writeText(document, currentPage, yRef[0], "No se registraron riesgos.", FONT_ITALIC, 10);
                }

                yRef[0] -= SECTION_GAP;
                currentPage = checkPageBreak(document, currentPage, yRef, 40);
                yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                yRef[0] -= SECTION_GAP;

                // === EQUIPOS DE SEGURIDAD ===
                List<PermisoTrabajoSeguro.EquipoSeguridad> equipos = pts.getEquiposSeguridad();
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "EQUIPOS DE SEGURIDAD");

                if (equipos != null && !equipos.isEmpty()) {
                    currentPage = checkPageBreak(document, currentPage, yRef, 30);
                    yRef[0] = writeTableRow(document, currentPage, yRef[0],
                        new String[]{"Equipo", "Requerido", "Proporcionado", "Observación"}, FONT_BOLD, 8);

                    for (PermisoTrabajoSeguro.EquipoSeguridad eq : equipos) {
                        currentPage = checkPageBreak(document, currentPage, yRef, 30);
                        yRef[0] = writeTableRow(document, currentPage, yRef[0],
                            new String[]{
                                safe(eq.getEquipo()),
                                eq.isEsRequerido() ? "Sí" : "No",
                                eq.isEsProporcionado() ? "Sí" : "No",
                                safe(eq.getObservacion())
                            }, FONT_NORMAL, 8);
                    }
                } else {
                    currentPage = checkPageBreak(document, currentPage, yRef, 20);
                    yRef[0] = writeText(document, currentPage, yRef[0], "No se registraron equipos de seguridad.", FONT_ITALIC, 10);
                }

                yRef[0] -= SECTION_GAP;
                currentPage = checkPageBreak(document, currentPage, yRef, 40);
                yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                yRef[0] -= SECTION_GAP;

                // === ESTADO Y FIRMA ===
                yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "ESTADO Y FIRMA");

                yRef[0] = writeLabelValue(document, currentPage, yRef[0], "Estado:", safe(pts.getRtoEstado()));

                if (pts.getDniSupervisorFirmante() != null && !pts.getDniSupervisorFirmante().isEmpty()) {
                    currentPage = checkPageBreak(document, currentPage, yRef, 20);
                    yRef[0] = writeLabelValue(document, currentPage, yRef[0],
                        "Firmado por (Legajo):", pts.getDniSupervisorFirmante());
                    if (pts.getFechaHoraFirmaSupervisor() != null) {
                        currentPage = checkPageBreak(document, currentPage, yRef, 20);
                        yRef[0] = writeLabelValue(document, currentPage, yRef[0],
                            "Fecha/Hora Firma:", pts.getFechaHoraFirmaSupervisor().toString());
                    }
                } else {
                    currentPage = checkPageBreak(document, currentPage, yRef, 20);
                    yRef[0] = writeText(document, currentPage, yRef[0], "PTS aún no firmado.", FONT_ITALIC, 10);
                }

                // === CIERRE RTO ===
                if (pts.getRtoResponsableCierreLegajo() != null && !pts.getRtoResponsableCierreLegajo().isEmpty()) {
                    yRef[0] -= SECTION_GAP;
                    currentPage = checkPageBreak(document, currentPage, yRef, 60);
                    yRef[0] = drawHorizontalLine(document, currentPage, yRef[0]);
                    yRef[0] -= SECTION_GAP;
                    yRef[0] = writeSectionHeader(document, currentPage, yRef[0], "CIERRE RTO");
                    yRef[0] = writeLabelValue(document, currentPage, yRef[0],
                        "Responsable Cierre (Legajo):", pts.getRtoResponsableCierreLegajo());
                    if (pts.getRtoFechaHoraCierre() != null) {
                        currentPage = checkPageBreak(document, currentPage, yRef, 20);
                        yRef[0] = writeLabelValue(document, currentPage, yRef[0],
                            "Fecha/Hora Cierre:", pts.getRtoFechaHoraCierre().toString());
                    }
                    if (pts.getRtoObservaciones() != null && !pts.getRtoObservaciones().isEmpty()) {
                        currentPage = checkPageBreak(document, currentPage, yRef, 40);
                        yRef[0] = writeLabelValue(document, currentPage, yRef[0], "Observaciones:", "");
                        yRef[0] = writeWrappedText(document, currentPage, yRef[0], pts.getRtoObservaciones(), FONT_NORMAL, 10);
                    }
                }

                document.save(baos);
                byte[] pdfBytes = baos.toByteArray();
                System.out.println("PDF generado exitosamente. Tamaño: " + pdfBytes.length + " bytes");
                return pdfBytes;
            }

        } catch (Exception e) {
            System.err.println("Error al generar PDF para PTS " + ptsId + ": " + e.getMessage());
            throw new RuntimeException("Error en la generación del PDF: " + e.getMessage());
        }
    }

    // ========== Métodos auxiliares para escritura en PDF ==========

    private PDPage addNewPage(PDDocument document) {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);
        return page;
    }

    private PDPage checkPageBreak(PDDocument document, PDPage currentPage, float[] yRef, float neededSpace) {
        if (yRef[0] < MARGIN + neededSpace) {
            PDPage newPage = addNewPage(document);
            yRef[0] = newPage.getMediaBox().getHeight() - MARGIN;
            return newPage;
        }
        return currentPage;
    }

    private float writeTitle(PDDocument document, PDPage page, float y, String text) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            float fontSize = 16;
            float textWidth = FONT_BOLD.getStringWidth(text) / 1000 * fontSize;
            float pageWidth = page.getMediaBox().getWidth();
            float x = (pageWidth - textWidth) / 2;
            cs.beginText();
            cs.setFont(FONT_BOLD, fontSize);
            cs.newLineAtOffset(x, y);
            cs.showText(text);
            cs.endText();
        }
        return y - 22;
    }

    private float writeCenteredText(PDDocument document, PDPage page, float y, String text, PDType1Font font, float fontSize) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            float textWidth = font.getStringWidth(text) / 1000 * fontSize;
            float pageWidth = page.getMediaBox().getWidth();
            float x = (pageWidth - textWidth) / 2;
            cs.beginText();
            cs.setFont(font, fontSize);
            cs.newLineAtOffset(x, y);
            cs.showText(text);
            cs.endText();
        }
        return y - LINE_HEIGHT;
    }

    private float writeSectionHeader(PDDocument document, PDPage page, float y, String title) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            // Fondo gris claro para el encabezado de sección
            float pageWidth = page.getMediaBox().getWidth();
            cs.setNonStrokingColor(0.9f, 0.9f, 0.9f);
            cs.addRect(MARGIN, y - 4, pageWidth - 2 * MARGIN, LINE_HEIGHT + 2);
            cs.fill();

            cs.setNonStrokingColor(0, 0, 0);
            cs.beginText();
            cs.setFont(FONT_BOLD, 11);
            cs.newLineAtOffset(MARGIN + 5, y);
            cs.showText(title);
            cs.endText();
        }
        return y - LINE_HEIGHT - 6;
    }

    private float writeLabelValue(PDDocument document, PDPage page, float y, String label, String value) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            cs.beginText();
            cs.setFont(FONT_BOLD, 10);
            cs.newLineAtOffset(MARGIN + 5, y);
            cs.showText(label);

            float labelWidth = FONT_BOLD.getStringWidth(label) / 1000 * 10;
            cs.setFont(FONT_NORMAL, 10);
            cs.newLineAtOffset(labelWidth + 5, 0);
            cs.showText(value);
            cs.endText();
        }
        return y - LINE_HEIGHT;
    }

    private float writeText(PDDocument document, PDPage page, float y, String text, PDType1Font font, float fontSize) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            cs.beginText();
            cs.setFont(font, fontSize);
            cs.newLineAtOffset(MARGIN + 5, y);
            cs.showText(text);
            cs.endText();
        }
        return y - LINE_HEIGHT;
    }

    private float writeWrappedText(PDDocument document, PDPage page, float y, String text, PDType1Font font, float fontSize) throws IOException {
        if (text == null || text.isEmpty()) {
            return writeText(document, page, y, "-", FONT_ITALIC, fontSize);
        }

        float maxWidth = page.getMediaBox().getWidth() - 2 * MARGIN - 10;
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();

        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            cs.beginText();
            cs.setFont(font, fontSize);
            cs.newLineAtOffset(MARGIN + 5, y);

            for (String word : words) {
                String testLine = line.isEmpty() ? word : line + " " + word;
                float testWidth = font.getStringWidth(testLine) / 1000 * fontSize;

                if (testWidth > maxWidth && !line.isEmpty()) {
                    cs.showText(line.toString());
                    cs.newLineAtOffset(0, -LINE_HEIGHT);
                    y -= LINE_HEIGHT;
                    line = new StringBuilder(word);
                } else {
                    line = new StringBuilder(testLine);
                }
            }
            if (!line.isEmpty()) {
                cs.showText(line.toString());
                y -= LINE_HEIGHT;
            }
            cs.endText();
        }
        return y;
    }

    private float writeTableRow(PDDocument document, PDPage page, float y, String[] cells, PDType1Font font, float fontSize) throws IOException {
        float pageWidth = page.getMediaBox().getWidth();
        float tableWidth = pageWidth - 2 * MARGIN;
        int cols = cells.length;
        float colWidth = tableWidth / cols;

        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            // Línea horizontal debajo
            cs.setStrokingColor(0.7f, 0.7f, 0.7f);
            cs.moveTo(MARGIN, y - 4);
            cs.lineTo(MARGIN + tableWidth, y - 4);
            cs.stroke();

            cs.setNonStrokingColor(0, 0, 0);
            for (int i = 0; i < cols; i++) {
                String cellText = cells[i];
                // Truncar texto si es muy largo para la columna
                float maxCellWidth = colWidth - 6;
                while (font.getStringWidth(cellText) / 1000 * fontSize > maxCellWidth && cellText.length() > 3) {
                    cellText = cellText.substring(0, cellText.length() - 4) + "...";
                }
                cs.beginText();
                cs.setFont(font, fontSize);
                cs.newLineAtOffset(MARGIN + (i * colWidth) + 3, y);
                cs.showText(cellText);
                cs.endText();
            }
        }
        return y - LINE_HEIGHT - 2;
    }

    private float drawHorizontalLine(PDDocument document, PDPage page, float y) throws IOException {
        try (PDPageContentStream cs = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true)) {
            float pageWidth = page.getMediaBox().getWidth();
            cs.setStrokingColor(0.3f, 0.3f, 0.3f);
            cs.setLineWidth(0.5f);
            cs.moveTo(MARGIN, y);
            cs.lineTo(pageWidth - MARGIN, y);
            cs.stroke();
        }
        return y - 5;
    }

    private String safe(String value) {
        return value != null ? value : "-";
    }

    /**
     * Para exportar multiples PTS filtrados a formato Excel
     * @param fechaDesde Fecha de inicio del filtro
     * @param fechaHasta Fecha de fin del filtro
     * @param area FIltro area
     * @return byte[] representa el archivo Excel generado
     */
    public byte[] exportarPtsExcel(Date fechaDesde, Date fechaHasta, String area) {
        try {
            String fechaDesdeStr = fechaDesde != null ? fechaDesde.toString() : null;
            List<PermisoTrabajoSeguro> ptsList = ptsService.buscarPts(null, null, area, null, fechaDesdeStr);

            System.out.println("Generando Excel real con " + ptsList.size() + " registros");

            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("Reporte PTS");

                // === Estilos ===
                // Estilo de título
                CellStyle titleStyle = workbook.createCellStyle();
                Font titleFont = workbook.createFont();
                titleFont.setBold(true);
                titleFont.setFontHeightInPoints((short) 14);
                titleStyle.setFont(titleFont);
                titleStyle.setAlignment(HorizontalAlignment.CENTER);

                // Estilo de encabezado de columnas
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setFontHeightInPoints((short) 10);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerStyle.setFont(headerFont);
                headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                headerStyle.setBorderBottom(BorderStyle.THIN);
                headerStyle.setBorderTop(BorderStyle.THIN);
                headerStyle.setBorderLeft(BorderStyle.THIN);
                headerStyle.setBorderRight(BorderStyle.THIN);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);

                // Estilo de datos
                CellStyle dataStyle = workbook.createCellStyle();
                dataStyle.setBorderBottom(BorderStyle.THIN);
                dataStyle.setBorderTop(BorderStyle.THIN);
                dataStyle.setBorderLeft(BorderStyle.THIN);
                dataStyle.setBorderRight(BorderStyle.THIN);
                dataStyle.setWrapText(true);

                // Estilo de filtros
                CellStyle filterStyle = workbook.createCellStyle();
                Font filterFont = workbook.createFont();
                filterFont.setItalic(true);
                filterFont.setFontHeightInPoints((short) 9);
                filterStyle.setFont(filterFont);

                // === Título ===
                int rowNum = 0;
                Row titleRow = sheet.createRow(rowNum++);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("REPORTE DE PERMISOS DE TRABAJO SEGURO (PTS)");
                titleCell.setCellStyle(titleStyle);
                sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 10));

                // === Filtros aplicados ===
                rowNum++;
                Row filterRow = sheet.createRow(rowNum++);
                Cell filterCell = filterRow.createCell(0);
                String filtrosTexto = "Filtros: " +
                    (fechaDesde != null ? "Desde " + fechaDesde + " " : "") +
                    (fechaHasta != null ? "Hasta " + fechaHasta + " " : "") +
                    (area != null && !area.isEmpty() ? "Área: " + area : "");
                if (filtrosTexto.equals("Filtros: ")) filtrosTexto = "Filtros: Ninguno (todos los registros)";
                filterCell.setCellValue(filtrosTexto);
                filterCell.setCellStyle(filterStyle);
                sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 10));

                rowNum++;

                // === Encabezados ===
                String[] headers = {
                    "ID", "Área", "Equipo/Instalación", "Descripción",
                    "Solicitante", "Supervisor", "Fecha Inicio", "Fecha Fin",
                    "Ubicación", "Estado", "Firmado Por"
                };

                Row headerRow = sheet.createRow(rowNum++);
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                // === Datos ===
                for (PermisoTrabajoSeguro pts : ptsList) {
                    Row dataRow = sheet.createRow(rowNum++);
                    int col = 0;

                    createDataCell(dataRow, col++, safe(pts.getId()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getArea()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getEquipoOInstalacion()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getDescripcionTrabajo()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getSolicitanteLegajo()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getSupervisorLegajo()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getFechaInicio()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getFechaFin()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getUbicacion()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getRtoEstado()), dataStyle);
                    createDataCell(dataRow, col++, safe(pts.getDniSupervisorFirmante()), dataStyle);
                }

                // Auto-ajustar ancho de columnas
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                    // Mínimo 12 caracteres de ancho
                    if (sheet.getColumnWidth(i) < 3500) {
                        sheet.setColumnWidth(i, 3500);
                    }
                }

                workbook.write(baos);
                byte[] excelBytes = baos.toByteArray();
                System.out.println("Excel generado exitosamente. Tamaño: " + excelBytes.length + " bytes");
                return excelBytes;
            }

        } catch (Exception e) {
            System.err.println("Error al generar Excel con filtros: " + e.getMessage());
            throw new RuntimeException("Error en la generación del Excel: " + e.getMessage());
        }
    }

    private void createDataCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }
}