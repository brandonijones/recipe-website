package com.example.springbootbackend.controller;

import com.example.springbootbackend.auth.AccountInfo;
import com.example.springbootbackend.auth.AuthRequest;
import com.example.springbootbackend.auth.AuthResponse;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.service.AccountServices;
import com.example.springbootbackend.service.RegistrationService;
import com.example.springbootbackend.verification.ResendRequest;
import com.example.springbootbackend.verification.ResendResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import java.util.Map;

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

//        System.out.println(siteURL);

        registrationService.register(account);
        registrationService.sendVerificationEmail(account);
        return "registration success";
    }

    @PostMapping("/resend-email")
    public ResendResponse resendVerificationEmail(@RequestBody ResendRequest request) {
        return registrationService.resendEmail(request);
    }

    @GetMapping("/verify")
    public String verifyAccount(@Param("code") String code) {
        if (registrationService.verify(code)) {
            return "verify_success";
        } else {
            return "verify_fail";
        }
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

}
