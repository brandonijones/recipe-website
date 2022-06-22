package com.example.springbootbackend.verification;

public class ResendResponse {

    private boolean error;
    private String message;
    private String email;

    public ResendResponse() { }

    public ResendResponse(boolean error, String message, String email) {
        this.error = error;
        this.message = message;
        this.email = email;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
