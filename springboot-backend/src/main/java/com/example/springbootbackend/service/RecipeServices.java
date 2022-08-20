package com.example.springbootbackend.service;

import com.example.springbootbackend.auth.RecipeUploadRequest;
import com.example.springbootbackend.auth.RecipeUploadResponse;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.*;
import com.example.springbootbackend.model.compositekeys.DirectionID;
import com.example.springbootbackend.model.compositekeys.IngredientID;
import com.example.springbootbackend.model.compositekeys.TaggedRecipeID;
import com.example.springbootbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class RecipeServices {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private DirectionRepository directionRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private TaggedRecipeRepository taggedRecipeRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CloudinaryServices cloudinaryServices;

    @Autowired
    private IngredientServices ingredientServices;

    @Autowired
    private DirectionServices directionServices;

    @Autowired
    private TagServices tagServices;

    private final String DEFAULT_RECIPE_IMAGE_URL = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1660331856/recipe_website/recipe_images/default_recipe_image.png";

    public RecipeUploadResponse uploadRecipe(String header, RecipeUploadRequest request) {
        RecipeUploadResponse response = new RecipeUploadResponse();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.setError(true);
            response.setMessage("JWT is invalid.");
            return response;
        }

        Long accountId = request.getAccountId();
        String newRecipeTitle = request.getTitle();
        String newRecipeDescription = request.getDescription();
        String newRecipeImageURL = request.getImageURL();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime rawCreatedAtTime = LocalDateTime.now();
        String createdAtText = rawCreatedAtTime.format(formatter);
        LocalDateTime formattedCreatedAtTime = LocalDateTime.parse(createdAtText, formatter);

        ArrayList<Ingredient> newRecipeIngredients = request.getIngredients();
        ArrayList<Direction> newRecipeDirections = request.getDirections();
        ArrayList<Tag> newRecipeTags = request.getTags();

        Account account = accountRepository.findByAccountId(accountId);

        if (account == null) {
            response.setError(true);
            response.setMessage("Account does not exist.");
            return response;
        }

        Recipe newRecipe = new Recipe();

        newRecipe.setAccount(account);
        newRecipe.setTitle(newRecipeTitle);
        newRecipe.setDescription(newRecipeDescription);
        newRecipe.setImageURL(newRecipeImageURL);
        newRecipe.setCreatedAt(formattedCreatedAtTime);
        recipeRepository.save(newRecipe);

        // Creating new recipe entity to access id
        Recipe recipe = recipeRepository.findRecipeByAccountIdAndTime(accountId, formattedCreatedAtTime);

        // Saving the ingredients to the database
        ingredientServices.addIngredients(recipe, newRecipeIngredients);

        // Saving the directions to the database
        directionServices.addDirections(recipe, newRecipeDirections);

        // Adding new tags to the database
        tagServices.addTags(recipe, newRecipeTags);

        response.setError(false);
        response.setMessage("Recipe successfully uploaded!");
        return response;
    }

    public ResponseEntity<Map<String, String>> editRecipe(String header, RecipeUploadRequest request) {
        Map<String, String> response = new HashMap<>();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.put("error", "JWT is invalid");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        // Original recipe
        Recipe recipe = recipeRepository.findRecipeById(request.getRecipeId());

        if (recipe == null) {
            response.put("error", "Recipe not found.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Long recipeId = recipe.getId();
        String originalTitle = recipe.getTitle();
        String originalImageURL = recipe.getImageURL();
        String originalDescription = recipe.getDescription();
        List<Ingredient> originalIngredients = ingredientRepository.findByRecipeId(recipeId);
        List<Direction> originalDirections = directionRepository.findByRecipeId(recipeId);
        List<TaggedRecipe> originalTags = taggedRecipeRepository.findTagsByRecipeId(recipeId);


        String updatedTitle = request.getTitle();
        String updatedImageURL = request.getImageURL();
        String updatedDescription = request.getDescription();
        ArrayList<Ingredient> updatedIngredients = request.getIngredients();
        ArrayList<Direction> updatedDirections = request.getDirections();
        ArrayList<Tag> updatedTags = request.getTags();

        // Updating title
        if (!updatedTitle.equals(originalTitle)) {
            recipe.setTitle(updatedTitle);
        }

        // Updating image url
        if (!updatedImageURL.equals(originalImageURL)) {
            try {
                cloudinaryServices.deleteRecipeImageFromCloudinary(originalImageURL);
            } catch (IOException e) {
                response.put("error", "Could not delete original recipe image");
                return new ResponseEntity<>(response, HttpStatus.OK);
            }

            recipe.setImageURL(updatedImageURL);
        }

        // Updating description
        if (!updatedDescription.equals(originalDescription)) {
            recipe.setDescription(updatedDescription);
        }

        // Resetting the ingredients
        for (Ingredient ingredient : originalIngredients) {
            ingredientRepository.delete(ingredient);
        }

        // Adding ingredients
        ingredientServices.addIngredients(recipe, updatedIngredients);

        // Resetting the directions
        for (Direction direction : originalDirections) {
            directionRepository.delete(direction);
        }

        // Adding directions
        directionServices.addDirections(recipe, updatedDirections);

        // Resetting the tags
        for (TaggedRecipe taggedRecipe : originalTags) {
            taggedRecipeRepository.delete(taggedRecipe);
        }

        // Updating tags
        tagServices.addTags(recipe, updatedTags);

        recipe.setId(recipeId);
        recipeRepository.save(recipe);
        response.put("success", "Recipe successfully updated.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public List<Recipe> findRecipesByAccountId(String accountId) {
        Long id = Long.parseLong(accountId);

        return recipeRepository.findRecipesByAccountId(id);
    }

    public Recipe findRecipeById(String recipeId) {
        Long id = Long.parseLong(recipeId);

        // Updating the average rating just in case accounts that left reviews were deleted
        Double averageRating = reviewRepository.getAverageRatingForRecipe(id);
        Recipe recipe = recipeRepository.findRecipeById(id);
        recipe.setId(recipe.getId());
        recipe.setAverageRating(averageRating);
        recipeRepository.save(recipe);

        return recipe;
    }

    public List<Ingredient> findIngredients(String recipeId) {
        Long id = Long.parseLong(recipeId);
        return ingredientRepository.findByRecipeId(id);
    }

    public List<Direction> findDirections(String recipeId) {
        Long id = Long.parseLong(recipeId);
        return directionRepository.findByRecipeId(id);
    }

    public List<Tag> findTags(String recipeId) {
        Long id = Long.parseLong(recipeId);
        List<TaggedRecipe> recipeTags = taggedRecipeRepository.findTagsByRecipeId(id);
        List<Tag> tagsList = new ArrayList<>();

        for (TaggedRecipe taggedRecipe : recipeTags) {
            tagsList.add(taggedRecipe.getTag());
        }

        return tagsList;
    }

    public ResponseEntity<String> deleteRecipe(String header, String recipeId) {

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            return new ResponseEntity<>("JWT is invalid", HttpStatus.BAD_REQUEST);
        }

        Long id = Long.parseLong(recipeId);
        Recipe recipe = recipeRepository.findRecipeById(id);

        if (recipe == null) {
            return new ResponseEntity<>("Deletion of recipe failed", HttpStatus.NOT_FOUND);
        }

        if (!recipe.getImageURL().equals(DEFAULT_RECIPE_IMAGE_URL)) {
            try {
                cloudinaryServices.deleteRecipeImageFromCloudinary(recipe.getImageURL());
            } catch (IOException e) {
                e.printStackTrace();
                return new ResponseEntity<>("Recipe image failed to delete from Cloudinary", HttpStatus.BAD_REQUEST);
            }
        }

        recipeRepository.delete(recipe);

        return new ResponseEntity<>("Successfully deleted recipe", HttpStatus.OK);
    }

    public List<Recipe> findRecipesByQuery(String query) {
        return recipeRepository.findRecipesByQuery(query);
    }

    public List<Recipe> findAllRecipes() {
        return recipeRepository.findAll();
    }
}
