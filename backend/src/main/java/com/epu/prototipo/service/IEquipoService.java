package com.epu.prototipo.service;

import com.epu.prototipo.model.Equipo;

import java.util.List;

public interface IEquipoService {

    Equipo getEquipoByTag(String tag);

    List<Equipo> getAllEquipos();

    Equipo actualizarEstadoEquipo(String tag, String nuevoEstadoDcs);

    Equipo actualizarCondicionEquipo(String tag, String nuevaCondicion);

    Equipo createEquipo(Equipo equipo);

    Equipo updateEquipo(String tag, Equipo equipo);

    void deleteEquipo(String tag);
}
