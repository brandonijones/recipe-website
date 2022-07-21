import React, { useContext, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';

/* React Bootstrap Components */
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function NavigationBar() {

    const { authState, setAuthState } = useContext(AuthContext);
    const [show, setShow] = useState(false);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({
            status: false,
            id: null,
            username: "",
            name: "",
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
            <Navbar collapseOnSelect bg='dark' variant='dark' expand='md' sticky="top">
                <Navbar.Brand> <Link to='/'>The Open Cookbook</Link> </Navbar.Brand>
                <Navbar.Toggle aria-controls='responsive-navbar-nav' />

                <div className='container-fluid' >
                    <Navbar.Collapse id='responsive-navbar-nav' className='justify-content-end'>
                        <Nav>
                            <Link to='/'>Home</Link>
                            <Link to='/search'>Search</Link>
                            <div className='dropdown'>
                                <FontAwesomeIcon className='profile-icon' icon={faUser} onClick={dropdownToggle} />
                                { show && 
                                    <div className='dropdown-content' >
                                    { authState.status ?
                                        <div>
                                            <Link to='/account/profile'>Profile</Link>
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
                    </Navbar.Collapse>
                </div>
            </Navbar>

            <Outlet />
        </div>
    );
}

export default NavigationBar;