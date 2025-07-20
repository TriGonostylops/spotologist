package com.spotologist.backend.controller;

import com.spotologist.backend.model.Spot;
import com.spotologist.backend.repository.SpotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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

    @GetMapping("/user/{userId}")
    public List<Spot> getSpotsByUserId(@PathVariable Long userId) {
        return spotRepository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Spot> getSpotById(@PathVariable Long id) {
        Optional<Spot> spot = spotRepository.findById(id);
        return spot.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Spot> updateSpot(@PathVariable Long id, @RequestBody Spot updatedSpot) {
        return spotRepository.findById(id).map(spot -> {
            spot.setTitle(updatedSpot.getTitle());
            spot.setDescription(updatedSpot.getDescription());
            spot.setLatitude(updatedSpot.getLatitude());
            spot.setLongitude(updatedSpot.getLongitude());
            spot.setCity(updatedSpot.getCity());
            spot.setCountry(updatedSpot.getCountry());
            spot.setAddress(updatedSpot.getAddress());
            spot.setPublic(updatedSpot.isPublic());
            spot.setUserId(updatedSpot.getUserId());
            // updatedAt will be set automatically if you have @PreUpdate
            Spot savedSpot = spotRepository.save(spot);
            return ResponseEntity.ok(savedSpot);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpot(@PathVariable Long id) {
        if (spotRepository.existsById(id)) {
            spotRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
