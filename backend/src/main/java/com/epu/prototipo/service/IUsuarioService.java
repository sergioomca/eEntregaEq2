package com.epu.prototipo.service;

import com.epu.prototipo.dto.UsuarioDTO;

import java.util.List;

public interface IUsuarioService {

    UsuarioDTO getUsuarioByLegajo(String legajo);

    List<UsuarioDTO> getAllUsuarios();

    List<UsuarioDTO> getUsuariosByRol(String rol);

    boolean existeUsuario(String legajo);

    UsuarioDTO createUsuario(UsuarioDTO usuario);

    UsuarioDTO updateUsuario(String legajo, UsuarioDTO usuario);

    void deleteUsuario(String legajo);
}
