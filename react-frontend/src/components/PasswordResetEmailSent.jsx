import React from "react";

function PasswordResetEmailSent(props) {
    
    return (
        <div>
            <p className='text-center' >Password reset email has been sent to { props.email } </p>
        </div>
    );
}

export default PasswordResetEmailSent;