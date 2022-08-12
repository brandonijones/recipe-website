package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.TaggedRecipe;
import com.example.springbootbackend.model.compositekeys.TaggedRecipeID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaggedRecipeRepository extends JpaRepository<TaggedRecipe, TaggedRecipeID> {

    @Query("SELECT tr FROM TaggedRecipe tr WHERE tr.taggedRecipePK.recipeId = ?1")
    List<TaggedRecipe> findTagsByRecipeId(Long id);

}
