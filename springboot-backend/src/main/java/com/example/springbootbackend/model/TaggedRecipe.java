package com.example.springbootbackend.model;

import com.example.springbootbackend.model.compositekeys.TaggedRecipeID;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "tagged_recipe")
public class TaggedRecipe implements Serializable {

    @EmbeddedId
    private TaggedRecipeID taggedRecipePK;

    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", referencedColumnName = "id")
    @ManyToOne
    private Recipe recipe;

    @MapsId("tagId")
    @JoinColumn(name = "tag_id", referencedColumnName = "id")
    @ManyToOne
    private Tag tag;

    public TaggedRecipe() { }

    public TaggedRecipe(TaggedRecipeID taggedRecipePK) {
        this.taggedRecipePK = taggedRecipePK;
    }

    public TaggedRecipeID getTaggedRecipePK() {
        return taggedRecipePK;
    }

    public void setTaggedRecipePK(TaggedRecipeID taggedRecipePK) {
        this.taggedRecipePK = taggedRecipePK;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
