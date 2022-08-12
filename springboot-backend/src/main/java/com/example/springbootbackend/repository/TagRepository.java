package com.example.springbootbackend.repository;

import com.example.springbootbackend.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    @Query("SELECT t FROM Tag t")
    List<Tag> findAllTags();

    @Query("SELECT t FROM Tag t WHERE t.id = ?1")
    Tag findTagById(Long id);

    @Query("SELECT t FROM Tag t WHEre t.name = ?1")
    Tag findTagByName(String name);
}
