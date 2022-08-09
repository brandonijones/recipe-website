import React, { useContext, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';

/* React Bootstrap Components */
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

function NavigationBar() {

    const { authState, setAuthState } = useContext(AuthContext);
    const [show, setShow] = useState(false);

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

    const dropdownToggle = () => {
        if (!show) {
            setShow(true);
        } else {
            setShow(false);
        }
    }

    return (
        <div>
            <Navbar  bg='dark' variant='dark' sticky="top">
                <Navbar.Brand> 
                    <Link to='/'>The Open Cookbook</Link>
                </Navbar.Brand>

                <div className='container-fluid justify-content-end' >
                    <Nav className='d-flex align-items-center' >
                        <div >
                            <Link to='/'>Home</Link>
                        </div>
                        <div >
                            <Link to='/search'>Search</Link>
                        </div>
                        
                        
                        { authState.status && 
                            <div className='border' >
                                <Link to='/new-post'>Post <FontAwesomeIcon icon={faCirclePlus} /> </Link>
                            </div>
                            
                        }

                        <div className='dropdown' onMouseLeave={() => setShow(false)} >
                            <FontAwesomeIcon className='profile-icon ms-2' icon={faUser} onClick={dropdownToggle} />
                        
                            {/* Profile icon dropdown content */}
                            { show && 
                                <div className='dropdown-content'>
                                    { authState.status ?
                                        <div>
                                            <Link to={'/profile/' + authState.username}>Profile</Link>
                                            <Link to='/account/settings'>Settings</Link>
                                            <br />
                                            <Link to="/" onClick={logout} >Logout</Link>
                                        </div> :
                                        <div>
                                            <Link to='/login'>Login</Link>
                                            <Link to='/registration'>Sign Up</Link>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </Nav>
                </div>
            </Navbar>

            <Outlet />
        </div>
    );
}

export default NavigationBar;