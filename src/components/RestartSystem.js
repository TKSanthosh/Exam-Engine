import React, { useState } from 'react';
import restart from './assets/images/restart.png';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

function RestartSystem() {
    const [alertState, setAlertState] = useState({ open: false, message: '', severity: '' });

    const handleRestart = async () => {
        const confirmed = window.confirm('Are you sure you want to restart the system?');

        if (confirmed) {
            try {
                const response = await fetch('http://localhost:5000/restart', {
                    method: 'POST',
                });

                if (response.ok) {
                    setAlertState({ open: true, message: 'System is restarting...', severity: 'success' });
                } else {
                    setAlertState({ open: true, message: 'Failed to restart the system.', severity: 'error' });
                }
            } catch (error) {
                console.error('Error restarting the system:', error);
                window.alert('An error occurred.'); // Use window.alert to avoid conflict
            }
        }
    };

    const handleCloseAlert = () => {
        setAlertState({ ...alertState, open: false });
    };

    return (
        <>
            <img
                src={restart}
                className='systembtn'
                onClick={handleRestart}
                title='Restart System'
                alt='Restart System'
            />
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertState.severity} sx={{ width: '100%',marginTop:'-20px' }}>
                    {alertState.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default RestartSystem;
