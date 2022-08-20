package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.model.Tag;
import com.example.springbootbackend.model.TaggedRecipe;
import com.example.springbootbackend.model.compositekeys.TaggedRecipeID;
import com.example.springbootbackend.repository.TagRepository;
import com.example.springbootbackend.repository.TaggedRecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

@Service
public class TagServices {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private TaggedRecipeRepository taggedRecipeRepository;

    public void addTags(Recipe recipe, ArrayList<Tag> newRecipeTags) {

        // Adding new tags to the database
        List<Tag> existingTags = tagRepository.findAllTags();

        // Will contain all the tags from the database
        HashMap<String, Long> existingTagsMap = new HashMap<>();

        // Will contain all the tags for this new recipe
        HashSet<Long> tagIdSet = new HashSet<>();

        if (existingTags.size() > 0) {

            // Adding existing tags to a hash map.
            for (Tag existingTag : existingTags) {
                String name = existingTag.getName().toLowerCase();
                Long id = existingTag.getId();
                existingTagsMap.put(name, id);
            }

            // Going through each tag submitting in the form
            for (Tag newRecipeTag : newRecipeTags) {


                // For convenience, all tags will be lowercase
                String formattedTagName = newRecipeTag.getName().toLowerCase();
                newRecipeTag.setName(formattedTagName);

                // Only adding tags to database if they do not exist yet
                if (!existingTagsMap.containsKey(formattedTagName)) {

                    // Save the new tag to generate the id
                    tagRepository.save(newRecipeTag);
                    Tag newTag = tagRepository.findTagByName(formattedTagName);
                    Long newTagId = newTag.getId();

                    // Adding new tag to hash map of existing tags in the database
                    existingTagsMap.put(newTag.getName(), newTagId);

                    // Add new tag id to set of tags for this new recipe
                    tagIdSet.add(newTagId);

                    // Saving to tagged_recipe table
                    TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipe.getId(), newTagId);
                    TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                    taggedRecipe.setRecipe(recipe);
                    taggedRecipe.setTag(newTag);
                    taggedRecipeRepository.save(taggedRecipe);
                } else {
                    // update tag
                    Long existingTagId = existingTagsMap.get(formattedTagName);

                    // Only adding tag to set and database if it is not a duplicate
                    if (!tagIdSet.contains(existingTagId)) {
                        tagIdSet.add(existingTagId);
                        Tag existingTag = tagRepository.findTagById(existingTagId);
                        TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipe.getId(), existingTagId);
                        TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                        taggedRecipe.setRecipe(recipe);
                        taggedRecipe.setTag(existingTag);
                        taggedRecipeRepository.save(taggedRecipe);
                    }
                }
            }
        } else {
            // This is used to populate the very first tags in the database

            for (Tag newRecipeTag : newRecipeTags) {
                // Saving tag to generate id
                String formattedTagName = newRecipeTag.getName().toLowerCase();
                newRecipeTag.setName(formattedTagName);
                tagRepository.save(newRecipeTag);

                // Save the data (mainly the generated id) to newTag
                newRecipeTag = tagRepository.findTagByName(newRecipeTag.getName());
                Long tagId = newRecipeTag.getId();

                TaggedRecipeID taggedRecipeID = new TaggedRecipeID(recipe.getId(), tagId);
                TaggedRecipe taggedRecipe = new TaggedRecipe(taggedRecipeID);
                taggedRecipe.setRecipe(recipe);
                taggedRecipe.setTag(newRecipeTag);
                taggedRecipeRepository.save(taggedRecipe);
            }
        }
    }
}
