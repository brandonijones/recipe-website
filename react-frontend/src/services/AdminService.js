import axios from 'axios';

const ADMIN_API_BASE_URL = `${process.env.REACT_APP_BACKEND_API_URL}/admin`;

class AdminService {

    findAllAccounts() {
        return axios.get(`${ADMIN_API_BASE_URL}/all-accounts`);
    }

    findAllRecipes() {
        return axios.get(`${ADMIN_API_BASE_URL}/all-recipes`);
    }

    editRole(request) {
        return axios.post(`${ADMIN_API_BASE_URL}/edit-role`, 
            {
                id: request.id,
                role: request.role
            },
            {
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        )
    }

    deleteAccount(request) {
        return axios.delete(`${ADMIN_API_BASE_URL}/delete-account`,
            {
                data: {
                    adminId: request.adminId,
                    accountId: request.accountId,
                    password: request.password
                },
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        )
    }

    deleteRecipe(request) {
        return axios.delete(`${ADMIN_API_BASE_URL}/delete-recipe`, 
            { 
                data: { 
                    recipeId: request.recipeId,
                    adminId: request.adminId,
                    password: request.password
                },
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        );
    }
}

export default new AdminService();