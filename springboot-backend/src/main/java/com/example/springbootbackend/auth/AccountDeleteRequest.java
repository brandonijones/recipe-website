package com.example.springbootbackend.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AccountDeleteRequest {

//    @JsonProperty("data")
//    AccountInfo data;

    private int id;
    private String password;

    public AccountDeleteRequest() { }

//    public AccountDeleteRequest(AccountInfo data) {
//        this.data = data;
//    }
//
//    public AccountInfo getData() {
//        return data;
//    }
//
//    public void setData(AccountInfo data) {
//        this.data = data;
//    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
