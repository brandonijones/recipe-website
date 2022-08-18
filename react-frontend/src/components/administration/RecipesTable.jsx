import { React, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { AuthContext } from '../../helpers/AuthContext';
import AdminService from '../../services/AdminService';

import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import Rating from '@mui/material/Rating';

function RecipesTable() {
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);

    const [showDeleteRecipe, setShowDeleteRecipe] = useState([]);
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {

        AdminService.findAllRecipes().then((response) => {
            setRecipes(response.data);
            let items = []
            for (var i = 0; i < response.data.length; i++) {
                items.push(false);
            }
            setShowDeleteRecipe(items);
        });
    }, []);

    const deleteRecipe = (affectedRecipe, index) => {

        let request = {
            recipeId: affectedRecipe.id,
            adminId: authState.id,
            password: password
        }

        AdminService.deleteRecipe(request).then((response) => {

            if (response.data.error !== undefined) {
                setShowAlert(true);
                setAlertMessage(response.data.error);
            } else {
                closeDeleteModal(index);
                setRecipes(recipes.filter((recipe) => {
                    return recipe.id !== affectedRecipe.id
                }));
            }
        })
    }

     /* Modal open/close logic to prompt admin to confirm deletion of a selected account */
    const showDeleteModal = (index) => {
        let items = [...showDeleteRecipe];
        items[index] = true;    // sets specific modal for specific account to true so it displays
        setShowDeleteRecipe(items);
    }

    const closeDeleteModal = (index) => {
        let items = [...showDeleteRecipe];
        items[index] = false; // sets specific modal for specific account to false so it closes
        setShowDeleteRecipe(items);
        setShowAlert(false);
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
            <div className='table-responsive'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th></th>
                            <th>Title</th>
                            <th>Username</th>
                            <th>Description</th>
                            <th>Average Rating</th>
                            <th>Created At</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody >
                        {recipes.map((recipe, index) => {

                            // Formatting the date
                            let createdAt = new Date(recipe.createdAt);
                            let month = months[createdAt.getMonth()];
                            let date = createdAt.getDate();
                            let year = createdAt.getFullYear();
                            let hours24Format = createdAt.getHours();
                            let hours = (hours24Format % 12) || 12;
                            let minutes = createdAt.getMinutes();
                            let timeOfDay;

                            if (hours24Format < 12) {
                                timeOfDay = "am"
                            } else {
                                timeOfDay = "pm"
                            }

                            return(
                                <>
                                    <tr key={index}>
                                        <td className='text-center'>{recipe.id}</td>
                                        <td 
                                            className='text-center' 
                                            onClick={() => navigate("/recipe/" + recipe.account.username + "/" + recipe.id)}
                                            style={{"cursor": "pointer"}}
                                        > 
                                            <img className='admin-recipe-images' src={recipe.imageURL} alt="" />
                                        </td>
                                        <td>{recipe.title}</td>
                                        <td onClick={() => navigate("/profile/" + recipe.account.username)} style={{"cursor": "pointer"}} >{recipe.account.username}</td>
                                        <td>{recipe.description.substring(0, 200) + "..."}</td>
                                        <td>
                                            <Rating 
                                                name='read-only'
                                                value={recipe.averageRating}
                                                precision={0.1}
                                                readOnly
                                            />
                                        </td>
                                        <td>{`${month} ${date}, ${year} ${hours}:${minutes} ${timeOfDay}`}</td>
                                        <td>
                                            <button className='btn btn-danger' onClick={() => showDeleteModal(index)}>Delete Recipe?</button></td>
                                    </tr>

                                    {/* Delete Recipe Modal */}
                                    <Modal 
                                        centered 
                                        backdrop="static" 
                                        show={showDeleteRecipe[index]} 
                                        onHide={() => closeDeleteModal(index)} >
                                        <Modal.Header closeButton>
                                            <Modal.Title>Are you sure you want to delete this recipe?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <img className='img-fluid' src={recipe.imageURL} alt="" />
                                            <hr />
                                            <p><strong>Title:</strong> {recipe.title}</p>
                                            <p><strong>Username</strong> {recipe.account.username}</p>
                                            <p><strong>Description:</strong> {recipe.description}</p>
                                            <hr />
                                            <Formik
                                                initialValues={initialValues}
                                                onSubmit={deleteRecipe}
                                                validationSchema={validationSchema}
                                            >
                                                {({ errors, touched, isValidating, setFieldValue }) => (
                                                    <Form>
                                                        {/* Field for password */}
                                                        <div className='my-4 row'>
                                                            <label className='col-form-label col-sm-4'>Password:</label>
                                                            <div className='col-sm-8'>
                                                                <Field 
                                                                    name="password" 
                                                                    type="password" 
                                                                    className="form-control" 
                                                                    placeholder='Type your password...' 
                                                                    onChange={(e) => {
                                                                        setPassword(e.target.value);
                                                                        setFieldValue("password", e.target.value);
                                                                    }} 
                                                                />
                                                                <ErrorMessage name='password' render={message => <div className='text-danger'>{message}</div>} />
                                                            </div>    
                                                        </div>

                                                        {/* Field for password confirmation */}
                                                        <div className='my-4 row'>
                                                            <label className='col-form-label col-sm-4'>Confirm Password:</label>
                                                            <div className='col-sm-8'>
                                                                <Field name="passwordConfirmation" type="password" className="form-control" placeholder='Re-type your password...'/>
                                                                <ErrorMessage name='passwordConfirmation' render={message => <div className='text-danger'>{message}</div>} />
                                                            </div>
                                                        </div>
                                                        <Alert className='mt-2' variant='danger' show={showAlert} onClose={() => setShowAlert(false)}>
                                                            <p className='text-center'>{alertMessage}</p>
                                                        </Alert> 
                                                    </Form>
                                                )}
                                            </Formik>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <button type='submit' className='btn btn-danger' onClick={() => deleteRecipe(recipe, index)}>Confirm Delete</button>
                                            <button type='button' className='btn btn-secondary' onClick={() => closeDeleteModal(index)}>Cancel</button>
                                        </Modal.Footer>
                                    </Modal>
                                </>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default RecipesTable;