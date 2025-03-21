import React, { useState } from 'react';
import shutdown from './assets/images/shutdown.png';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const ShutdownButton = () => {
    const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

        // Proceed with the function if the user clicks "OK"
        const handleShutdown = async () => {

            const confirmed = window.confirm('Are you sure you want to Shutdown the server ?');
    
            if (confirmed) {
                try {
                    const response = await fetch('http://localhost:5000/shutdown', {
                        method: 'POST',
                    });

                    if (response.ok) {
                        setAlert({ open: true, message: 'Shutdown initiated successfully !', severity: 'success' });

                        // alert('Shutdown initiated successfully.');
                    } else {
                        setAlert({ open: true, message: 'Failed to initiate shutdown.', severity: 'error' });
                        // alert('Failed to initiate shutdown.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error while trying to initiate shutdown.');
                }
            } else {
                // Do nothing if the user clicks "Cancel"
                console.log('Action was canceled.');
              }
        };
    
        const handleCloseAlert = () => {
            setAlert({ ...alert, open: false });
          };

    return (
        <>
            <img src={shutdown} className='systembtn'  onClick={handleShutdown}  title='Shutdown System' /> 
                <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%',marginTop:'-20px' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
      </>
    );
};

export default ShutdownButton;
