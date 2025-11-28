package com.spotologist.features.user.service;

import com.spotologist.authentication.model.AuthIdentity;
import com.spotologist.authentication.model.GoogleUser;
import com.spotologist.authentication.repository.AuthIdentityRepository;
import com.spotologist.features.user.mapper.UserMapper;
import com.spotologist.features.user.model.User;
import com.spotologist.features.user.model.UserDto;
import com.spotologist.features.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AuthIdentityRepository authIdentityRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, AuthIdentityRepository authIdentityRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.authIdentityRepository = authIdentityRepository;
        this.userMapper = userMapper;
    }

    @Transactional
    public User upsertFromGoogle(GoogleUser user) {
        Instant now = Instant.now();
        String GOOGLE_PROVIDER = "GOOGLE";
        return authIdentityRepository.findByProviderAndSubject(GOOGLE_PROVIDER, user.subject()).map(AuthIdentity::getUser).map(u -> {
            u.setLastLogin(now);
            return userRepository.save(u);
        }).orElseGet(() -> {
            User u = new User();
            u.setLastLogin(now);
            u.setEmail(user.email());
            u.setCreatedAt(now);
            userRepository.save(u);

            AuthIdentity ai = new AuthIdentity();
            ai.setProvider(GOOGLE_PROVIDER);
            ai.setSubject(user.subject());
            ai.setUser(u);
            authIdentityRepository.save(ai);
            return u;
        });
    }

    public UserDto getUserNameById(String subject) {
        User user = userRepository.findEmailById(UUID.fromString(subject));
        return userMapper.toDto(user);
    }
}
