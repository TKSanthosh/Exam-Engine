import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TextField, IconButton, InputAdornment, Button, Card, CardContent, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import wifi from './assets/images/wifi.png';

import './InternetSpeedChecker.css'; 
import { red } from '@mui/material/colors';

const InternetSpeedChecker = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [speedLevel, setSpeedLevel] = useState('-');
    const [speedMbps, setSpeedMbps] = useState(0);
    const [showSpeedChecker, setShowSpeedChecker] = useState(false);

    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('');
    const [panelVisible, setPanelVisible] = useState(false);
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
    const wifiButtonRef = useRef(null);



    
  // Fetch available networks
  const fetchNetworks = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/networks');
      const networks = response.data;
    setNetworks(networks);
    } catch (error) {
      console.error('Error fetching networks:', error);
      setStatus('Failed to fetch networks');
    }
  };

  // Fetch the current connection status
  const fetchConnectionStatus = async () => {
    console.log('fetch status');
    try {
      const response = await axios.get('http://localhost:5001/api/connection-status');
      const { connected, details } = response.data;
    //   console.log('conn',response.data);
      if (connected && details) {
        setStatus(`Connected to ${details.ssid}`);
      } else {
        setStatus('Not connected to any network');
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
      setStatus('Failed to fetch connection status');
    }
  };

  // Handle connection
  const handleConnect = async () => {
    if (!selectedNetwork || !password) {
      setStatus('Please select a network and enter a password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/connect', {
        ssid: selectedNetwork.ssid,
        password,
      });
      setStatus(response.data.message);
      fetchConnectionStatus();
    } catch (error) {
      console.error('Error connecting to the network:', error);
      setStatus('Failed to connect to the network.');
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/disconnect');
      setStatus(response.data.message);
      fetchConnectionStatus();
    } catch (error) {
      console.error('Error disconnecting from the network:', error);
      setStatus('Failed to disconnect from the network.');
    }
  };


useEffect(() => {
    if(panelVisible==true){
        fetchNetworks();
        fetchConnectionStatus();
    const intervalId = setInterval(() => {
      fetchNetworks();
      fetchConnectionStatus();
    }, 5000); // Update every 5 seconds
  
    return () => clearInterval(intervalId);
    }
    
  }, [panelVisible]);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the panel and not on the Wi-Fi button
      if (panelVisible && !event.target.closest('.wifi-panel') && !wifiButtonRef.current.contains(event.target)) {
        // Ensure clicks on specific elements inside the panel do not close the panel
        if (!event.target.closest('#show-password-icon')) {
          setPanelVisible(false);
        }
      }
      
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);

    
  }, [panelVisible]);

    // Handle right-click to show panel
  const handleRightClick = (event) => {
    event.preventDefault();
    console.log('right click');
    // Get the image's position and dimensions
    const { top, left, height } = wifiButtonRef.current.getBoundingClientRect();

    // Calculate the position for the card to be above the image
    const cardTop = top - 800; // Adjust 300 to the height of your card
    const cardLeft = 960-left;

    setPanelPosition({ top: cardTop, left: cardLeft });
    setPanelVisible(true);
  };


    useEffect(() => {
        const handleOnlineStatus = () => {
            setIsOnline(navigator.onLine);
            if (navigator.onLine) {
                checkInternetSpeed();
            } else {
                setSpeedLevel('--');
                setSpeedMbps(0);
            }
        };

        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);

        // Start interval to check internet speed every second
        const intervalId = setInterval(() => {
            if (navigator.onLine) {
                checkInternetSpeed();
            }
        }, 1000); // Updates every second

        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
            clearInterval(intervalId); // Clear interval on unmount
        };
    }, []);

    const checkInternetSpeed = () => {
        const image = new Image();
        const startTime = new Date().getTime();
        // const imageUrl = "https://demo70.sifyitest.com/livedata/speed/1mb.jpg"; // 1MB file
        const imageUrl = "https://demo70.sifyitest.com/livedata/speed/1kb.png"; // 1kb file
        
        image.onload = () => {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000; // in seconds
            const fileSizeInBytes = 1024; // 1KB = 1024 bytes
            const bitsLoaded = fileSizeInBytes * 8; // Convert to bits
            const speedBps = bitsLoaded / duration; // Bits per second
            const speedKbps = speedBps / 1024; // Kilobits per second
            const speedMbps = speedKbps / 1024; // Megabits per second
        
            setSpeedMbps(speedMbps.toFixed(2)); // Set speed in Mbps
        
            let speedLevel = 'Fast';
            if (speedMbps < 0.02) {
                speedLevel = 'Slow';
            } else if (speedMbps >= 0.02 && speedMbps < 0.05) {
                speedLevel = 'Medium';
            }
        
            setSpeedLevel(speedLevel);
        
            // Log the data to the backend
            logInternetStatus('On', speedLevel);
        };
        

        image.onerror = () => {
            setSpeedLevel('---');
            setSpeedMbps(0);
    
            // Log the data as "offline"
            logInternetStatus('Off', '---');
        };

        image.src = `${imageUrl}?time=${startTime}`; // Add timestamp to avoid caching
    };


