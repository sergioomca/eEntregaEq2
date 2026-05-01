package com.epu.prototipo.repository;

import com.epu.prototipo.entity.EquipoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipoRepository extends JpaRepository<EquipoEntity, String> {
}
