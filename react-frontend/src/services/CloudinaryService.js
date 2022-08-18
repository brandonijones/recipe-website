import axios from 'axios';

const CLOUDINARY_UPLOAD_URL = process.env.REACT_APP_CLOUDINARY_API_URL;

class CloudinaryService {

    uploadImage(request) {
        return axios.post(CLOUDINARY_UPLOAD_URL, request);
    }
}

export default new CloudinaryService();