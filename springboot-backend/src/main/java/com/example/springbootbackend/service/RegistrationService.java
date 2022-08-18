package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.EmailVerificationToken;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.repository.EmailTokenRepository;
import com.example.springbootbackend.verification.ResendRequest;
import com.example.springbootbackend.verification.ResendResponse;
import com.example.springbootbackend.verification.VerifyResponse;
import net.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.transaction.Transactional;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

@Service
@Transactional
public class RegistrationService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EmailTokenRepository emailTokenRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private EmailServices emailServices;

    private final int TIME_TO_EXPIRE = 15;

    public void register(Account account) throws UnsupportedEncodingException, MessagingException {

        // Creating a random verification code
        String randomCode = generateVerificationCode();
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);

        // Default profile picture
        String defaultProfilePictureURL = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1657138912/recipe_website/profile_images/default_profile_picture.png";

        // Encoding the password for the database
        String encodedPassword = bCryptPasswordEncoder.encode(account.getPassword());
        account.setPassword(encodedPassword);
        account.setCreatedAt(createdAt);
        account.setEnabled(false);
        account.setRole("USER");
        account.setProfilePicture(defaultProfilePictureURL);

        // Create email verification token
        EmailVerificationToken emailToken = new EmailVerificationToken(account, randomCode, createdAt, expiresAt);

        // Save account info and token to the database
        accountRepository.save(account);
        emailTokenRepository.save(emailToken);

        // Send email
        emailServices.sendVerificationEmail(account, emailToken);
    }

    public ResendResponse resendEmail(ResendRequest request) {
        ResendResponse response = new ResendResponse();
        Account account = accountRepository.findByEmail(request.getEmail());

        // Account was not found with the given email
        if (account == null) {
            response.setError(true);
            response.setMessage("Email cannot be found in our records.");
            response.setEmail(request.getEmail());
            return response;
        }

        // Account is already activated
        if (account.isEnabled()) {
            response.setError(true);
            response.setMessage("Account is already activated.");
            response.setEmail(request.getEmail());
            return response;
        }

        EmailVerificationToken emailToken = emailTokenRepository.findByAccountId(account.getId());

        // New verification email sent
        String randomCode = generateVerificationCode();
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(TIME_TO_EXPIRE);

        Long emailTokenId = emailToken.getId();
        emailToken.setId(emailTokenId);
        emailToken.setConfirmedAt(null);
        emailToken.setCode(randomCode);
        emailToken.setCreatedAt(createdAt);
        emailToken.setExpiresAt(expiresAt);
        account.setEnabled(false);

        // Send email
        try {
            emailServices.sendVerificationEmail(account, emailToken);
            response.setError(false);
            response.setMessage("New verification email has been sent!");
            response.setEmail(request.getEmail());

            account.setId(account.getId());
            accountRepository.save(account);
            emailTokenRepository.save(emailToken);
            return response;
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        // If there's an error sending the email
        response.setError(true);
        response.setMessage("Email could not be sent.");
        response.setEmail(request.getEmail());
        return response;
    }

    private String generateVerificationCode() {
        return RandomString.make(64);
    }

    public VerifyResponse verifyEmail(String verificationCode) {
        VerifyResponse response = new VerifyResponse();

        EmailVerificationToken emailToken = emailTokenRepository.findByCode(verificationCode);

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

        // Account is already enabled so there is no need to verify the email
        if (account.isEnabled()) {
            response.setError(true);
            response.setMessage("Your account is already activated.");
            return response;
        }

        LocalDateTime confirmedTime = LocalDateTime.now();
        LocalDateTime expirationTime = emailToken.getExpiresAt();
        emailToken.setConfirmedAt(confirmedTime);

        // Checking if token is expired
        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new verification link.");
            emailTokenRepository.save(emailToken);
            return response;
        }

        // Verification code is valid
        account.setEnabled(true);
        account.setId(account.getId());
        accountRepository.save(account);

        emailToken.setCode(null);
        emailToken.setId(emailToken.getId());
        emailTokenRepository.save(emailToken);

        response.setError(false);
        response.setMessage("Account successfully activated!");
        return response;
    }
}
