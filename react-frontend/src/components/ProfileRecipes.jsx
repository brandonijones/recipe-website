import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import RecipeService from '../services/RecipeService';
import Rating from '@mui/material/Rating';

function ProfileRecipes(props) {

    const navigate = useNavigate();
    const profileId = props.currentProfile.id;
    const profileUsername = props.currentProfile.username;
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        RecipeService.findRecipesByAccount(profileId).then((response) => {
            console.log(response.data);
            setRecipes(response.data);
        });
    }, []);

    const goToRecipe = (username, recipeId) => {
        navigate(`/recipe/${username}/${recipeId}`);
    }

    return (
        <div>
            <h3 className='text-center my-3' >Recipes</h3>
            <p className='text-center'>({recipes.length} total)</p>
            <div className='row g-3'>
                {recipes.length > 0 ? 
                    <>
                        {recipes.map((recipe, index) => {
                            return (
                                <div className='col-sm-6 col-md-4' key={index} >
                                    <div className='card recipe-card h-100' onClick={() => goToRecipe(profileUsername, recipe.id)}>
                                        <img src={recipe.imageURL} alt={recipe.title} className='card-img-top' />
                                        <div className='card-body'>
                                            <div className='d-flex align-items-center mb-2'>
                                                <Rating 
                                                    name='read-only'
                                                    value={recipe.averageRating}
                                                    precision={0.1}
                                                    readOnly
                                                />
                                                { recipe.averageRating !== null ?
                                                    <span className='ms-2'>({`${recipe.averageRating}/5`})</span> :
                                                    <span className='ms-2'>(no reviews yet)</span>
                                                }
                                            </div>
                                            <h5 className='card-title'>{recipe.title}</h5>
                                            <p>{recipe.description.substring(0, 50) + "..."}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })} 
                    </> :
                    <p className='text-center my-3' >No recipes posted yet</p>
                }
            </div>

        </div>
    );
}

export default ProfileRecipes;