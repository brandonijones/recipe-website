package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT r FROM Recipe r WHERE r.account.id = ?1 ORDER BY r.createdAt DESC")
    List<Recipe> findRecipesByAccountId(Long id);

    @Query("SELECT r FROM Recipe r ORDER BY r.createdAt")
    List<Recipe> getRecipesOrderByDate();

    @Query("SELECT r FROM Recipe r WHERE r.account.id = ?1 AND r.createdAt = ?2")
    Recipe findRecipeByAccountIdAndTime(Long id, LocalDateTime createdAt);

    @Query("SELECT r FROM Recipe r WHERE r.id = ?1")
    Recipe findRecipeById(Long id);

    @Query("SELECT DISTINCT r " +
            "FROM Recipe r " +
            "INNER JOIN r.ingredients i " +
            "INNER JOIN r.taggedRecipes t " +
            "WHERE r.title LIKE %?1% " +
            "OR r.description LIKE %?1% " +
            "OR i.item LIKE %?1% " +
            "OR t.tag.name LIKE %?1% " +
            "ORDER BY r.averageRating DESC")
    List<Recipe> findRecipesByQuery(String query);
}
