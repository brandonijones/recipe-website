package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
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
    @PostMapping("/create-account")
    public Account createAccount(@RequestBody Account account) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encodedPassword = passwordEncoder.encode(account.getPassword());
        account.setPassword(encodedPassword);

        return accountRepository.save(account);
    }

    @PostMapping("/registration")
    public String register(@RequestBody Account account, HttpServletRequest request)
            throws UnsupportedEncodingException, MessagingException {

        String siteURL = getSiteURL(request) + "/api/v1/account";
        System.out.println(siteURL);
        registrationService.register(account, siteURL);
        registrationService.sendVerificationEmail(account, siteURL);
        return "registration success";
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
//
//    @GetMapping("/confirm")
//    public String confirm(@RequestParam("token") String token) {
//        return  registrationService.confirmToken(token);
//    }
}
