package com.example.springbootbackend.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {

    private String accessToken;
    private boolean error;
    private String message;

    @JsonProperty("user")
    private AccountInfo user;

    public AuthResponse() {
        this.user = new AccountInfo();
    }

    public AuthResponse(String accessToken, boolean error) {
        this.accessToken = accessToken;
        this.error = error;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setUser(String[] subject) {
        user.setId(Integer.parseInt(subject[0]));
        user.setUsername(subject[1]);
        user.setFirstName(subject[2]);
        user.setLastName(subject[3]);
        user.setRole(subject[4]);
    }
}
