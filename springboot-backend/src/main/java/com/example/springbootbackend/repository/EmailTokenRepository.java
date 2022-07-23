package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.time.LocalDateTime;

public interface EmailTokenRepository extends JpaRepository<EmailVerificationToken, Integer> {

    @Query("SELECT e FROM EmailVerificationToken e WHERE e.account.email = ?1")
    EmailVerificationToken findByEmail(String email);

    @Query("SELECT e FROM EmailVerificationToken e WHERE e.account.id = ?1")
    EmailVerificationToken findByAccountId(Integer accountId);

    @Query("SELECT e FROM EmailVerificationToken e WHERE e.code = :code")
    EmailVerificationToken findByCode(@Param("code") String code);

    @Transactional
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.code = ?1 WHERE e.id = ?2")
    void updateCode(String code, int id);

    @Transactional
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.code = NULL WHERE e.id = ?1")
    void deleteCode(int id);

    @Transactional
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.createdAt = ?1 WHERE e.id = ?2")
    void updateCreatedAt(LocalDateTime createdAt, int id);

    @Transactional
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.expiresAt = ?1 WHERE e.id = ?2")
    void updateExpiresAt(LocalDateTime expiresAt, int id);

    @Transactional
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.confirmedAt = ?1 WHERE e.id = ?2")
    void updateConfirmedAt(LocalDateTime confirmedAt, int id);
}
