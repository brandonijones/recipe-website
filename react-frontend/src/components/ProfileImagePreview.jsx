import { React, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

function ProfileImagePreview(props) {
    const [preview, setPreview] = useState(null);

    const reader = new FileReader();
    reader.readAsDataURL(props.file);
    reader.onload = () => {
        setPreview(reader.result);
    }

    return (
        <div>
            { preview ? 
                <img className='img-fluid edit-profile-img' src={preview} alt="preview" /> : 
                <p className='m-3' >loading...</p> }
        </div>
    );
}

export default ProfileImagePreview;