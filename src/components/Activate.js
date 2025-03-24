import React, { useState, useEffect } from 'react';
import { startPm2Process,roundDownToNearestFive, handleClear } from './utils';
import ReusablePasswordDialog from './ReusablePasswordDialog';
import axios from 'axios';
import './Activate.css'; 
import { checkTableFunction } from './utils'; // Import the utility function
import { Switch, Card, CardContent, Typography, Box } from '@mui/material';
import ReportTable from './ReportTable';
import CircularProgress from "@mui/material/CircularProgress"; // For a spinner
// Newly added
import ExamClosureSummary from './ExamClosureSummary'; 
// import ExamClosureSummary, { handleSubmit } from './ExamClosureSummary';
// Newly added
// import { io } from "socket.io-client";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import useApiUrl from "./useApiUrl";
function Activate({ username, examData, serialNumber, onButtonQpStatus }) {
  // 
  const API_URL = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonStyle, setButtonStyle] = useState('button-import active-btn');
  const [qpStatus, setQpStatus] = useState(0); // State to store the number of rows in qp_download
  const [slotCount, setSlotCount] = useState(0);
  const [clearStyles, setClearButtonStyles] = useState('active-btn');
  const [buttonTexts, setButtonTexts] = useState(['Import QP', 'Import QP', 'Import QP']); // Default texts
  const [buttonStyles, setButtonStyles] = useState(['button-import active-btn', 'button-import active-btn', 'button-import active-btn']); // Default styles
  const [actButtonDisabled, setactButtonDisabled] = useState([false, false, false]); // Array to manage disabled state for each button
  const [closureButtonDisabled, setactClosureButtonDisabled] = useState([true, true, true]); // Default texts
  const [batchStyles, setBatchButtonStyles] = useState(['active-btn-disabled','active-btn-disabled','active-btn-disabled']);
  const [actLoading, setactLoading] = useState([false, false, false]); // Array to manage disabled state for each button
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchact, setBatchAct] = useState('');
  const [passwordtype, setPasswordType] = useState(''); 
  const [error, setError] = useState('');
  const [showCardOne, setShowCardOne] = useState(false);
  const [showCardTwo, setShowCardTwo] = useState(false);
  const [showCardThree, setShowCardThree] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [BatchCount, setBatchCount] = useState(1);
  // Newly added
  const [showExamClosureSummary, setShowExamClosureSummary] = useState(false);
  const [ClosuredataCount,setClosuredataCount] = useState(0);
  const [ClosuredataCountFeedback,setClosuredataCountFeedback] = useState(0);
  const [percentage, setPercentage] = useState(0);  
  const delay=async (ms)=> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // useEffect(() => {
  //   if (socket) {
  //     console.log("Disconnecting old socket before creating a new one...");
  //     socket.disconnect(); // Disconnect old socket before creating a new one
  //     setSocket(null); // Reset state
  //   }
  
  //   // Create a new WebSocket connection
  //   const newSocket = io(`${API_URL}:5000`, {
  //     transports: ["websocket"],
  //     reconnection: true,
  //     withCredentials: true,
  //   });
  
  //   newSocket.on("connect", () => {
  //     console.log("Connected to WebSocket:", newSocket.id);
  //   });
  
  //   setSocket(newSocket);
  
  //   return () => {
  //     console.log("Cleaning up WebSocket...");
  //     newSocket.off(); // Remove all listeners
  //     newSocket.disconnect(); // Ensure it's disconnected
  //     setSocket(null);
  //   };
  // }, [API_URL]); // Reconnect only if API_URL changes
  // const socket = io("http://localhost:5000", {
  //   // transports: ["websocket", "polling"], // Allow fallback
  //         reconnection: true,
  //   withCredentials: true
  // });
  
  
  const handleClearQP = () => {
    handleOpenDialog(1);
    setBatchCount(1);
    setPasswordType('clearqp');
  }

  const handlefeedback =()=>{
    setShowExamClosureSummary(true);
  }
 
  const handleReportClick = () => {
    handleClosePopup();
    if (examData.length > 0) {
      const zone_code_val = examData[examData.length - 1].zone_code;
      handleClosure('day', zone_code_val);
    } else {
      alert("No exam data available!");
    }
  };
  
  const handleClosePopup = () => {
    setShowExamClosureSummary(null);
  };
  
 

  const handleSuccess = (result) => {
    console.log("Form submitted successfully!", result);
    // alert("Form submitted successfully!", result);
    setShowExamClosureSummary(null);
    // Perform any actions, e.g., close a modal, refresh data, etc.
  };
 
   // Newly added

  const handleReportSelect = (report) => {
    setSelectedReport(report); // Update state in parent component
    console.log('Selected Report:', report); // You can also perform other actions here
    
  };
 
  const handleToggleOne = () => {
    setShowCardOne(!showCardOne);
    if (!showCardOne) {
      setShowCardTwo(false);
      setShowCardThree(false);
    }
  };

  const handleToggleTwo = () => {
    setShowCardTwo(!showCardTwo);
    if (!showCardTwo) {
      setShowCardOne(false);
      setShowCardThree(false);
    }
  };

  const handleToggleThree = () => {
    setShowCardThree(!showCardThree);
    if (!showCardThree) {
      setShowCardOne(false);
      setShowCardTwo(false);
    }
  };
  const handleOpenDialog = (batch) => {
    setBatchAct(batch)
    setDialogOpen(true);
};

