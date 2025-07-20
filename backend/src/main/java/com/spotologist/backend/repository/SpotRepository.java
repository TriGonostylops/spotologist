package com.spotologist.backend.repository;

import com.spotologist.backend.model.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpotRepository extends JpaRepository<Spot, Long> {
    List<Spot> findByUserId(Long userId);
}
