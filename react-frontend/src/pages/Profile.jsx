import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../helpers/AuthContext';

function Profile() {
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    
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

    return (
        <div>
            { isLoading ? 
                <div>
                    <h1>Loading...</h1>
                </div> :
                <div>
                    <h1>Profile Page</h1>
                    { authState.status && <h2>Hello { authState.username }!</h2>}
                </div>
            }   
        </div>
    );
}

export default Profile;