package com.spotologist.features.user.service;

import com.spotologist.authentication.model.GoogleUser;
import com.spotologist.features.user.model.User;
import com.spotologist.features.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void upsert(GoogleUser googleUser) {
        User user = userRepository.findById(googleUser.subject())
                .map(existing -> {
                    existing.setEmail(googleUser.email());
                    existing.setName(googleUser.name());
                    existing.setLastLogin(Instant.now());
                    return existing;
                })
                .orElseGet(() -> new User(googleUser.subject(), googleUser.email(), googleUser.name(), Instant.now(), Instant.now()));
        userRepository.save(user);
    }
}
