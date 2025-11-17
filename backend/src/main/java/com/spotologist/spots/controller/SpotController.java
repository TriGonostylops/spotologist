package com.spotologist.spots.controller;

import com.spotologist.spots.model.Spot;
import com.spotologist.spots.service.SpotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/spots")
public class SpotController {

    private final SpotService spotService;

    public SpotController(SpotService spotService) {
        this.spotService = spotService;
    }

    @PostMapping
    public ResponseEntity<Void> createSpot(@RequestBody Spot spot) {
        try {
            spotService.saveSpot(spot);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Spot> getAllSpots() {
        return spotService.getAllSpots();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Spot> getSpotById(@PathVariable Long id) {
        Optional<Spot> spot = spotService.findSpotById(id);
        return spot.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Spot> updateSpot(@PathVariable Long id, @RequestBody Spot updatedSpot) {
        if(spotService.updateSpotById(id, updatedSpot).isPresent()) {
            return ResponseEntity.ok(updatedSpot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping(value = "/hello", produces = "text/plain")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello from Spotologist backend!");
    }
}
