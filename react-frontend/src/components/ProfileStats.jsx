import { React, useState, useEffect } from 'react';
import RecipeService from '../services/RecipeService';

function ProfileStats(props) {
    const profileId = props.profileId;
    const [recipeCount, setRecipeCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0); 

    useEffect(() => {
        RecipeService.findRecipesByAccount(profileId).then((response) => {
            console.log(response.data);
            const recipes = response.data;
            setRecipeCount(recipes.length);
        });
    }, []);

    return (
        <div className='row gx-5 text-center'>
            <div className='col'>
                <span>{recipeCount} recipes</span>
            </div>
            {/* <div className='col-md-4'>
                <span>{followerCount} followers</span>
            </div>
            <div className='col-md-4'>
                <span>{followingCount} following</span>
            </div>   */}
        </div>
    );
}

export default ProfileStats;