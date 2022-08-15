package com.example.springbootbackend.model.compositekeys;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class ReviewID implements Serializable {

    private Long recipeId;

    private Long accountId;

    public ReviewID() { }

    public ReviewID(Long recipeId, Long accountId) {
        this.recipeId = recipeId;
        this.accountId = accountId;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
}
