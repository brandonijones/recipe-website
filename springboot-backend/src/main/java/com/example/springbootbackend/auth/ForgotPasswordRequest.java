package com.example.springbootbackend.auth;

public class ForgotPasswordRequest {

    private String email;

    public ForgotPasswordRequest() { }

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
