package com.spotologist.features.user.controller;

import com.spotologist.features.user.model.UserDto;
import com.spotologist.features.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/name")
    public ResponseEntity<UserDto> getUserNameById(@AuthenticationPrincipal Jwt jwt){
        return ResponseEntity.ok().body(userService.getUserNameById(jwt.getSubject()));
    }
}
