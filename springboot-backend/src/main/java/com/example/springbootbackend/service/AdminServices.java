package com.example.springbootbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.springbootbackend.cloudinary.config.CloudinaryConfig;
import com.example.springbootbackend.jwt.JwtTokenUtil;
import com.example.springbootbackend.model.Account;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.repository.AccountRepository;
import com.example.springbootbackend.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminServices {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private CloudinaryServices cloudinaryServices;

    public ResponseEntity<Map<String, String>> adminEditRole(String header, Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        Long accountId = Long.parseLong(request.get("id"));
        String newRole = request.get("role");

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.put("error", "JWT is invalid");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Account accountToUpdate = accountRepository.findByAccountId(accountId);

        if (accountToUpdate == null) {
            response.put("error", "Account could not be found");
                return new ResponseEntity<>(response, HttpStatus.OK);
        }

        accountToUpdate.setId(accountId);
        accountToUpdate.setRole(newRole);
        accountRepository.save(accountToUpdate);

        response.put("success", "Account successfully updated");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, String>> adminDeleteAccount(String header, Map<String, String> request) {
        Map<String, String> response = new HashMap<>();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.put("error", "JWT is invalid");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Long adminId = Long.parseLong(request.get("adminId"));
        Long accountId = Long.parseLong(request.get("accountId"));
        String password = request.get("password");

        Account admin = accountRepository.findByAccountId(adminId);

        boolean matches = bCryptPasswordEncoder.matches(password, admin.getPassword());

        // password was incorrect
        if (!matches) {
            response.put("error", "Password incorrect");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Account accountToDelete = accountRepository.findByAccountId(accountId);

        // Delete profile image from Cloudinary
        try {
            cloudinaryServices.deleteProfileImageFromCloudinary(accountToDelete.getProfilePicture());
        } catch (IOException e) {
            e.printStackTrace();
        }

        List<Recipe> accountRecipes = recipeRepository.findRecipesByAccountId(accountToDelete.getId());

        // Deleting every recipe image associated with this account from Cloudinary if there are any
        if (accountRecipes.size() > 0) {
            for (Recipe recipe : accountRecipes) {
                String imageURL = recipe.getImageURL();
                try {
                    cloudinaryServices.deleteRecipeImageFromCloudinary(imageURL);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        accountRepository.delete(accountToDelete);

        response.put("success", "Account successfully deleted");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, String>> adminDeleteRecipe(String header, Map<String, String> request) {
        Map<String, String> response = new HashMap<>();

        String token = header.split(" ")[1];
        boolean isValid = jwtTokenUtil.validateAccessToken(token);

        if (!isValid) {
            response.put("error", "JWT is invalid");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Long recipeId = Long.parseLong(request.get("recipeId"));
        Long adminId = Long.parseLong(request.get("adminId"));
        String password = request.get("password");

        Account admin = accountRepository.findByAccountId(adminId);

        boolean matches = bCryptPasswordEncoder.matches(password, admin.getPassword());

        // password was incorrect
        if (!matches) {
            response.put("error", "Password incorrect");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Recipe recipeToDelete = recipeRepository.findRecipeById(recipeId);
        try {
            cloudinaryServices.deleteRecipeImageFromCloudinary(recipeToDelete.getImageURL());
        } catch (IOException e) {
            e.printStackTrace();
        }
        recipeRepository.delete(recipeToDelete);

        response.put("success", "Recipe successfully deleted");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
