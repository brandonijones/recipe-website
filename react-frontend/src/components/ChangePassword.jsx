import { React, useContext, useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import AccountService from '../services/AccountService';
import * as Yup from 'yup';
import { AuthContext } from '../helpers/AuthContext';

import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';

function ChangePassword() {

    const { authState, setAuthState } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [message, setMessage] = useState("");

    const [passwordVisibility, setPasswordVisibilty] = useState(false);
    const [newPasswordVisibility, setNewPasswordVisibilty] = useState(false);
    const [newPasswordConfirmVisibility, setNewPasswordConfirmVisibility] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const [newPasswordType, setNewPasswordType] = useState("password");
    const [newPasswordConfirmType, setNewPasswordConfirmType] = useState("password");


    const saveChanges = (formData) => {

        console.log(formData);

        let request = {...formData, userId: authState.id}
        setIsLoading(true);
        setShowSuccessModal(false);
        setShowErrorMessage(false);

        AccountService.changePassword(request).then((response) => {

            console.log(response.data);
            if (!response.data.error) {
                setShowSuccessModal(true);
            } else {
                setShowErrorMessage(true);
            }
            setIsLoading(false);
            setMessage(response.data.message);
        });
    }

    const validationSchema = Yup.object().shape({
        oldPassword: Yup.string().required("Please enter your original password"),
        newPassword: Yup.string().min(6, "Must be at least 6 characters").required("Please create a new password"),
        newPasswordConfirmation: Yup.string().oneOf([Yup.ref('newPassword'), null], "Passwords do not match!").required("Please confirm your new password.")
    });

    const initialValues = {
        oldPassword: "",
        newPassword: "",
        newPasswordConfirmation: ""
    }

    const showPassword = () => {
        if (!passwordVisibility) {
            setPasswordType("text");
            setPasswordVisibilty(true);
        } else {
            setPasswordType("password");
            setPasswordVisibilty(false);
        }
    }

    const showNewPassword = () => {
        if (!newPasswordVisibility) {
            setNewPasswordType("text");
            setNewPasswordVisibilty(true);
        } else {
            setNewPasswordType("password");
            setNewPasswordVisibilty(false);
        }
    }

    const showNewPasswordConfirmation = () => {
        if (!newPasswordConfirmVisibility) {
            setNewPasswordConfirmType("text");
            setNewPasswordConfirmVisibility(true);
        } else {
            setNewPasswordConfirmType("password");
            setNewPasswordConfirmVisibility(false);
        }
    }

    return (
        <div>    
            <Formik
                onSubmit={saveChanges}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating }) => (
                    <Form className='mx-md-5'>
                        <h3 className='my-3' >Change Password</h3>

                        {/* Field for original password */}
                        <div className='my-4 row'>
                            <label className='col-form-label col-sm-4'>Old password:</label>
                            <div className='col-sm-8'>
                                <Field name="oldPassword" type={passwordType} className="form-control" placeholder='Type your current password...'/>
                                <div className="form-check mt-1">
                                    <input className="form-check-input" type="checkbox" onClick={showPassword} />
                                    <label className="form-check-label">Show password</label>
                                </div>
                                {errors.oldPassword && touched.oldPassword && <div className='text-danger'>{errors.oldPassword}</div>}
                            </div>    
                        </div>

                        {/* Field for new password */}
                        <div className='my-4 row'>
                            <label className='col-form-label col-sm-4'>New Password</label>
                            <div className='col-sm-8' >
                                <Field name="newPassword" type={newPasswordType} className="form-control" placeholder='Create a new password...'/>
                                <div className="form-check mt-1">
                                    <input className="form-check-input" type="checkbox" onClick={showNewPassword} />
                                    <label className="form-check-label">Show password</label>
                                </div>
                                {errors.newPassword && touched.newPassword && <div className='text-danger'>{errors.newPassword}</div>}
                            </div>
                        </div>
                        
                        {/* Field for new password confirmation */}
                        <div className='mt-4 mb-2 row'>
                            <label className='col-form-label col-sm-4'>Confirm new password:</label>
                            <div className='col-sm-8' >
                                <Field name="newPasswordConfirmation" type={newPasswordConfirmType} className="form-control" placeholder='Re-type your new password...'/>
                                <div className="form-check mt-1">
                                    <input className="form-check-input" type="checkbox" onClick={showNewPasswordConfirmation} />
                                    <label className="form-check-label">Show password</label>
                                </div>
                                {errors.newPasswordConfirmation && touched.newPasswordConfirmation && <div className='text-danger'>{errors.newPasswordConfirmation}</div>}
                            </div>
                        </div>

                        {/* Error message */}
                        <Alert show={showErrorMessage} variant="danger"> <p className='text-center my-auto'>{ message }</p> </Alert>

                        {/* Buttons to submit or to cancel */}
                        <div>
                            <button type="submit" className="btn btn-primary my-3">Reset Password</button>
                            <button 
                                type='reset' 
                                className='btn btn-secondary ms-1'
                                onClick={() => {
                                    setShowErrorMessage(false);
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
                    <p className='text-center my-auto'>Password successfully changed!</p> 
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

export default ChangePassword;