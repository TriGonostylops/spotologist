package com.spotologist.authentication.model;

public record IssuedNonce(String nonce, long expiresIn) {}
