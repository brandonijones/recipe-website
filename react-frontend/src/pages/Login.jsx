import React, { useState, useContext } from 'react';
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
    const [isSending, setIsSending] = useState(false);
    const [passwordVisibility, setPasswordVisibilty] = useState(false);
    const [passwordType, setPasswordType] = useState("password");

    const initialValues = {
        user: "",
        password: ""
    }

    const login = (data) => {
        console.log(data);

        setShow(false);
        setIsSending(true);
        AccountService.login(data).then((response) => {
            console.log(response.data);
            setIsSending(false);

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
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    role: user.role
                });
                navigate("/");
            }
            
        });
    }

    const validationSchema = Yup.object().shape({
        user: Yup.string().required("Please enter your email or username."),
        password: Yup.string().required("Please enter your password.")
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

    return (
        <div className='border container-sm my-5' style={{"maxWidth": "35rem"}}>
            <h2>Log In</h2>
            
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
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Password:</label>
                            <Field name="password" type={passwordType} className="form-control" placeholder='Enter your password...' />
                        </div>
                        <div className="form-check mb-4">
                            <input className="form-check-input" type="checkbox" onClick={showPassword} />
                            <label className="form-check-label">Show password</label>
                        </div>
                        {errors.password && touched.password && <div className='text-danger'>{errors.password}</div>}
                        <div className='container'>
                            <p>Need to create an account? <a href="/registration">Sign up</a></p>
                            <p>Need a new email verification link? <a href="/resend-email">Send now</a> </p>
                            <p> <a href="/forgot-password">Forgot password?</a> </p>
                        </div>

                        <Alert show={show} variant="danger"> <p className='text-center my-auto'>{ loginError }</p> </Alert>

                        <div>
                            <button type="submit" className="btn btn-primary my-3">Log In</button>
                            { isSending && <span>loading...</span> }
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default Login;