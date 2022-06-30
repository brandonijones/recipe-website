package com.example.springbootbackend.service;

import com.example.springbootbackend.auth.*;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.ForgotPasswordToken;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.repository.ForgotPasswordTokenRepository;
import com.example.springbootbackend.verification.VerifyResponse;
import net.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

@Service
public class AccountServices {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ForgotPasswordTokenRepository passwordTokenRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private JavaMailSender mailSender;

    private AccountInfo accountInfo;

    public AuthResponse login(AuthRequest request) {
        Account account;
        AuthResponse response = new AuthResponse();

        String enteredUsernameOrEmail = request.getUser();
        String enteredPassword = request.getPassword();
        Account usernameCheck = accountRepository.findByUsername(enteredUsernameOrEmail);
        Account emailCheck = accountRepository.findByEmail(enteredUsernameOrEmail);

        // Neither username nor email was found
        if (usernameCheck == null && emailCheck == null) {
            response.setError(true);
            response.setAccessToken(null);
            response.setMessage("Username or email is incorrect.");
            return response;
        }

        boolean matches;

        // Username was entered
        if (usernameCheck != null) {
            account = accountRepository.findByUsername(enteredUsernameOrEmail);
            matches = bCryptPasswordEncoder.matches(enteredPassword, account.getPassword());
            return authenticate(response, account, matches);
        }

        // If username was null then it's assumed that the email was attempted
        account = accountRepository.findByEmail(enteredUsernameOrEmail);
        matches = bCryptPasswordEncoder.matches(enteredPassword, account.getPassword());
        return authenticate(response, account, matches);
    }

    private AuthResponse authenticate(AuthResponse response, Account account, boolean matches) {

        if (matches) {
            // Password is correct but account is not enabled yet.
            if (!account.isEnabled()) {
                response.setAccessToken(null);
                response.setError(true);
                response.setMessage("Your account still needs to be activated. Please check your email to activate your account.");
                return response;
            }

            // Password is correct and account is enabled.
            // Generating JWT with the subject as the needed account details
            String accessToken = jwtTokenUtil.generateAccessToken(account);
            String[] subject = jwtTokenUtil.getSubject(accessToken).split(", ");

            response.setAccessToken(accessToken);
            response.setUser(subject);

            response.setError(false);
            response.setMessage("Login successful.");

            return response;
        }

        // User entered the incorrect password
        response.setAccessToken(null);
        response.setError(true);
        response.setMessage("Password is incorrect.");
        return response;
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        ForgotPasswordResponse response = new ForgotPasswordResponse();
        Account account = accountRepository.findByEmail(request.getEmail());


        // Account was not found with the given email
        if (account == null) {
            response.setError(true);
            response.setMessage("Email cannot be found in our records.");
            response.setEmail(request.getEmail());
            return response;
        }

        // Account has not been activated yet
        if (!account.isEnabled()) {
            response.setError(true);
            response.setMessage("Please activate your account before resetting your password.");
            response.setEmail(request.getEmail());
            return response;
        }

        // Check if a token with this email already exists (request sent but not confirmed)
        ForgotPasswordToken passwordToken = passwordTokenRepository.findByEmail(request.getEmail());
        String randomCode = RandomString.make(64);
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);
        if (passwordToken != null) {
            // Update the token if the email already exists in the table
            passwordToken.setAccount(account);
            passwordToken.setCode(randomCode);
            passwordToken.setCreatedAt(createdAt);
            passwordToken.setExpiresAt(expiresAt);
            passwordToken.setConfirmedAt(null);
        } else {
            // Create a new token if there hasn't been a "forgot password" request with this email
            passwordToken = new ForgotPasswordToken(account, randomCode, createdAt, expiresAt);
        }

        accountRepository.save(account);
        passwordTokenRepository.save(passwordToken);

        // Send email
        try {
            sendForgotPasswordEmail(account, passwordToken);
            response.setError(false);
            response.setMessage("Password reset email has been sent!");
            response.setEmail(request.getEmail());
            return response;
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        // If there's an error sending the email
        response.setError(true);
        response.setMessage("Email can not be sent at this time.");
        response.setEmail(request.getEmail());
        return response;
    }

    private void sendForgotPasswordEmail(Account account, ForgotPasswordToken passwordToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Reset your password";
        String senderName = "Recipe Website";

        String resetURL = "http://localhost:3000/reset-password/" + passwordToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getFullName() + ",</p>";
        mailContent += "<p>Please click the link below to reset your password.</p>";
        mailContent += "<a href=" + resetURL + ">RESET PASSWORD</a>";
        mailContent += "<p>This link will expire in 15 minutes.</p>";
        mailContent += "<p>Thank you, <br> The Recipe Website Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO make custom email for this website
        helper.setFrom("brandonijones@outlook.com", senderName);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }

    public VerifyResponse authorizePasswordReset(String verificationCode) {
        VerifyResponse response = new VerifyResponse();

        ForgotPasswordToken passwordToken = passwordTokenRepository.findByCode(verificationCode);

        if (passwordToken == null) {
            response.setError(true);
            response.setMessage("Cannot reset password. Invalid URL.");
            return response;
        }

        Account account = accountRepository.findByEmail(passwordToken.getAccount().getEmail());

        if (account == null) {
            response.setError(true);
            response.setMessage("This account does not exist.");
            return response;
        }

        if (!account.isEnabled()) {
            response.setError(true);
            response.setMessage("Account needs to be activated before the password can be reset.");
            return response;
        }

        LocalDateTime confirmedTime = LocalDateTime.now();
        LocalDateTime expirationTime = passwordToken.getExpiresAt();
        passwordToken.setConfirmedAt(confirmedTime);

        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new password reset link.");
            passwordTokenRepository.delete(passwordToken);
            return response;
        }

        // Code is valid
        passwordTokenRepository.save(passwordToken);
        response.setError(false);
        response.setMessage("Authorized to change password.");
        return response;

//        if (account == null || !account.isEnabled()) {
//            return false;
//        } else {
//            account.setVerificationCode(null);
//            accountRepository.save(account);
//            return true;
//        }
    }

    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {
        ChangePasswordResponse response = new ChangePasswordResponse();

        String code = request.getVerificationCode();
        int userId = request.getUserId();
        String newPassword = request.getNewPassword();
        String newEncodedPassword = bCryptPasswordEncoder.encode(newPassword);

        if (code != null) {
            ForgotPasswordToken passwordToken = passwordTokenRepository.findByCode(code);

            // In case verification code is invalid
            if (passwordToken == null) {
                response.setError(true);
                response.setMessage("Account cannot be found with verification code.");
                return response;
            }

            Account account = accountRepository.findByEmail(passwordToken.getAccount().getEmail());

            // Resetting password through forgot password link
            account.setPassword(newEncodedPassword);
            passwordToken.setCode(null);
            accountRepository.save(account);
            passwordTokenRepository.save(passwordToken);

            // Generate response
            response.setError(false);
            response.setMessage("Password successfully reset!");
            return response;
        }

        // Resetting password through account settings
        if (userId != 0) {
            Account account = accountRepository.findById(userId);

            // In case id is invalid
            if (account == null) {
                response.setError(true);
                response.setMessage("Account cannot be found with user id.");
                return response;
            }

            account.setPassword(newEncodedPassword);
            accountRepository.save(account);

            // Generate response
            response.setError(false);
            response.setMessage("Password successfully reset!");
            return response;
        }

        // Generate response
        response.setError(true);
        response.setMessage("Password cannot be reset. Invalid verification code or user id.");
        return response;
    }
}
