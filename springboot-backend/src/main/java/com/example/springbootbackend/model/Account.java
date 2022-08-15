package com.example.springbootbackend.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "account")
public class Account implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "username", unique = true, nullable = false, length = 30)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "bio", length = 250)
    private String bio;

    @Column(name = "profile_picture", length = 1024)
    private String profilePicture;

    @Column(name = "locked")
    private boolean locked = false;

    @Column(name = "enabled")
    private boolean enabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "account")
    private List<Recipe> recipes = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "account")
    private List<Review> reviews = new ArrayList<>();

    @OneToOne(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "account")
    private EmailVerificationToken emailToken;

    @OneToOne(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "account")
    private ForgotPasswordToken passwordToken;

    // Default constructor
    public Account() {}

    public Account(String name, String email, String username, String password, String role) {
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String toString() {
        return "id: " + getId() + "\n" +
                "username: " + getUsername() + "\n" +
                "email: " + getEmail() + "\n" +
                "name: " + getName() + "\n" +
                "bio: " + getBio() + "\n" +
                "role: " + getRole() + "\n";
    }
}
