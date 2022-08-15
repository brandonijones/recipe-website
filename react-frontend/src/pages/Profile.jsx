import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Loading from '../components/Loading';
import AccountService from '../services/AccountService';
import ProfileInfo from '../components/ProfileInfo';
import ProfileRecipes from '../components/ProfileRecipes';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [currentProfile, setCurrentProfile] = useState({});
    

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

                    {/* <ProfileStats profileId={currentProfile.id} /> */}
                    
                    {/* <hr /> */}

                    <ProfileRecipes currentProfile={currentProfile} />
                </div>
            }
        </div>
    );
}

export default Profile;