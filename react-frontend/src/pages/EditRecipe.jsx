import { React, useEffect, useState, useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import CloudinaryService from '../services/CloudinaryService';
import RecipeService from '../services/RecipeService';
import { useNavigate, useParams } from 'react-router';
import { Formik, Form, Field, FieldArray, getIn } from 'formik';
import * as Yup from 'yup';

import Loading from '../components/Loading';
import CropRecipeImageModal from '../components/crop/CropRecipeImageModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'react-bootstrap';

function EditRecipe() {

    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const { recipeId } = useParams();
    const [originalRecipe, setOriginalRecipe] = useState({});
    const [originalIngredients, setOriginalIngredients] = useState([]);
    const [originalDirections, setOriginalDirections] = useState([]);
    const [originalTags, setOriginalTags] = useState([]);
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
    const [initialValues, setInitialValues] = useState({
        title: "",
        imageURL: "",
        description: "",
        ingredients: [{ item: "" }],
        directions: [{ description: "" }],
        tags: [{ name: "" }],
        file: null
    })

    useEffect(() => {
        
        console.log(recipeId)
        console.log(authState);
        setIsLoading(true);

        if (authState.status === true) {
            RecipeService.findRecipeById(recipeId).then((response) => {
                let recipeValues = response.data;
                console.log(recipeValues);
                if (recipeValues) {
                    setOriginalRecipe(recipeValues);
                    setImageURL(recipeValues.imageURL);
                    setInitialValues(previousState => {
                        return {...previousState, 
                            title: recipeValues.title,
                            imageURL: recipeValues.imageURL,
                            description: recipeValues.description
                        }
                    });
                }
                if (recipeValues.account.id !== authState.id) {
                    navigate("*");
                }
                setIsLoading(false);
            });

            RecipeService.findIngredients(recipeId).then((response) => {
                let ingredients = response.data;
                setOriginalIngredients(ingredients);
                setInitialValues(previousState => {
                    return {...previousState,
                        ingredients: ingredients
                    }
                });
            });

            RecipeService.findDirections(recipeId).then((response) => {
                let directions = response.data;
                setOriginalDirections(directions);
                setInitialValues(previousState => {
                    return {...previousState,
                        directions: directions
                    }
                });
            });

            RecipeService.findTags(recipeId).then((response) => {
                let tags = response.data;
                if (tags.length > 0) {
                    setOriginalTags(tags);
                    setInitialValues(previousState => {
                        return {...previousState,
                            tags: tags
                        }
                    });
                }
                
            });
        }

        if (authState.status === false) {
            navigate("*");
        }
    }, [authState, navigate, recipeId]);

    const saveChanges = (formValues) => {
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

            CloudinaryService.uploadImage(cloudinaryRecipeImageRequest).then((response) => {
                console.log(response.data);

                const recipeURL = response.data.secure_url;
                let recipeUploadValues = {...formValues, 
                    imageURL: recipeURL, 
                    recipeId: recipeId
                }

                updateRecipe(recipeUploadValues); 
            });
        } else {
            let recipeUploadValues = {...formValues,
                imageURL: imageURL,
                recipeId: recipeId 
            }

            updateRecipe(recipeUploadValues);   
        }
    }

    const updateRecipe = (recipeValues) => {

        RecipeService.editRecipe(recipeValues).then((response) => {
            setIsLoading(false);
            cancelRecipeImageUpdate();
            setShowSuccessModal(true);

            setImageURL(recipeValues.imageURL);
            setInitialValues({...initialValues,
                title: recipeValues.title,
                imageURL: recipeValues.imageURL,
                description: recipeValues.description,
                ingredients: recipeValues.ingredients,
                directions: recipeValues.directions,
                tags: recipeValues.tags,
                file: null
            });
        })
    } 

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
        ).min(1, "Please provide at least one tag."),
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
    });

    const resetRecipeImage = () => {
        setImageURL(DEFAULT_RECIPE_IMAGE_URL);
        setShowFileUpload(false);
        setSelectedFile(null);
    }

    const cancelRecipeImageUpdate = () => {
        setSelectedFile(null);
        setImageURL(originalRecipe.imageURL);
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
                <div className='border container-sm my-5 main-forms'>
                    <Formik
                        enableReinitialize={true}
                        onSubmit={saveChanges}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                    >
                        {({ errors, touched, values, setFieldValue }) => (
                            <Form className='mx-md-5'>
                                <h3 className='my-3 text-center' >Edit Recipe</h3>

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
                                    <p className='my-3 edit-pfp-link text-center' onClick={() => setShowFileUpload(true)}>Edit image</p> :
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
                                        <div className='my-3 text-center' >
                                            <p className='text-danger remove-pfp-link' onClick={resetRecipeImage}>Remove image</p>
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
                                            placeholder='Write a description (try to include serving sizes)'
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
                                                                { (ingredients.length > 1 && index !== 0) && 
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
                                                                { (directions.length > 1 && index !== 0) && 
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

                                                                    { (tags.length > 1 && index !== 0) && 
                                                                        <FontAwesomeIcon 
                                                                            onClick={() => arrayHelpers.remove(index)} 
                                                                            icon={faCircleMinus}
                                                                            className='add-minus-button mt-2'
                                                                        />
                                                                    }
                                                                    
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
                            <p className='text-center my-auto'>Recipe successfully updated!</p> 
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

export default EditRecipe;