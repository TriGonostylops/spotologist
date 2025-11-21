package com.spotologist.authentication.repository;

import com.spotologist.authentication.model.AuthIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, UUID> {
    Optional<AuthIdentity> findByProviderAndSubject(String provider, String subject);
}
