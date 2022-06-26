import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import AuthorizedPasswordResetRequest from "../components/AuthorizedPasswordResetRequest";
import AccountService from "../services/AccountService";
import { useNavigate } from 'react-router';

function ResetPassword() {

    const navigate = useNavigate();
    let { code } = useParams();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        AccountService.authorizePasswordReset(code).then((response) => {
            console.log(response.data);
            if (response.data) {
                setIsAuthorized(true);
            } else {
                navigate("/");
            }
        })
    }, []);

    return (
        <div>
            <h1>Reset Password page</h1>
            { isAuthorized ? <AuthorizedPasswordResetRequest code={code} /> : <p>Cannot reset password.</p> }
        </div>
    );
}

export default ResetPassword;