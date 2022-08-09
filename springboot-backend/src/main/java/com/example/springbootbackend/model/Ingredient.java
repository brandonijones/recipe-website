package com.example.springbootbackend.model;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "ingredient")
public class Ingredient implements Serializable {

    @EmbeddedId
    private CompositeKey key;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @Column(name = "item")
    private String item;

    public Ingredient() { }

    public Ingredient(CompositeKey key, String item) {
        this.key = key;
        this.item = item;
    }

    public CompositeKey getKey() {
        return key;
    }

    public void setKey(CompositeKey key) {
        this.key = key;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }
}