const logInternetStatus = (status, level) => {
    fetch('http://localhost:5000/log-internet-speed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, level }),
    })
    .then((response) => response.text())
    // .then((result) => console.log(result))
    .catch((error) => console.error('Error logging internet speed:', error));
};


    const speedBarWidth = () => {
        if (speedLevel === 'Slow') return 20;
        if (speedLevel === 'Medium') return 50;
        if (speedLevel === 'Fast') return 100;
        return 0;
    };

    const handleLeftClick = () => {
        setShowSpeedChecker(!showSpeedChecker);
    };

    const handleClose = () => {
        setShowSpeedChecker(false);
    };

    return (
        <div className="internet-icon">
            <img 
            src={wifi} className='wifi-button'
            alt="Wi-Fi"
            style={{ width: '30px', cursor: 'pointer', position: 'absolute', bottom: '0px', right: '10px' }}
            onContextMenu={handleRightClick}
            ref={wifiButtonRef} 
            onClick={handleLeftClick} />

            <span className={isOnline ? "online-indicator" : "offline-indicator"}></span>
            <div className="internet-speed-checker" style={{ display: showSpeedChecker ? 'flex' : 'none' }}>
                <button className="close-wifi" onClick={handleClose}>X</button>
                <div className="speed-info">
                    <span className='status'><span className='badge'>Internet</span> <span className={isOnline ? "online" : "offline"}>{isOnline ? 'ON' : 'OFF'}</span></span>
                    <span className='speed'><span className='badge'>Speed</span> <p>{speedMbps} Mbps</p></span>
                    <span className='speed-level'><span className='badge'>Level</span> {speedLevel}</span>
                </div>
                <div className="speed-bar">
                    <div
                        className="speed-bar-fill"
                        style={{
                            width: `${speedBarWidth()}%`,
                            backgroundColor: speedLevel === 'Fast' ? 'green' : speedLevel === 'Medium' ? 'orange' : 'red',
                        }}
                    ></div>
                </div>
            </div>
                {panelVisible && (
                    <Card
                    className='wifi-panel'
                    style={{
                        position: 'absolute',
                        top: panelPosition.top,
                        left: panelPosition.left,
                        zIndex: 1000,
                        width: 275,
                    }}
                    >
                    <CardContent>
                         
                        <div style={{ marginBottom: 16 }}>
                        <TextField
                            select
                            fullWidth
                            label="Select Network"
                            value={selectedNetwork ? selectedNetwork.ssid : ''}
                            onChange={(e) =>
                            setSelectedNetwork(networks.find((net) => net.ssid === e.target.value))
                            }
                            SelectProps={{
                            native: true,
                            }}
                        >
                            <option value=""> </option>
                            {networks.map((network) => (
                            <option key={network.ssid} value={network.ssid}>
                                {network.ssid} <small>(Signal: {network.signal})</small>
                            </option>
                            ))}
                        </TextField>
                        
                        </div>
                        {selectedNetwork && (
                        <div style={{ marginBottom: 16 }}>
                            <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    {/* <IconButton
                                    edge="end"
                                    onClick={() => setShowPassword(!showPassword)}
                                    >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton> */}
                                    <IconButton
                                        id="show-password-icon"
                                        edge="end"
                                        onClick={() => setShowPassword(!showPassword)}
                                        >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                ),
                            }}
                            />
                        </div>
                        )}
                        <Button variant="contained" color="primary" onClick={handleConnect} style={{ marginRight: 8 }}>
                        Connect
                        </Button>
                        <Button variant="contained" style={{background:"red"}} onClick={handleDisconnect}>
                        Disconnect
                        </Button>
                        <p style={{fontSize:"13px"}}>Status: {status}</p>
                    </CardContent>
                    </Card>
                )}  
        </div>
    );
};

export default InternetSpeedChecker;
