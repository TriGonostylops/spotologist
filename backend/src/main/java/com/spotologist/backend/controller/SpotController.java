package com.spotologist.backend.controller;

import com.spotologist.backend.model.Spot;
import com.spotologist.backend.repository.SpotRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spots")
public class SpotController {

    private final SpotRepository spotRepository;

    public SpotController(SpotRepository spotRepository) {
        this.spotRepository = spotRepository;
    }

    @PostMapping
    public Spot createSpot(@RequestBody Spot spot) {
        return spotRepository.save(spot);
    }

    @GetMapping
    public List<Spot> getAllSpots() {
        return spotRepository.findAll();
    }
}
