package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmailTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    @Query("SELECT e FROM EmailVerificationToken e WHERE e.account.email = ?1")
    EmailVerificationToken findByEmail(String email);

    @Query("SELECT e FROM EmailVerificationToken e WHERE e.code = ?1")
    EmailVerificationToken findByCode(String code);
}
