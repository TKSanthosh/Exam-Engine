import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import sifyLogo from './assets/images/sify-logo.png';
import SerialNumber from './SerialNumber'; // Import the SerialNumber component
// const axios = require("axios");
import axios from 'axios';

import './Admin.css';

  const ClientLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('854306A');
  const [password, setPassword] = useState('admin');
  const [serialNumber, setSerialNumber] = useState('');

  // This function will be passed to the child component
  const handleSerialNumber = (serial) => {
    setSerialNumber(serial);
  };
  


//   const handleLogin = () => {
//     // Check user data (replace this with your actual authentication logic)
//     if ((username === 'admin' && password === 'admin')) {
//         // Call the onLogin function passed from the parent
//         onLogin(username);
//       } else if ((username === '800002A' && password === 'password')) {
//         // Call the onLogin function passed from the parent
//         onLogin(username);
//       } else {
//       alert('Invalid username or password');
//     }
//   };

  const handleLogin = async () => {
    try { const response = await axios.post('http://localhost:5000/clientlogin',
        {
          username: username,
          password: password,
          serialnumber: serialNumber,
        },
        {
          withCredentials: true, // Include cookies with the request
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Successful login
      console.log('Login successful:', response.data);
  
      // Call the onLogin function or perform further actions
      onLogin(username);
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Login failed:', error.response.statusText);
        alert(error.response.data.message || 'Invalid username or password');
      } else {
        // Network or other errors
        console.error('Error during login:', error.message);
        alert('Error during login. Please try again.');
      }
    }
  };
  
  

 

  return (
    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6 loginform " >
        <center><img src={sifyLogo} style={{width:'150px'}}/></center>
      <h3>Client Login </h3><hr/>
      <label>Username: <input type="text" className='form-control' style={{display:'inline'}} value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <br />
      <label>Password: <input type="password" className='form-control' style={{display:'inline'}} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <br />
      <br />
      <button onClick={handleLogin}>Login</button> <span className='serialno'><SerialNumber onSerialNumberChange={handleSerialNumber} /></span>
      {/* <Link className='btn btn-primary register-btn' to='/registration'>Register</Link> */}

    </div>
    </div>
    </div>
  );
};

export default ClientLogin;
