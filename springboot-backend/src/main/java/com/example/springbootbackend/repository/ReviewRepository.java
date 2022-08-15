package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Review;
import com.example.springbootbackend.model.compositekeys.ReviewID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, ReviewID> {

    @Query("SELECT r FROM Review r WHERE r.recipe.id = ?1 ORDER BY r.createdAt DESC")
    List<Review> findReviewsByRecipeId(Long id);

    @Query("SELECT r FROM Review r WHERE r.recipe.id = ?1 AND r.account.id = ?2")
    Review getReview(Long recipe, Long account);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewPK.recipeId = ?1")
    Double getAverageRatingForRecipe(Long recipeId);
}
