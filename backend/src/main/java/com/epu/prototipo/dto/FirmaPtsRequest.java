package com.epu.prototipo.dto;

// DTO manejar molicitud de firma de un PTS.
public class FirmaPtsRequest {

    private String ptsId; // ID del documento a firmar en Firestore
    private String dniFirmante; // !!! revisar - DNI del supervisor que esta firmando
    private String firmaBase64; // La imagen de la firma como string Base64

    // Constructor vacio y Getters/setters para el binding de JSON en Spring Boot.

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