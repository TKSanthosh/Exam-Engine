import React from 'react';
import { useNavigate } from 'react-router-dom';
import sifyLogo from './assets/images/sify-logo.png';

function NotFound() {
  const navigate = useNavigate();

  const goToAbout = () => {
    navigate('/');
  };

  return (
    <div>
      <div className='row'>
        <div className='container'>
        <center>
          <br/>
          <br/>
          <br/>
        <img src={sifyLogo} style={{width:'150px'}}/> 

        <h2>404 - Page Not Found</h2>
        <p>Sorry, the page you are looking for does not exist.</p>
        <button className='btn btn-primary' style={{marginTop:"20px"}} onClick={goToAbout}>Home</button>
        </center>
        </div>
      </div>
      
    </div>
  );
}

export default NotFound;
