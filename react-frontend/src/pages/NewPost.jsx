import { React, useEffect, useState, useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import RecipeService from '../services/RecipeService';
import { useNavigate } from 'react-router';
import { Formik, Form, Field, FieldArray, getIn } from 'formik';
import * as Yup from 'yup';
import axios from "axios";

import Loading from '../components/Loading';
import CropRecipeImageModal from '../components/crop/CropRecipeImageModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'react-bootstrap';

function NewPost() {

    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [showCropModal, setShowCropModal] = useState(false);
    const tagExamples = ["breakfast", "lunch", "dinner", "quick", "drink", "holiday", "dessert", "vegan", "healthy"];
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
    const DEFAULT_RECIPE_IMAGE_URL = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1660331856/recipe_website/recipe_images/default_recipe_image.png";
    const [imageURL, setImageURL] = useState(DEFAULT_RECIPE_IMAGE_URL);


    // User has to be logged in to access this page
    useEffect(() => {
        console.log("authState status is " + authState.status);
        console.log("authState id is " + authState.id);
        
        if (authState.status === 'undefined') {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }

        if (authState.status === false) {
            navigate("/login");
        }

    }, [authState, navigate]);

    const validationSchema = Yup.object().shape({
        title: Yup.string().max(255, "Too long! Maximum 255 characters.").required("Please give recipe a title."),
        description: Yup.string().max(500, "Too long! Maximum 500 characters.").required("Please provide a short description of the recipe."),
        ingredients: Yup.array().of(
            Yup.object().shape({
                item: Yup.string().max(255, "Too long! Maximum 255 characters").required("Please add this ingredient or remove.")
            })
        ).min(1, "Please provide at least one ingredient."),
        directions: Yup.array().of(
            Yup.object().shape({
                description: Yup.string().max(500, "Too long! Maximum 500 characters").required("Please add this direction or remove.")
            })
        ).min(1, "Please provide at least one direction."),
        tags: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().max(255, "Too long! Maximum 255 characters").required("Please add a tag or remove").matches(/^[A-Za-z0-9_]+$/, "Tag cannot contain special characters or white spaces.")
            })
        ),
        file: Yup
            .mixed()
            .nullable()
            .test("FILE_SIZE", "The file is too large. Should be no more than 5MB.", 
            (value) => {
                return !value || (value && value.size <= 5000000)
            })
            .test("FILE_FORMAT", "Uploaded file has unsupported format.",
            (value) => {
                return !value || (value && SUPPORTED_FORMATS.includes(value?.type))
            })
    })

    const submitForm = (formValues) => {
        console.log("New recipe uploaded!")
        console.log(formValues);
        console.log(selectedFile);

        setIsLoading(true);
        setShowSuccessModal(false);

        const cloudinaryRecipeImageRequest = new FormData();
        
        if (selectedFile) {
            cloudinaryRecipeImageRequest.append("file", selectedFile);
            cloudinaryRecipeImageRequest.append("upload_preset", "recipe_website_preset");
            cloudinaryRecipeImageRequest.append("folder", "recipe_website/recipe_images");

            axios.post("https://api.cloudinary.com/v1_1/dxgfugkbb/image/upload", cloudinaryRecipeImageRequest).then((response) => {
                console.log(response.data);

                const recipeURL = response.data.secure_url;
                let recipeUploadValues = {...formValues, 
                    imageURL: recipeURL, 
                    accountId: authState.id 
                }

                postRecipe(recipeUploadValues); 
            });
        } else {
            let recipeUploadValues = {...formValues, 
                imageURL: DEFAULT_RECIPE_IMAGE_URL, 
                accountId: authState.id 
            }

            postRecipe(recipeUploadValues);   
        }
    }

    const postRecipe = (recipeUploadValues) => {

        RecipeService.postRecipe(recipeUploadValues).then((response) => {
            setIsLoading(false);
            cancelRecipeImageUpdate();
            setShowSuccessModal(true);
        });
    }

    const initialValues = {
        title: "",
        description: "",
        ingredients: [{ item: "" }],
        directions: [{ description: "" }],
        tags: [],
        file: null
    }

    const cancelRecipeImageUpdate = () => {
        setSelectedFile(null);
        setImageURL(DEFAULT_RECIPE_IMAGE_URL);
        setShowFileUpload(false);
    }

    const ErrorMessage = ({ name }) => (
        <Field 
            name={name}
            render={({ form }) =>{
                const error = getIn(form.errors, name);
                const touch = getIn(form.touched, name);
                return touch && error ?  <div className='text-danger'>{ error }</div> : null;
            }}
        />
    );

    return (
        <div>
            { isLoading ?
                <Loading /> :
                <div className='border container-sm my-5' style={{"maxWidth": "50rem"}}>
                    <Formik
                        onSubmit={submitForm}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                    >
                        {({ errors, touched, values, setFieldValue }) => (
                            <Form className='mx-md-5'>
                                <h3 className='my-3 text-center' >Create a new post</h3>

                                {/* TODO insert file upload */}
                                { showCropModal ?
                                    <Modal show={showCropModal} backdrop='static' keyboard={false} >
                                        <Modal.Body>
                                            <CropRecipeImageModal 
                                                defaultImageURL={DEFAULT_RECIPE_IMAGE_URL}
                                                file={selectedFile}
                                                setSelectedFile={setSelectedFile}
                                                photoURL={imageURL}
                                                setImageURL={setImageURL}
                                                setShowCropModal={setShowCropModal}
                                                cancelRecipeImageUpdate={cancelRecipeImageUpdate}
                                            />
                                        </Modal.Body>
                                    </Modal> :
                                    <div className='my-4 text-center' >
                                        <img 
                                            className='img-fluid border' 
                                            style={{width: "25rem"}} 
                                            src={imageURL} alt="Recipe" />
                                    </div>
                                }
                                
                                {!showFileUpload ?
                                    <p className='my-3 edit-pfp-link text-center' onClick={() => setShowFileUpload(true)}>Add image</p> :
                                    <div className='row my-3'>
                                        <div className='col-10'>
                                            <input 
                                                type="file"
                                                className='form-control'
                                                onChange={(event) => {
                                                    setFieldValue("file", event.target.files[0]);
                                                    setSelectedFile(event.target.files[0]);
                                                    setImageURL(URL.createObjectURL(event.target.files[0]));
                                                    setShowCropModal(true);
                                                }}
                                            />
                                            <ErrorMessage name='file' />
                                        </div>
                                        <div
                                            className='col-2 my-auto fs-6 text-center file-close'
                                            onClick={() => {
                                                cancelRecipeImageUpdate();
                                            }}
                                        >
                                            <span className='me-2'>Cancel</span>
                                            <FontAwesomeIcon icon={ faCircleXmark } />
                                        </div>
                                    </div>
                                }
                                <div className='my-2 row'>
                                    <label className='col-form-label col-sm-2'>Title:</label>
                                    <div className='col-sm-10'>
                                        <Field name='title' className='form-control' placeholder='Name the recipe' />
                                        <ErrorMessage name='title' />
                                    </div>
                                </div>

                                <div className='my-2 row'>
                                    <label className='col-form-label col-sm-2'>Description:</label>
                                    <div className='col-sm-10'>
                                        <Field 
                                            as='textarea' 
                                            rows={6} 
                                            name='description' 
                                            className='form-control'
                                            placeholder='Write a description'
                                        />
                                        <ErrorMessage name='description' />
                                    </div>
                                </div>
                                
                                <hr />
                                <h4>Ingredients</h4>
                                <FieldArray 
                                    name='ingredients'
                                    render={arrayHelpers => {
                                        const ingredients = values.ingredients;
                                        return (
                                            <div>
                                                { ingredients && ingredients.length > 0
                                                    ? ingredients.map((ingredient, index) => (
                                                        <div className='my-2 row' key={index}>
                                                            <label className='col-form-label col-sm-3'>{`Ingredient #${index + 1}` }</label>
                                                            <div className='col-sm-8'>
                                                                <Field 
                                                                    name={`ingredients.${index}.item`} 
                                                                    className='form-control'
                                                                    placeholder="Ex: 1 tbs salt..."
                                                                />
                                                                <ErrorMessage name={`ingredients.${index}.item`} />
                                                            </div>
                                                            <div className='col-sm-1 my-auto'>
                                                                { (values.ingredients.length > 1 && index !== 0) && 
                                                                    <FontAwesomeIcon 
                                                                        onClick={() => arrayHelpers.remove(index)} 
                                                                        icon={faCircleMinus}
                                                                        className='add-minus-button'
                                                                    /> 
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                    : null
                                                }
                                                <button 
                                                    type='button' 
                                                    className='btn btn-success'
                                                    onClick={() => arrayHelpers.push({ item: ""})}
                                                ><FontAwesomeIcon icon={faCirclePlus} /> Add ingredient 
                                                </button>
                                            </div>
                                        )
                                    }}
                                />

                                <hr />
                                <h4>Directions</h4>
                                <FieldArray 
                                    name='directions'
                                    render={arrayHelpers => {
                                        const directions = values.directions;
                                        return (
                                            <div>
                                                { directions && directions.length > 0
                                                    ? directions.map((direction, index) => (
                                                        <div className='my-2 row' key={index}>
                                                            <label className='col-form-label col-sm-3'>{`Step ${index + 1}:` }</label>
                                                            <div className='col-sm-8'>
                                                                <Field 
                                                                    as='textarea'
                                                                    rows={3}
                                                                    name={`directions.${index}.description`} 
                                                                    className='form-control'
                                                                    placeholder="Ex: Mix dry ingredients in a small bowl..."
                                                                />
                                                                <ErrorMessage name={`directions.${index}.description`} />
                                                            </div>
                                                            <div className='col-sm-1 my-auto'>
                                                                { (values.directions.length > 1 && index !== 0) && 
                                                                    <FontAwesomeIcon 
                                                                        onClick={() => arrayHelpers.remove(index)} 
                                                                        icon={faCircleMinus}
                                                                        className='add-minus-button'
                                                                    />  
                                                                }  
                                                            </div>
                                                        </div>
                                                    ))
                                                    : null
                                                }
                                                <button 
                                                    type='button' 
                                                    className='btn btn-success'
                                                    onClick={() => arrayHelpers.push({ description: ""})}
                                                ><FontAwesomeIcon icon={faCirclePlus} /> Add step 
                                                </button>
                                            </div>
                                        )
                                    }}
                                />
                                <br />

                                <hr />
                                <h4>Tags</h4>
                                <FieldArray 
                                    name='tags'
                                    render={arrayHelpers => {
                                        const tags = values.tags
                                        return (
                                            <div>
                                                { tags && tags.length > 0
                                                    ? <div className='row'>
                                                            { tags.map((tag, index) => (
                                                                <div className='col-sm-3 mb-3' key={index}>
                                                                    <Field 
                                                                        name={`tags.${index}.name`} 
                                                                        className='form-control'
                                                                        placeholder={`Ex: ${tagExamples[Math.floor(Math.random() * tagExamples.length)]}`}
                                                                    />

                                                                    <FontAwesomeIcon 
                                                                        onClick={() => arrayHelpers.remove(index)} 
                                                                        icon={faCircleMinus}
                                                                        className='add-minus-button mt-2'
                                                                    />
                                                                    
                                                                    <ErrorMessage name={`tags.${index}.name`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    : null
                                                }
                                                <button 
                                                    type='button' 
                                                    className='btn btn-success'
                                                    onClick={() => arrayHelpers.push({ name: ""})}
                                                ><FontAwesomeIcon icon={faCirclePlus} /> Add tag
                                                </button>
                                            </div>
                                        )
                                    }}
                                />

                                <div className='my-3' >
                                    <button type='submit' className='btn btn-primary me-1'>Post</button>
                                    <button 
                                        type='reset' 
                                        className='btn btn-secondary ms-1' 
                                        onClick={() => {
                                            cancelRecipeImageUpdate();
                                            setShowCancelModal(true);
                                        }} >Cancel</button>
                                    { isLoading && <span className='ms-3'>loading...</span>  }
                                </div>
                            </Form>
                        )}

                    </Formik>

                    {/* Modal for saving changes */}
                    <Modal 
                        show={showSuccessModal} 
                        onHide={() => setShowSuccessModal(false)}
                        size='sm'
                        centered
                    >
                        <Modal.Header closeButton></Modal.Header>
                        <Modal.Body>
                            <p className='text-center my-auto'>Recipe successfully uploaded!</p> 
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
            }
        </div>
        
    );
}

export default NewPost;