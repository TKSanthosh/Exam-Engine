// utils.js
import axios from 'axios';
 

export const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600); // 3600 seconds in an hour
    const minutes = Math.floor((timeInSeconds % 3600) / 60); // Remaining minutes
    const remainingSeconds = timeInSeconds % 60; // Remaining seconds
    
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

export const startPm2Process = async () => {
    try {
      const response = await fetch('http://localhost:5000/start-pm2', {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to start PM2 process: ${response.statusText}`);
      }
  
      console.log('PM2 process started successfully');
    } catch (error) {
      console.error('Error starting PM2 process:', error);
    //   alert(`Error starting PM2 process: ${error.message}`);
    //   throw error; // Re-throw the error to handle it in the calling function
    }
  };


  export const getCurrentFormattedTime = (format) => {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if(format == 'date'){
        return `${year}-${month}-${day} 00:00:00`;
    }else if(format == 'date_alone'){
        return `${year}-${month}-${day}`;
    }else{
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
  };


  // Function to remove entries with empty values
  export const removeEmptyValues = (obj) => {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key, value]) => value.trim() !== '')  // Filter out empty values
            .map(([key, value]) => [key, Number(value)])   // Convert values to numbers
    );
};

export const convertDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

export const getCurrentDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString(undefined, options);
  };

export function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = String(hours).padStart(2, '0');

    return `${hours}:${minutes}:${seconds} ${ampm}`;
}

export function roundDownToNearestFive(value) {
    return Math.floor(value / 5) * 5;
}
/**
 * Function to check if a table exists in the database.
 * @param {string} tableName - The name of the table to check.
 * @returns {Promise<boolean>} - Returns true if the table exists, false otherwise.
 */
export const checkTableFunction = async (tableName) => {
    try {
      const response = await axios.get('http://localhost:5000/check-table', {
        params: { tableName },
      });
  
      return response.data.exists;
    } catch (error) {
      console.error('Error checking table:', error);
      return false;
    }
  };


export  const reloadComponent = () => {
    // You can force a re-render by updating the state
    window.location.reload(); // This will reload the entire page
    // Alternatively, you can use state management to re-render the component without a full page reload
};


export const fetchClientIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      throw error; // Re-throw the error so the caller can handle it
    }
  };


export  const handleClear = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear the QP data?');
    if (!confirmClear) {
         
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/clear');
      if (response.ok) {
        alert('Data cleared successfully!');
        // setButtonText('Data Download');
        // setButtonStyle('button-import active-btn');
     
      } else {
        alert('Failed to clear data.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while clearing the data.');
    }
  };