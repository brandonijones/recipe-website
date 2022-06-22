import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Registration from './pages/Registration';
import ConfirmEmail from './pages/ConfimEmail';
import ResendEmail from './pages/ResendEmail';
import EmailVerification from './pages/EmailVerification';
import PageNotFound from './pages/PageNotFound';

/* Import styling */
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Navbar.css';
import { AuthContext } from './helpers/AuthContext';
import AccountService from './services/AccountService';



function App() {

  const [authState, setAuthState] = useState({
    status: false,
    id: null,
    username: "",
    firstName: "",
    lastName: "",
    role: ""
  });

  useEffect(() => {
    AccountService.validate().then((response) => {
      console.log(response.data);
      if (response.data.error) {
        setAuthState({
          status: false,
          id: null,
          username: "",
          firstName: "",
          lastName: "",
          role: ""
        });
      } else {
        let user = response.data.user;
        setAuthState({
            status: true,
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
      }

      
    });
  }, [authState.status]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }} >
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavigationBar />} >
            <Route index element={<Home />} />
            <Route path='/search' element={<Search />} />
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={ <ForgotPassword /> } />
            <Route path='/reset-password/:code' element={ <ResetPassword /> } />
            <Route path='/registration' element={<Registration />} />
            <Route path='/registration-success' element={<ConfirmEmail />} />
            <Route path='/resend-email' element={<ResendEmail />} />
            <Route path='/verify/:code' element={<EmailVerification />} />
            <Route path='*' element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
