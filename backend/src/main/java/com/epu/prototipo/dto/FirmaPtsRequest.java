package com.epu.prototipo.dto;

/**
 * DTO para manejar la solicitud de firma de un Permiso de Trabajo Seguro (PTS).
 */
public class FirmaPtsRequest {

    private String ptsId; // ID del documento a firmar en Firestore
    private String dniFirmante; // DNI del supervisor que está firmando
    private String firmaBase64; // La imagen de la firma como string Base64

    // CONSTRUCTOR VACÍO Y GETTERS/SETTERS: Necesarios para el binding de JSON en Spring Boot.

    public FirmaPtsRequest() {}

    public String getPtsId() {
        return ptsId;
    }

    public void setPtsId(String ptsId) {
        this.ptsId = ptsId;
    }

    public String getDniFirmante() {
        return dniFirmante;
    }

    public void setDniFirmante(String dniFirmante) {
        this.dniFirmante = dniFirmante;
    }

    public String getFirmaBase64() {
        return firmaBase64;
    }

    public void setFirmaBase64(String firmaBase64) {
        this.firmaBase64 = firmaBase64;
    }
}