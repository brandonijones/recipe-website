import React, { useContext, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';


/* React Bootstrap Components */
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCirclePlus, faHouse } from '@fortawesome/free-solid-svg-icons';

import ExpandedLogo from '../images/recipe-website-expanded-logo.png';

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
            <Navbar className='py-3' sticky='top'>
                <div className='container px-4'>
                    <Navbar.Brand> 
                        <Link to='/' className='logo' > <img className='img-fluid' src={ExpandedLogo} alt="The Recipe Bowl logo" /> </Link>
                    </Navbar.Brand>

                    <div className='align-items-end' >
                        <Nav className='d-flex align-items-center' >
                            <div >
                                <Link to='/'><FontAwesomeIcon className='home-icon' icon={faHouse} /> </Link>
                            </div>

                            
                            
                            { authState.status && 
                                <div className='post-border py-1' >
                                    <Link to='/new-post'><FontAwesomeIcon icon={faCirclePlus} /> Post</Link>
                                </div>  
                            }

                            { authState.role === 'ADMIN' &&
                                <Link to='/admin'>ADMIN</Link>
                            }

                            <div className='dropdown' onMouseLeave={() => setShow(false)} >

                                {authState.status ? 
                                    <img className='profile-image-icon ms-2' src={authState.profilePicture} onClick={dropdownToggle} alt="Profile" /> :
                                    <div >
                                        <FontAwesomeIcon className='profile-icon ms-2' icon={faUser} onClick={dropdownToggle} />
                                    </div>
                                    
                                }
                                
                            
                                {/* Profile icon dropdown content */}
                                { show && 
                                    <div className='dropdown-content'>
                                        { authState.status ?
                                            <div>
                                                <Link to={'/profile/' + authState.username}>Profile</Link>
                                                <Link to='/account/settings'>Settings</Link>
                                                <hr className='my-0' />
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
                </div>
            </Navbar>

            <Outlet />
        </div>
    );
}

export default NavigationBar;