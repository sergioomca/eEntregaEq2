package com.epu.prototipo.repository;

import com.epu.prototipo.entity.PtsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PtsRepository extends JpaRepository<PtsEntity, String> {

    List<PtsEntity> findByFechaInicio(String fechaInicio);
}
