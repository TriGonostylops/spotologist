package com.spotologist.common;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.spotologist.authentication.GoogleUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
public class GoogleTokenVerifier {
    private final String clientId;
    private final JWKSource<SecurityContext> jwkSource;

    public GoogleTokenVerifier(JWKSource<SecurityContext> jwkSource,
                               @Value("${GOOGLE_CLIENT_ID:}") String clientId) {
        this.jwkSource = jwkSource;
        this.clientId = clientId;
    }

    public GoogleUser verify(String idToken) {
        try {
            SignedJWT jwt = SignedJWT.parse(idToken);

            JWSAlgorithm expectedJwsAlg = JWSAlgorithm.RS256;
            JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(expectedJwsAlg, jwkSource);
            ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
            jwtProcessor.setJWSKeySelector(keySelector);
            SecurityContext ctx = null;
            JWTClaimsSet claims = jwtProcessor.process(jwt, ctx);

            if (!"accounts.google.com".equals(claims.getIssuer()) && !"https://accounts.google.com".equals(claims.getIssuer())) {
                throw new BadCredentialsException("Invalid issuer");
            }
            if (clientId != null && !clientId.isBlank() && !claims.getAudience().contains(clientId)) {
                throw new BadCredentialsException("Invalid audience");
            }
            Date exp = claims.getExpirationTime();
            if (exp == null || exp.toInstant().isBefore(Instant.now())) {
                throw new BadCredentialsException("Token expired");
            }

            String subject = claims.getSubject();
            String email = claims.getStringClaim("email");
            String name = (String) claims.getClaim("name");
            return new GoogleUser(subject, email, name);
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid Google ID token", e);
        }
    }
}