import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AuthorizedPasswordResetRequest from "../components/AuthorizedPasswordResetRequest";
import AccountService from "../services/AccountService";
import { useNavigate } from 'react-router';

function ResetPassword() {

    const navigate = useNavigate();
    // let { code } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const code = searchParams.get("code");
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        AccountService.authorizePasswordReset(code).then((response) => {
            console.log(response.data);
            if (!response.data.error) {
                setIsAuthorized(true);
            }   
        })
    }, []);

    return (
        <div>
            { isAuthorized ? 
                <AuthorizedPasswordResetRequest code={code} /> : 
                <h2 className='text-center my-3' >Cannot reset password. Invalid URL or link is expired.</h2> }
        </div>
    );
}

export default ResetPassword;