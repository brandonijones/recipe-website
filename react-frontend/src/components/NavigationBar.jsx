import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/* React Bootstrap Components */
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

function NavigationBar() {

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
                            <Link to='/login'>Login</Link>
                            <Link to='/registration'>Sign Up</Link>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>

            <Outlet />
        </div>
    );
}

export default NavigationBar;