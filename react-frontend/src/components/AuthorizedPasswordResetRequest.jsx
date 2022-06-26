import React, { useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AccountService from "../services/AccountService";
import { Alert } from "react-bootstrap";
import { AuthContext } from '../helpers/AuthContext';
import { useNavigate } from 'react-router';

function AuthorizedPasswordResetRequest(props) {

    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { authState } = useContext(AuthContext);

    const [passwordVisibility, setPasswordVisibilty] = useState(false);
    const [passwordConfirmVisibility, setPasswordConfirmVisibility] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const [passwordConfirmType, setPasswordConfirmType] = useState("password");

    const resetPassword = (formData) => {
        setIsSending(true);
        let newPasswordRequest; 
        if (props.code) {
            newPasswordRequest = {...formData, verificationCode: props.code};
        }

        if (authState.status) {
            newPasswordRequest = {...formData, userId: authState.id};
        }
        console.log(newPasswordRequest);
        
        AccountService.changePassword(newPasswordRequest).then((response) => {
            console.log(response.data);
            setIsSending(false);

            if (response.data.error) {
                setErrorMessage(response.data.message);
                setShow(true);
            } else {
                navigate("/");
            }
        });
    }

    const initialValues = {
        newPassword: "",
        passwordConfirmation: ""
    }

    const validationSchema = Yup.object().shape({
        newPassword: Yup.string().min(6, "Must be at least 6 characters").required("Please create a password"),
        passwordConfirmation: Yup.string().oneOf([Yup.ref('newPassword'), null], "Passwords do not match!").required("Please confirm your password.")
    });

    const showPassword = () => {
        if (!passwordVisibility) {
            setPasswordType("text");
            setPasswordVisibilty(true);
        } else {
            setPasswordType("password");
            setPasswordVisibilty(false);
        }
    }

    const showPasswordConfirmation = () => {
        if (!passwordConfirmVisibility) {
            setPasswordConfirmType("text");
            setPasswordConfirmVisibility(true);
        } else {
            setPasswordConfirmType("password");
            setPasswordConfirmVisibility(false);
        }
    }

    return (
        <div className='border container-sm my-5' style={{"maxWidth": "35rem"}}>
            <Alert show={show} variant="danger"> <p>{ errorMessage }</p> </Alert>
            <Formik
                onSubmit={resetPassword}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating }) => (
                    <Form>
                        <div className='mb-1'>
                            <label className='form-label'>New password:</label>
                            <Field name="newPassword" type={passwordType} className="form-control" placeholder='Create a new password...'/>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" onClick={showPassword} />
                            <label className="form-check-label">Show password</label>
                        </div>
                        {errors.newPassword && touched.newPassword && <div className='text-danger'>{errors.newPassword}</div>}
                        <div className='mb-1'>
                            <label className='form-label'>Confirm new password:</label>
                            <Field name="passwordConfirmation" type={passwordConfirmType} className="form-control" placeholder='Re-type your new password...'/>
                        </div>
                        <div className="form-check mb-1">
                            <input className="form-check-input" type="checkbox" onClick={showPasswordConfirmation} />
                            <label className="form-check-label">Show password</label>
                        </div>
                        {errors.passwordConfirmation && touched.passwordConfirmation && <div className='text-danger'>{errors.passwordConfirmation}</div>}
                        {!errors.passwordConfirmation && touched.passwordConfirmation && <div className='text-success'>Password matches!</div>}
                        <div>
                            <button type="submit" className="btn btn-primary my-3">Reset Password</button>
                            { isSending && <span>loading...</span> }
                        </div>
                    </Form>
                )}

            </Formik>
        </div>
    );
}

export default AuthorizedPasswordResetRequest;