import { React, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../helpers/AuthContext';
import AccountsTable from '../components/administration/AccountsTable';
import RecipesTable from '../components/administration/RecipesTable';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Loading from '../components/Loading';

function Admin() {
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authState.stats === undefined) {
            setIsLoading(true);
        }

        if (authState.status !== undefined) {
            if (authState.role !== "ADMIN") {
                navigate("/");
            }
            setIsLoading(false);
        }
    }, [authState]);

    return (
        <div>
            {isLoading ?
                <Loading /> :
                <>
                    {authState.role !== "ADMIN" ? 
                        <div className='text-center m-5'>
                            <h1>You do not have authorized access to this page</h1>
                            <FontAwesomeIcon className='p-5' icon={faLock} style={{ fontSize: "10rem" }} />
                        </div> :
                        <div className='container'>
                            <h1 className='m-5 text-center'>Administration</h1>
                            <Tabs defaultActiveKey="accounts" className="mb-3">
                                <Tab eventKey="accounts" title="Accounts">
                                    <AccountsTable />
                                </Tab>
                                <Tab eventKey="recipes" title="Recipes">
                                    <RecipesTable />
                                </Tab>
                            </Tabs>
                        </div>
                    }
                </>
            }
            
        </div>
    );
}

export default Admin;