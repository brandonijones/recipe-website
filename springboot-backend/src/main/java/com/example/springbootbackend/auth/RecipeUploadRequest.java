package com.example.springbootbackend.auth;

import com.example.springbootbackend.model.Direction;
import com.example.springbootbackend.model.Ingredient;
import com.example.springbootbackend.model.Tag;

import java.util.ArrayList;

public class RecipeUploadRequest {

    private Long accountId;
    private String title;
    private String description;
    private String imageURL;
    private ArrayList<Ingredient> ingredients;
    private ArrayList<Direction> directions;
    private ArrayList<Tag> tags;

    public RecipeUploadRequest() { }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public ArrayList<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(ArrayList<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }

    public ArrayList<Direction> getDirections() {
        return directions;
    }

    public void setDirections(ArrayList<Direction> directions) {
        this.directions = directions;
    }

    public ArrayList<Tag> getTags() {
        return tags;
    }

    public void setTags(ArrayList<Tag> tags) {
        this.tags = tags;
    }

    public void printRecipeRequest() {
        System.out.println("Account id: " + accountId );
        System.out.println("Title: " + getTitle());
        System.out.println("Description: " + getDescription());
        System.out.println("Image URL: " + getImageURL());

        System.out.println();
        System.out.println("INGREDIENTS:");
        getIngredients().forEach(x -> System.out.println(x.getItem()));

        System.out.println();
        System.out.println("DIRECTIONS:");
        getDirections().forEach(x -> System.out.println(x.getDescription()));

        System.out.println();
        System.out.println("TAGS:");
        getTags().forEach(x -> System.out.println(x.getName()));
    }
}
