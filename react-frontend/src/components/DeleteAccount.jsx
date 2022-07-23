import { React, useContext } from 'react';
import AccountService from '../services/AccountService';
import { AuthContext } from '../helpers/AuthContext';

function DeleteAccount() {

    const { authState, setAuthState } = useContext(AuthContext);

    return (
        <div>
            <h1>Delete Account</h1>
        </div>
    );
}

export default DeleteAccount;