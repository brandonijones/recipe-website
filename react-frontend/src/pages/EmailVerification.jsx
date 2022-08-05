import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import VerifySuccess from '../components/VerifySuccess';
import VerifyFail from '../components/VerifyFail';

import AccountService from '../services/AccountService';


function EmailVerification() {
    // let { code } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const code = searchParams.get("code");
    const changeEmailCode = searchParams.get("changeEmailCode");
    const [isVerified, setIsVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        
        // User is making a new account
        if (code !== null) {
            console.log("regular code called");
            AccountService.verify(code).then((response) => {
                console.log(response.data);

                if (!response.data.error) {
                    setIsVerified(true);   
                }
                setErrorMessage(response.data.message);
            });
        }
        
        // User is changing email
        if (changeEmailCode !== null) {
            console.log("change email code called");
            AccountService.verifyNewEmail(changeEmailCode).then((response) => {
                if (!response.data.error) {
                    setIsVerified(true);    
                }
                setErrorMessage(response.data.message);
            });
        }
    }, []);

    return (
        <div className='text-center m-4'>
            { isVerified ? <VerifySuccess /> : <VerifyFail errorMessage={errorMessage} /> }
        </div>
    );
}

export default EmailVerification;