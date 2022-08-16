import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import RecipeService from '../services/RecipeService';
import Rating from '@mui/material/Rating';
import RecipeCard from './RecipeCard';

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
                                <RecipeCard recipe={recipe} index={index} />
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