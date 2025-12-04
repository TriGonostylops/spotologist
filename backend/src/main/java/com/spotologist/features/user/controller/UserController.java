package com.spotologist.features.user.controller;

import com.spotologist.features.user.model.UserDto;
import com.spotologist.features.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/me")
    public ResponseEntity<UserDto> getUserDetails(@AuthenticationPrincipal Jwt jwt){
        return ResponseEntity.ok().body(userService.getUserNameById(jwt.getSubject()));
    }

    public record UsernameUpdateRequest(String userName) {}

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/username/check")
    public ResponseEntity<Void> checkAvailability(@RequestParam("name") String name) {
        boolean available = userService.isUsernameAvailable(name);
        return available ? ResponseEntity.ok().build() : ResponseEntity.status(409).build();
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PutMapping("/username")
    public ResponseEntity<Void> setUsername(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody UsernameUpdateRequest body) {
        userService.setUsernameFor(jwt.getSubject(), body.userName());
        return ResponseEntity.noContent().build();
    }
}
