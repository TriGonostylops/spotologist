package com.spotologist.authentication;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.spotologist.authentication.model.IssuedNonce;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

@Service
public class NonceService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder b64url = Base64.getUrlEncoder().withoutPadding();
    private final Duration ttl;

    private final Cache<String, Boolean> nonceCache;

    public NonceService(@Value("${security.nonce.ttl-seconds:120}") long ttlSeconds) {
        this.ttl = Duration.ofSeconds(ttlSeconds);

        this.nonceCache = Caffeine.newBuilder()
                .expireAfterWrite(this.ttl)
                .build();
    }

    public IssuedNonce issue() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String nonce = b64url.encodeToString(bytes);

        nonceCache.put(nonce, true);

        return new IssuedNonce(nonce, ttl.getSeconds());
    }

    public boolean consume(String nonce) {
        if (nonce == null || nonce.isBlank()) return false;

        return nonceCache.asMap().remove(nonce) != null;
    }
}