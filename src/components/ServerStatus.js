import React, { useEffect, useState } from 'react';
import warningImg from './assets/images/warning.png';
import intDown from './assets/images/int-down.png';
import './ServerStatus.css'; // Import CSS for styling and transitions

const ServerStatus = (props) => {
    const { pageValue } = props;
    const [serverUp, setServerUp] = useState(true);
    const [statusMsg, setStatusMsg] = useState("");
    const [consecutiveMedium, setConsecutiveMedium] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
    const [internetOn, setInternetOn] = useState(true);

    useEffect(() => {
        if (pageValue === "client") {
            setStatusMsg("[Err: 01] Server is currently down. Please contact Administrator!");
        } else {
            setStatusMsg("MySQL Server is currently down. Please check server status!");
        }
    }, [pageValue]);

    // Independent function to check the server status
    const checkServerStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            if (!response.ok) {
                throw new Error('Server not reachable');
            }
            setServerUp(true);
        } catch (error) {
            console.error('Error in health check:', error);
            setServerUp(false);
        }
    };

    // Independent function to check for 10 consecutive "Medium" speed levels
    const checkSpeedMedium = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/check-speed');
            const data = await response.json();
            // console.log('speed', data);
            if (data.mediumCount >= 8) {
                setConsecutiveMedium(true);
            } else {
                setConsecutiveMedium(false);
            }
        } catch (error) {
            console.error('Error in speed check:', error);
        }
    };

    const checkInternetConnection = () => {
        setOnlineStatus(navigator.onLine);
        setInternetOn(navigator.onLine);
    };

    // useEffect for server status check
    useEffect(() => {
        checkServerStatus();
        const serverStatusInterval = setInterval(checkServerStatus, 10000);

        // Clean up on unmount
        return () => clearInterval(serverStatusInterval);
    }, []);

    // useEffect for speed and internet connection checks when `pageValue` is "admin"
    useEffect(() => {
        if (pageValue === "admin") {
            checkSpeedMedium(); // Check speed level immediately
            checkInternetConnection(); // Check internet connection status immediately

            // Set intervals for periodic checks
            const speedCheckInterval = setInterval(checkSpeedMedium, 10000);
            const connectionCheckInterval = setInterval(checkInternetConnection, 10000);

            // Clean up intervals on unmount or when `pageValue` changes
            return () => {
                clearInterval(speedCheckInterval);
                clearInterval(connectionCheckInterval);
            };
        }
    }, [pageValue]); // Dependency array ensures this effect runs only when `pageValue` changes

    return (
        <div>
            {/* Server Status */}
            <div className={`status-message ${serverUp ? 'hidden' : 'visible'}`}>
                <img src={warningImg} alt="Warning" style={{ width: "auto" }} /> {statusMsg}
            </div>
         
            <div className={`status-warning ${consecutiveMedium ? 'visible' : 'hidden'}`}>
                <img src={intDown} alt="Warning" style={{ width: "25px" }} />
                &nbsp;&nbsp;Internet Speed is <b>Slow</b> for the last 5 mins. Please change your Internet Connection !
            </div>

            <div className={`status-message ${internetOn ? 'hidden' : 'visible'}`}>
                <img src={warningImg} alt="Warning" style={{ width: "auto" }} />
                &nbsp;&nbsp;Internet is OFF !
            </div>
             
            {/* Modal backdrop for server down or consecutive medium */}
            <div className={`modal-backdrop-custom ${!serverUp  ? 'visible' : 'hidden'}`}></div>
            {/* <div className={`modal-backdrop-custom ${!serverUp || consecutiveMedium || !internetOn ? 'visible' : 'hidden'}`}></div> */}
        </div>
    );
};

export default ServerStatus;
