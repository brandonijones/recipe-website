package com.example.springbootbackend.model;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class CompositeKey implements Serializable {

    private int recipeId;
    private int placement;
}
