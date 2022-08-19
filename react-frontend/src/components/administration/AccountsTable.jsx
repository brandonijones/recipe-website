import { React, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { AuthContext } from '../../helpers/AuthContext';
import AdminService from '../../services/AdminService';

import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';


function AccountsTable() {

    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);

    const [showChangeRole, setShowChangeRole] = useState([]);
    const [newRole, setNewRole] = useState("");
    const [showDeleteAccount, setShowDeleteAccount] = useState([]);

    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {

        /* On first render, access all of the accounts from the database */
        AdminService.findAllAccounts().then((response) => {
            setAccounts(response.data);
            let items = []
            for (var i = 0; i < response.data.length; i++) {
                items.push(false);
            }
            setShowDeleteAccount(items);
            setShowChangeRole(items);
        })
    }, []);

    const changeRole = (affectedAccountId, index) => {
        /* Only changes the type for the account if the field is not blank */
        if (newRole.replace(/\s+/g, "") !== "") {

            let request = {
                id: affectedAccountId,
                role: newRole
            }

            AdminService.editRole(request).then((response) => {
                console.log(response.data);
                /* Optimistic rendering to update the type in the front end */
                setAccounts(accounts.map((account, key) => {
                    return account.id === affectedAccountId ?
                    {
                        id: account.id,
                        profilePicture: account.profilePicture,
                        username: account.username,
                        name: account.name,
                        email: account.email,
                        role: newRole,
                        createdAt: account.createdAt
                    } : account;
                }));
                setNewRole("");
                closeRoleModal(index);
            });  
        }
    }

    const deleteAccount = (affectedUsername, affectedAccountId, index) => {
        alert(affectedUsername + " will be deleted");

        let request = {
            adminId: authState.id,
            accountId: affectedAccountId,
            password: password
        }
        setShowAlert(false);
        setAlertMessage("");

        AdminService.deleteAccount(request).then((response) => {

            if (response.data.error !== undefined) {
                setShowAlert(true);
                setAlertMessage(response.data.error);
            } else {
                closeDeleteModal(index);
                setAccounts(accounts.filter((account) => {
                    return account.id !== affectedAccountId
                }));
            }
        });
    }

    /* Modal open/close logic to prompt admin to confirm deletion of a selected account */
    const showDeleteModal = (index) => {
        let items = [...showDeleteAccount];
        items[index] = true;    // sets specific modal for specific account to true so it displays
        setShowDeleteAccount(items);
    }

    const closeDeleteModal = (index) => {
        let items = [...showDeleteAccount];
        items[index] = false; // sets specific modal for specific account to false so it closes
        setShowDeleteAccount(items);
        setShowAlert(false);
    }
    
    /* Modal open/close logic to prompt admin to change the account types */
    const showRoleModal = (index) => {
        let items = [...showChangeRole];
        items[index] = true; // sets specific modal for specific account to true so it displays
        setShowChangeRole(items);
    }

    const closeRoleModal = (index) => {
        let items = [...showChangeRole];
        items[index] = false; // sets specific modal for specific account to false so it closes
        setShowChangeRole(items);
        setNewRole("");
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
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody >
                        {accounts.map((account, index) => {

                            // Formatting the date
                            let createdAt = new Date(account.createdAt);
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
                                    <tr key={index} >
                                        <td className='text-center'>{account.id}</td>
                                        <td onClick={() => navigate("/profile/" + account.username)} style={{"cursor": "pointer"}} className='text-center'> <img className='admin-account-images' src={account.profilePicture} alt="" /> </td>
                                        <td onClick={() => navigate("/profile/" + account.username)} style={{"cursor": "pointer"}} >{account.username}</td>
                                        <td>{account.name}</td>
                                        <td>{account.email}</td>
                                        <td style={{cursor: "pointer"}}  onClick={() => showRoleModal(index)}>{account.role}</td>
                                        <td>{`${month} ${date}, ${year} ${hours}:${minutes} ${timeOfDay}`}</td>
                                        <td>
                                            <button 
                                                className='btn btn-danger' onClick={() => showDeleteModal(index)}>Delete Account?</button></td>
                                    </tr>

                                    {/* Change Account Type Modal */}
                                    <Modal centered backdrop="static" show={showChangeRole[index]} onHide={() => closeRoleModal(index)} >
                                        <Modal.Header closeButton>
                                            <Modal.Title>Edit Account Type of {account.username}?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <p>Old Account Role: {account.role}</p>
                                            <label className='form-label'>New Account Role:</label>
                                            <input type="text" className='form-control' onChange={(e) => setNewRole(e.target.value)} />
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <button type='button' className='btn btn-secondary' onClick={() => closeRoleModal(index)}>Cancel</button>
                                            {/* Condition avoids changing the account type of your own account */}
                                            {authState.username !== account.username && <button type='button' className='btn btn-warning' onClick={() => changeRole(account.id, index)}>Change Account Type</button> }
                                        </Modal.Footer>
                                    </Modal>

                                    {/* Delete Account Modal */}
                                    <Modal 
                                        centered 
                                        backdrop="static" 
                                        show={showDeleteAccount[index]} 
                                        onHide={() => closeDeleteModal(index)} >
                                        <Modal.Header closeButton>
                                            <Modal.Title>Are you sure you want to delete {account.username}?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <p><strong>Role:</strong> {account.role}</p>
                                            <p><strong>Name:</strong> {account.name}</p>
                                            <p><strong>Username:</strong> {account.username}</p>
                                            <hr />
                                            <Formik
                                                initialValues={initialValues}
                                                onSubmit={deleteAccount}
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
                                            {/* Condition avoids deleting your own account */}
                                            {authState.username !== account.username && <button type='submit' className='btn btn-danger' onClick={() => deleteAccount(account.username, account.id, index)}>Confirm Delete</button> }
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
    );
}

export default AccountsTable;