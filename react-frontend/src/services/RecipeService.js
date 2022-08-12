import axios from "axios";

const RECIPE_API_BASE_URL = "http://localhost:8080/api/v1/recipe";

class RecipeService {

    postRecipe(recipeValues) {
        return axios.post(RECIPE_API_BASE_URL + "/upload-recipe",
            recipeValues,
            {
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        );
    }

    findRecipesByAccount(accountId) {
        return axios.get(`${RECIPE_API_BASE_URL}/find-recipes?account-id=${accountId}`)
    }
}

export default new RecipeService();