package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a WHERE a.username = ?1")
    Account findByUsername(String username);

    @Query("SELECT a FROM Account a WHERE a.email = ?1")
    Account findByEmail(String email);

    @Query("SELECT a FROM Account a WHERE a.id = ?1")
    Account findById(int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.enabled = TRUE WHERE a.email = ?1")
    int enableAccount(String email);


}
