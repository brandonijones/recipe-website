package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.service.AccountServices;
import com.example.springbootbackend.service.AdminServices;
import com.example.springbootbackend.service.RecipeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "https://therecipebowl.netlify.app"})
@RestController
@RequestMapping(value = "/api/v1/admin")
public class AdminController {

    @Autowired
    private AccountServices accountServices;

    @Autowired
    private RecipeServices recipeServices;

    @Autowired
    private AdminServices adminServices;

    @GetMapping("/all-accounts")
    public List<Account> findAllAccounts() {
        return accountServices.findAllAccounts();
    }

    @GetMapping("all-recipes")
    public List<Recipe> findAllRecipes() {
        return recipeServices.findAllRecipes();
    }

    @PostMapping("edit-role")
    public ResponseEntity<Map<String, String>> editRole(@RequestHeader("authorization") String header,
                                                        @RequestBody Map<String, String> request) {
        return adminServices.adminEditRole(header, request);
    }

    @DeleteMapping("delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(@RequestHeader("authorization") String header,
                                                             @RequestBody Map<String, String> request) {
        return adminServices.adminDeleteAccount(header, request);
    }

    @DeleteMapping("delete-recipe")
    public ResponseEntity<Map<String, String>> deleteRecipe(@RequestHeader("authorization") String header,
                                                             @RequestBody Map<String, String> request) {
        return adminServices.adminDeleteRecipe(header, request);
    }

}
