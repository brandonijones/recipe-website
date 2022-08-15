package com.example.springbootbackend.model;

import com.example.springbootbackend.model.compositekeys.DirectionID;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "direction")
public class Direction implements Serializable {

    @EmbeddedId
    private DirectionID directionPK;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @Column(name = "description", length = 500)
    private String description;

    public Direction() { }

    public Direction(DirectionID directionPK, String description) {
        this.directionPK = directionPK;
        this.description = description;
    }

    public DirectionID getDirectionPK() {
        return directionPK;
    }

    public void setDirectionPK(DirectionID directionPK) {
        this.directionPK = directionPK;
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
