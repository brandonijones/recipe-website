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

        // Encoding the password for the database
        String encodedPassword = bCryptPasswordEncoder.encode(account.getPassword());
        account.setPassword(encodedPassword);

        account.setCreatedAt(LocalDateTime.now());

        // Creating a random verification code
        String randomCode = generateVerificationCode();
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);
        EmailVerificationToken token = new EmailVerificationToken(account, randomCode, createdAt, expiresAt);

//        account.setEmailToken(token);
        account.setEnabled(false);
        token.setAccount(account);

        sendVerificationEmail(account, token);
        accountRepository.save(account);
        emailTokenRepository.save(token);
//        return accountRepository.save(account);
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
        emailToken.setCode(randomCode);
        emailToken.setCreatedAt(createdAt);
        emailToken.setExpiresAt(expiresAt);
        account.setEnabled(false);

        // Send email
        try {
            sendVerificationEmail(account, emailToken);
            response.setError(false);
            response.setMessage("New verification email has been sent!");
            response.setEmail(request.getEmail());
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

//        String verifyURL = siteURL + "/verify?code=" + account.getVerificationCode();
        String verifyURL = "http://localhost:3000/verify/" + emailToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getFullName() + ",</p>";
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

        //
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

        if (confirmedTime.isAfter(expirationTime)) {
            response.setError(true);
            response.setMessage("Link has expired. Please get a new verification link.");
            emailTokenRepository.save(emailToken);
            return response;
        }

        // Verification code is valid
        emailToken.setCode(null);
        account.setEnabled(true);
        accountRepository.save(account);
        emailTokenRepository.save(emailToken);
        response.setError(false);
        response.setMessage("Account successfully activated!");
        return response;

    }
}
