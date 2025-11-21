package com.spotologist.features.spot.repository;

import com.spotologist.features.spot.model.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}
