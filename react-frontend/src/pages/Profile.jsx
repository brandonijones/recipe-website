import React, { useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';

function Profile() {

    const { authState } = useContext(AuthContext);

    return (
        <div>
            <h1>Profile Page</h1>
            { authState.status && <h2>Hello { authState.username }!</h2>}
            
        </div>
    );
}

export default Profile;