package com.example.springbootbackend.controller;

import com.example.springbootbackend.auth.RecipeUploadRequest;
import com.example.springbootbackend.auth.RecipeUploadResponse;
import com.example.springbootbackend.model.Direction;
import com.example.springbootbackend.model.Ingredient;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.model.Tag;
import com.example.springbootbackend.service.RecipeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/recipe")
public class RecipeController {

    @Autowired
    private RecipeServices recipeServices;

    @PostMapping("/upload-recipe")
    public RecipeUploadResponse uploadRecipe(@RequestHeader("authorization") String header ,@RequestBody RecipeUploadRequest request) {
        return recipeServices.uploadRecipe(header, request);
    }

    @GetMapping("/find-recipes")
    public List<Recipe> findRecipesByAccountId(@Param("id") String id) {
        return recipeServices.findRecipesByAccountId(id);
    }

    @GetMapping("/get-recipe")
    public Recipe findRecipeById(@Param("id") String id) {
        return recipeServices.findRecipeById(id);
    }

    @GetMapping("/ingredients")
    public List<Ingredient> findIngredientsByRecipeId(@Param("id") String id) {
        return recipeServices.findIngredients(id);
    }

    @GetMapping("/directions")
    public List<Direction> findDirectionsByRecipeId(@Param("id") String id) {
        return recipeServices.findDirections(id);
    }

    @GetMapping("/tags")
    public List<Tag> findTagsByRecipeId(@Param("id") String id) {
        return recipeServices.findTags(id);
    }

    @PostMapping("/edit-recipe")
    public ResponseEntity<Map<String, String>> editRecipe(@RequestHeader("authorization") String header, @RequestBody RecipeUploadRequest request) {
        return recipeServices.editRecipe(header, request);
    }

    @DeleteMapping("/delete-recipe")
    public ResponseEntity<String> deleteRecipe(@RequestHeader("authorization") String header, @RequestBody Map<String, String> recipe) {
        return recipeServices.deleteRecipe(header, recipe.get("id"));
    }
}
