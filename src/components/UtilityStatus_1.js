import React, { useState, useEffect,useRef } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import synchronize from './assets/images/synchronize.png';
import ReusablePasswordDialog from './ReusablePasswordDialog';
import { handleClear } from './utils';
import axios from 'axios';

function UtilityStatus(examdata) {
    const [isOpen, setIsOpen] = useState(false);
    const [reactStatus, setReactStatus] = useState('red'); // 'green' for up, 'red' for down
    const [nodeStatus, setNodeStatus] = useState('red'); // 'green' for up, 'red' for down
    const [mysqlStatus, setMySQLStatus] = useState('red'); // 'green' for up, 'red' for down
    const [memCacheStatus, setMemCacheStatus] = useState('red'); // 'green' for up, 'red' for down
    const [examStatus, setExamStatus] = useState('red'); // 'green' for up, 'red' for down
    const [dialogOpen, setDialogOpen] = useState(false);
    const [utilityPwd, setUtilityPwd] = useState('');
    const [utilityText, setUtilityText] = useState('utility-txt');
    
    const [centreCode, setCenterCode] = useState("");
    const [serverNumber, setServerNo] = useState("");
    const [module, setModule] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const hiddenPasswordRef = useRef(null);
    // const [password, setPassword] = useState('');
     
    const handleOpenDialog = (utility) => {
        setDialogOpen(true);
        setUtilityPwd(utility);
        setUtilityText('utility-txt-active');
        // console.log('ssss',examdata);
    };
    
    const handleCloseDialog = () => {
        setDialogOpen(false);
        // setUtilityPwd('');
        if(utilityPwd==''){
            setUtilityText('utility-txt');
        } else{
        setUtilityPwd('');

        }
        // setUtilityText('utility-txt');
    };

    const handleSubmitPassword = (password) => {
        // Handle password submission here
        // alert('1');
        // // setPassword(password);
        // alert(password);
        console.log('Utility Password submitted:', password);
    };


    const handleValidAccess = async (vaaccess) => {
       
        if (vaaccess !== 1) {
            alert('Access Failed!');
            setUtilityText('utility-txt');
            return;
        }
        // alert("TEST");
    
        try {
            const hiddenPasswordValue = document.getElementById('hiddenPassword').value;
            // Fetch center and server details
            const { data: centerData } = await axios.get('http://localhost:5000/get-center-server-details');
            if (!centerData.center_code) {
                console.error('Error fetching center/server details:', centerData.error);
                alert('Failed to fetch center and server details.');
                return;
            }
    
            setCenterCode(centerData.center_code);
            setServerNo(centerData.serverno);
    
            // Determine module type
            const moduleType =
                ['memcache', 'mysql', 'node'].includes(utilityPwd)
                    ? 'Utility'
                    : ['clear', 'backup'].includes(utilityPwd)
                    ? 'Truncate'
                    : '';
    
            // Generate password
            const { data: passwordResponse } = await axios.post('http://localhost:5000/generate-password', {
                centreCode: centerData.center_code,
                serverNumber: centerData.serverno,
                module: moduleType,
            });
    
            if (!passwordResponse.success) {
                console.error('Password generation failed:', passwordResponse.error);
                alert('Failed to generate password.');
                return;
            }
    
            const generatedPassword = passwordResponse.generatedPassword;
            setGeneratedPassword(generatedPassword);
    
           
            
            // Check password match
            
            alert(generatedPassword);
            // alert(hiddenPasswordValue);
            if (hiddenPasswordValue != generatedPassword) {
                alert('Password Mismatch');
                return;
            }
    
            // Handle utility tasks
            switch (utilityPwd) {
                case 'node':
                    restartService('node');
                    break;
                case 'mysql':
                    restartService('mysql');
                    break;
                case 'clear':
                    handleClear();
                    break;
                case 'backup':
                    handleBackup();
                    break;
                case 'memcache':
                    try {
                        const { data: preloadResponse } = await axios.get('http://localhost:4500/preload-images');
                        alert(preloadResponse.message);
                    } catch (error) {
                        console.error('Error fetching preload images:', error.message);
                    }
                    break;
                default:
                    console.error('Invalid utility task:', utilityPwd);
            }
        } catch (error) {
            console.error('Error handling valid access:', error.message);
            alert('An error occurred while processing the request.');
        }
    };
    
    
    
    const handleBackup = async () => {
        

        try {
            
            // Make GET request to batch closure API
            const response = await axios.get(`http://localhost:5000/api/backup/${examdata['centrecode']}/${examdata['serialNumber']}`);
     
            if(response.statusText=='OK'){
               
                  // Display alert on successful batch closure
                  alert('Backup successful');
            } else {
                alert('Backup Falied !');
            }
          } catch (err) {
            // Handle error
            console.log('Error while processing backup');
          }
      };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setUtilityText('utility-txt');

    };

    const restartService = (service) => {
        fetch(`http://localhost:5001/api/restart/${service}`, { method: 'POST' })
            .then(response => {
                console.log('utilityy',response);
                if (response.ok) {
                    alert(`${service} service is restarting...`);
                } else {
                    
                    alert(`Failed to restart ${service} service.`);
                }
            })
            .catch(() => alert(`Failed to restart ${service} service.`));
    };

    useEffect(() => {
        // Function to check the status of the servers
        const checkUtilityStatus = () => {
            fetch('/health-check')
                .then(response => {
                    if (response.ok) {
                        setReactStatus('green'); // React server is up
                    } else {
                        setReactStatus('red');
                    }
                })
                .catch(() => setReactStatus('red'));

            fetch('http://localhost:5000/api/health')
                .then(response => {
                    if (response.ok) {
                        setNodeStatus('green'); // Node.js server is up
                    } else {
                        setNodeStatus('red');
                    }
                })
                .catch(() => setNodeStatus('red'));

            fetch('http://localhost:5000/api/mysql-health')
                .then(response => {
                    if (response.ok) {
                        setMySQLStatus('green'); // MySQL server is up
                    } else {
                        setMySQLStatus('red');
                    }
                })
                .catch(() => setMySQLStatus('red'));

            fetch('http://localhost:5000/api/memcache-health')
                .then(response => {
                    if (response.ok) {
                        setMemCacheStatus('green'); // Memcached server is up
                    } else {
                        setMemCacheStatus('red');
                        // setMemCacheStatus('green');
                    }
                })
                .catch(() => setMemCacheStatus('red'));
                // .catch(() => setMemCacheStatus('green'));

            // Add check for WWW service
            // fetch('http://your-web-server-url/health-check') // Replace with your web server's health check URL
            //     .then(response => {
            //         if (response.ok) {
            //             setExamStatus('green'); // WWW service is up
            //         } else {
            //             setExamStatus('red');
            //         }
            //     })
            //     .catch(() => setExamStatus('red'));
        };

        // Initial status check
        checkUtilityStatus();

        // Set up an interval to check the status every 2 seconds
        const intervalId = setInterval(checkUtilityStatus, 2000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <IconButton
                onClick={toggleOpen}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '0',
                    transform: 'translateY(-50%)',
                    zIndex: 1000,
                    backgroundColor: 'white',
                }}
            >
                <SettingsIcon />
            </IconButton>

            {isOpen && ( <>
                <Paper
                    elevation={3}
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50px',
                        transform: 'translateY(-50%)',
                        padding: '10px',
                        zIndex: 1000,
                        transition: 'transform 0.3s ease-in-out',
                        width: '200px',
                        borderRadius: "10px"
                    }}
                >
                    <center>
                        <Typography variant="h6" gutterBottom>
                            Server Status 
                        </Typography>
                    </center>
                    <hr/>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: reactStatus,
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography>Admin Server</Typography>
                        
                        {/* <img src={synchronize}  onClick={() => restartService('react')} className="utility-btn"/>  */}

                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: examStatus,
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography>Exam Server</Typography>
                        
                        {/* <img src={synchronize}  onClick={() => restartService('exam')} className="utility-btn"/>  */}

                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: nodeStatus,
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography>Node Server</Typography>
                         
                        <img src={synchronize} onClick={() => handleOpenDialog('node')} className="utility-btn"/> 
                        {/* <img src={synchronize}   onClick={() => restartService('node')} className="utility-btn"/>  */}
                        
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: mysqlStatus,
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography>MySQL Server</Typography>
                        <img src={synchronize}  onClick={() => handleOpenDialog('mysql')} className="utility-btn"/> 

                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: memCacheStatus,
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography>Memcache Service</Typography>
                         
                        <img src={synchronize}  onClick={() => handleOpenDialog('memcache')} className="utility-btn"/> 

                    </Box><hr/>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography className={utilityText}>Clear Exam Data</Typography>
                         
                        <img src={synchronize} onClick={() => handleOpenDialog('clear')} className="utility-btn"/> 
                        
                    </Box>
                    {(examdata['qpStatus']>=6) && (
                    <Box display="flex" alignItems="center" mb={1}>
                        <Box
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                marginRight: '10px',
                            }}
                        />
                        <Typography className={utilityText}>Back-up Data</Typography>
                         
                        <img src={synchronize} onClick={() => handleOpenDialog('backup')} className="utility-btn"/> 
                        
                    </Box>
                    )}
                </Paper>

                    <ReusablePasswordDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    onSubmit={handleSubmitPassword}
                    validAccess={handleValidAccess}
                    
                    title="Enter Utility Password"
                    passwordtype={utilityPwd}
                    batch=''
                    />
                    {/* <ReusablePasswordDialog
    open={dialogOpen}
    onClose={handleCloseDialog}
    validAccess={async (password) => {
        await handleSubmitPassword(password); // First function
        handleValidAccess(1); // Second function
    }}
    onSubmit={handleSubmitPassword}
    title="Enter Utility Password"
    passwordtype={utilityPwd}
    batch=""
/> */}

                    </>
            )}
        </>
    );
}

export default UtilityStatus;
