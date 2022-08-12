import { React, useContext, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import AccountService from '../services/AccountService';
import * as Yup from 'yup';
import { AuthContext } from '../helpers/AuthContext';

// Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

// React Bootstrap Imports
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

function ChangeEmail() {

    const { authState, setAuthState } = useContext(AuthContext);
    const [currentEmail, setCurrentEmail] = useState(authState.email);
    const [emailTaken, setEmailTaken] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const validationSchema = Yup.object().shape({
        newEmail: Yup.string().email("Please enter a valid email address.").required("Email address is required."),
        newEmailConfirmation: Yup.string().oneOf([Yup.ref("newEmail"), null], "Email does not match!").required("Please re-type your email address.")
    });

    const initialValues = {
        newEmail: "",
        newEmailConfirmation: ""
    }

    const popover = (
        <Popover>
            <Popover.Body>
                {validationMessage}
            </Popover.Body>
        </Popover>
    );

    useEffect(() => {

        AccountService.checkEmail(currentEmail).then((response) => {
            console.log("Email check:")
            console.log(currentEmail)
            console.log(response.data);
            if (!response.data.error) {
                setIsVerified(true);
                setValidationMessage(response.data.message);
            } else {
                setIsVerified(false);
                setValidationMessage(response.data.message);
            }

            setCurrentEmail(authState.email);
        });
    }, [authState, currentEmail]);

    const sendEmail = (formData) => {
        let request = {...formData, email: currentEmail}
        setIsLoading(true);

        AccountService.changeEmail(request).then((response) => {
            console.log(response.data);
            if (!response.data.error) {
                let newAccessToken = response.data.accessToken;
                let user = response.data.user;

                localStorage.setItem("accessToken", newAccessToken);

                setAuthState({...authState, 
                    email: user.email
                });
                setCurrentEmail(user.email);
                setShowSuccessModal(true);
            } else {
                setShowSuccessModal(false);
            }
            setIsLoading(false);
        });
    }

    const validateEmail = (value) => {

        AccountService.findEmail({ email: value }).then((response) => {

            // If there was a non-null response, then an account was found with the email
            if (response.data && response.data.email !== currentEmail) {   
                setEmailTaken(true); 
            } else {
                setEmailTaken(false);
            }
        });

        let error;
        if (emailTaken) {
            error = "Email is already associated with another account.";
        }
        return error;
    }

    return (
        <div>   
            <Formik
                onSubmit={sendEmail}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {({ errors, touched, values }) => (
                    <Form className='mx-md-5'>
                        <h3 className='my-3' >Change Email Address</h3>
                        <div className='my-2 row d-flex align-items-center '>
                            <label className='col-form-label col-sm-4'>Current email:</label>
                            {!currentEmail ? 
                                <Spinner className='mx-auto' animation='border' /> :
                                <>   
                                    <div className='col-sm-5'>
                                        <span >{currentEmail}</span>   
                                    </div>
                                    <OverlayTrigger trigger='click' placement='bottom' overlay={popover} > 
                                        <div className='col-sm-3 my-2' >
                                            { isVerified ? 
                                                <div className='email-verified-label text-center'>
                                                    <span className='p-2' >Verified</span>
                                                    <FontAwesomeIcon icon={faCircleInfo} />
                                                </div> :
                                                <div className='email-not-verified-label text-center'>
                                                    <span className='p-2' >Not Verified</span>
                                                    <FontAwesomeIcon icon={faCircleInfo} />
                                                </div>   
                                            }   
                                        </div>
                                    </OverlayTrigger>
                                </>
                            }
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-4'>New email address:</label>
                            <div className='col-sm-8'>
                                <Field validate={validateEmail}  name='newEmail' className='form-control' />
                                <ErrorMessage name='newEmail' render={message => <div className='text-danger'>{message}</div>} />
                            </div>
                        </div>
                        <div className='my-2 row'>
                            <label className='col-form-label col-sm-4'>Confirm email:</label>
                            <div className='col-sm-8'>
                                <Field name='newEmailConfirmation' className='form-control' />
                                <ErrorMessage name='newEmailConfirmation' render={message => <div className='text-danger'>{message}</div>} />
                            </div>
                        </div>
                        <div className='my-3' >
                            <button type='submit' className='btn btn-primary me-1' >Submit</button>
                            <button 
                                type='reset' 
                                className='btn btn-secondary ms-1'
                                onClick={() => {
                                    setShowCancelModal(true);
                                }}
                            >Cancel</button>
                            { isLoading && <span className='mx-2'>loading...</span> }
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Modal for saving changes */}
            <Modal 
                show={showSuccessModal} 
                onHide={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                }}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p className='text-center my-auto'>Email successfully updated. Please check your email to verify the your new email address.</p> 
                </Modal.Body> 
            </Modal>

            {/* Modal for reverting back to initial values */}
            <Modal
                show={showCancelModal}
                onHide={() => setShowCancelModal(false)}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p className='text-center my-auto'>Successfully discarded changes.</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ChangeEmail;