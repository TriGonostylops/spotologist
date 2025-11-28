package com.spotologist.features.spot.service;

import com.spotologist.features.spot.repository.SpotRepository;
import org.springframework.stereotype.Service;

@Service
public class SpotService {
    private final SpotRepository spotRepository;

    public SpotService(SpotRepository spotRepository) {
        this.spotRepository = spotRepository;
    }
}
