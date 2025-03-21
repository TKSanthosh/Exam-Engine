import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TextField, IconButton, InputAdornment, Button, Card, CardContent, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import wifi from './assets/images/wifi.png';

const WifiConnector = () => {
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
      setNetworks(response.data);
    } catch (error) {
      console.error('Error fetching networks:', error);
      setStatus('Failed to fetch networks');
    }
  };

  // Fetch the current connection status
  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/connection-status');
      const { connected, connection } = response.data;
      if (connected && connection) {
        setStatus(`Connected to ${connection.bssid}`);
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

  // Polling function to fetch networks and status
  const startPolling = () => {
    fetchNetworks();
    fetchConnectionStatus();
    const intervalId = setInterval(() => {
      fetchNetworks();
      fetchConnectionStatus();
    }, 1000); // Update every second

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  };

  useEffect(() => {
    // Start polling on mount
    const cleanup = startPolling();
    // Cleanup interval on unmount
    return cleanup;
  }, []);

  // Handle right-click to show panel
  const handleRightClick = (event) => {
    event.preventDefault();
    
    // Get the image's position and dimensions
    const { top, left, height } = wifiButtonRef.current.getBoundingClientRect();

    // Calculate the position for the card to be above the image
    const cardTop = top - 280; // Adjust 300 to the height of your card
    const cardLeft = left - 280;

    setPanelPosition({ top: cardTop, left: cardLeft });
    setPanelVisible(true);
  };

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

  return (
    <>
      <img
        src={wifi}
        className='wifi-button'
        alt="Wi-Fi"
        style={{ width: '30px', cursor: 'pointer', position: 'absolute', bottom: '0px', right: '10px' }}
        onContextMenu={handleRightClick}
        ref={wifiButtonRef}
      />
      {panelVisible && (
        <Card
          className='wifi-panel'
          style={{
            position: 'absolute',
            top: panelPosition.top,
            left: panelPosition.left,
            zIndex: 1000,
            width: 300,
          }}
        >
          <CardContent>
            <Typography variant="h6">Wi-Fi Connection</Typography>
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
                    {network.ssid} (Signal: {network.signal_level} dBm)
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
            <Button variant="contained" color="secondary" onClick={handleDisconnect}>
              Disconnect
            </Button>
            <p>Status: {status}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default WifiConnector;
