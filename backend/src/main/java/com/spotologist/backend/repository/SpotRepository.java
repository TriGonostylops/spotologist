package com.spotologist.backend.repository;

import com.spotologist.backend.model.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}
