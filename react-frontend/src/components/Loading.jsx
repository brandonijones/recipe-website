import React from 'react';

import Spinner from 'react-bootstrap/Spinner';

function Loading() {
    return (
        <div className='text-center my-auto' >
            <h1>Loading</h1>
            <Spinner animation='border' />
        </div>
    );
}

export default Loading;