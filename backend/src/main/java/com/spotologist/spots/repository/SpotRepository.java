package com.spotologist.spots.repository;

import com.spotologist.spots.model.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpotRepository extends JpaRepository<Spot, Long> {
    List<Spot> findByUserId(Long userId);
}
