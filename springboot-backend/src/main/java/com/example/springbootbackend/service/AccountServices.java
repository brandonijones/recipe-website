package com.example.springbootbackend.service;

import com.cloudinary.utils.ObjectUtils;
import com.example.springbootbackend.auth.*;
import com.example.springbootbackend.cloudinary.config.CloudinaryConfig;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.EmailVerificationToken;
import com.example.springbootbackend.model.ForgotPasswordToken;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.repository.EmailTokenRepository;
import com.example.springbootbackend.repository.ForgotPasswordTokenRepository;
import com.example.springbootbackend.verification.VerifyResponse;
import net.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.Arrays;

import com.cloudinary.*;

@Service
public class AccountServices {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ForgotPasswordTokenRepository passwordTokenRepository;

    @Autowired
    private EmailTokenRepository emailTokenRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private CloudinaryConfig cloudinaryConfig;

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
            response.setMessage("Email or username is incorrect.");
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
//            passwordToken.setAccount(account);
//            passwordToken.setCode(randomCode);
//            passwordToken.setCreatedAt(createdAt);
//            passwordToken.setExpiresAt(expiresAt);
//            passwordToken.setConfirmedAt(null);
            int tokenId = passwordToken.getId();
            passwordTokenRepository.updateCode(randomCode, tokenId);
            passwordTokenRepository.updateCreatedAt(createdAt, tokenId);
            passwordTokenRepository.updateExpiresAt(expiresAt, tokenId);
            passwordTokenRepository.deleteConfirmedAt(tokenId);
        } else {
            // Create a new token if there hasn't been a "forgot password" request with this email
            passwordToken = new ForgotPasswordToken(account, randomCode, createdAt, expiresAt);
            passwordTokenRepository.save(passwordToken);
        }

//        accountRepository.save(account);
//        passwordTokenRepository.save(passwordToken);

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
        String resetURL = "http://localhost:3000/reset-password?code=" + passwordToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
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

        // Check to see if account exists
        if (account == null) {
            response.setError(true);
            response.setMessage("This account does not exist.");
            return response;
        }

        // Check to see if the account is enabled
        if (!account.isEnabled()) {
            response.setError(true);
            response.setMessage("Account needs to be activated before the password can be reset.");
            return response;
        }

        // Check to see if token is expired
        LocalDateTime confirmedTime = LocalDateTime.now();
        LocalDateTime expirationTime = passwordToken.getExpiresAt();
//        passwordToken.setConfirmedAt(confirmedTime);
        passwordTokenRepository.updateConfirmedAt(confirmedTime, passwordToken.getId());

        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new password reset link.");
            passwordTokenRepository.delete(passwordToken);
            return response;
        }

        // Code is valid
//        passwordTokenRepository.save(passwordToken);
        response.setError(false);
        response.setMessage("Authorized to change password.");
        return response;
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
//            account.setPassword(newEncodedPassword);
            accountRepository.updatePassword(newEncodedPassword, account.getId());
            passwordTokenRepository.deleteCode(passwordToken.getId());
//            passwordToken.setCode(null);
//            accountRepository.save(account);
//            passwordTokenRepository.save(passwordToken);

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

//            account.setPassword(newEncodedPassword);
            accountRepository.updatePassword(newPassword, userId);
