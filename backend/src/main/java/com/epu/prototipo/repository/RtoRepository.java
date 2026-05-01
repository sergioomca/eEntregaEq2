package com.epu.prototipo.repository;

import com.epu.prototipo.entity.RtoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RtoRepository extends JpaRepository<RtoEntity, String> {

    Optional<RtoEntity> findByEquipoTagAndEstado(String equipoTag, String estado);

    List<RtoEntity> findByEstado(String estado);
}
