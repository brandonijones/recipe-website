package com.example.springbootbackend.auth;

import com.example.springbootbackend.model.Account;
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

    public AccountInfo getUser() {
        return user;
    }

    // Setting uer information based on jwt subject
    // Needed for the authState hook on the frontend
    public void setUser(String[] subject) {
        user.setId(Integer.parseInt(subject[0]));
        user.setUsername(subject[1]);
        user.setName(subject[2]);
        user.setRole(subject[3]);
    }

    // Setting user information to use for editing account settings
    public void setUser(Account account) {
        user.setId(account.getId());
        user.setUsername(account.getUsername());
        user.setName(account.getName());
        user.setRole(account.getRole());
        user.setEmail(account.getEmail());
        user.setBio(account.getBio());
        user.setProfilePicture(account.getProfilePicture());
        user.setCreatedAt(account.getCreatedAt());
    }
}
