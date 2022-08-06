import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Loading from '../components/Loading';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import ProfileInfo from '../components/ProfileInfo';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [currentProfile, setCurrentProfile] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [recipeCount, setRecipeCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        // using the username from the parameters
        let request = { username: username }

        setIsLoading(true);

        AccountService.findUsername(request).then((response) => {
            console.log(response.data);
            if (response.data) {
                let profile = {
                    id: response.data.id,
                    username: response.data.username,
                    name: response.data.name,
                    profilePicture: response.data.profilePicture,
                    bio: response.data.bio
                }

                setCurrentProfile(profile);
                setIsLoading(false);
            } else {
                navigate("404");
            }
        });

    }, []);

    return (
        <div>
            { isLoading ? 
                <Loading /> :
                <div className='my-5 container' style={{"maxWidth": "70rem"}}>
                    <ProfileInfo currentProfile={currentProfile} />

                    <hr />

                    <div className='row gx-5 text-center'>
                        <div className='col-md-4'>
                            <span>{recipeCount} recipes</span>
                        </div>
                        <div className='col-md-4'>
                            <span>{followerCount} followers</span>
                        </div>
                        <div className='col-md-4'>
                            <span>{followingCount} following</span>
                        </div>  
                    </div>
                    
                    <hr />
                </div>
            }
        </div>
    );
}

export default Profile;