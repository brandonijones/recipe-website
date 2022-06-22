import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import VerifySuccess from '../components/VerifySuccess';
import VerifyFail from '../components/VerifyFail';

import AccountService from '../services/AccountService';

function EmailVerification() {
    let { code } = useParams();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        AccountService.verify(code).then((response) => {
            console.log(response.data);
            let message = response.data;
            if (message === "verify_success") {
                setIsVerified(true);
            }
        });
    }, []);

    return (
        <div className='text-center m-4'>
            { isVerified ? <VerifySuccess /> : <VerifyFail /> }
        </div>
    );
}

export default EmailVerification;