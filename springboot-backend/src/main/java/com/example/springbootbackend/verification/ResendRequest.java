package com.example.springbootbackend.verification;

public class ResendRequest {

    private String email;

    public ResendRequest() { }

    public ResendRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
