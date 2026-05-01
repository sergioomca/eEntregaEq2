package com.epu.prototipo.repository;

import com.epu.prototipo.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, String> {

    List<UsuarioEntity> findByRolesContaining(String rol);
}
