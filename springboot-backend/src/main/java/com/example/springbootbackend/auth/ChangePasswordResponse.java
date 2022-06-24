package com.example.springbootbackend.auth;

public class ChangePasswordResponse {

    private boolean error;
    private String message;

    public ChangePasswordResponse() { }

    public ChangePasswordResponse(boolean error, String message) {
        this.error = error;
        this.message = message;
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
}
