import { React, useCallback, useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AccountService from '../services/AccountService';
import axios from "axios";
import Cropper from 'react-easy-crop';
import CropModal from './crop/CropModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';

function EditProfile(props) {
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(props.currentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [imageURL, setImageURL] = useState(props.currentUser.profilePicture);
    const [selectedFile, setSelectedFile] = useState(0);
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

    const DEFAULT_PROFILE_PICTURE = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1657138912/recipe_website/profile_images/default_profile_picture.png";
    const [isDefaltImage, setIsDefaultImage] = useState(true);

    const [charactersLeft, setCharactersLeft] = useState(150);
    const MAX_COUNT = 250;

    useEffect(() => {
        checkInitialBio();
    }, []);

    const checkInitialBio = () => {
        if (currentUser.bio) {
            let bio = currentUser.bio;
            
            setCharactersLeft(MAX_COUNT - bio.length);
        }
    }
    
    // Necessary for when user removes profile picture, restoring to default profile picture
    useEffect(() => {
        if (imageURL !== DEFAULT_PROFILE_PICTURE) {
            setIsDefaultImage(false);
        } else {
            setImageURL(DEFAULT_PROFILE_PICTURE);
            setIsDefaultImage(true);
        }

        console.log("use effect is being called.");
    }, [imageURL]);

    const initialValues = {
        name: currentUser.name,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        bio: currentUser.bio,
        file: null
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().max(30, "Too long! Maximum 30 characters").required("A display name is required."),
        username: Yup.string().max(30, "Too long! Maximum 30 characters").required("Username is required").matches(/^[A-Za-z0-9_]+$/, "Username cannot contain special characters or white spaces"),
        bio: Yup.string().max(250, "Too long! Maximum 250 characters.").nullable(),
        file: Yup
            .mixed()
            .nullable()
            .test("FILE_SIZE", "The file is too large. Should be no more than 2MB", 
            (value) => {
                return !value || (value && value.size <= 2000000)
            })
            .test("FILE_FORMAT", "Uploaded file has unsupported format.",
            (value) => {
                return !value || (value && SUPPORTED_FORMATS.includes(value?.type))
            })
    });

    const saveChanges = (formData) => {
        setIsLoading(true);
        setShowSuccessModal(false);
        console.log(formData);

        const cloudinaryRequest = new FormData();

        if (selectedFile) {
            cloudinaryRequest.append("file", selectedFile);
            cloudinaryRequest.append("upload_preset", "recipe_website_preset");
            cloudinaryRequest.append("folder", "recipe_website/profile_images");
            axios.post("https://api.cloudinary.com/v1_1/dxgfugkbb/image/upload", cloudinaryRequest).then((response) => {
                console.log(response.data);
                
                const newURL = response.data.secure_url;
                let updatedProfile = {...formData, profilePicture: newURL, id: currentUser.id};
                setCurrentUser(previousState => {
                    return { ...previousState, profilePicture: newURL }
                });
                setImageURL(newURL);
                console.log(updatedProfile);
                

                updateProfile(updatedProfile);
            });
        } else {
            let updatedProfile = {...formData, profilePicture: imageURL, id: currentUser.id};
            console.log(updatedProfile);
            
            updateProfile(updatedProfile);
        }
        
        console.log(formData);

        
    }

    const updateProfile = (updatedProfile) => {
        
        AccountService.editProfile(updatedProfile).then((response) => {
            
            if (!response.data.error) {
                let newAccessToken = response.data.accessToken;
                let user = response.data.user;

                localStorage.setItem("accessToken", newAccessToken);

                props.setCurrentUser({...props.currentUser, 
                    name: user.name,
                    username: user.username,
                    bio: user.bio,
                    profilePicture: user.profilePicture
                });

                setShowSuccessModal(true);
            } else {
                setShowSuccessModal(false);
            }
            setShowFileUpload(false);
            setIsLoading(false);
        });
    }

    const validateUsername = (value) => {

        AccountService.findUsername({ username: value }).then((response) => {

            console.log(response.data);
            let account = response.data;

            if (account && account.username !== currentUser.username) {
                setUsernameTaken(true);
            } else {
                setUsernameTaken(false);
            }
        });

        let error;
        if (usernameTaken) {
            error = "Username is already taken!";
        }
        return error;
    }

    const resetProfilePicture = () => {
        setImageURL(DEFAULT_PROFILE_PICTURE);
        setShowFileUpload(false);
    }

    const countCharactersLeft = (value) => {
        console.log(value);
        const charsLeft = MAX_COUNT - value.length;
        setCharactersLeft(charsLeft);
    }

    const cancelProfilePictureUpdate = () => {
        setSelectedFile(null);
        setImageURL(currentUser.profilePicture);
        setShowFileUpload(false);
        checkInitialBio();
        
    }

    return (
        <div>
            
            <Formik
                initialValues={initialValues}
                onSubmit={saveChanges}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating, values, setFieldValue }) => (
                    <Form className='mx-md-5' >
                        <div className='my-4 text-center' >
                             
                            { showCropModal ? 
                                <Modal show={showCropModal} backdrop="static" keyboard={false} >
                                    <Modal.Body>
                                        <CropModal 
                                            currentUser={props.currentUser}
                                            file={selectedFile} 
                                            setSelectedFile={setSelectedFile} 
                                            photoURL={imageURL} 
                                            setImageURL={setImageURL}
                                            setShowCropModal={setShowCropModal}
                                        />
                                    </Modal.Body>  
                                </Modal> :
                                <img 
                                    className='img-fluid edit-profile-img' 
                                    src={ (selectedFile || isDefaltImage) ? imageURL : currentUser.profilePicture }
                                    alt="Profile"
                                />
                            }
                            
                            { !showFileUpload ? 
                                <p className='my-3 edit-profile-link ' onClick={() => setShowFileUpload(true)}>Change profile picture</p> :
                                <div className='row my-3'>
                                    <div className='col-10' >
                                        <input
                                            type="file" 
                                            className="form-control"
                                            onChange={(event) => {
                                                setFieldValue("file", event.target.files[0]);
                                                setSelectedFile(event.target.files[0]);
                                                setImageURL(URL.createObjectURL(event.target.files[0]));
                                                setShowCropModal(true);
                                            }}
                                        />
                                    </div>
                                    <div 
                                        className='col-2 my-auto fs-6 text-center file-close' 
                                        onClick={cancelProfilePictureUpdate}
                                    >
                                        <span className='me-2'>Cancel</span>
                                        <FontAwesomeIcon 
                                            icon={ faCircleXmark }   
                                        />
                                    </div>
                                    {errors.file && <div className='text-danger'>{errors.file}</div>}
                                    <div className='my-3 text-center' >
                                        <p className='text-danger remove-pfp-link' onClick={resetProfilePicture}>Remove profile picture</p>
                                    </div>
                                </div> 
                            }
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Name:</label>
                            <div className='col-sm-10'>
                                <Field name='name' className='form-control' placeholder='John Doe'/>
                            </div>
                            {errors.name && touched.name && <div className='text-danger'>{errors.name}</div>}
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Username:</label>
                            <div className='col-sm-10'>
                                <Field validate={validateUsername} name="username" className='form-control' placeholder='John Doe'/>
                                {errors.username && touched.username && <div className='text-danger'>{errors.username}</div>}
                            </div>
                            
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Bio:</label>
                            <div className='col-sm-10'>
                                <Field
                                    as='textarea'
                                    rows={8} 
                                    name='bio' 
                                    className='form-control' 
                                    onChange={(e) => {
                                        setFieldValue('bio', e.target.value)
                                        countCharactersLeft(e.target.value)
                                    }}
                                    placeholder='Say something about yourself (250 characters max).'/>
                                <p className={(charactersLeft < 0) && 'text-danger'} >{charactersLeft} characters left</p>
                                {errors.bio && touched.bio && <div className='text-danger'>{errors.bio}</div>}
                            </div>
                        </div>
                        <div className='my-3' >
                            <button type='submit' className='btn btn-primary me-1'>Save changes</button>
                            <button 
                                type='reset' 
                                className='btn btn-secondary ms-1' 
                                onClick={() => {
                                    cancelProfilePictureUpdate();
                                    setShowCancelModal(true);
                                }}
                            >Cancel</button>
                            { isLoading && <span>loading...</span> }
                            
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Modal for saving changes */}
            <Modal 
                show={showSuccessModal} 
                onHide={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                }}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p className='text-center my-auto'>Profile successfully updated!</p> 
                </Modal.Body> 
            </Modal>

            {/* Modal for reverting back to initial values */}
            <Modal
                show={showCancelModal}
                onHide={() => setShowCancelModal(false)}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p className='text-center my-auto'>Successfully discarded changes.</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default EditProfile;