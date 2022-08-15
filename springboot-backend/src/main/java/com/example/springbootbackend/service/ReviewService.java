package com.example.springbootbackend.service;

import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.model.Review;
import com.example.springbootbackend.model.compositekeys.ReviewID;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.repository.RecipeRepository;
import com.example.springbootbackend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public ResponseEntity<Review> uploadReview(String header, Map<String, String> request) {

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        Review review = new Review();
        ReviewID reviewId = new ReviewID();

        Long recipeId = Long.parseLong(request.get("recipeId"));
        Long accountId = Long.parseLong(request.get("accountId"));
        Double rating = Double.parseDouble(request.get("rating"));
        String reviewContent = request.get("reviewContent");

        reviewId.setRecipeId(recipeId);
        reviewId.setAccountId(accountId);

        Recipe recipe = recipeRepository.findRecipeById(recipeId);
        Account account = accountRepository.findByAccountId(accountId);

        review.setReviewPK(reviewId);
        review.setRecipe(recipe);
        review.setAccount(account);
        review.setRating(rating);
        review.setReviewContent(reviewContent);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime rawCreatedAtTime = LocalDateTime.now();
        String createdAtText = rawCreatedAtTime.format(formatter);
        LocalDateTime formattedCreatedAtTime = LocalDateTime.parse(createdAtText, formatter);

        review.setCreatedAt(formattedCreatedAtTime);

        reviewRepository.save(review);

        Double averageRating = reviewRepository.getAverageRatingForRecipe(recipeId);

        recipe.setAverageRating(averageRating);
        recipe.setId(recipeId);
        recipeRepository.save(recipe);

        return new ResponseEntity<>(review, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, String>> getReview(String accountId, String recipeId) {

        Long recipe = Long.parseLong(recipeId);
        Long account = Long.parseLong(accountId);

        Review review = reviewRepository.getReview(recipe, account);

        Map<String, String> response = new HashMap<>();
        if (review == null) {
            response.put("success", "User may post a review");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        response.put("error", "Cannot post more than one review on a single recipe");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public List<Review> findReviews(String recipeId) {
        Long id = Long.parseLong(recipeId);

        return reviewRepository.findReviewsByRecipeId(id);
    }

    public ResponseEntity<String> deleteReview(String header, String accountId, String recipeId) {

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        Long accountIdParsed = Long.parseLong(accountId);
        Long recipeIdParsed = Long.parseLong(recipeId);

        Review reviewToDelete = reviewRepository.getReview(recipeIdParsed, accountIdParsed);

        if (reviewToDelete == null) {
            return new ResponseEntity<>("No review could be found", HttpStatus.OK);
        }

        reviewRepository.delete(reviewToDelete);

        Recipe recipe = recipeRepository.findRecipeById(recipeIdParsed);
        Double newAverageRating = reviewRepository.getAverageRatingForRecipe(recipeIdParsed);
        recipe.setAverageRating(newAverageRating);
        recipe.setId(recipeIdParsed);
        recipeRepository.save(recipe);

        return new ResponseEntity<>("Successfully deleted review", HttpStatus.OK);
    }
}