const handleCloseDialog = () => {
    setDialogOpen(false);
    setactLoading([false, false, false]);
};

const handleSubmitPassword = (password) => {
    // Handle password submission here
    console.log('Activation Password submitted:', password);
    
};

const handleOfflineError = (status, qpStatus) => {
  let textStatus = status.split("_")[1] ?? status.split("_")[0];
  alert("Failed to download the file. You are offline!");
  resetDownloadState(qpStatus, textStatus);

};



const handleDownloadError = (status, qpStatus,message) => {

  let textStatus = status.split("_")[1] ?? status.split("_")[0];
  alert(message);
  resetDownloadState(qpStatus, textStatus);
  console.error("Failed to download the file.");

};

const resetDownloadState = (qpStatus, textStatus) => {
  setPercentage(0);
  setQpStatus(qpStatus);
  setButtonText(qpStatus === 1 ? "Data Download" : qpStatus === 2 ? "Download Center QP" : qpStatus===3 ?`Download Photos` : 'Download Sign');
  setButtonStyle("button-import active-btn");
  setButtonDisabled(false);
  setLoading(false);
};
 
const handleValidAccess  = async (vaaccess) => {
  // alert(vaaccess);
    if(vaaccess==1){
        // Handle password submission here
        handleActivation(qpStatus,batchact);
    } else if(vaaccess==2){
        // Handle password submission here
        handleBatchClosure(qpStatus,batchact);
    } 
    else if(vaaccess==4){
        // Handle clear qp
         // Send a request to the server to clear the cookie
      const response = await axios.get('http://localhost:5000/clientlogout', { withCredentials: true });
  
      if (response.status === 204) {
        // Clear the local state and localStorage on the client-side
        // setUser(null); // Update the state (assuming you have a state for the user)
        localStorage.removeItem('user'); // Remove the user from localStorage
        console.log('Logout successful');
        // Optionally, redirect to login page or home page
      }
    } 
    else {
        alert('Access Failed !')
    }
    
};
    const examDataTotal = examData.length;
    const col=(12/examData.length);
    const text = '';
    let candidate_cnt = 0;

    // Loop through examData to calculate the total number of candidates
    examData.forEach((data) => {
        candidate_cnt += data.totalScheduled;
    });

    // Calculate the average number of candidates
    const avg_cand_cnt = examData.length > 0 ? candidate_cnt / examData.length : 0;

    // const avg_cand_cnt = Math.floor((examData.length > 0 ? candidate_cnt / examData.length : 0) / 5) * 5;
     
    const handleCheckTable = async (qpStatus, batch , batch_count) => {
         
      setBatchCount(batch_count);
      // alert(batch_count);
        try {
          const batch_closure = await checkTableFunction('batchwise_closure_summary');
          
          if(qpStatus==6){
             
                handleFileUpload(qpStatus, batch);
         
          }else if(qpStatus==7){
            if(batch_closure==1){
                handleFileUpload(qpStatus, batch);
                 
            }else{
                return alert('Kindly do previous batch closure!')
            }
          }else if(qpStatus==8){
            if(batch_closure==2){
                handleFileUpload(qpStatus, batch); 
                            
            }else{
                return alert('Kindly do previous batch closure!')
            }
        }
        
        } catch (err) {
          console.log('Error checking table');
           
        }
    };

  useEffect(() => {
    const fetchSlotCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/exam-slot-count`);
        const data = await response.json();
        setSlotCount(data.slotCount);
      } catch (error) {
        console.error('Error fetching slot count:', error);
      }
    };

    fetchSlotCount();
  }, [qpStatus]);
  
  
  useEffect(() => {
 
    // Pass the buttonDisabled state to the parent whenever it changes
    onButtonQpStatus(qpStatus);
   
    // Fetch the qp_download status when the component loads
    const fetchQpStatus = async () => {
      
      // console.log('act load',buttonTexts);
      try {
        // alert();
        let texts = [];
        let styles = [];
        let batchstyles = [];
        let disabled = [];
        let batchdisabled = [];

        const response = await axios.get('http://localhost:5000/qp-status');
        const data = response.data;
        setQpStatus(data.count); // Store the number of rows in qp_download
        if(data.count==0){
            localStorage.removeItem('user');
            window.location.reload(); // Refresh the page
         }
         const batch_closure = await checkTableFunction('batchwise_closure_summary');

         const serverNo = document.getElementById("serverNo").value;
         const response_closure_feedback = await axios.post('http://localhost:5000/get-exam-closure-count', {
          centre_code: username,
          serverno: serverNo,
          closure_action: "Feedback"
        });


        const response_closure_init = await axios.post('http://localhost:5000/get-exam-closure-count-init', {
          centre_code: username,
          serverno: serverNo,
        });
        
        
        const data_closure_feedback_count = response_closure_feedback.data.count;
        const data_closure_init_count = response_closure_init.data.count;
        
        //  let loader = [];
        if(data_closure_init_count==0){
          if(data.count==1 && loading!=true ){
            setButtonText('Data Download');
            setButtonDisabled(false);
            setButtonStyle('button-data-download active-btn');
        } 
          else if(data.count==2){
            setButtonText('Download Centre QP');
            setButtonDisabled(false);
            setButtonStyle('button-data-download active-btn');
        } 
        else if(data.count==3 || data.count==4){
          setButtonText('Download Photos');
          setButtonDisabled(false);
          setButtonStyle('button-data-download active-btn');
      }
      else if(data.count==5){
        setButtonText('Download Sign');
        setButtonDisabled(false);
        setButtonStyle('button-data-download active-btn');
    }
          else if (data.count == 6) {
            texts = ['Import QP', 'Import QP', 'Import QP'];
            styles = ['button-import active-btn', 'button-import disabled active-btn', 'button-import disabled active-btn'];
            batchstyles = ['active-btn disabled','active-btn disabled','active-btn disabled'];
            disabled = [false, true, true]; // Example disabled states
            batchdisabled = [true,true,true]; // Example disabled states
          } 
          
          else if (data.count == 7) {
            texts = ['Activated', 'Import QP', 'Import QP'];
            styles = ['button-activated disabled active-btn', 'button-import  active-btn', 'button-import disabled active-btn'];
            disabled = [true, true, true]; // Example disabled states
            if(batch_closure==1){
                batchstyles = ['button-activated  active-btn disabled','active-btn disabled','active-btn disabled'];
                batchdisabled = [true,true,true]; // Example disabled states
                disabled = [true, false, true]; // Example disabled states
            }else{
                batchdisabled = [false,true,true]; // Example disabled states
                batchstyles = ['active-btn','active-btn disabled','active-btn disabled'];
            }

          } else if (data.count == 8) { 
            // alert('ss');
            texts = ['Activated', 'Activated', 'Import QP'];
            styles = ['button-activated disabled active-btn', 'button-activated disabled active-btn', 'button-import active-btn'];
            disabled = [true, true, false]; // Example disabled states

            if(batch_closure==2){
                batchstyles = ['button-activated  active-btn disabled','button-activated active-btn disabled','active-btn disabled'];
                batchdisabled = [true,true,true]; // Example disabled states
                disabled = [true, true, false]; // Example disabled states
            }else{
              disabled = [true, true, true]; // Example disabled states
                batchdisabled = [true,false,true]; // Example disabled states
                batchstyles = ['button-activated  active-btn disabled','active-btn','active-btn disabled'];
            }

          } 
          else if (data.count == 9)  {
            texts = ['Activated', 'Activated', 'Activated'];
            styles = ['button-activated disabled active-btn', 'button-activated disabled active-btn', 'button-activated disabled active-btn'];
            disabled = [true, true, true]; // Example disabled states
            if(batch_closure>2){
                batchstyles = ['button-activated  active-btn disabled','button-activated active-btn disabled','button-activated active-btn disabled'];
                // batchdisabled = [true,true,true]; // Example disabled states
            }else{
                batchdisabled = [true,true,false]; // Example disabled states
                batchstyles = ['button-activated  active-btn disabled','button-activated  active-btn disabled','active-btn'];
            }
        }else if (data.count == 10)  {
          texts = ['Activated', 'Activated', 'Activated'];
          styles = ['button-activated disabled active-btn', 'button-activated disabled active-btn', 'button-activated disabled active-btn'];
          disabled = [true, true, true]; // Example disabled states
          if(batch_closure>=3){
              batchstyles = ['button-activated  active-btn disabled','button-activated active-btn disabled','button-activated active-btn disabled'];
              // batchdisabled = [true,true,true]; // Example disabled states
          }else{
              batchdisabled = [true,true,true]; // Example disabled states
              batchstyles = ['button-activated  active-btn disabled','button-activated  active-btn disabled','button-activated  active-btn disabled'];
          }
        }
        }
        
          setButtonStyles(styles);
          setButtonTexts(texts);
          setactButtonDisabled(disabled);
          setBatchButtonStyles(batchstyles)
          setactClosureButtonDisabled(batchdisabled);
          setClosuredataCount(data_closure_init_count);
          setClosuredataCountFeedback(data_closure_feedback_count);
          
      } catch (error) {
        console.error('Error fetching QP status:', error);
      }
    };
    

    fetchQpStatus(); // Call the function to fetch the status
     // Set up an interval to fetch status every 2 seconds
     
     const intervalId = setInterval(fetchQpStatus, 10000);

     // Clean up the interval on component unmount
     return () => clearInterval(intervalId);

     
  }, [qpStatus, onButtonQpStatus]);
  // },[qpStatus]);
// },[]);

  // const [imageCount, setImageCount] = useState(0);

  // useEffect(() => {
  //   const fetchImageCount = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5000/get-image-count");
  //       setImageCount(res.data.imageCount);
  //     } catch (err) {
  //       console.error("Error fetching image count:", err);
  //       setImageCount(0); // Default to 0 on error
  //     }
  //   };

  //   fetchImageCount();
  // }, []);
  

  const insertBase = async (status_msg) => {
    // alert(status_msg);

    const batchValue = document.getElementById("batchValue").value;
    const serverNo = document.getElementById("serverNo").value;
    // alert(batchValue);
    // Example usage
    const data = {
        centre_code: username,
        serverno: serverNo,
        download_sec: status_msg,
        batchValue: batchValue
    };
    // alert(data.centre_code);
    try {
      const response = await fetch('http://localhost:5000/insert-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.text();
        console.log('Data inserted successfully:', result);
        const res = await axios.get("http://localhost:5000/get-image-count");
        // setImageCount(res.data.imageCount);

        const badge = document.querySelector(".QpImageCount");
            if (badge) {
                let currentCount = parseInt(res.data.imageCount);
                badge.textContent = currentCount;
            }

        // setButtonDisabled(false);
      } else {
        console.error('Failed to insert data:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  const handleActivation = async (qpStatus,batch) => {

    let status;
    setLoading(true);
      // Determine the status based on qpStatus
      if (qpStatus == 1) {
        status = 'Base';
        setButtonText('Downloading...');
        setButtonDisabled(true);
        setClearButtonStyles('active-btn-disabled');
      } else if (qpStatus == 2 || qpStatus == 3 || qpStatus == 4 || qpStatus == 5) {
        status = username;
        setButtonText('Downloading...');
        setButtonDisabled(true);
        setClearButtonStyles('active-btn-disabled');

      } else 
      if (qpStatus === 6) {
        status = 'Act';
      } else if (qpStatus === 7) {
        status = 'Act';
      } else if (qpStatus === 8) {
        status = 'Act';
      }
      // if (qpStatus === 1) {
      //   status = "Base";
      // } else if ([2, 3, 4, 5].includes(qpStatus)) {
      //   status = username;
      // } else if ([6, 7, 8].includes(qpStatus)) {
      //   status = "Act";
      // }
    
      // // Set UI updates before making API call
      // setButtonText("Downloading...");
      // setButtonDisabled(true);
      // setButtonStyle("button-activating active-btn");
      // setClearButtonStyles("active-btn-disabled");

    
      // setLoading(true);
    
     
    setButtonStyle('button-activating active-btn');
    // setClearButtonStyles('active-btn-disabled');
    
    // try {
    //      setactLoading([false, false, false]);
      
    //      if (!navigator.onLine) {
    //        handleOfflineError(status, qpStatus);
    //        return;
    //      }
    //      const response = await axios.post(`http://localhost:5000/activate/${status}/${batch}/${serialNumber}/${qpStatus}`);
    //     //  alert(JSON.stringify(response));
    //     // if(qpStatus==1){
    //     //   let progress = 0;
    //     //   const progressInterval = setInterval(() => {
    //     //     if (progress < 100) {
    //     //       progress += 5;
    //     //       setPercentage(progress);
    //     //     }
    //     //   }, 1000); // Increase progress every 3 seconds
    //     // }
    //     console.log("response from activate",response)
    //      socket.on("download-percentage", ({ percentage }) => {
    //        console.log(`Download percentage ${status}: ${percentage}`);
    //        setPercentage(percentage);
    //      });
       
       
    //      if (response.status !== 200) {
    //        handleDownloadError(status, qpStatus,response.data.message);
    //        return;
    //      }
       
    //      // Handle success cases based on qpStatus
    //      switch (qpStatus) {
    //        case 1:
    //          insertBase("Base QP");
    //          //await delay(5000);
    //          setPercentage(0);
    //          setButtonText("Download Centre QP");
    //          setButtonStyle("button-data-download active-btn");
    //          break;
       
    //        case 2:
    //          insertBase("Centre QP");
    //          //await delay(5000);
    //          setPercentage(0);
    //          setButtonText("Download Photos");
    //          setButtonStyle("button-data-download active-btn");
    //          break;
       
    //        case 4:
    //          insertBase("Photo");
    //          //await delay(5000);
    //          setPercentage(0);
    //          setButtonText("Download Sign");
    //          setButtonStyle("button-data-download active-btn");
    //          break;
       
    //        case 5:
    //          insertBase("Sign");
    //          setButtonText("Download Sign");
    //          setButtonStyle("button-data-download active-btn");
    //          break;
       
    //        case 6:
    //        case 7:
    //        case 8:
    //          insertBase(`Activated-${batch}`);
    //          break;
       
    //        default:
    //          console.warn("Unknown qpStatus:", qpStatus);
    //      }
       
    //      setClearButtonStyles("active-btn");
    //      setButtonDisabled(false);
    //      setPercentage(0);
    //      setLoading(false);

    //      await startPm2Process();
    //    } catch (error) {
    //      console.error("Error:", error);
    //      handleDownloadError(status, qpStatus,error.message);
    //    } finally {
    //      setLoading(false);
    //    }
    try {
      setactLoading([false, false, false]);
    
      // Check if offline
      if (!navigator.onLine) {
        handleOfflineError(status, qpStatus);
        return;
      }
      // Make Axios request
      const response = await axios.post(
        `http://localhost:5000/activate/${status}/${batch}/${serialNumber}/${qpStatus}`,{},
        {withCredentials:true}
      );
      console.log("Response from activate:", response);
      // alert(JSON.stringify(response.data))
      // Ensure response is successful
      if (response.status !== 200) {
        handleDownloadError(status, qpStatus, response.data.message);
        return;
      }
    
      // Remove previous listeners to prevent multiple event bindings
    
      // Listen for download percentage updates
    //   if(qpStatus==1){
    //   socket.on("download-base", ({ percentage }) => {
    //     console.log(`Download percentage ${qpStatus+" "+status}: ${percentage}`);
    //     setPercentage(percentage);
    //   });
    // }
    //   if(qpStatus==2){
    //     socket.on("download-centreqp", ({ percentage }) => {
    //       console.log(`Download percentage ${qpStatus+" "+status}: ${percentage}`);
    //       setPercentage(percentage);
    //     });
    //   }if(qpStatus==4){
    //     socket.on("download-photos", ({ percentage }) => {
    //       console.log(`Download percentage ${qpStatus+" "+status}: ${percentage}`);
    //       setPercentage(percentage);
    //     });
    //   }if(qpStatus==5){
        // socket.on("download-percentage", ({ percentage }) => {
        //   console.log(`Download percentage ${qpStatus+" "+status}: ${percentage}`);
        //   setPercentage(percentage);
        // });
      // }
    
      // Process cases sequentially
      switch (qpStatus) {
        case 1:
          insertBase("Base QP");
          //await delay(3000);
          setPercentage(0);
          setButtonText("Download Centre QP");
          setButtonStyle("button-data-download active-btn");
          break;
    
        case 2:
          insertBase("Centre QP");
          //await delay(3000);
          setPercentage(0);
          setButtonText("Download Photos");
          setButtonStyle("button-data-download active-btn");
          break;
    
        case 4:
          insertBase("Photo");
          //await delay(3000);
          setPercentage(0);
          setButtonText("Download Sign");
          setButtonStyle("button-data-download active-btn");
          break;
    
        case 5:
          insertBase("Sign");
          //await delay(3000);
          setButtonText("Download Sign");
          setPercentage(0);
          setButtonStyle("button-data-download active-btn");
          break;
    
        case 6:
        case 7:
        case 8:
          insertBase(`Activated-${batch}`);
          break;
    
        default:
          console.warn("Unknown qpStatus:", qpStatus);
      }
    
      // Final UI updates
      setClearButtonStyles("active-btn");
      setButtonDisabled(false);
      setPercentage(0);
    
      await startPm2Process();
    } catch (error) {
      console.error("Error:", error);
      handleDownloadError(status, qpStatus, error.message);
    } finally {
      setLoading(false);
    }
    
  };
 

 
  const handleFileUpload = async (qpStatus, batch) => {
 
    try {
      let status;
      // setLoading(true);
  
      switch (qpStatus) {
        case 1:
            status = 'Base';
            // setButtonText('Downloading...');
            // setButtonStyle('button-data-download active-btn active-disabled');
            break;
        case 2:
            
            setButtonText('Downloading....');
            setButtonDisabled(true);
            setClearButtonStyles('active-btn-disabled');
            setButtonStyle('button-data-download active-btn active-disabled');
            status = username;
            break;
        case 4:
            setButtonText('Downloading photo...');
            setClearButtonStyles('active-btn-disabled');
            setButtonDisabled(true);
            setButtonStyle('button-data-download active-btn active-disabled');
            status = `${username}_photo`;
            break;
        case 5:
            setButtonText('Downloading sign...');
            setButtonDisabled(true);
            setButtonStyle('button-data-download active-btn active-disabled');
            setClearButtonStyles('active-btn-disabled');
            status = `${username}_sign`;
            break;
        case 6:
            status = 'Act';
            setButtonTexts(['Activating', 'Import QP', 'Import QP']);
            setactLoading([true, false, false]);
            break;
        case 7:
            status = 'Act';
            setButtonTexts(['Activated','Activating','Import QP']);
            setactLoading([false, true, false]);
            break;
        case 8:
            status = 'Act';
            setactLoading([false, false, true]);
            break;
        default:
          console.error('Unhandled QP Status:', qpStatus);
          return;
      }
  
      // const response = await fetch(`http://localhost:5000/download-zip/${status}/${batch}`);
      
      // const text = await response.text();
      // console.log('resppp',batch);
  
      if ([1, 2 ,3 ,4, 5].includes(qpStatus)) {

        handleActivation(qpStatus, batch);

        
      } else if ([6, 7, 8].includes(qpStatus)) {

        // handleActivation(qpStatus, batch);
        setPasswordType('activation')
        handleOpenDialog(batch);
        
      } else if (qpStatus === 4) {
        setButtonStyle('button-activating active-btn');
        insertBase('Photo');
        setButtonText('Download Sign');
        setButtonDisabled(false);
        setButtonStyle('button-data-download active-btn');
        setLoading(false);
      } else if (qpStatus === 5) {
        setButtonStyle('button-activating active-btn');
        insertBase('Sign');
        setButtonText('Import QP');
        setButtonStyle('button-import active-btn');
        setButtonDisabled(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClosure = async (type, batch) => {
    console.log('batch cnt', batch);
    
    try {
        // Call the backend API to check if the batch has an entry
        const response = await axios.get(`http://localhost:5000/check-batch-closure/${batch}`);
        const { exists, count } = response.data;
        
        if (!exists) {
            console.log(`Batch closure entry found with count: ${count}`);
            // Proceed with your logic
            if (type === 'batch') {
                setPasswordType('batchclosure');
            } else if (type === 'day') {
                setPasswordType('dayclosure');
            }
            handleOpenDialog(batch);
        } else {
            console.log('No entry found for this batch');
            alert('Batch Closure has been already done!');
            // Optionally, show a message or take alternative action if no entry is found
        }
    } catch (err) {
        console.error('Error checking batch closure:', err);
    }
};

  const handleDayClosure = async (qpStatus, batch) => {
    // alert(batch);
    try {
        const responseIP = await axios.get('http://localhost:5000/get-system-ip');
        // const hostIp = await getSystemIp();
        const hostIp = responseIP.data.ip;
        // Set loading to true if using a loading state
        setLoading(true);
          
        // Make GET request to batch closure API
        const response = await axios.get(`http://localhost:5000/handleDayClosure/${batch}/${hostIp}/${serialNumber}/${username}`);
        const dataRes = response.data; // Keep it as an object

          if (dataRes.processStatus) {
            alert(dataRes.message);
            setShowExamClosureSummary(true);
          }
      } catch (err) {
        // Handle error
        
        console.error('Error:', err);
        setError('Failed to process batch closure. Please try again.');
        alert('Failed to process batch closure. Please try again.');
        setLoading(false);
      } finally {
        // Reset loading state to false if applicable
        setLoading(false);
      }

 

  };

  const handleBatchClosure = async (qpStatus, batch) => {
    const serverNo = document.getElementById("serverNo").value;
    // alert(batch);
    
    try {
      // const hostIp = await getSystemIp();
      // const hostIp = "172.2.2.2";
      const responseIP = await axios.get('http://localhost:5000/get-system-ip');
        // const hostIp = await getSystemIp();
        const hostIp = responseIP.data.ip;  
      // Set loading to true if using a loading state
      // setLoading(true);
        
      // Make GET request to batch closure API
      const response = await axios.get(`http://localhost:5000/handleBatchClosure/${batch}/${hostIp}/${serialNumber}/${username}/${serverNo}`);
  console.log('respppp',response.statusText);
      if(response.statusText=='OK'){
            // Display alert on successful batch closure
            alert(`Batch ${batch} closure done!`);
            
             
            
      } 
    } catch (err) {
      // Handle error
      console.error('Error:', err);
      setError('Failed to process batch closure. Please try again.');
      alert('Failed to process batch closure. Please try again.');
    } finally {
      // Reset loading state to false if applicable
      setLoading(false);
    }
  };

   

  return (
    <div>
      <center>
      <div className="card-container">
        {/* <div className="card"> */}
        {/* {(!showCardOne && !showCardTwo && !showCardThree) && ( */}
        <div className={`card ${(!showCardOne && !showCardTwo && !showCardThree) ? 'card-show' : 'card-hide'}`}>
        {ClosuredataCount >= 1 ? (
  <h6>Closure Process</h6>
) : (
  qpStatus < 6 ? <h4>Data Download</h4> : <h6>Activate Exam</h6>
)}
          <hr/>
            <>
            <div className='msg-space'>
               { (qpStatus == 1 ) && loading ? ( 
                                  <center> <div className="loader"></div></center>
                                ) : (null)}
            {qpStatus == 2 ? (
              //  <CircularProgressWithLabel value={percentage} />
                    loading ? ( <center> <div className="loader"></div> </center>) : (
                    <p className='fade-text'>You have <span style={{fontSize:"25px",fontWeight:"700"}}>{slotCount}</span> <b>Exam Slots.</b></p>
                    )
                ) : qpStatus == 4 || qpStatus == 5 ? (
                    loading ? (<center> <div className="loader"></div> </center>) : (
                        <p className='fade-text-1' style={{left:"10px !important"}}>You have <b>average</b> <span style={{fontSize:"25px",fontWeight:"700"}}>{(avg_cand_cnt)}+</span> <b>Candidates</b> in each batch.</p>
                    )
                ) : qpStatus >= 6 && ClosuredataCount <= 0 ? (
  <div className='row' style={{ marginBottom: "-50px", zIndex: "10" }}>
    {examData.map((data, index) => (
      <div key={index} className={`col-md-${col}`}>
        {actLoading[index] ? (
          <center><div className={`loader${index + 1}`}></div></center>
         
              // <CircularProgressWithLabel value={percentage} />
        ) : (
          <>
            <h5>{`Batch ${index + 1}`}</h5>
            <h6>{data.zone_code}</h6>
          </>
        )}
        <button
          onClick={() => handleCheckTable(qpStatus, data.zone_code, index + 1)}
          disabled={actButtonDisabled[index]}
          style={{ width: "100%" }}
          className={buttonStyles[index]}
        >
          {buttonTexts[index]}
        </button>

        {examDataTotal === index + 1 ? (
          <button
            onClick={() => handleDayClosure("day", data.zone_code)}
            disabled={closureButtonDisabled[index]}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            className={batchStyles[index]}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Day Closure"}
          </button>
        ) : (
          <button
            onClick={() => handleBatchClosure('batch', data.zone_code)}
            disabled={closureButtonDisabled[index]}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            className={batchStyles[index]}
          >
            Batch {index + 1} Closure
          </button>          
        )}
      </div>
    ))}
  </div>
) : ClosuredataCountFeedback >= 1 ? (
  <button
    onClick={() => handleClearQP()}
    style={{ width: "33%", marginTop: "12%" }}
    className={buttonStyles[0]}
  >
    Clear QP
  </button>
) : ClosuredataCount === 1 && ClosuredataCountFeedback === 0 ? (
  <button
    onClick={() => handlefeedback()}
    style={{ width: "50%", marginTop: "12%" }}
    className={buttonStyles[0]}
  >
    Closure Feedback
  </button>
) : null}
   </div>
            </>
         
          {(qpStatus < 6) ? (
            <>
                <button onClick={() => handleFileUpload(qpStatus)} disabled={buttonDisabled} className={`${buttonStyle} active-btn-margin-bottom`} >
                                    {buttonText}            
                </button>
                {/* <button className={clearStyles} disabled={buttonDisabled}  onClick={handleClear}>Clear</button> */}
            </>
          ):(<></>)}
            
          {text}
        </div>
        <div className={`card ${showCardOne ? 'card-show' : 'card-hide'}`}>
             <h5>Exam Reports </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='exam' onReportSelect={handleReportSelect}/>
        </div>

        <div className={`card ${showCardTwo ? 'card-show' : 'card-hide'}`}>
             <h5>Biometric Activities </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='biometric' onReportSelect={handleReportSelect}/>
        </div>

        <div className={`card ${showCardThree ? 'card-show' : 'card-hide'}`}>
             <h5>Miscellaneous Activities </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='miscellaneous' onReportSelect={handleReportSelect}/>
        </div>
        
        {selectedReport==null ? (
            <div className="switch-container row">
            <div className='col-md-4'>
            <Box className="switchbox  " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Reports</Typography>
              <Switch
                checked={showCardOne}
                onChange={handleToggleOne}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
            <div className='col-md-4'>
            <Box className="switchbox " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Biometric</Typography>
              <Switch
                checked={showCardTwo}
                onChange={handleToggleTwo}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
            <div className='col-md-4'>
            <Box className="switchbox " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Miscellaneous</Typography>
              <Switch
                checked={showCardThree}
                onChange={handleToggleThree}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
          </div>
        ):(<></>)}
            
        </div>
       {showExamClosureSummary && <div className="popup" style={{top:"30px",left:"250px"}}>
          <div className="popup-content" style={{overflow:"auto"}}>
            <span className="close-btn" onClick={handleClosePopup}>&times;</span>
            <h4>Exam Closure Feedback</h4>
            {/* {examData.map((data, index) => ( */}
            {/* <ExamClosureSummary onSubmitComplete={handleClosure('day', '1')} /> */}
            {/* ))} */}
            <ExamClosureSummary onSubmitSuccess={handleSuccess} />
            
          </div>
        </div>
} 
      </center>
      <input type="hidden" name="batchValue" id="batchValue" value={BatchCount} />
      <ReusablePasswordDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    validAccess={handleValidAccess}
                    onSubmit={handleSubmitPassword}
                    title="Enter Activation Password"
                    passwordtype={passwordtype}
                    batch={batchact}
                    batchval={BatchCount}
                    />
    </div>
  );
}

export default Activate;
