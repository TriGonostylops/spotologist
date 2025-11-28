package com.spotologist.authentication.service;

import com.spotologist.authentication.model.GoogleUser;
import com.spotologist.authentication.model.IdTokenRequest;
import com.spotologist.authentication.model.TokenResponse;
import com.spotologist.common.GoogleTokenVerifier;
import com.spotologist.features.user.model.User;
import com.spotologist.features.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {
    private final JwtEncoder jwtEncoder;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserService userService;
    private final NonceService nonceService;

    public AuthService(JwtEncoder jwtEncoder, GoogleTokenVerifier googleTokenVerifier, UserService userService, NonceService nonceService) {
        this.jwtEncoder = jwtEncoder;
        this.googleTokenVerifier = googleTokenVerifier;
        this.userService = userService;
        this.nonceService = nonceService;
    }

    public ResponseEntity<TokenResponse> getAndMapGoogleToken(IdTokenRequest req) {
        if (req.nonce() == null || !nonceService.exists(req.nonce())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        GoogleUser googleUser;
        try {
            googleUser = googleTokenVerifier.verify(req.idToken(), req.nonce());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!nonceService.consume(req.nonce())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.upsertFromGoogle(googleUser);

        Instant now = Instant.now();
        long expirySeconds = 3600; // 1 hour
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("spotologist-backend").issuedAt(now).expiresAt(now.plusSeconds(expirySeconds)).subject(user.getId().toString()).build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return ResponseEntity.ok(new TokenResponse(token, expirySeconds, user.getId().toString()));
    }
}
