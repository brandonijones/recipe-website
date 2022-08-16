import { React } from 'react';
import { useNavigate } from 'react-router';
import Rating from '@mui/material/Rating';

function RecipeCard(props) {
    const navigate = useNavigate();
    const recipe = props.recipe;
    const index = props.index;

    const goToRecipe = (username, recipeId) => {
        navigate(`/recipe/${username}/${recipeId}`);
    }

    return (
        <div className='col-sm-6 col-md-4' key={index} >
            <div className='card recipe-card h-100' onClick={() => goToRecipe(recipe.account.username, recipe.id)}>
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
}

export default RecipeCard;