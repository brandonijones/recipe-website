import axios from "axios";

const ACCOUNT_API_BASE_URL = "http://localhost:8080/api/v1/account";

class AccountService {
    
    findUsername(username) {
        return axios.post(ACCOUNT_API_BASE_URL + "/find-username", username);
    }

    findEmail(email) {
        return axios.post(ACCOUNT_API_BASE_URL + "/find-email", email);
    }

    register(account) {
        return axios.post(ACCOUNT_API_BASE_URL + "/registration", account);
    }

    verify(verificationCode) {
        return axios.get(`${ACCOUNT_API_BASE_URL}/verify?code=${verificationCode}`);
    }

    login(formData) {
        return axios.post(ACCOUNT_API_BASE_URL + "/auth/login", formData);
    }

    validate() {
        return axios.get(ACCOUNT_API_BASE_URL + "/auth/validation", { headers: {
            authorization: 'bearer ' + localStorage.getItem("accessToken")
        }});
    }
}

export default new AccountService();