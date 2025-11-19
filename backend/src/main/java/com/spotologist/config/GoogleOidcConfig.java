package com.spotologist.config;

import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;
import java.net.URL;

@Configuration
public class GoogleOidcConfig {

    @Bean
    public JWKSource<SecurityContext> googleJwkSource(
            @Value("${google.oidc.jwks-uri:https://www.googleapis.com/oauth2/v3/certs}") String jwksUriString,
            @Value("${google.oidc.connect-timeout-ms:2000}") int connectTimeoutMs,
            @Value("${google.oidc.read-timeout-ms:2000}") int readTimeoutMs
    ) throws Exception {
        URI jwksUri = URI.create(jwksUriString);
        URL jwksUrl = jwksUri.toURL();
        DefaultResourceRetriever resourceRetriever = new DefaultResourceRetriever(connectTimeoutMs, readTimeoutMs);
        return new RemoteJWKSet<>(jwksUrl, resourceRetriever);
    }
}
