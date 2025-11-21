package com.spotologist.authentication.model;

public record TokenResponse(String accessToken, long expiresIn) {}

