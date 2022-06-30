package com.example.springbootbackend.controller;

import com.example.springbootbackend.auth.*;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.service.AccountServices;
import com.example.springbootbackend.service.RegistrationService;
import com.example.springbootbackend.verification.ResendRequest;
import com.example.springbootbackend.verification.ResendResponse;
import com.example.springbootbackend.verification.VerifyResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(value = "/api/v1/account")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AccountServices accountServices;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    // get all accounts
    @GetMapping("/all-accounts")
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // check for existing username
    @PostMapping("/find-username")
    public Account findExistingUser(@RequestBody Account account) {
        return accountRepository.findByUsername(account.getUsername());
    }

    // check for existing email
    @PostMapping("/find-email")
    public Account findExistingEmail(@RequestBody Account account) {
        return accountRepository.findByEmail(account.getEmail());
    }

    // register new account
    @PostMapping("/registration")
    public String register(@RequestBody Account account, HttpServletRequest request)
            throws UnsupportedEncodingException, MessagingException {

        String siteURL = getSiteURL(request) + "/api/v1/account";

        registrationService.register(account);
        return "registration success";
    }

    @PostMapping("/resend-email")
    public ResendResponse resendVerificationEmail(@RequestBody ResendRequest request) {
        return registrationService.resendEmail(request);
    }

    @GetMapping("/verify")
    public VerifyResponse verifyAccount(@Param("code") String code) {
        return registrationService.verifyEmail(code);
    }

    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return accountServices.login(request);
    }

    @GetMapping("/auth/validation")
    public AuthResponse validation(@RequestHeader("authorization") String header) {

        AuthResponse response = new AuthResponse();

        // Authorization: Bearer [jwt token]
        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (isValid) {
            // The subject contains the values that will be stored in the authContext hook in the front end
            String[] subject = jwtTokenUtil.getSubject(token).split(", ");
            response.setUser(subject);
            response.setMessage("JWT is valid.");
            response.setError(false);
            return response;
        }

        response.setMessage(jwtTokenUtil.getMessage());
        response.setError(true);
        return response;
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return accountServices.forgotPassword(request);
    }

    @GetMapping("/authorize-password-reset")
    public VerifyResponse authorizePasswordReset(@Param("code") String code) {
        return accountServices.authorizePasswordReset(code);
    }

    @PostMapping("/change-password")
    public ChangePasswordResponse changePassword(@RequestBody ChangePasswordRequest request) {
        return accountServices.changePassword(request);
    }
}
