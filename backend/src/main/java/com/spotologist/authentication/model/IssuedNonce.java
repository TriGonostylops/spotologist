package com.spotologist.authentication.model;

/**
 * Immutable value object returned when the server issues a nonce.
 */
public record IssuedNonce(String nonce, long expiresIn) {}
