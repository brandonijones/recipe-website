import axios from 'axios';

const REVIEW_API_BASE_URL = `${process.env.REACT_APP_BACKEND_API_URL}/review`;

class ReviewService {

    postReview(review) {
        return axios.post(REVIEW_API_BASE_URL + "/upload-review", 
            review,
            {
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        );
    }

    getReview(accountId, recipeId) {
        return axios.get(`${REVIEW_API_BASE_URL}/get-review?accountId=${accountId}&recipeId=${recipeId}`);
    }

    findReviews(recipeId) {
        return axios.get(`${REVIEW_API_BASE_URL}/find-reviews?id=${recipeId}`);
    }

    deleteReview(accountId, recipeId) {
        return axios.delete(REVIEW_API_BASE_URL + "/delete-review", 
            { 
                data: { 
                    accountId: accountId,
                    recipeId: recipeId
                },
                headers: {
                    authorization: "bearer " + localStorage.getItem("accessToken")
                }
            }
        );
    }
}

export default new ReviewService();