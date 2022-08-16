package com.example.springbootbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.springbootbackend.auth.RecipeUploadRequest;
import com.example.springbootbackend.auth.RecipeUploadResponse;
import com.example.springbootbackend.cloudinary.config.CloudinaryConfig;
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
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CloudinaryConfig cloudinaryConfig;

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

        // Creating new recipe entity to access

        Recipe recipe = recipeRepository.findRecipeByAccountIdAndTime(accountId, formattedCreatedAtTime);
        Long recipeId = recipe.getId();

        // Saving the ingredients to the database
        for (int i = 0; i < newRecipeIngredients.size(); i++) {
            Long ingredientOrder = (long) i;
            IngredientID ingredientID = new IngredientID(recipeId, ingredientOrder);

            Ingredient ingredient = newRecipeIngredients.get(i);
            ingredient.setIngredientPK(ingredientID);
            ingredient.setRecipe(recipe);
            ingredientRepository.save(ingredient);
        }

        // Saving the directions to the database
        for (int i = 0; i < newRecipeDirections.size(); i++) {
            Long directionOrder = (long) i;
            DirectionID directionID = new DirectionID(recipeId, directionOrder);

            Direction direction = newRecipeDirections.get(i);
            direction.setDirectionPK(directionID);
            direction.setRecipe(recipe);
            directionRepository.save(direction);
        }

        // Adding new tags to the database
        List<Tag> existingTags = tagRepository.findAllTags();

        // Will contain all the tags from the database
        HashMap<String, Long> existingTagsMap = new HashMap<>();

        // Will contain all the tags for this new recipe
        HashSet<Long> tagIdSet = new HashSet<>();

        // Adding tags if necessary
        if (newRecipeTags.size() > 0) {

            // Special checks needed if there are tags in the database
            if (existingTags.size() > 0) {

                // Adding existing tags to a hash map.
                for (Tag existingTag : existingTags) {
                    String name = existingTag.getName().toLowerCase();
                    Long id = existingTag.getId();
                    existingTagsMap.put(name, id);
                }

                // Going through each tag submitting in the form
                for (Tag newRecipeTag : newRecipeTags) {


                    // For convenience, all tags will be lowercase
                    String formattedTagName = newRecipeTag.getName().toLowerCase();
                    newRecipeTag.setName(formattedTagName);

                    // Only adding tags to database if they do not exist yet
                    if (!existingTagsMap.containsKey(formattedTagName)) {

                        // Save the new tag to generate the id
                        tagRepository.save(newRecipeTag);
                        Tag newTag = tagRepository.findTagByName(formattedTagName);
                        Long newTagId = newTag.getId();

                        // Adding new tag to hash map of existing tags in the database
                        existingTagsMap.put(newTag.getName(), newTagId);

                        // Add new tag id to set of tags for this new recipe
                        tagIdSet.add(newTagId);

                        // Saving to tagged_recipe table
                        TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipeId, newTagId);
                        TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                        taggedRecipe.setRecipe(recipe);
                        taggedRecipe.setTag(newTag);
                        taggedRecipeRepository.save(taggedRecipe);
                    } else {
                        // update tag
                        Long existingTagId = existingTagsMap.get(formattedTagName);

                        // Only adding tag to set and database if it is not a duplicate
                        if (!tagIdSet.contains(existingTagId)) {
                            tagIdSet.add(existingTagId);
                            Tag existingTag = tagRepository.findTagById(existingTagId);
                            TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipeId, existingTagId);
                            TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                            taggedRecipe.setRecipe(recipe);
                            taggedRecipe.setTag(existingTag);
                            taggedRecipeRepository.save(taggedRecipe);
                        }
                    }
                }
            } else {
                // This is used to populate the very first tags in the database

                for (Tag newRecipeTag : newRecipeTags) {
                    // Saving tag to generate id
                    String formattedTagName = newRecipeTag.getName().toLowerCase();
                    newRecipeTag.setName(formattedTagName);
                    tagRepository.save(newRecipeTag);

                    // Save the data (mainly the generated id) to newTag
                    newRecipeTag = tagRepository.findTagByName(newRecipeTag.getName());
                    Long tagId = newRecipeTag.getId();

                    TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipeId, tagId);
                    TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                    taggedRecipe.setRecipe(recipe);
                    taggedRecipe.setTag(newRecipeTag);
                    taggedRecipeRepository.save(taggedRecipe);
                }
            }
        }

        response.setError(false);
        response.setMessage("Recipe successfully uploaded!");
        return response;
    }

    public List<Recipe> findRecipesByAccountId(String accountId) {
        Long id = Long.parseLong(accountId);
        List<Recipe> accountRecipes = recipeRepository.findRecipesByAccountId(id);

        return accountRecipes;
    }

    public Recipe findRecipeById(String recipeId) {
        Long id = Long.parseLong(recipeId);
        return recipeRepository.findRecipeById(id);
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
                deleteRecipeImageFromCloudinary(recipe.getImageURL());
            } catch (IOException e) {
                e.printStackTrace();
                return new ResponseEntity<>("Recipe image failed to delete from Cloudinary", HttpStatus.BAD_REQUEST);
            }
        }

        recipeRepository.delete(recipe);

        return new ResponseEntity<>("Successfully deleted recipe", HttpStatus.OK);
    }

    private void deleteRecipeImageFromCloudinary(String recipeImage) throws IOException {

        // The public id / filename is the last url parameter
        String[] urlArray = recipeImage.split("/");
        int lastIndex = urlArray.length - 1;
        String fileName = urlArray[lastIndex];

        // Separate the public id from the file extension
        String[] fileArray = fileName.split("\\.");
        String publicId = "recipe_website/recipe_images/" + fileArray[0];

        Cloudinary cloudinary = cloudinaryConfig.getInstance();

        // Avoids deleting the default profile picture
        if (!publicId.equals("recipe_website/recipe_images/default_recipe_image")) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        }
    }

    public List<Recipe> findRecipesByQuery(String query) {
        return recipeRepository.findRecipesByQuery(query);
    }
}
