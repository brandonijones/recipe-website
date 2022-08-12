import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './helpers/AuthContext';
import AccountService from './services/AccountService';

/* Components and Pages */
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Search from './pages/Search';
import NewPost from './pages/NewPost';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import EditProfile from './components/EditProfile';
import ChangeEmail from './components/ChangeEmail';
import ChangePassword from './components/ChangePassword';
import DeleteAccount from './components/DeleteAccount';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Registration from './pages/Registration';
import ConfirmEmail from './pages/ConfimEmail';
import ResendEmail from './pages/ResendEmail';
import EmailVerification from './pages/EmailVerification';
import PageNotFound from './pages/PageNotFound';

/* Import styling */
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/navbar.css';
import './styles/settings.css';
import './styles/profile.css';
import './styles/newpost.css';

function App() {

  const [authState, setAuthState] = useState({});

  useEffect(() => {
    AccountService.validate().then((response) => {
      console.log("Valdation check: \n");
      console.log(response.data);
      if (response.data.error) {
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
      } else {
        let user = response.data.user;
        setAuthState({
            status: true,
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profilePicture: user.profilePicture,
            bio: user.bio,
            role: user.role
        });
      }
      console.log(authState)
    });
  }, [authState.status, authState.username]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }} >
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavigationBar />} >
            <Route index element={<Home />} />
            <Route path='/search' element={<Search />} />
            <Route path='/new-post' element={ <NewPost /> } />
            <Route path='/login' element={<Login />} />
            <Route path='/profile/:username' element={<Profile />} />
            <Route path='/account/settings' element={<Settings />}>
              <Route index element={<EditProfile />} />
              <Route path='edit-profile' element={<EditProfile />} />
              <Route path='change-email' element={<ChangeEmail />} />
              <Route path='change-password' element={<ChangePassword />} />
              <Route path='delete-account' element={<DeleteAccount /> } />
            </Route>
            <Route path='/forgot-password' element={ <ForgotPassword /> } />
            <Route path='/reset-password' element={ <ResetPassword /> } />
            <Route path='/registration' element={<Registration />} />
            <Route path='/registration-success' element={<ConfirmEmail />} />
            <Route path='/resend-email' element={<ResendEmail />} />
            <Route path='/verify' element={<EmailVerification />} />
            <Route path='*' element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
