package com.example.springbootbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.springbootbackend.cloudinary.config.CloudinaryConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class CloudinaryServices {

    @Autowired
    private CloudinaryConfig cloudinaryConfig;

    public void deleteProfileImageFromCloudinary(String originalURL) throws IOException {

        // The public id / filename is the last url parameter
        String[] urlArray = originalURL.split("/");
        int lastIndex = urlArray.length - 1;
        String fileName = urlArray[lastIndex];

        // Separate the public id from the file extension
        String[] fileArray = fileName.split("\\.");
        String publicId = "recipe_website/profile_images/" + fileArray[0];

        Cloudinary cloudinary = cloudinaryConfig.getInstance();

        // Avoids deleting the default profile picture
        if (!publicId.equals("recipe_website/profile_images/default_profile_picture")) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        }
    }

    public void deleteRecipeImageFromCloudinary(String recipeImage) throws IOException {

        // The public id / filename is the last url parameter
        String[] urlArray = recipeImage.split("/");
        int lastIndex = urlArray.length - 1;
        String fileName = urlArray[lastIndex];

        // Separate the public id from the file extension
        String[] fileArray = fileName.split("\\.");
        String publicId = "recipe_website/recipe_images/" + fileArray[0];

        Cloudinary cloudinary = cloudinaryConfig.getInstance();

        // Avoids deleting the default profile picture
        if (!publicId.equals("recipe_website/recipe_images/default_recipe_image")) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        }
    }
}
