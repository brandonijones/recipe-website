package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.security.PasswordEncoder;
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
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    public Account register(Account account) throws UnsupportedEncodingException, MessagingException {

        // Encoding the password for the database
        String encodedPassword = bCryptPasswordEncoder.encode(account.getPassword());
        account.setPassword(encodedPassword);

        account.setCreatedAt(LocalDateTime.now());

        // Creating a random verification code
        String randomCode = RandomString.make(64);
        account.setVerificationCode(randomCode);

        account.setEnabled(false);

        return accountRepository.save(account);
    }

    public void sendVerificationEmail(Account account, String siteURL) throws MessagingException, UnsupportedEncodingException {
        String subject = "Activate your account";
        String senderName = "Recipe Website";
        String mailContent = "<p>Dear " + account.getFullName() + ",</p>";
        mailContent += "<p>Please click the link below to verify your email and activate your account./p>";

//        String verifyURL = siteURL + "/verify?code=" + account.getVerificationCode();
        String verifyURL = "http://localhost:3000/verify/" + account.getVerificationCode();

        System.out.println(verifyURL);

        mailContent += "<a href=" + verifyURL + ">VERIFY</a>";
        mailContent += "<p>Thank you, <br> The Recipe Website Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO: make custom email for this website
        helper.setFrom("brandonijones@outlook.com", senderName);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }

    public boolean verify(String verificationCode) {
        Account account = accountRepository.findByVerificationCode(verificationCode);

        if (account == null || account.isEnabled()) {
            return false;
        } else {
            account.setVerificationCode(null);
            account.setEnabled(true);
            accountRepository.save(account);

            return true;
        }

    }
}
