package com.example.springbootbackend.model;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "direction")
public class Direction implements Serializable {

    @EmbeddedId
    private CompositeKey id;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @Column(name = "description", length = 500)
    private String description;

    public Direction() { }

    public Direction(CompositeKey id, String description) {
        this.id = id;
        this.description = description;
    }

    public CompositeKey getId() {
        return id;
    }

    public void setId(CompositeKey id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
