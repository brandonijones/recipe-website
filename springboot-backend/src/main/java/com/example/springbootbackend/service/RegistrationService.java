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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
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
    private JavaMailSender mailSender;

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
        sendVerificationEmail(account, emailToken);
    }

    public ResendResponse resendEmail(ResendRequest request) {
        ResendResponse response = new ResendResponse();
        Account account = accountRepository.findByEmail(request.getEmail());
        EmailVerificationToken emailToken = emailTokenRepository.findByEmail(request.getEmail());

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

        // New verification email sent
        String randomCode = generateVerificationCode();
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);

        int emailTokenId = emailToken.getId();
//        emailToken.setCode(randomCode);
//        emailToken.setCreatedAt(createdAt);
//        emailToken.setExpiresAt(expiresAt);
        account.setEnabled(false);
        emailTokenRepository.updateCode(randomCode, emailTokenId);
        emailTokenRepository.updateCreatedAt(createdAt, emailTokenId);
        emailTokenRepository.updateExpiresAt(expiresAt, emailTokenId);
//        accountRepository.disableAccount(account.getEmail());

        // Send email
        try {
            sendVerificationEmail(account, emailToken);
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

    public void sendVerificationEmail(Account account, EmailVerificationToken emailToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Activate your account";
        String senderName = "Recipe Website";
        String verifyURL = "http://localhost:3000/verify?code=" + emailToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
        mailContent += "<p>Please click the link below to verify your email and activate your account.</p>";
        mailContent += "<a href=" + verifyURL + ">VERIFY</a>";
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
//        emailTokenRepository.updateConfirmedAt(confirmedTime, emailToken.getId());

        // Checking if token is expired
        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new verification link.");
//            emailTokenRepository.save(emailToken);
            return response;
        }

        // Verification code is valid
        emailToken.setCode(null);
//        emailTokenRepository.deleteCode(emailToken.getId());
        account.setEnabled(true);
//        accountRepository.enableAccount(account.getEmail());
        account.setId(account.getId());
        emailToken.setId(emailToken.getId());
        accountRepository.save(account);
        emailTokenRepository.save(emailToken);
        response.setError(false);
        response.setMessage("Account successfully activated!");
        return response;
    }
}
