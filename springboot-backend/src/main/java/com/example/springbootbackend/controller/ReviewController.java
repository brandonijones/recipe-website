package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Review;
import com.example.springbootbackend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "https://therecipebowl.netlify.app"})
@RestController
@RequestMapping(value = "/api/v1/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/upload-review")
    public ResponseEntity<Review> uploadReview(@RequestHeader("authorization") String header, @RequestBody Map<String, String> request) {
        return reviewService.uploadReview(header, request);
    }

    @GetMapping("/get-review")
    public ResponseEntity<Map<String, String>> getReview(@Param("accountId") String accountId, @Param("recipeId") String recipeId) {
        return reviewService.getReview(accountId, recipeId);
    }

    @GetMapping("/find-reviews")
    public List<Review> findReviews(@Param("id") String id) {
        return reviewService.findReviews(id);
    }

    @DeleteMapping("/delete-review")
    public ResponseEntity<String> deleteReview(@RequestHeader("authorization") String header, @RequestBody Map<String, String> review) {
        return reviewService.deleteReview(header, review.get("accountId"), review.get("recipeId"));
    }

}
