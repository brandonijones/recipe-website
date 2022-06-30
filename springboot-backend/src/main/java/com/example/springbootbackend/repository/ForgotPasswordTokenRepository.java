package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ForgotPasswordTokenRepository extends JpaRepository<ForgotPasswordToken, Long> {

    @Query("SELECT p FROM ForgotPasswordToken p WHERE p.account.email = ?1")
    ForgotPasswordToken findByEmail(String email);

    @Query("SELECT p FROM ForgotPasswordToken p WHERE p.code = ?1")
    ForgotPasswordToken findByCode(String code);
}
