package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT r FROM Recipe r WHERE r.account.id = ?1")
    List<Recipe> findRecipesByAccountId(Long id);

    @Query("SELECT r FROM Recipe r WHERE r.account.id = ?1 AND r.createdAt = ?2")
    Recipe findRecipeByAccountIdAndTime(Long id, LocalDateTime createdAt);
}
