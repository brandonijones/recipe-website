package com.example.springbootbackend.model.compositekeys;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class IngredientID implements Serializable {

    private Long recipeId;

    @Column(name = "ingredient_order")
    private Long ingredientOrder;

    public IngredientID() { }

    public IngredientID(Long recipeId, Long ingredientOrder) {
        this.recipeId = recipeId;
        this.ingredientOrder = ingredientOrder;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getIngredientOrder() {
        return ingredientOrder;
    }

    public void setIngredientOrder(Long ingredientOrder) {
        this.ingredientOrder = ingredientOrder;
    }
}
