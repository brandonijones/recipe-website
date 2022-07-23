package com.example.springbootbackend.auth;

public class ChangeEmailRequest {

    private String email;
    private String newEmail;

    // Default constructor
    public ChangeEmailRequest() { }

    public String getEmail() {
        return email;
    }

    public String getNewEmail() {
        return newEmail;
    }
}
