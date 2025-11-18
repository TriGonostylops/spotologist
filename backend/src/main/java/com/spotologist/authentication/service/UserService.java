package com.spotologist.authentication.service;

import com.spotologist.authentication.model.GoogleUser;
import com.spotologist.user.model.User;
import com.spotologist.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void upsert(GoogleUser googleUser) {
        User user = userRepository.findById(googleUser.sub())
                .map(existing -> {
                    existing.setEmail(googleUser.email());
                    existing.setName(googleUser.name());
                    existing.setLastLogin(Instant.now());
                    return existing;
                })
                .orElseGet(() -> new User(googleUser.sub(), googleUser.email(), googleUser.name(), Instant.now(), Instant.now()));
        userRepository.save(user);
    }
}
