import { React, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import AccountService from '../services/AccountService';
import { useNavigate } from 'react-router';

/* Components */
import EditProfile from '../components/EditProfile';
import ChangeEmail from '../components/ChangeEmail';
import ChangePassword from '../components/ChangePassword';

/* Import react boostrap styling */
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

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
        }

        if (authState.status === false) {
            navigate("/login");
        }

        AccountService.getCurrentUser(authState.id).then((response) => {

            console.log("Settings check: \n")
            console.log(response.data);

            if (!response.data.error) {
                setIsLoading(false);
            }
            const accountInfo = response.data.user;
            setCurrentUser({...accountInfo});
        });
    }, [authState, navigate]);

    return (
        <div >
            { isLoading ? 
                <div>
                    <h1>Loading...</h1>
                </div> :
                <div className='border container-sm my-5' style={{"maxWidth": "50rem"}}>
                    <h1>Account Settings</h1>
                    <Tabs>
                        <Tab eventKey="profile" title="Edit Profile" >
                            <EditProfile currentUser={currentUser} setCurrentUser={setCurrentUser} />
                        </Tab>
                        <Tab eventKey="changeEmail" title="Change Email Address">
                            <ChangeEmail />
                        </Tab>
                        <Tab eventKey="changePassword" title="Change Password" >
                            <ChangePassword />
                        </Tab>
                    </Tabs>
                </div>
            } 
        </div>
    );
}

export default Settings;