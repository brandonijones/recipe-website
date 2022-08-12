package com.example.springbootbackend.model.compositekeys;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class DirectionID implements Serializable {

    private Long recipeId;

    @Column(name = "direction_order")
    private Long directionOrder;

    public DirectionID() { }

    public DirectionID(Long recipeId, Long directionOrder) {
        this.recipeId = recipeId;
        this.directionOrder = directionOrder;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getDirectionOrder() {
        return directionOrder;
    }

    public void setDirectionOrder(Long directionOrder) {
        this.directionOrder = directionOrder;
    }
}
