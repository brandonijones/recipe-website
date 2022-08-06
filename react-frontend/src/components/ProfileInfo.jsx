import  { React, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../helpers/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

function ProfileInfo(props) {
    const currentProfile = props.currentProfile;
    const { authState } = useContext(AuthContext);
    const [formattedBio, setFormattedBio] = useState([]);

    useEffect(() => {
        let bio = currentProfile.bio;
        if (bio !== null) {
            let bioArray = bio.split("\n");
            setFormattedBio(bioArray);
        }
        
    }, []);

    return (
        <div className='row gx-5' >
            <div className='col-4 text-center' >
                <img className='profile-picture' src={currentProfile.profilePicture} alt={currentProfile.username + "'s profile picture"} />
            </div>
            <div className='col' >
                <div className='row d-flex align-items-center mb-3 gy-2' >
                    <div className='col-md-6' >
                        <h2> {currentProfile.name} </h2>    
                    </div>
                    {
                        (authState.status && authState.id === currentProfile.id) && 
                        <div className='col-md-6' >
                            <span className='edit-profile-link border py-2'>
                                <a className='ms-2' href='/account/settings'>Edit profile</a>
                                <FontAwesomeIcon className='mx-2' icon={faGear} />
                            </span>
                        </div>
                    }   
                </div>
                <div className='row' >
                    <div className='col'>
                        <h5> @{currentProfile.username} </h5>
                        
                        { formattedBio !== null ? 
                            formattedBio.map((line) => {
                                if (line === '') {
                                    return <br />
                                } else {
                                    return <p className='mb-0'>{line}</p>
                                }   
                            }) :
                            <p>{ currentProfile.bio }</p>
                        }
                        
                    </div>   
                </div>
            </div>    
        </div>
    );
}

export default ProfileInfo;