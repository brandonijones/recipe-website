package com.example.springbootbackend.model;

import com.example.springbootbackend.model.compositekeys.IngredientID;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "ingredient")
public class Ingredient implements Serializable {

    @EmbeddedId
    private IngredientID ingredientPK;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @Column(name = "item")
    private String item;

    public Ingredient() { }

    public Ingredient(IngredientID ingredientPK, String item) {
        this.ingredientPK = ingredientPK;
        this.item = item;
    }

    public IngredientID getIngredientPK() {
        return ingredientPK;
    }

    public void setIngredientPK(IngredientID ingredientPK) {
        this.ingredientPK = ingredientPK;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }
}
