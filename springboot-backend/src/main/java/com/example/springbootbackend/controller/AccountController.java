package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(value = "/api/v1/account")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    // get all accounts
    @GetMapping("/all-accounts")
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // check for existing username
    @PostMapping("/find-username")
    public List<Account> findExistingUser(@RequestBody Account account) {
        return accountRepository.findByUsername(account.getUsername());
    }

    // check for existing email
    @PostMapping("/find-email")
    public List<Account> findExistingEmail(@RequestBody Account account) {
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
}
