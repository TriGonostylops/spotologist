package com.spotologist.features.spots.repository;

import com.spotologist.features.spots.model.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}
