package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Ingredient;
import com.example.springbootbackend.model.compositekeys.IngredientID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, IngredientID> {

    @Query("SELECT i FROM Ingredient i WHERE i.ingredientPK.recipeId = ?1 ORDER BY i.ingredientPK.ingredientOrder")
    List<Ingredient> findByRecipeId(Long id);
}
