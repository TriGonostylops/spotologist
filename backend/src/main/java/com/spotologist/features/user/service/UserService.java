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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.UUID;
import java.util.Set;
import java.util.regex.Pattern;

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

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_.]{3,30}$");
    private static final Set<String> RESERVED = Set.of(
            "admin", "administrator", "root", "support", "help", "api", "system",
            "me", "settings", "profile", "user", "users"
    );

    public void assertValidUsername(String name) {
        if (name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userName is required");
        }
        if (!USERNAME_PATTERN.matcher(name).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid username format");
        }
        if (RESERVED.contains(name.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This username is reserved");
        }
    }

    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String name) {
        assertValidUsername(name);
        return !userRepository.existsByUserNameIgnoreCase(name);
    }

    @Transactional
    public void setUsernameFor(String subject, String desired) {
        assertValidUsername(desired);
        UUID id = UUID.fromString(subject);
        User user = userRepository.findUserById(id);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        if (user.getUserName() != null && !user.getUserName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "USERNAME_ALREADY_SET");
        }

        if (userRepository.existsByUserNameIgnoreCase(desired)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "USERNAME_TAKEN");
        }

        user.setUserName(desired);
        userRepository.save(user);
    }
}
