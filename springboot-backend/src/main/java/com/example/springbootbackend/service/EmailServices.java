package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.EmailVerificationToken;
import com.example.springbootbackend.model.ForgotPasswordToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
@PropertySource("classpath:application.properties")
public class EmailServices {

    @Autowired
    private JavaMailSender mailSender;

    @Value(value = "${FRONTEND_URL}")
    private String WEBSITE_BASE_URL;

    private final String SENDER_EMAIL = "therecipebowl@outlook.com";
    private final String SENDER_NAME = "The Recipe Bowl";

    public void sendVerificationEmail(Account account, EmailVerificationToken emailToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Activate your account";
        String verifyURL = WEBSITE_BASE_URL + "/verify?code=" + emailToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
        mailContent += "<p>Please click the link below to verify your email and activate your account.</p>";
        mailContent += "<a href=" + verifyURL + ">VERIFY</a>";
        mailContent += "<p>This link will expire in 15 minutes.</p>";
        mailContent += "<p>Thank you, <br> " + SENDER_NAME + " Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO make custom email for this website
        helper.setFrom(SENDER_EMAIL, SENDER_NAME);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }

    public void sendForgotPasswordEmail(Account account, ForgotPasswordToken passwordToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Reset your password";
        String resetURL = WEBSITE_BASE_URL + "/reset-password?code=" + passwordToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
        mailContent += "<p>Please click the link below to reset your password.</p>";
        mailContent += "<a href=" + resetURL + ">RESET PASSWORD</a>";
        mailContent += "<p>This link will expire in 15 minutes.</p>";
        mailContent += "<p>Thank you, <br> " + SENDER_NAME + " Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO make custom email for this website
        helper.setFrom(SENDER_EMAIL, SENDER_NAME);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }

    public void sendEmailChangeNotice(Account account, String newEmail) throws MessagingException, UnsupportedEncodingException {
        String subject = "Your email is being changed";

        // Mail content
        String mailContent = "<p>Dear " + account.getUsername() + ",</p>";
        mailContent += "<p>You have recently requested to update your email to " + newEmail + ".</p>";
        mailContent += "<p>If this was you, please ignore this email.</p>";
        mailContent += "<p>If this was not you, please log in to correct the email change or contact us for assistance.</p>";
        mailContent += "<p>Thank you, <br> " + SENDER_NAME + " Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO make custom email for this website
        helper.setFrom(SENDER_EMAIL, SENDER_NAME);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }

    public void sendNewVerificationEmail(Account account, EmailVerificationToken emailToken) throws MessagingException, UnsupportedEncodingException {
        String subject = "Verify your new email address";
        String resetURL = WEBSITE_BASE_URL + "/verify?changeEmailCode=" + emailToken.getCode();

        // Mail content
        String mailContent = "<p>Dear " + account.getName() + ",</p>";
        mailContent += "<p>Please click the link below to verify your new email address</p>";
        mailContent += "<a href=" + resetURL + ">VERIFY EMAIL</a>";
        mailContent += "<p>This link will expire in 15 minutes.</p>";
        mailContent += "<p>Thank you, <br> " + SENDER_NAME + " Team";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        // TODO make custom email for this website
        helper.setFrom(SENDER_EMAIL, SENDER_NAME);
        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }
}
