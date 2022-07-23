package com.example.springbootbackend.auth;

public class ChangePasswordRequest {

    private String verificationCode;
    private int userId;
    private String newPassword;
    private String oldPassword;

    public ChangePasswordRequest() { }

    public ChangePasswordRequest(String verificationCode, int userId, String newPassword) {
        this.verificationCode = verificationCode;
        this.userId = userId;
        this.newPassword = newPassword;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }
}
