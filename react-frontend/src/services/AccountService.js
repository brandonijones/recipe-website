import axios from "axios";

const ACCOUNT_API_BASE_URL = "http://localhost:8080/api/v1/account";

class AccountService {
    
    findUsername(username) {
        return axios.post(ACCOUNT_API_BASE_URL + "/find-username", username);
    }

    findEmail(email) {
        return axios.post(ACCOUNT_API_BASE_URL + "/find-email", email);
    }

    createAccount(account) {
        return axios.post(ACCOUNT_API_BASE_URL + "/create-account", account);
    }
}

export default new AccountService();