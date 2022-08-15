package com.example.springbootbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipe")
public class Recipe implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "avg_rating")
    private Double averageRating;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "recipe")
    private List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "recipe")
    private List<Direction> directions = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "recipe")
    private List<TaggedRecipe> taggedRecipes = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "recipe")
    private List<Review> reviews = new ArrayList<>();

    public Recipe() { }

    public Recipe(String title, String description, String imageURL, Account account) {
        this.title = title;
        this.description = description;
        this.imageURL = imageURL;
        this.account = account;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
}
