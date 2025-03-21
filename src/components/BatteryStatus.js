import React, { useState, useEffect } from 'react';
import zeroBattery from './assets/images/zerobat.png';
import battery20 from './assets/images/bat20.png';
import battery40 from './assets/images/bat40.png';
import battery60 from './assets/images/bat60.png';
import battery80 from './assets/images/bat80.png';
import fullBattery from './assets/images/full-battery.png';
import charBattery from './assets/images/char-bat.png';
import './BatteryStatus.css'; 

const BatteryStatus = () => {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [charging, setCharging] = useState(false);
  const [prevBatteryLevel, setPrevBatteryLevel] = useState(batteryLevel);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    let battery;

    const updateBatteryInfo = (battery) => {
      setPrevBatteryLevel(batteryLevel); // Store previous battery level for transition
      setBatteryLevel(Math.floor(battery.level * 100));
      setCharging(battery.charging);
      setFlip(true); // Trigger flip effect
      setTimeout(() => setFlip(false), 600); // Reset flip after animation duration
    };

    const handleBatteryEvents = (battery) => {
      updateBatteryInfo(battery);
      
      battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
      battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
    };

    // Fetch the battery info
    navigator.getBattery().then((bat) => {
      battery = bat;
      handleBatteryEvents(battery);
    });

    // Clean up the event listeners
    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.removeEventListener('chargingchange', () => updateBatteryInfo(battery));
      }
    };
  }, [batteryLevel]);

  // Function to get the battery image based on the battery level
  const getBatteryImage = () => {
    if (charging) {
      return charBattery; // Charging image
    }

    if (batteryLevel === 100) return fullBattery;
    if (batteryLevel > 80) return battery80;
    if (batteryLevel > 60) return battery60;
    if (batteryLevel > 40) return battery40;
    if (batteryLevel > 20) return battery20;
    return zeroBattery; // Empty battery image
  };

  const batteryImage = getBatteryImage();

  return (
    <div className="battery-container">
      <div className={`battery-flip ${flip ? 'flip' : ''}`}>
        <div className="battery-face battery-front">
          <img 
            className={`battery-icon ${charging ? 'char_battery_icon' : ''}`} 
            src={batteryImage} 
            title={`${charging ? 'charging' : batteryLevel+'% available'}`} 
 
          />
        </div>
        <div className="battery-face battery-back">
          <img 
            className={`battery-icon ${charging ? 'char_battery_icon' : ''}`} 
            src={batteryImage} 
            alt="Battery Status" 
          />
        </div>
      </div>
      <span className={charging ? 'bt-badge-charge' : 'bt-badge'}>{batteryLevel}%</span>
    </div>
  );
};

export default BatteryStatus;
