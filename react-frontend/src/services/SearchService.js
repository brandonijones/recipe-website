import axios from 'axios';

const SEARCH_API_BASE_URL = `${process.env.REACT_APP_BACKEND_API_URL}/search`;

class SearchService {

    findRecipes(searchedRecipe) {
        return axios.post(`${SEARCH_API_BASE_URL}/find-recipes`, { query: searchedRecipe });
    }

    findAccounts(searchedAccount) {
        return axios.post(`${SEARCH_API_BASE_URL}/find-accounts`, { query: searchedAccount });
    }
}

export default new SearchService();