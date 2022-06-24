import React, { useState } from "react";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AccountService from "../services/AccountService";
import { Alert } from "react-bootstrap";

function ResendEmail() {

    const [message, setMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const sendEmail = (email) => {
        setIsSending(true);

        AccountService.resendEmail(email).then((response) => {
            console.log(response.data);

            setIsSending(false);

            if (response.data.error) {
                setMessage(response.data.message);
                setShowError(true);
                setShowSuccess(false);
            } else {
                setMessage(response.data.message);
                setShowError(false);
                setShowSuccess(true);
            }
        });
    }
    
    const initialValues = {
        email: "",
        emailConfirmation: ""
    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Please enter a valid email address.").required("Email address is required."),
        emailConfirmation: Yup.string().oneOf([Yup.ref("email"), null], "Email does not match!").required("Please re-type your email address.")
    });

    return (
        <div className='border container-sm my-5' style={{"maxWidth": "35rem"}}>
            <h1>Resend Email</h1>
            <Alert show={showError} variant="danger"> <p>{ message }</p> </Alert>
            <Alert show={showSuccess} variant="success"> <p>{ message }</p> </Alert>
            <Formik
                onSubmit={sendEmail} 
                initialValues={initialValues}
                validationSchema={validationSchema} 
            >
                {({ errors, touched, isValidating }) => (
                    <Form>
                        <div className='mb-1'>
                            <label className='form-label'>Email:</label>
                            <Field name="email" type="email" className="form-control" placeholder='Type your email address...'/>
                            {errors.email && touched.email && <div className='text-danger'>{errors.email}</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Confirm Email:</label>
                            <Field name="emailConfirmation" type="email" className="form-control" placeholder='Re-type email address...'/>
                            {errors.emailConfirmation && touched.emailConfirmation && <div className='text-danger'>{errors.emailConfirmation}</div>}
                            {!errors.emailConfirmation && touched.emailConfirmation && <div className='text-success'>Email matches!</div>}
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary my-3">Send email</button>
                            { isSending && <span>loading...</span> }
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default ResendEmail;