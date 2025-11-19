package com.spotologist.authentication;

import com.spotologist.authentication.model.IssuedNonce;
import com.spotologist.common.GoogleTokenVerifier;
import com.spotologist.authentication.model.GoogleUser;
import com.spotologist.features.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtEncoder jwtEncoder;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserService userService;
    private final NonceService nonceService;

    public AuthController(JwtEncoder jwtEncoder, GoogleTokenVerifier googleTokenVerifier, UserService userService, NonceService nonceService) {
        this.jwtEncoder = jwtEncoder;
        this.googleTokenVerifier = googleTokenVerifier;
        this.userService = userService;
        this.nonceService = nonceService;
    }

    @GetMapping("/nonce")
    public ResponseEntity<IssuedNonce> nonce() {
        return ResponseEntity.ok(nonceService.issue());
        
    }

    @PostMapping("/google")
    public ResponseEntity<TokenResponse> google(@RequestBody IdTokenRequest req) {
        if (req.nonce() == null || !nonceService.consume(req.nonce())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        GoogleUser user = googleTokenVerifier.verify(req.idToken(), req.nonce());

        userService.upsert(user);

        Instant now = Instant.now();
        long expirySeconds = 3600; // 1 hour
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("spotologist-backend")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expirySeconds))
                .subject(user.subject())
                .claim("email", user.email())
                .claim("name", user.name())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return ResponseEntity.ok(new TokenResponse(token, expirySeconds));
    }

    public record IdTokenRequest(String idToken, String nonce) {}
    public record TokenResponse(String accessToken, long expiresIn) {}
}