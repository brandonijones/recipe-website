package com.example.springbootbackend.model.compositekeys;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class TaggedRecipeID implements Serializable {

    private Long recipeId;
    private Long tagId;

    public TaggedRecipeID() { }

    public TaggedRecipeID(Long recipeId, Long tagId) {
        this.recipeId = recipeId;
        this.tagId = tagId;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }
}
