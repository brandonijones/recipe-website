import { React, useEffect, useState, useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import { useNavigate } from 'react-router';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

import Loading from '../components/Loading';
import CropRecipeImageModal from '../components/crop/CropRecipeImageModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'react-bootstrap';

function NewPost() {

    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [showCropModal, setShowCropModal] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState(0);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
    const DEFAULT_RECIPE_IMAGE_URL = "https://res.cloudinary.com/dxgfugkbb/image/upload/v1660010858/recipe_website/recipe_images/default_recipe_image.png";
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
                item: Yup.string().required("Ingredient required.")
            })
        ).min(1, "Please provide at least one ingredient."),
        directions: Yup.array().of(
            Yup.object().shape({
                description: Yup.string().required("Direction required.")
            })
        ).min(1, "Please provide at least one direction."),
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
    })

    const postRecipe = (formValues) => {
        console.log("New recipe uploaded!")
        console.log(formValues);
    }

    const initialValues = {
        title: "",
        description: "",
        ingredients: [{ item: "" }],
        directions: [{ description: "" }],
        file: null
    }

    const cancelRecipeImageUpdate = () => {
        setSelectedFile(null);
        setImageURL(DEFAULT_RECIPE_IMAGE_URL);
        setShowFileUpload(false);
    }

    return (
        <div>
            { isLoading ?
                <Loading /> :
                <div className='border container-sm my-5' style={{"maxWidth": "50rem"}}>
                    <Formik
                        onSubmit={postRecipe}
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
                                                                    placeholder="Ex: 1 tsp salt..."
                                                                />
                                                            </div>
                                                            <div className='col-sm-1'>
                                                                { (ingredients.length > 1 && index !== 0) && 
                                                                    <button 
                                                                        type='button' 
                                                                        className='btn btn-danger'
                                                                        onClick={() => arrayHelpers.remove(index)}
                                                                    >-</button>
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
                                                >Add ingredient</button>
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
                                                            </div>
                                                            <div className='col-sm-1'>
                                                                { (directions.length > 1 && index !== 0) && 
                                                                    <button 
                                                                        type='button' 
                                                                        className='btn btn-danger'
                                                                        onClick={() => arrayHelpers.remove(index)}
                                                                    >-</button>
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
                                                >Add step</button>
                                            </div>
                                        )
                                    }}
                                />
                                <br />

                                <div className='my-3' >
                                    <button type='submit' className='btn btn-primary me-1'>Post</button>
                                    <button type='reset' className='btn btn-secondary ms-1'>Cancel</button>
                                    { isLoading && <span className='ms-3'>loading...</span>  }
                                </div>
                            </Form>
                        )}

                    </Formik>
                </div>
            }
        </div>
        
    );
}

export default NewPost;