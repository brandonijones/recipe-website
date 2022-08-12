package com.example.springbootbackend.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tag")
public class Tag implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "tag")
    private List<TaggedRecipe> taggedRecipes = new ArrayList<>();

    public Tag() { }

    public Tag(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<TaggedRecipe> getTaggedRecipes() {
        return taggedRecipes;
    }

    public void setTaggedRecipes(List<TaggedRecipe> taggedRecipes) {
        this.taggedRecipes = taggedRecipes;
    }
}
