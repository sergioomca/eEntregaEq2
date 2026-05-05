package com.epu.prototipo.service;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.entity.EntityMapper;
import com.epu.prototipo.entity.UsuarioEntity;
import com.epu.prototipo.repository.UsuarioRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Profile("prod")
public class MysqlUsuarioService implements IUsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    private String toPersistenceRole(String role) {
        if (role == null || role.isBlank()) {
            return role;
        }
        String normalized = role.replace(' ', '_');
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }

    private boolean isDelegatingFormat(String password) {
        return password != null && password.startsWith("{") && password.contains("}");
    }

    private String ensureEncodedPassword(String password) {
        if (password == null || password.isEmpty() || isDelegatingFormat(password)) {
            return password;
        }
        return passwordEncoder.encode(password);
    }

    public MysqlUsuarioService(UsuarioRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UsuarioDTO getUsuarioByLegajo(String legajo) {
        UsuarioEntity entity = repo.findById(legajo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return EntityMapper.toDTO(entity);
    }

    @Override
    public List<UsuarioDTO> getAllUsuarios() {
        return repo.findAll().stream()
                .map(EntityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRol(String rol) {
        return repo.findByRolesContaining(toPersistenceRole(rol)).stream()
                .map(EntityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existeUsuario(String legajo) {
        return repo.existsById(legajo);
    }

    @Override
    public UsuarioDTO createUsuario(UsuarioDTO usuario) {
        if (repo.existsById(usuario.getLegajo())) {
            throw new RuntimeException("Ya existe un usuario con legajo: " + usuario.getLegajo());
        }
        if (usuario.getPassword() == null || usuario.getPassword().isEmpty()) {
            usuario.setPassword(usuario.getLegajo());
        }
        usuario.setPassword(ensureEncodedPassword(usuario.getPassword()));
        usuario.setMustChangePassword(true);
        UsuarioEntity saved = repo.save(EntityMapper.toEntity(usuario));
        return EntityMapper.toDTO(saved);
    }

    @Override
    public UsuarioDTO updateUsuario(String legajo, UsuarioDTO usuario) {
        UsuarioEntity existing = repo.findById(legajo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setLegajo(legajo);
        if (usuario.getPassword() == null || usuario.getPassword().isEmpty()) {
            usuario.setPassword(existing.getPassword());
        }
        usuario.setPassword(ensureEncodedPassword(usuario.getPassword()));
        if (usuario.getHuellaDigital() == null && existing.getHuellaDigital() != null) {
            usuario.setHuellaDigital(existing.getHuellaDigital());
        }
        UsuarioEntity saved = repo.save(EntityMapper.toEntity(usuario));
        return EntityMapper.toDTO(saved);
    }

    @Override
    public void deleteUsuario(String legajo) {
        if (!repo.existsById(legajo)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        repo.deleteById(legajo);
    }
}
