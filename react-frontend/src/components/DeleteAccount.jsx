import { React, useContext, useState } from 'react';
import AccountService from '../services/AccountService';
import { AuthContext } from '../helpers/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useNavigate } from 'react-router';

import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function DeleteAccount() {

    const navigate = useNavigate();
    const { authState, setAuthState } = useContext(AuthContext);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    

    const handleCloseForm = () => {
        setShowForm(false);
    }

    const handleShowForm = () => {
        setShowForm(true);
    }

    const deleteAccount = (data) => {

        setShowError(false);
        let request = {...data, accountId: authState.id}
        
        AccountService.deleteAccount(request).then((response) => {
            console.log(response.data);

            if (response.data.error) {
                handleCloseForm();
                setShowError(true);
                setErrorMessage(response.data.message);

            } else {
                setShowSuccessModal(true);
            }
            
        });
    }

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({
            status: false,
            id: null,
            email: "",
            username: "",
            name: "",
            profilePicture: "",
            bio: "",
            role: ""
        });
    }

    const initialValues = {
        password: "",
        passwordConfirmation: ""
    }

    const validationSchema = Yup.object().shape({
        password: Yup.string().required("Please enter your password"),
        passwordConfirmation: Yup.string().oneOf([Yup.ref('password'), null], "Passwords do not match!").required("Please confirm your password.")
    });

    return (
        <div>
            <div className='text-center my-3' >
            
                <h3>Delete Account</h3>

                <Alert show={showError} variant="danger" className='mx-5' > 
                    <p className='text-center my-auto'>{ errorMessage }</p> 
                </Alert>

                <button className='btn btn-danger my-3' onClick={handleShowForm}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>

            <Modal show={showForm} onHide={handleCloseForm} >
                <Modal.Header closeButton>
                    <h2>Are you sure?</h2>
                </Modal.Header>
                <Modal.Body>
                    <p className='text-center mx-2'>Performing this action will permanently delete your account, and there will be no way to get it back.</p>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={deleteAccount}
                        validationSchema={validationSchema}
                    >
                        {({ errors, touched, isValidating }) => (
                            <Form>

                                {/* Field for password */}
                                <div className='my-4 row'>
                                    <label className='col-form-label col-sm-4'>Password:</label>
                                    <div className='col-sm-8'>
                                        <Field name="password" type="password" className="form-control" placeholder='Type your password...'/>
                                        {errors.password && touched.password && <div className='text-danger'>{errors.password}</div>}
                                    </div>    
                                </div>

                                {/* Field for password confirmation */}
                                <div className='my-4 row'>
                                    <label className='col-form-label col-sm-4'>Confirm Password:</label>
                                    <div className='col-sm-8'>
                                        <Field name="passwordConfirmation" type="password" className="form-control" placeholder='Re-type your password...'/>
                                        {errors.passwordConfirmation && touched.passwordConfirmation && <div className='text-danger'>{errors.passwordConfirmation}</div>}
                                    </div>    
                                </div>

                                <button type='submit' className='btn btn-danger me-1'>Confirm Delete</button>
                                <button type='reset' className='btn btn-secondary ms-1' onClick={handleCloseForm} >Cancel</button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

            {/* Modal for saving changes */}
            <Modal 
                show={showSuccessModal} 
                onHide={() => {
                    setShowSuccessModal(false);
                    logout();
                    navigate("/");
                }}
                size='sm'
                centered
                backdrop="static"
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p className='text-center my-auto'>Your account has been successfully deleted</p> 
                </Modal.Body> 
            </Modal>
        </div>
    );
}

export default DeleteAccount;