import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import { useNavigate } from 'react-router';

import  Alert from 'react-bootstrap/Alert';

function Login() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [loginError, setLoginError] = useState("");
    const { setAuthState } = useContext(AuthContext);

    const initialValues = {
        user: "",
        password: ""
    }

    const login = (data) => {
        console.log(data);

        setShow(false);
        AccountService.login(data).then((response) => {
            console.log(response.data);

            if (response.data.error) {
                setLoginError(response.data.message);
                setShow(true);
            } else {
                localStorage.setItem("accessToken", response.data.accessToken);
                let user = response.data.user;
                console.log(user);

                setAuthState({
                    status: true,
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                });
            }
            
        });
    }

    const validationSchema = Yup.object().shape({
        user: Yup.string().required("Please enter your email or username."),
        password: Yup.string().required("Please enter your password.")
    });

    return (
        <div className='border container-sm my-5' style={{"maxWidth": "35rem"}}>
            <h2>Log In</h2>
            <Alert show={show} variant="danger"> <p>{ loginError }</p> </Alert>
            <Formik 
                initialValues={initialValues}
                onSubmit={login}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating }) => (
                    <Form>
                        <div className='mb-1'>
                            <label className='form-label'>Email or Username:</label>
                            <Field name="user" className="form-control" placeholder='Enter your email or username...'/>
                            {errors.user && touched.user && <div className='text-danger'>{errors.user}</div>}
                            {/* {!errors.user && touched.user && <div className='text-success'>Email or username is valid!</div>} */}
                        </div>
                        <div className='mb-4'>
                            <label className='form-label'>Password:</label>
                            <Field name="password" type="password" className="form-control" placeholder='Enter your password...' />
                            {errors.password && touched.password && <div className='text-danger'>{errors.password}</div>}
                            {/* {!errors.password && touched.password && <div className='text-success'>Password is valid!</div>} */}
                        </div>
                        <div className='container '>
                            <div className='row'>
                                <div className='col-sm-12 col-md-7'>
                                    <p>Need to create an account? <a href="/registration">Sign Up</a></p>
                                </div>
                                <div className='col-sm-12 col-md-5'>
                                    <p> <a href="/">Forgot password?</a> </p>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary my-3">Log In</button>
                    </Form>
                )}

            </Formik>
        </div>
    );
}

export default Login;