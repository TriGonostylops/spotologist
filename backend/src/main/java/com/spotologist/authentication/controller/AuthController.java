package com.spotologist.authentication.controller;

import com.spotologist.authentication.model.IdTokenRequest;
import com.spotologist.authentication.model.IssuedNonce;
import com.spotologist.authentication.model.TokenResponse;
import com.spotologist.authentication.service.AuthService;
import com.spotologist.authentication.service.NonceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final NonceService nonceService;
    private final AuthService authService;
    public AuthController(NonceService nonceService, AuthService authService) {
        this.nonceService = nonceService;
        this.authService = authService;
    }

    @GetMapping("/nonce")
    public ResponseEntity<IssuedNonce> nonce() {
        return ResponseEntity.ok(nonceService.issue());
    }

    @PostMapping("/google")
    public ResponseEntity<TokenResponse> google(@RequestBody IdTokenRequest req) {
        return authService.getAndMapGoogleToken(req);
    }
}