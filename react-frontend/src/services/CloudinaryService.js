import axios from 'axios';

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dxgfugkbb/image/upload";

class CloudinaryService {

    uploadImage(request) {
        return axios.post(CLOUDINARY_UPLOAD_URL, request);
    }
}

export default new CloudinaryService();