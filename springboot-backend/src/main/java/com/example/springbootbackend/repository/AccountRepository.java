package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a WHERE a.username = ?1")
    Account findByUsername(String username);

    @Query("SELECT a FROM Account a WHERE a.email = ?1")
    Account findByEmail(String email);

    @Query("SELECT a FROM Account a WHERE a.id = ?1")
    Account findByAccountId(Long id);

    @Query("SELECT DISTINCT a " +
            "FROM Account a " +
            "WHERE a.username LIKE %?1% " +
            "OR a.name LIKE %?1% " +
            "ORDER BY a.name, a.username")
    List<Account> findAccountsByQuery(String query);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.enabled = TRUE WHERE a.email = ?1")
    void enableAccount(String email);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.enabled = FALSE WHERE a.email = ?1")
    void disableAccount(String email);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.password = ?1 WHERE a.id = ?2")
    void updatePassword(String password, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.email = ?1 WHERE a.id = ?2")
    void updateEmail(String email, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.profilePicture = ?1 WHERE a.id = ?2")
    void updateProfilePicture(String profilePicture, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.name = ?1 WHERE a.id = ?2")
    void updateName(String name, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.username = ?1 WHERE a.id = ?2")
    void updateUsername(String username, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.bio = ?1 WHERE a.id = ?2")
    void updateBio(String bio, int id);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.bio = NULL WHERE a.id = ?1")
    void deleteBio(int id);


}
