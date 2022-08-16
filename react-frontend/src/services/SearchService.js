import axios from 'axios';

const SEARCH_API_BASE_URL = "http://localhost:8080/api/v1/search";

class SearchService {

    findRecipes(searchedRecipe) {
        return axios.post(`${SEARCH_API_BASE_URL}/find-recipes`, { query: searchedRecipe });
    }

    findAccounts(searchedAccount) {
        return axios.post(`${SEARCH_API_BASE_URL}/find-accounts`, { query: searchedAccount });
    }
}

export default new SearchService();