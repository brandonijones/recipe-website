package com.example.springbootbackend.verification;

public class VerifyResponse {

    private boolean error;
    private String message;

    public VerifyResponse() { }

    public VerifyResponse(boolean error, String message) {
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
