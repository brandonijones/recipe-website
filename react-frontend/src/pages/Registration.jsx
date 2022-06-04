import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AccountService from '../services/AccountService';

function Registration() {

    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);

    const initialValues = {
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        passwordConfirmation: ""
    }

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().min(2, 'Too Short!').max(20, "Too Long!").required("First name is required."),
        lastName: Yup.string().min(2, 'Too Short!').max(20, "Too Long!").required("Last name is required."),
        email: Yup.string().email("Please enter a valid email.").required("Email is required."),
        emailConfirmation: Yup.string().oneOf([Yup.ref("email"), null], "Email does not match!").required("Please confirm your email address."),
        username: Yup.string().min(3, 'Too Short!').max(50, "Too Long!").required("Username is required."),
        password: Yup.string().min(8, 'Must be at least 8 characters long').required("Password is required."),
        passwordConfirmation: Yup.string().oneOf([Yup.ref('password'), null], "Passwords do not match!").required("Please confirm your password.")
    });

    const validateUsername = (value) => {

        AccountService.findUsername({ username: value }).then((response) => {

            if (response.data.length > 0) {
                setUsernameTaken(true);
            } else {
                setUsernameTaken(false);
            }
        });

        let error;
        if (usernameTaken) {
            error = "Username is taken!";
        }
        return error;
    }

    const validateEmail = (value) => {

        AccountService.findEmail({ email: value }).then((response) => {

            if (response.data.length > 0) {
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

    const registerUser = (data) => {
        const newAccount = {...data, role: "USER"}

        /* A successful registration will take you to the home page */
        AccountService.createAccount(newAccount).then(() => {
            // console.log(data);
        });
    }

    return (
        <div className='border container-sm my-5' style={{"maxWidth": "35rem"}}>
            <h2>Sign Up</h2>
            <Formik
                initialValues={initialValues}
                onSubmit={registerUser}
                validationSchema={validationSchema}
            >
                {({ errors, touched, isValidating }) => (
                    <Form>
                        <div className='mb-1'>
                            <label className='form-label'>First Name</label>
                            <Field name="firstName" className="form-control"/>
                            {errors.firstName && touched.firstName && <div className='text-danger'>{errors.firstName}</div>}
                            {!errors.firstName && touched.firstName && <div className='text-success'>Looks good!</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Last Name</label>
                            <Field name="lastName" className="form-control"/>
                            {errors.lastName && touched.lastName && <div className='text-danger'>{errors.lastName}</div>}
                            {!errors.lastName && touched.lastName && <div className='text-success'>Looks good!</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Email</label>
                            <Field name="email" validate={validateEmail} type="email" className="form-control"/>
                            {errors.email && touched.email && <div className='text-danger'>{errors.email}</div>}
                            {!errors.email && touched.email && <div className='text-success'>Email is valid!</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Confirm Email</label>
                            <Field name="emailConfirmation" type="email" className="form-control"/>
                            {errors.emailConfirmation && touched.emailConfirmation && <div className='text-danger'>{errors.emailConfirmation}</div>}
                            {!errors.emailConfirmation && touched.emailConfirmation && <div className='text-success'>Email matches!</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Create a username</label>
                            <Field name="username" validate={validateUsername} className="form-control"/>
                            {errors.username && touched.username && <div className='text-danger'>{errors.username}</div>}
                            {!errors.username && touched.username && <div className='text-success'>Username is valid!</div>}
                        </div>
                        <div className='mb-1'>
                            <label className='form-label'>Create a password</label>
                            <Field name="password" type="password" className="form-control"/>
                            {errors.password && touched.password && <div className='text-danger'>{errors.password}</div>}
                            {!errors.password && touched.password && <div className='text-success'>Password is valid!</div>}
                        </div>
                        <div className='mb-4'>
                            <label className='form-label'>Confirm password</label>
                            <Field name="passwordConfirmation" type="password" className="form-control"/>
                            {errors.passwordConfirmation && touched.passwordConfirmation && <div className='text-danger'>{errors.passwordConfirmation}</div>}
                            {!errors.passwordConfirmation && touched.passwordConfirmation && <div className='text-success'>Password matches!</div>}
                        </div>
                        <p>Already have an account? <a href="/login">Log in</a></p>
                        <button type="submit" className="btn btn-primary my-3">Register</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default Registration;