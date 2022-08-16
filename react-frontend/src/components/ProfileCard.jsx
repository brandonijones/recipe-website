import { React } from 'react';
import { useNavigate } from 'react-router';

function ProfileCard(props) {
    const navigate = useNavigate();
    const account = props.account;
    const index = props.index;

    const goToAccount = (username) => {
        navigate(`/profile/${username}`);
    }

    return (
        <div className='col-sm-6 col-md-3' key={index} >
            <div className='card profile-card h-100 mx-auto' onClick={() => goToAccount(account.username)}>
                <img src={account.profilePicture} alt={account.name} className='mt-2 mx-auto card-img-top profile-card-img' />
                <div className='card-body'>
                    <h5 className='card-title text-center'>{account.name}</h5>
                    <hr />
                    <p className='text-center'>{account.username}</p>
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;