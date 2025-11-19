package com.spotologist.authentication.model;

/**
 * Public representation of a verified Google user extracted from an ID token.
 */
public record GoogleUser(String sub, String email, String name) { }