//            accountRepository.save(account);

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

    public VerifyResponse checkEmail(String email) {
        VerifyResponse response = new VerifyResponse();
        Account account = accountRepository.findByEmail(email);

        // Check to see if account exists
        if (account == null) {
            response.setError(true);
            response.setMessage("Account cannot be found with given email.");
            return response;
        }

        EmailVerificationToken emailToken = emailTokenRepository.findByEmail(email);

        if (emailToken == null) {
            response.setError(true);
            response.setMessage("There is no email token.");
            return response;
        }

        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime expiresAt = emailToken.getExpiresAt();
        LocalDateTime confirmedAt = emailToken.getConfirmedAt();

        // Check to see if it's been confirmed
        if (confirmedAt == null) {

            // Check if verification is expired.
            if (currentTime.isAfter(expiresAt)) {
                response.setError(true);
                response.setMessage("Email verification link is expired. Please request a new link.");
                return response;
            }

            // Email token not expired and email has not been confirmed yet.
            response.setError(true);
            response.setMessage("Email has not been verified yet. Please check your email for verification link.");
            return response;
        }

        // Email has been correctly verified
        if (confirmedAt.isBefore(expiresAt)) {
            response.setError(false);
            response.setMessage("Email is verified.");
            return response;
        }

        // Email is not correctly verified somehow
        response.setError(true);
        response.setMessage("Email is not correctly verified.");
        return response;
    }

    public AuthResponse changeEmail(String header, ChangeEmailRequest request) {
        AuthResponse response = new AuthResponse();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.setError(true);
            response.setMessage("JWT is invalid.");
            return response;
        }

        String previousEmail = request.getEmail();
        String newEmail = request.getNewEmail();

        Account account = accountRepository.findByEmail(previousEmail);

        if (account == null) {
            response.setError(true);
            response.setMessage("Account cannot be found with given email.");
            return response;
        }

        // Sending an email notice to previous email
        try {
            sendEmailChangeNotice(account, newEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
            response.setError(true);
            response.setMessage("Could not send email.");
            return response;
        }

        EmailVerificationToken previousEmailToken = emailTokenRepository.findByEmail(previousEmail);
        emailTokenRepository.delete(previousEmailToken);

        // Updating email in database
        account.setEmail(newEmail);
        account.setId(account.getId());
//        accountRepository.updateEmail(newEmail, account.getId());
        accountRepository.save(account);

        // Generate new token and token values
        EmailVerificationToken newEmailToken = new EmailVerificationToken();
        String randomCode = generateVerificationCode();
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);

        // Set new token values
        newEmailToken.setAccount(account);
        newEmailToken.setCode(randomCode);
        newEmailToken.setCreatedAt(createdAt);
        newEmailToken.setExpiresAt(expiresAt);
        emailTokenRepository.save(newEmailToken);

        String newAccessToken = jwtTokenUtil.generateAccessToken(account);

        // Sending verification link to new email address
        try {
            sendNewVerificationEmail(account, newEmailToken);
            response.setError(false);
            response.setMessage("New verification email has been sent!");
            response.setAccessToken(newAccessToken);
            response.setUser(account);
            return response;
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        response.setError(true);
        response.setMessage("Email could not be sent.");
        return response;
    }

    private String generateVerificationCode() {
        return RandomString.make(64);
    }

    private void sendEmailChangeNotice(Account account, String newEmail) throws MessagingException, UnsupportedEncodingException {
        String subject = "Your email is being changed";
        String senderName = "Recipe Website";

        // Mail content
        String mailContent = "<p>Dear " + account.getUsername() + ",</p>";
        mailContent += "<p>You have recently requested to update your email to " + newEmail + ".</p>";
        mailContent += "<p>If this was you, please ignore this email.</p>";
        mailContent += "<p>If this was not you, please log in to correct the email change or contact us for assistance.</p>";
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

    private void sendNewVerificationEmail(Account account, EmailVerificationToken emailToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Verify your new email address";
        String senderName = "Recipe Website";
        String resetURL = "http://localhost:3000/verify?changeEmailCode=" + emailToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
        mailContent += "<p>Please click the link below to verify your new email address</p>";
        mailContent += "<a href=" + resetURL + ">VERIFY EMAIL</a>";
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

    public VerifyResponse verifyNewEmail(String code) {
        VerifyResponse response = new VerifyResponse();

        EmailVerificationToken emailToken = emailTokenRepository.findByCode(code);

        // Checking if token exists
        if (emailToken == null) {
            response.setError(true);
            response.setMessage("Could not verify email. Invalid URL or account is already activated.");
            return response;
        }

        Account account = accountRepository.findByEmail(emailToken.getAccount().getEmail());

        // Account couldn't be found in the database
        if (account == null) {
            response.setError(true);
            response.setMessage("This account does not exist.");
            return response;
        }

        LocalDateTime confirmedTime = LocalDateTime.now();
        LocalDateTime expirationTime = emailToken.getExpiresAt();

//        emailTokenRepository.updateConfirmedAt(confirmedTime, emailToken.getId());
        emailToken.setConfirmedAt(confirmedTime);

        // Checking if token is expired
        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new verification link.");
//            emailTokenRepository.save(emailToken);
            return response;
        }

        // Verification code is valid
//        emailTokenRepository.updateCode(null, emailToken.getId());
//        accountRepository.enableAccount(account.getEmail());
        emailToken.setCode(null);
        account.setEnabled(true);
        account.setId(account.getId());
        accountRepository.save(account);
        emailTokenRepository.save(emailToken);
        response.setError(false);
        response.setMessage("Account successfully activated!");
        return response;
    }

    public AuthResponse getCurrentUser(String header, String userId) {
        AuthResponse response = new AuthResponse();

        if (userId.equals("undefined")) {
            response.setError(true);
            response.setMessage("React hook has not been set yet.");
            return response;
        }

        if (userId.equals("null")) {
            response.setError(true);
            response.setMessage("User not logged in.");
            return response;
        }

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.setError(true);
            response.setMessage(jwtTokenUtil.getMessage());
            return response;
        }

        int id = Integer.parseInt(userId);

        // Check to see if account exists first
        if (accountRepository.findById(id) == null) {
            response.setError(true);
            response.setMessage("Account does not exist.");
            return response;
        }

        Account account = accountRepository.findById(id);
        response.setError(false);
        response.setMessage("JWT is valid.");
        response.setUser(account);

        return response;
    }

    public AuthResponse editProfile(String header, AccountInfo updatedAccount) {
        AuthResponse response = new AuthResponse();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.setError(true);
            response.setMessage("JWT is invalid");
            return response;
        }

        Account account;

        if(accountRepository.findById(updatedAccount.getId()) == null) {
            response.setError(true);
            response.setMessage("Account could not be found.");
            return response;
        } else {
            account = accountRepository.findById(updatedAccount.getId());
        }

        int accountId = account.getId();

        String originalProfilePicture = account.getProfilePicture();
        String originalName = account.getName();
        String originalUsername = account.getUsername();
        String originalBio = account.getBio();

        String updatedProfilePicture = updatedAccount.getProfilePicture();
        String updatedName = updatedAccount.getName();
        String updatedUsername = updatedAccount.getUsername();
        String updatedBio = updatedAccount.getBio();

        // Updating profile picture URL if needed
        if (updatedProfilePicture != null && !updatedProfilePicture.equals(originalProfilePicture)) {

            System.out.println("Original profile picture: " + originalProfilePicture + " ******");
            try {
                deleteOriginalFromCloudinary(originalProfilePicture);
            } catch (IOException e) {
                e.printStackTrace();
                response.setError(true);
                response.setMessage("Error deleting original image from cloudinary.");
                return response;
            }

            account.setProfilePicture(updatedProfilePicture);
//            accountRepository.updateProfilePicture(updatedProfilePicture, accountId);
        }

        // Updating the name if needed
        if (!updatedName.equals(originalName)) {
            account.setName(updatedName);
//            accountRepository.updateName(updatedName, accountId);
        }

        // Updating the username if needed
        if (!updatedUsername.equals(originalUsername)) {
            account.setUsername(updatedUsername);
//            accountRepository.updateUsername(updatedUsername, accountId);
        }

        // Updating the bio if needed
        if (updatedBio == null) {
            account.setBio(null);
//            accountRepository.deleteBio(accountId);
        } else {
            if (!updatedBio.equals(originalBio)) {
                account.setBio(updatedBio);
//                accountRepository.updateBio(updatedBio, accountId);
            }
        }
        account.setId(accountId);
        accountRepository.save(account);
//        System.out.println("Original Account: \n" + account.toString());
//        Account finishedAccount = accountRepository.findById(accountId);
//        System.out.println("\nFinished Account: \n" + finishedAccount.toString());

        // Generating a new JWT
        String newAccessToken = jwtTokenUtil.generateAccessToken(account);

        response.setError(false);
        response.setMessage("Profile successfully updated!");
        response.setAccessToken(newAccessToken);
        response.setUser(account);
        return response;
    }

    private void deleteOriginalFromCloudinary(String originalURL) throws IOException {

        // The public id / filename is the last url parameter
        String[] urlArray = originalURL.split("/");
        int lastIndex = urlArray.length - 1;
        String fileName = urlArray[lastIndex];

        // Separate the public id from the file extension
        String[] fileArray = fileName.split("\\.");
        String publicId = "recipe_website/profile_images/" + fileArray[0];

        Cloudinary cloudinary = cloudinaryConfig.getInstance();

        if (!publicId.equals("recipe_website/profile_images/default_profile_picture")) {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", "image"));
        }
    }
}
