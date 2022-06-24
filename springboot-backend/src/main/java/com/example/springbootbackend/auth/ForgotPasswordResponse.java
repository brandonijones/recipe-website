package com.example.springbootbackend.auth;

public class ForgotPasswordResponse {

    private boolean error;
    private String message;
    private String email;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(boolean error, String message, String email) {
        this.error = error;
        this.message = message;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
