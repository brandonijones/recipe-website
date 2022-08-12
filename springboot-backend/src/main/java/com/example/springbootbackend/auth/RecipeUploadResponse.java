package com.example.springbootbackend.auth;

public class RecipeUploadResponse {

    private String message;
    private boolean error;

    public RecipeUploadResponse() { }

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
}
