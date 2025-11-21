package com.spotologist.features.spot.service;

import com.spotologist.features.spot.model.Spot;
import com.spotologist.features.spot.repository.SpotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SpotService {
    private final SpotRepository spotRepository;

    public SpotService(SpotRepository spotRepository) {
        this.spotRepository = spotRepository;
    }

    public Spot saveSpot(Spot spot) {
        return spotRepository.save(spot);
    }

    public List<Spot> getAllSpots() {
        return spotRepository.findAll();
    }

    public Optional<Spot> findSpotById(Long id) {
        return spotRepository.findById(id);
    }

    public Optional<Spot> updateSpotById(Long id, Spot updatedSpotDto) {
        return spotRepository.findById(id).map(spot -> {
            spot.setTitle(updatedSpotDto.getTitle());
            spot.setDescription(updatedSpotDto.getDescription());
            spot.setLatitude(updatedSpotDto.getLatitude());
            spot.setLongitude(updatedSpotDto.getLongitude());
            spot.setCity(updatedSpotDto.getCity());
            spot.setCountry(updatedSpotDto.getCountry());
            spot.setAddress(updatedSpotDto.getAddress());
            spot.setPublic(updatedSpotDto.isPublic());
            return spotRepository.save(spot);
        });
    }
}
