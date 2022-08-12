package com.example.springbootbackend.controller;

import com.example.springbootbackend.auth.RecipeUploadRequest;
import com.example.springbootbackend.auth.RecipeUploadResponse;
import com.example.springbootbackend.service.RecipeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping(value = "/api/v1/recipe")
public class RecipeController {

    @Autowired
    private RecipeServices recipeServices;

    @PostMapping("/upload-recipe")
    public RecipeUploadResponse uploadRecipe(@RequestHeader("authorization") String header ,@RequestBody RecipeUploadRequest request) {
        return recipeServices.uploadRecipe(header, request);
    }
}
