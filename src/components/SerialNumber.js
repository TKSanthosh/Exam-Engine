import React, { useEffect, useState } from 'react';

const SerialNumber = ({ onSerialNumberChange }) => {
  const [serialNumber, setSerialNumber] = useState('');

  useEffect(() => {
    const fetchSerialNumber = async () => {
      try {
        const response = await fetch("http://localhost:5000/serial-number");
        const data = await response.json();
        setSerialNumber(data.serialNumber);
        onSerialNumberChange(data.serialNumber); // Call the parent function
      } catch (error) {
        console.error("Error fetching serial number:", error);
      }
    };

    fetchSerialNumber();
  }, []); // Dependency array ensures it only runs when `onSerialNumberChange` changes



  return (
    <>
       <p style={{fontSize:"10px",textAlign:"center"}}>SERIAL NUMBER :</p>{serialNumber} 
    </>
  );
};

export default SerialNumber;
