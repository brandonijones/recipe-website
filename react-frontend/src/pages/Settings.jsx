import { React, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import { useNavigate } from 'react-router';
import { Routes, Route, Link, Outlet } from 'react-router-dom';

/* Components */
import EditProfile from '../components/EditProfile';
import ChangeEmail from '../components/ChangeEmail';
import ChangePassword from '../components/ChangePassword';
import Loading from '../components/Loading';

/* Import react boostrap styling */
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';

function Settings() {
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);
    const [currentUser, setCurrentUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // User has to be logged in to access this page
    useEffect(() => {
        console.log("authState status is " + authState.status);
        console.log("authState id is " + authState.id);
        
        if (authState.status === 'undefined') {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }

        if (authState.status === false) {
            navigate("/login");
        }

        // AccountService.getCurrentUser(authState.id).then((response) => {

        //     console.log("Settings check: \n")
        //     console.log(response.data);

        //     if (!response.data.error) {
        //         setIsLoading(false);
        //     }
        //     const accountInfo = response.data.user;
        //     setCurrentUser({...accountInfo});
        // });
    }, [authState, navigate]);

    return (
        <div >
            { isLoading ? 
                <Loading /> :
                <div className='border container-sm my-5' style={{"maxWidth": "50rem"}}>
                    <h1>Account Settings</h1>
                    <Nav>
                        <Nav.Item>
                            <Link to='/account/settings/edit-profile'>Edit Profile</Link>   
                        </Nav.Item>
                        <Nav.Item>
                            <Link to='/account/settings/change-email'>Change Email</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to='/account/settings/change-password'>Change Password</Link>
                        </Nav.Item>
                    </Nav>

                    <Outlet />
                </div>
            } 
        </div>
    );
}

export default Settings;