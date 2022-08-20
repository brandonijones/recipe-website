package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Ingredient;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.model.compositekeys.IngredientID;
import com.example.springbootbackend.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class IngredientServices {

    @Autowired
    private IngredientRepository ingredientRepository;

    public void addIngredients(Recipe recipe, ArrayList<Ingredient> ingredientsToAdd) {
        for (int i = 0; i < ingredientsToAdd.size(); i++) {
            Long ingredientOrder = (long) i;
            IngredientID ingredientID = new IngredientID(recipe.getId(), ingredientOrder);

            Ingredient ingredient = ingredientsToAdd.get(i);
            ingredient.setIngredientPK(ingredientID);
            ingredient.setRecipe(recipe);
            ingredientRepository.save(ingredient);
        }
    }
}
