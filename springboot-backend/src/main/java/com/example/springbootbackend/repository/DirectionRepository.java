package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Direction;
import com.example.springbootbackend.model.compositekeys.DirectionID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectionRepository extends JpaRepository<Direction, DirectionID> {

    @Query("SELECT d FROM Direction d WHERE d.directionPK.recipeId = ?1 ORDER BY d.directionPK.directionOrder")
    List<Direction> findByRecipeId(Long id);
}
