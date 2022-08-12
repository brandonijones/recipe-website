package com.example.springbootbackend.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AccountDeleteRequest {

    private Long id;
    private String password;

    public AccountDeleteRequest() { }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
