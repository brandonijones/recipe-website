import React from "react";

function VerifyFail(props) {

    return (
        <div>
            <h2> { props.errorMessage } </h2>
            <p>Need a new email verificaiton link? <a href="/resend-email">Send now</a> </p>
        </div>
    );
}

export default VerifyFail;