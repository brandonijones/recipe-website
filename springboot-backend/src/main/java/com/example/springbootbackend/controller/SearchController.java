package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.service.AccountServices;
import com.example.springbootbackend.service.RecipeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "${app.react-frontend.url}")
@RestController
@RequestMapping(value = "/api/v1/search")
public class SearchController {

    @Autowired
    private RecipeServices recipeServices;

    @Autowired
    private AccountServices accountServices;

    @PostMapping("/find-recipes")
    public List<Recipe> findRecipes(@RequestBody Map<String, String> searchQuery) {
        String query = searchQuery.get("query");
        return recipeServices.findRecipesByQuery(query);
    }

    @PostMapping("/find-accounts")
    public List<Account> findAccounts(@RequestBody Map<String, String> searchQuery) {
        String query = searchQuery.get("query");
        return accountServices.findAccountsByQuery(query);
    }
}
