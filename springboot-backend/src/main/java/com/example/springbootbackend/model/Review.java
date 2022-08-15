package com.example.springbootbackend.model;

import com.example.springbootbackend.model.compositekeys.ReviewID;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
public class Review implements Serializable {

    @EmbeddedId
    private ReviewID reviewPK;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @MapsId("accountId")
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    @ManyToOne
    private Account account;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "review_content")
    private String reviewContent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Review() { }

    public Review(ReviewID reviewPK, Recipe recipe, Account account, Double rating, String reviewContent, LocalDateTime createdAt) {
        this.reviewPK = reviewPK;
        this.recipe = recipe;
        this.account = account;
        this.rating = rating;
        this.reviewContent = reviewContent;
        this.createdAt = createdAt;
    }

    public ReviewID getReviewPK() {
        return reviewPK;
    }

    public void setReviewPK(ReviewID reviewPK) {
        this.reviewPK = reviewPK;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getReviewContent() {
        return reviewContent;
    }

    public void setReviewContent(String reviewContent) {
        this.reviewContent = reviewContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
