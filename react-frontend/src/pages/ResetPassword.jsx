import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import AuthorizedPasswordResetRequest from "../components/AuthorizedPasswordResetRequest";
import AccountService from "../services/AccountService";

function ResetPassword() {

    let { code } = useParams();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        AccountService.authorizePasswordReset(code).then((response) => {
            console.log(response.data);
            if (response.data) {
                setIsAuthorized(true);
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