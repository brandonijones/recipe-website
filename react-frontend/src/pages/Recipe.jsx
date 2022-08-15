import { React, useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router';
import RecipeService from '../services/RecipeService';
import AccountService from '../services/AccountService';
import Loading from '../components/Loading';
import { AuthContext } from '../helpers/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import Modal from 'react-bootstrap/Modal';

function Recipe() {
    
    const { username, recipeId } = useParams(); 
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [recipe, setRecipe] = useState({});
    const [ingredients, setIngredients] = useState([]);
    const [directions, setDirections] = useState([]);
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {

        console.log(username);
        console.log(recipeId);

        RecipeService.findRecipeById(recipeId).then((response) => {
            console.log(response.data);
            if (response.data) {
                setRecipe(response.data);

                checkUsername(response.data);

            } else {
                navigate("404");
            }
        })
    }, []);

    const checkUsername = (recipeValues) => {
        AccountService.findUsername({ username: username }).then((response) => {
            let account = response.data;
            console.log(recipeValues);
            if (account.id === recipeValues.account.id) {
                findIngredients();
                findDirections();
                findTags();
                setIsLoading(false);
            } else {
                navigate("404");
            }
        });
    }

    const findIngredients = () => {
        RecipeService.findIngredients(recipeId).then((response) => {
            setIngredients(response.data);
        });
    }

    const findDirections = () => {
        RecipeService.findDirections(recipeId).then((response) => {
            setDirections(response.data);
        });
    }

    const findTags = () => {
        RecipeService.findTags(recipeId).then((response) => {
            if (response.data) {
                setTags(response.data);
            }  
        });
    }

    const deleteRecipe = () => {
        RecipeService.deleteRecipe(recipeId).then((response) => {
            setShowDeleteModal(false);
            setShowSuccessModal(true);
        });
    }

    return (
        <div>
            { isLoading ? 
                <Loading /> : 
                <div className='my-5 container border' style={{"maxWidth": "45rem"}}>
                    <div className='m-4'>
                        <div className='text-center'>
                            <img className='img-fluid' src={recipe.imageURL} alt={recipe.title} />
                        </div>

                        <h2 className='mt-3' >{recipe.title}</h2>
                        <p>posted by <a href={`/profile/${username}`}>{username}</a></p>
                        <p> {recipe.description} </p>

                        <h4>Ingredients</h4>
                        <ul>
                            {ingredients.map((ingredient, index) => {
                                return (
                                    <li key={index} >{ingredient.item}</li>
                                );
                            })}
                        </ul>

                        <h4>Directions</h4>
                        <ol>
                            {directions.map((direction, index) => {
                                return (
                                    <li key={index} >{direction.description}</li>
                                );
                            })}
                        </ol>
                    </div>
                    { tags.length > 0 &&
                        <div className='mx-4'>
                            <hr />
                            <span> <strong>Tags: </strong> </span>
                            {tags.map((tag, index) => {
                                return (
                                    <span className='border p-2 mx-1' key={index} >{tag.name}</span>
                                );
                            })}
                        </div>
                    }
                    { authState.username === username && 
                        <div className='mx-4'>
                            <hr />
                            <p className='text-center' style={{"cursor": "pointer"}} onClick={() => setShowDeleteModal(true)} >Delete recipe? <FontAwesomeIcon icon={faTrash} /></p> 
                        </div>
                    }
                </div>
            }

            <Modal 
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this recipe?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-danger' onClick={deleteRecipe}>Confirm</button>
                    <button className='btn btn-secondary' onClick={() => setShowDeleteModal(false)}>Cancel</button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showSuccessModal}
                onHide={() => {
                    setShowSuccessModal(false);
                    navigate("/profile/" + username);
                }}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p>Recipe successfully deleted!</p>
                </Modal.Body>
            </Modal>
            
        </div>
    );
}

export default Recipe;