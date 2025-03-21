import React, { useState,useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const ReusablePasswordDialog = ({ open, onClose, onSubmit,validAccess,  title, passwordtype, batch , batchval }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [serialNumber, setSerialNumber] = useState('');
    // const [actPasswordDB, setactPasswordDB] = useState('');

    useEffect(() => {
      
      fetch('http://localhost:5000/serial-number')
        .then(response => response.json())
        .then(data => {
          setSerialNumber(data.serialNumber);
        })
        .catch(error => console.error('Error fetching serial number:', error));
    }, []);

    // console.log('Pass Batch', batch);
    const handleSubmit = () => {
        // alert(passwordtype);
        if (password.trim()) {
            // if(passwordtype=='node' & password == 'tiger'){
            //     validAccess(1);
            // }else if(passwordtype=='mysql' & password == 'mysql'){
            //     validAccess(1);
            // }else if(passwordtype=='clear' & password == 'data'){
            //     validAccess(1);
            // }else if(passwordtype=='backup' & password == 'zip'){
            //     validAccess(1);
            // }else if(passwordtype=='memcache' & password == 'memcache'){
            //   validAccess(1);
          if(passwordtype=='node'){
              validAccess(1);
          }else if(passwordtype=='mysql'){
              validAccess(1);
          }else if(passwordtype=='clear'){
              validAccess(1);
          }else if(passwordtype=='backup'){
              validAccess(1);
          }else if(passwordtype=='memcache'){
            validAccess(1);
          }else if(passwordtype=='clear'){
            validAccess(1);
          }else if(passwordtype == 'miscellaneous'){
            validAccess(1);
          }else if(passwordtype == 'Biometric'){
            validAccess(1);
          }
          
            else if(passwordtype=='activation'){
                axios
                .post(
                  "http://localhost:5000/Qpactivation",
                  { serialNumber, batch, batchval , password},
                  {
                    withCredentials: true, // Include cookies with the request
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                )
                .then((response) => {
                  console.log("External system response:", response.data);
              
                  // Check if actPasswordDB exists in the response and handle accordingly
                  if (response.data?.actPasswordDB) {
                    console.log("Password:", response.data.actPasswordDB);
                    // setactPasswordDB(response.data.actPasswordDB); // Assuming you have this state setter
                //   if((batch=='11:00:00' && password==response.data.actPasswordDB) || (batch=='15:00:00' && password==response.data.actPasswordDB) ){
                    if((password==response.data.actPasswordDB)){
                      validAccess(1);
                      try {
                        const response = axios.get(`http://localhost:4500/preload-images`);
                      } catch (error) {
                        console.error("Error fetching data:", error.message);
                      }
                  } else {
                      validAccess(0);
                  }
                  } else {
                    console.warn("actPasswordDB is not available in the response.");
                  }
                
                })
                .catch((error) => {
                  if (error.response) {
                    // Server responded with a status outside the 2xx range
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                    console.error("Error headers:", error.response.headers);
                  } else if (error.request) {
                    // Request was made but no response received
                    console.error("Error request:", error.request);
                  } else {
                    // Something went wrong while setting up the request
                    console.error("Error message:", error.message);
                  }
              
                  // Optionally show a user-friendly error message
                  alert("An error occurred while processing your request. Please try again.");
                });
                
            }else if(passwordtype=='batchclosure'){
                axios.post("http://localhost:5000/Qpactivation",
                  { serialNumber, batch, batchval, password},
                  {
                    withCredentials: true, // Include cookies with the request
                    headers: {'Content-Type': 'application/json',
                    },
                  }
                )
                .then((response) => {
                  console.log("External system response:", response.data);
              
                  // Check if actPasswordDB exists in the response and handle accordingly
                  if (response.data?.actPasswordDB) {
                    console.log("Password:", response.data.actPasswordDB);
                    // setactPasswordDB(response.data.actPasswordDB); // Assuming you have this state setter
                //   if((batch=='11:00:00' && password==response.data.actPasswordDB) || (batch=='15:00:00' && password==response.data.actPasswordDB) ){
                    if((password==response.data.actPasswordDB)){
                      validAccess(2);
                  } else {
                      validAccess(0);
                  }
                  } else {
                    console.warn("actPasswordDB is not available in the response.");
                  }
                })
                .catch((error) => {
                  if (error.response) {
                    // Server responded with a status outside the 2xx range
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                    console.error("Error headers:", error.response.headers);
                  } else if (error.request) {
                    // Request was made but no response received
                    console.error("Error request:", error.request);
                  } else {
                    // Something went wrong while setting up the request
                    console.error("Error message:", error.message);
                  }
              
                  // Optionally show a user-friendly error message
                  alert("An error occurred while processing your request. Please try again.");
                });
                
            }else if(passwordtype=='dayclosure'){
                axios
                .post(
                  "http://localhost:5000/Qpactivation",
                  { serialNumber, batch, batchval , password},
                  {
                    withCredentials: true, // Include cookies with the request
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                )
                .then((response) => {
                  console.log("External system response:", response.data);
              
                  // Check if actPasswordDB exists in the response and handle accordingly
                  if (response.data?.actPasswordDB) {
                    console.log("Password:", response.data.actPasswordDB);
                    // setactPasswordDB(response.data.actPasswordDB); // Assuming you have this state setter
                //   if((batch=='11:00:00' && password==response.data.actPasswordDB) || (batch=='15:00:00' && password==response.data.actPasswordDB) ){
                    if((password==response.data.actPasswordDB)){
                      validAccess(3);
                  } else {
                      validAccess(0);
                  }
                  } else {
                    console.warn("actPasswordDB is not available in the response.");
                  }
                })
                .catch((error) => {
                  if (error.response) {
                    // Server responded with a status outside the 2xx range
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                    console.error("Error headers:", error.response.headers);
                  } else if (error.request) {
                    // Request was made but no response received
                    console.error("Error request:", error.request);
                  } else {
                    // Something went wrong while setting up the request
                    console.error("Error message:", error.message);
                  }
              
                  // Optionally show a user-friendly error message
                  alert("An error occurred while processing your request. Please try again.");
                });
                
            }else if(passwordtype=='clearqp'){
              // alert();
              axios.post("http://localhost:5000/clearQP",
                { serialNumber, password},
                {
                  withCredentials: true, // Include cookies with the request
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              )
              .then((response) => {
                console.log("External system response:", response.data);
            
                // Check if actPasswordDB exists in the response and handle accordingly
                if (response.data?.success) {
                  validAccess(4);
                }else{
                  validAccess(0);
                }
              })
              .catch((error) => {
                if (error.response) {
                  // Server responded with a status outside the 2xx range
                  console.error("Error response:", error.response.data);
                  console.error("Error status:", error.response.status);
                  console.error("Error headers:", error.response.headers);
                } else if (error.request) {
                  // Request was made but no response received
                  console.error("Error request:", error.request);
                } else {
                  // Something went wrong while setting up the request
                  console.error("Error message:", error.message);
                }
            
                // Optionally show a user-friendly error message
                alert("An error occurred while processing your request. Please try again.");
              });
              
          }
            else{
                validAccess(0);
            }

            
            onSubmit(password);
            setPassword(''); // Clear password after submission
            onClose(); // Close the dialog
        } else {
            // Optionally handle empty password case
            alert('Please enter a password.');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton> &nbsp; &nbsp; 
                                 {<SendIcon className='sendbtn'  onClick={handleSubmit} />}
                                 
                                
                            </InputAdornment>
                        ),
                    }}
                />
             <input type="hidden" name="hiddenPassword" id="hiddenPassword" value={password} />
            </DialogContent>
             
        </Dialog>
    );
};

export default ReusablePasswordDialog;
