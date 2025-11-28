package com.spotologist.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/auth/nonce").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/google").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/spots", "/api/spots/*", "/api/spots/hello").permitAll()

                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(request -> {
                            String method = request.getMethod();
                            String path = request.getRequestURI();
                            boolean isPublic =
                                    ("GET".equals(method) && ("/api/spots/hello".equals(path)
                                            || "/api/spots".equals(path)
                                            || path.startsWith("/api/spots/")))
                                            || ("GET".equals(method) && "/api/auth/nonce".equals(path))
                                            || ("POST".equals(method) && "/api/auth/google".equals(path))
                                            || ("OPTIONS".equals(method));
                            if (isPublic) {
                                return null;
                            }
                            DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
                            return resolver.resolve(request);
                        })
                        .jwt(Customizer.withDefaults())
                )
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        String secret = System.getenv().getOrDefault("JWT_HS256_SECRET", "BqabkJAeVi05MyT8+ByDIGEFzW8pC9+XT7eu58G4abXqt7yyygjE64OBy9SqGZPo\n" + "4GAF2L+/5WUL2/YuTC677Q==");
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    @Bean
    JwtEncoder jwtEncoder() {
        String secret = System.getenv().getOrDefault("JWT_HS256_SECRET", "BqabkJAeVi05MyT8+ByDIGEFzW8pC9+XT7eu58G4abXqt7yyygjE64OBy9SqGZPo\n" + "4GAF2L+/5WUL2/YuTC677Q==");
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        ImmutableSecret<SecurityContext> immutableSecret = new ImmutableSecret<>(key);
        return new NimbusJwtEncoder(immutableSecret);
    }
}
