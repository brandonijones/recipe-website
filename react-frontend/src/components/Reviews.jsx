import { React, useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../helpers/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReviewService from '../services/ReviewService';

import Rating from '@mui/material/Rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import Modal from 'react-bootstrap/Modal';
import Accordian from 'react-bootstrap/Accordion';

function Reviews(props) {

    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const recipeId = props.recipeId;
    const username = props.username;
    const [reviews, setReviews] = useState([]);
    const [value, setValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        ReviewService.findReviews(recipeId).then((response) => {
            console.log(response.data);
            setReviews(response.data);

            
        });
        
    }, []);

    useState(() => {

        ReviewService.getReview(authState.id, recipeId).then((response) => {
            console.log(response.data);
            if (response.data.error !== undefined) {
                setAlreadyReviewed(true);
            } else {
                setAlreadyReviewed(false);
            }
        });

    }, [reviews])

    const postReview = (formValues) => {
        console.log(formValues);
        setIsLoading(true);
        let fullReview = {...formValues,
            accountId: authState.id,
            recipeId: recipeId
        }

        ReviewService.postReview(fullReview).then((response) => {
            console.log(response.data);
            setReviews([...reviews, response.data])
            setIsLoading(false);
            setAlreadyReviewed(true);
        })
    }

    const validationSchema = Yup.object().shape({
        rating: Yup.number().min(0.5).max(5).required("A rating greater than 0 is required!"),
        reviewContent: Yup.string().max(255, "Too long! Maximum of 255 characters").required("Field cannot be left empty")
    });

    const initialValues = {
        rating: value,
        reviewContent: ""
    }

    const deleteReview = () => {
        ReviewService.deleteReview(authState.id, recipeId).then((response) => {
            console.log(response.data);
            setReviews(reviews.filter((value) => {
                return value.account.id !== authState.id && value.recipe.id !== recipeId;
            }));
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            setAlreadyReviewed(false);
        })
    }
    
    return (
        <div className='my-5 container border full-recipe-card'>
            <Accordian className='m-3'>
                <Accordian.Item eventKey='0'>
                    <Accordian.Header>
                        <div className='d-flex align-items-center'>
                            <h3 className='m-2'>Reviews</h3>
                            <span>({reviews.length + " total"}) </span>
                        </div>
                        
                    </Accordian.Header>
                    <Accordian.Body>
                        { authState.status && authState.username !== username && !alreadyReviewed ?
                            <Formik
                                onSubmit={postReview}
                                validationSchema={validationSchema}
                                initialValues={initialValues}
                            >
                                {({ errors, touched, values, isValidating, setFieldValue }) => (
                                    <Form className='mx-3'>

                                        <label className='form-label'>Write a review</label>
                                        <br />
                                        <Rating 
                                            className='review-rating-star'
                                            name='rating'
                                            value={value}
                                            defaultValue={0}
                                            size='large'
                                            precision={0.5}
                                            onChange={(event, newValue) => {
                                                setValue(newValue);
                                                setFieldValue("rating", newValue);
                                            }}
                                        />
                                        <Field as='textarea' name="reviewContent" className="form-control" placeholder='Let this person know what you thought about the recipe (optional)...'/>
                                        <ErrorMessage name='rating' render={message => <div className='text-danger'>{message}</div>} />
                                        <ErrorMessage name='reviewContent' render={message => <div className='text-danger'>{message}</div>} />
                                        
                                        <div>
                                            <button type="submit" className="btn btn-primary my-3">Post</button>
                                            <button type='reset' className='btn btn-secondary my-3 ms-2' onClick={() => setValue(0)}>Cancel</button>
                                            { isLoading && <span className='ms-3'>loading...</span> }
                                        </div>
                                        
                                    </Form>
                                )}
                            </Formik> :
                            <>
                                { authState.username === username && <p className='my-4 mx-3 text-center'>You cannot write a review on your own recipe.</p> }

                                { alreadyReviewed && <p className='my-4 mx-3 text-center'>You have already reviewed this recipe.</p> }

                                { !authState.status && <p className='my-4 mx-3 text-center'>Log in to write a review! <a href="/login">Log in</a></p> }
                            </>
                            
                        }

                        <hr className='mx-3' />
                        { reviews.length > 0 ?
                            <div>
                                {reviews.map((review, index) => {
                                    let createdAt = new Date(review.createdAt);
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

                                    return (
                                        <div className='row mx-3 mb-3 border p-2'>
                                            <div className='col-sm-11 ' key={index}>
                                                <Rating 
                                                    name='read-only'
                                                    value={review.rating}
                                                    precision={0.5}
                                                    readOnly
                                                />
                                                <h5 className='reviewer' onClick={() => navigate("/profile/" + review.account.username)}>{review.account.name}</h5>
                                                <p>{review.reviewContent}</p>
                                                <p className='review-date'>{`${month} ${date}, ${year} ${hours}:${minutes} ${timeOfDay}`} </p>
                                            </div>
                                            <div className='col-sm-1 text-center my-auto delete-review'>
                                                {(authState.id === review.account.id || authState.role === 'ADMIN') && 
                                                    <FontAwesomeIcon 
                                                        icon={faTrash}
                                                        onClick={() => setShowDeleteModal(true)}
                                                    />
                                                }
                                                
                                            </div>
                                        </div>
                                        
                                    );
                                })}
                            </div> :
                            <p className='text-center'>There are no reviews for this recipe yet.</p>
                        }
                    </Accordian.Body>
                </Accordian.Item>
            </Accordian>

            <Modal 
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this review?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-danger' onClick={deleteReview}>Confirm</button>
                    <button className='btn btn-secondary' onClick={() => setShowDeleteModal(false)}>Cancel</button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showSuccessModal}
                onHide={() => {
                    setShowSuccessModal(false);
                }}
                size='sm'
                centered
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <p>Review successfully deleted!</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Reviews;