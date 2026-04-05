package com.epu.prototipo.service;

import com.epu.prototipo.model.RetornoOperaciones;

import java.util.List;

public interface IRtoService {

    RetornoOperaciones createRto(RetornoOperaciones rto);

    RetornoOperaciones getRtoById(String id);

    List<RetornoOperaciones> getAllRtos();

    RetornoOperaciones getRtoByEquipoTag(String equipoTag);

    RetornoOperaciones agregarPtsAlRto(String rtoId, String ptsId);

    RetornoOperaciones cerrarEspecialidad(String rtoId, String especialidadNombre, String responsableLegajo, String observaciones);

    List<RetornoOperaciones> getRtosAbiertos();
}
