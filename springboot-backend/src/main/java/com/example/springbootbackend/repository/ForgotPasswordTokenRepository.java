package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.LocalDateTime;

public interface ForgotPasswordTokenRepository extends JpaRepository<ForgotPasswordToken, Long> {

    @Query("SELECT p FROM ForgotPasswordToken p WHERE p.account.email = ?1")
    ForgotPasswordToken findByEmail(String email);

    @Query("SELECT p FROM ForgotPasswordToken p WHERE p.code = ?1")
    ForgotPasswordToken findByCode(String code);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.code = ?1 WHERE p.id = ?2")
    void updateCode(String code, int id);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.code = NULL WHERE p.id = ?1")
    void deleteCode(int id);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.createdAt = ?1 WHERE p.id = ?2")
    void updateCreatedAt(LocalDateTime createdAt, int id);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.expiresAt = ?1 WHERE p.id = ?2")
    void updateExpiresAt(LocalDateTime expiresAt, int id);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.confirmedAt = ?1 WHERE p.id = ?2")
    void updateConfirmedAt(LocalDateTime confirmedAt, int id);

    @Transactional
    @Modifying
    @Query("UPDATE ForgotPasswordToken p SET p.confirmedAt = NULL WHERE p.id = ?2")
    void deleteConfirmedAt(int id);

}
