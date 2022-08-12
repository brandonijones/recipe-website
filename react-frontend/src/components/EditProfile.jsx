import { React, useEffect, useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AccountService from '../services/AccountService';
import axios from "axios";
import Cropper from 'react-easy-crop';
import CropModal from './crop/CropModal';
import { AuthContext } from '../helpers/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';

function EditProfile() {
    const { authState, setAuthState } = useContext(AuthContext);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [imageURL, setImageURL] = useState(authState.profilePicture);
    const [selectedFile, setSelectedFile] = useState(0);
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
    const [initialValues, setInitialValues] = useState({
        name: authState.name,
        username: authState.username,
        profilePicture: authState.profilePicture,
        bio: authState.bio,
        file: null
    });

    

    const DEFAULT_PROFILE_PICTURE = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1657138912/recipe_website/profile_images/default_profile_picture.png";
    const [isDefaltImage, setIsDefaultImage] = useState(true);

    const MAX_COUNT = 250;
    const [charactersLeft, setCharactersLeft] = useState(MAX_COUNT);
    

    useEffect(() => {
        checkInitialBio();
    }, [authState]);

    useEffect(() => {
        setCurrentUser(authState);
        console.log("authState values (edit profile page):");
        console.log(authState);
        setInitialValues(previousState => {
            return {...previousState, 
                name: authState.name,
                username: authState.username,
                profilePicture: authState.profilePicture,
                bio: authState.bio,
                file: null
            }
        });

    }, [authState]);

    const checkInitialBio = () => {
        if (authState.bio) {
            let bio = authState.bio;
            
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
        console.log(currentUser);

        const cloudinaryRequest = new FormData();

        if (selectedFile) {
            cloudinaryRequest.append("file", selectedFile);
            cloudinaryRequest.append("upload_preset", "recipe_website_preset");
            cloudinaryRequest.append("folder", "recipe_website/profile_images");
            axios.post("https://api.cloudinary.com/v1_1/dxgfugkbb/image/upload", cloudinaryRequest).then((response) => {
                console.log(response.data);
                
                const newURL = response.data.secure_url;
                let updatedProfile = {...currentUser, profilePicture: newURL, id: authState.id};
                setAuthState(previousState => {
                    return { ...previousState, profilePicture: newURL }
                });
                setImageURL(newURL);
                console.log(updatedProfile);
                

                updateProfile(updatedProfile);
            });
        } else {
            let updatedProfile = {...currentUser, profilePicture: imageURL, id: authState.id};
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
                console.log(user);

                localStorage.setItem("accessToken", newAccessToken);

                setAuthState({...authState, 
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

            if (account && account.username !== authState.username) {
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
        setImageURL(authState.profilePicture);
        setShowFileUpload(false);
        checkInitialBio();
        
    }

    return (
        <div>
            
            <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                onSubmit={saveChanges}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating, values, setFieldValue }) => (
                    <Form className='mx-md-5'>
                        <h3 className='my-3 text-center'>Edit Profile</h3>
                        <div className='my-4 text-center'> 
                            { showCropModal ? 
                                <Modal show={showCropModal} backdrop="static" keyboard={false} >
                                    <Modal.Body>
                                        <CropModal 
                                            currentUser={authState}
                                            file={selectedFile} 
                                            setSelectedFile={setSelectedFile} 
                                            photoURL={imageURL} 
                                            setImageURL={setImageURL}
                                            setShowCropModal={setShowCropModal}
                                            cancelProfilePictureUpdate={cancelProfilePictureUpdate}
                                        />
                                    </Modal.Body>  
                                </Modal> :
                                <img 
                                    className='img-fluid edit-profile-img' 
                                    src={ (selectedFile || isDefaltImage) ? imageURL : authState.profilePicture }
                                    alt="Profile"
                                />
                            }
                            
                            { !showFileUpload ? 
                                <p className='my-3 edit-pfp-link ' onClick={() => setShowFileUpload(true)}>Change profile picture</p> :
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
                                        <FontAwesomeIcon icon={ faCircleXmark } />
                                    </div>
                                    <ErrorMessage name='file' render={message => <div className='text-danger'>{message}</div>} />
                                    <div className='my-3 text-center' >
                                        <p className='text-danger remove-pfp-link' onClick={resetProfilePicture}>Remove profile picture</p>
                                    </div>
                                </div> 
                            }
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Name:</label>
                            <div className='col-sm-10'>
                                <Field 
                                    // value={currentUser.name} 
                                    name='name' 
                                    className='form-control' 
                                    placeholder='John Doe'
                                    onChange={(event) => {
                                        setFieldValue('name', event.target.value)
                                        setCurrentUser(previousState => {
                                            return {...previousState, name: event.target.value}
                                        });
                                    }}
                                />
                                <ErrorMessage name='name' render={message => <div className='text-danger'>{message}</div>} />
                            </div>
                            
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Username:</label>
                            <div className='col-sm-10'>
                                <Field 
                                    // value={currentUser.username} 
                                    validate={validateUsername} 
                                    name="username" 
                                    className='form-control' 
                                    placeholder='johndoe'
                                    onChange={(event) => {
                                        setFieldValue('username', event.target.value)
                                        setCurrentUser(previousState => {
                                            return {...previousState, username: event.target.value}
                                        });
                                    }}
                                />
                                <ErrorMessage name='username' render={message => <div className='text-danger'>{message}</div>} />
                            </div>
                            
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-2'>Bio:</label>
                            <div className='col-sm-10'>
                                <Field
                                    // value={currentUser.bio}
                                    as='textarea'
                                    rows={8} 
                                    name='bio' 
                                    className='form-control' 
                                    onChange={(event) => {
                                        setFieldValue('bio', event.target.value)
                                        setCurrentUser(previousState => {
                                            return {...previousState, bio: event.target.value}
                                        });
                                        countCharactersLeft(event.target.value);
                                    }}
                                    placeholder='Say something about yourself (250 characters max).'/>
                                <p className={(charactersLeft < 0) && 'text-danger'} >{charactersLeft} characters left</p>
                                <ErrorMessage name='bio' render={message => <div className='text-danger'>{message}</div>} />
                            </div>
                        </div>
                        <div className='my-3' >
                            <button type='submit' className='btn btn-primary me-1'>Save changes</button>
                            {/* onClick={() => saveChanges(values)} */}
                            <button 
                                type='reset' 
                                className='btn btn-secondary ms-1' 
                                onClick={() => {
                                    cancelProfilePictureUpdate();
                                    setShowCancelModal(true);
                                }}
                            >Cancel</button>
                            { isLoading && <span className='ms-3'>loading...</span>  }
                            
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