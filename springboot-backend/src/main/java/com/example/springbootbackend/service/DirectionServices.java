package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Direction;
import com.example.springbootbackend.model.Recipe;
import com.example.springbootbackend.model.compositekeys.DirectionID;
import com.example.springbootbackend.repository.DirectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class DirectionServices {

    @Autowired
    private DirectionRepository directionRepository;

    public void addDirections(Recipe recipe, ArrayList<Direction> directionsToAdd) {
        for (int i = 0; i < directionsToAdd.size(); i++) {
            Long directionOrder = (long) i;
            DirectionID directionID = new DirectionID(recipe.getId(), directionOrder);

            Direction direction = directionsToAdd.get(i);
            direction.setDirectionPK(directionID);
            direction.setRecipe(recipe);
            directionRepository.save(direction);
        }
    }
}
