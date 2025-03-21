import React, { useState, useEffect } from "react";
import axios from "axios";

const BiometricApiServices = () => {
  const [serverIPs, setServerIPs] = useState("");
  const [newIPs, setNewIPs] = useState("");
  const [apiType, setApiType] = useState("");
  const [memNo, setMemNo] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [batchTimes, setBatchTimes] = useState([]);
  const [selectedBatchTime, setSelectedBatchTime] = useState('');

  const handleIPSubmit = () => {
    axios
      .post("http://localhost:5000/submit-biometric-ips", { server_ips: newIPs })
      .then((response) => {
        alert("IPs saved successfully!");
        // setServerIPs(response.data.server_ips); // Assuming response returns saved server IPs
      })
      .catch((error) => {
        if (error.response) {
          // Handle server-side errors
          alert(error.response.data.message);
        } else {
          // Handle network errors or other unexpected errors
          alert("An error occurred while saving IPs.");
        }
      });
};


  const handleApiTypeChange = async(event) => {
    setApiType(event.target.value);
    // if(event.target.value==2){
        try {
            const res = await axios.get("http://localhost:5000/get-batch-time-value"); // Await the promise
            console.log("Batch time response:", res.data.result);
            // alert(res.data.result);
            setBatchTimes(res.data.result || []); // Default to an empty array if `result` is missing
        } catch (err) {
            console.error("Error fetching batch times:", err);
        }
        // }
  };

  useEffect(() => {
    const getBiometricServerIps = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-biometric-server-ips");
        console.log("Biometric response:", res.data.result);
        setServerIPs(res.data.result.map((item) => item.server_ips).join(';') || []); // Default to an empty array if `result` is missing
      } catch (err) {
        console.error("Error fetching batch times:", err);
      }
    };

    getBiometricServerIps(); // Call the async function inside useEffect

  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    setNewIPs(serverIPs);
  }, [serverIPs]);  // This will run whenever serverIPs changes

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Update state with the selected file
  };

  const handleImport = async () => {

    if (!selectedFile) {
        alert("Please select a CSV file.");
        return;
    }

        // Validate file extension
    const fileName = selectedFile.name;
    const fileExtension = fileName.split('.').pop().toLowerCase(); // Get file extension
    if (fileExtension !== 'csv') {
        alert("Invalid file type. Please upload a file with a .csv extension.");
        return;
    }

    const formData = new FormData();
    formData.append("csvFile", selectedFile);
    axios.post('http://localhost:5000/manual-sync-api-import-csv', formData)
    .then((response) => {
        alert("Manual sync completed successfully!");
        console.log("Response from server:", response.data);
    })
    .catch((error) => {
        console.error("Error during manual sync:", error);
        alert("Failed to complete manual sync. Please try again.");
    });

};
  // const handleFileUpload = async () => {
  //   // if (!selectedFile) {
  //   //   alert("Please select a file.");
  //   //   return;
  //   // }
  //   // const formData = new FormData();
  //   // formData.append("file", selectedFile); // Key must match "file" in uploads_mul.single("file")
  //   const csvFile = document.querySelector("input[type='file']").files[0]; // Get the file
  //   // alert(csvFile.name);
  //   // alert(selectedFile);
  //     if (!selectedFile) {
  //       console.error("No file selected!");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("file_name_test", selectedFile); // "file" must match the key expected by the server

        
  //   axios.post("http://localhost:5000/manual-sync-api-import-csv", formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data", // Let axios set the boundary automatically
  //     },
  //   })
  //     .then(response => {
  //       console.log("File uploaded successfully:", response.data);
  //     })
  //     .catch(error => {
  //       console.error("Error uploading file:", error);
  //     });
  // };
  
  
  // const handleSyncData = () => {
  //   if (apiType === "1" && batchTimes.length > 1 && !selectedBatchTime) {
  //     alert("Please select the Batch Time. Because users belong to multiple Batch Times.");
  //     return;
  //   }
  
  //   const myData = {
  //     examDate: "",
  //     examTime: selectedBatchTime || "",
  //     api_type: apiType,
  //     mem_no: memNo,
  //     exam_mode: selectedBatchTime || "",
  //   };
  
  //   setIsLoading(true); // Show loader
  //   setMessage(""); // Clear previous messages
  
  //   axios
  //     .post("http://localhost:5000/dynamic-sync-biometric-api", myData)
  //     .then((response) => {
  //       // setMessage(response.data.message); // Display success message

  //       const myDataTrack = {
  //         examDate: "",
  //         examTime: selectedBatchTime || "",
  //         api_type: apiType,
  //         mem_no: memNo,
  //         exam_mode: selectedBatchTime || "",
  //         R: 1,
  //         D:response.data.message,
  //       };

  //       axios
  //     .post("http://localhost:5000/dynamic-update-batchwise-tracking", myDataTrack)
  //     .then((response) => {
  //       // setMessage(response.data.message); // Display success message
        
  //       console.log("Response Data:", response.data); // Debug response
  //     })
  //     .catch((error) => {
  //       setMessage("Error syncing data."); // Display error message
  //       console.error("Error:", error); // Debug error
  //     })
  //     .finally(() => {
  //       setIsLoading(false); // Hide loader
  //     });
  //       console.log("Response Data:", response.data); // Debug response
  //     })
  //     .catch((error) => {
  //       setMessage("Error syncing data."); // Display error message
  //       console.error("Error:", error); // Debug error
  //     })
  //     .finally(() => {
  //       setIsLoading(false); // Hide loader
  //     });
  // };
  
  const handleSyncData = () => {
    if (apiType === "1" && batchTimes.length > 1 && !selectedBatchTime) {
      alert("Please select the Batch Time. Because users belong to multiple Batch Times.");
      return;
    }
  
    const myData = {
      examDate: "",
      examTime: selectedBatchTime || "",
      api_type: apiType,
      mem_no: memNo,
      exam_mode: selectedBatchTime || "",
    };
  
    setIsLoading(true); // Show loader
    setMessage(""); // Clear previous messages
  
    axios
      .post("http://localhost:5000/dynamic-sync-biometric-api", myData)
      .then((response) => {
        const { response: message } = response.data;
        // alert(message || "Sync completed successfully.");
  
        const myDataTrack = {
          ...myData,
          R: 1,
          D: message,
        };
  
        return axios.post("http://localhost:5000/dynamic-update-batchwise-tracking", myDataTrack);
      })
      .then((trackingResponse) => {
        alert( "Sync completed successfully.");
        console.log("Tracking Response:", trackingResponse.data);
      })
      .catch((error) => {
        alert("Error syncing data.");
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false); // Hide loader
      });
  };
  

  const handleDownloadTemplateCSV = () => {
    axios.get('http://localhost:5000/biometric-data-template-download', { responseType: 'blob' })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'BIOMETRIC_DATA.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch((error) => {
            console.error('Error downloading the file:', error);
        });
};

  return (
    <div className="p-3">
  {/* Add/Edit IPs Section */}
  <h5 className="text-lg font-bold mb-2" style={{ textAlign: "left" }} >Biometric Server IPs - Add / Edit</h5>
  <textarea
    className="w-full p-1 border border-gray-300 rounded mb-1"
    rows="3"
    placeholder="e.g., 127.0.0.1;127.0.0.2;127.0.0.3"
    value={newIPs}
    onChange={(e) => setNewIPs(e.target.value)}
    style={{ width: "100%" }}
  ></textarea>
  {/* <button
    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mb-3"
    onClick={handleIPSubmit}
  >
    Save IPs
  </button> */}
  <button onClick={handleIPSubmit} className="button-save-ips">Save IPs</button>

  {/* <p className="text-gray-700">{serverIPs}</p> */}
  {message && <p className="text-green-500 font-semibold mt-2">{message}</p>}

  {/* Sync Data Section */}
  <h5 className="text-lg font-bold mt-6 mb-2" style={{ textAlign: "left" }}>
    Dynamic Sync Biometric Data to Exam Server
  </h5>
  <div className="flex items-center space-x-4 mb-1 alignLmarginB">
  {/* API Type Dropdown */}
  <select
    className="w-1/5 p-1 m-2 border border-gray-300 rounded"
    value={apiType}
    onChange={handleApiTypeChange}
  >
    <option value="">- choose service -</option>
    <option value="1">Candidate API</option>
    <option value="2">Bulk Data API</option>
  </select>

  {/* Batch Time Dropdown */}
  {apiType === "2" && (
    <>
      <label className="font-medium whitespace-nowrap">Batch Time:</label>
      <select
  className="flex-1 p-1 m-2 border border-gray-300 rounded"
  value={selectedBatchTime}
  onChange={(e) => setSelectedBatchTime(e.target.value)}
>
<option value="">- select -</option>
  {batchTimes.map((time, index) => (
    <option key={index} value={time.slot_time}>
      {time.slot_time}
    </option>
  ))}
</select>
    </>
  )}

  {/* Membership No Input */}
  {apiType === "1" && (
    <>
    <label className="font-medium whitespace-nowrap">Batch Time:</label>
    <select
  className="flex-1 p-1 m-2 border border-gray-300 rounded"
  value={selectedBatchTime}
  onChange={(e) => setSelectedBatchTime(e.target.value)}
>
  <option value="">- select -</option>
  {batchTimes.map((time, index) => (
    // <option key={index} value={`${time.slot_no}~${time.slot_time}`}>
    <option key={index} value={time.slot_time}>
      {time.slot_time}
    </option>
  ))}
</select>

      <label className="font-medium whitespace-nowrap">Membership No:</label>
      <input
        className="flex-1 p-1 m-2 border border-gray-300 rounded"
        type="text"
        value={memNo}
        onChange={(e) => setMemNo(e.target.value)}
      />
    </>
  )}

  {/* Sync Data Button */}
  <button onClick={handleSyncData} disabled={isLoading} style={{ marginLeft: "10px", backgroundColor: isLoading ? "gray" : "yellowgreen", color: "white", padding: "5px 10px", border: "none", cursor: isLoading ? "not-allowed" : "pointer" }}>{isLoading ? "Syncing..." : "Sync Data"}</button>
</div>



  {/* Manual File Upload Section */}
  <h5 className="text-lg font-bold mt-6 mb-2" style={{ textAlign: "left" }}>
    Manual Sync Biometric Data to Exam Server
  </h5>
  <div className="flex items-center space-x-4 mb-1" style={{ textAlign: "left" }}>

<input className="w-1/4 p-1 border border-gray-300 m-2 rounded" type="file" onChange={handleFileChange} />
                <button
                    onClick={handleImport}
                    style={{
                      backgroundColor: "yellowgreen",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      margin: "10px"
                    }}
                >
                    Manual Sync
                </button>
  <button
    type="button"
    // className="bg-gray-100 border border-gray-300 px-4 py-1 rounded hover:bg-gray-200"
    style={{
      marginRight: "10px",
      padding: "5px 10px",
      backgroundColor: "#f4f4f4",
      border: "1px solid #ccc",
  }}
    onClick={handleDownloadTemplateCSV}
  >
    Download Template
  </button>
 {/* </form> */}

  {statusMsg && <p className="text-blue-500 font-semibold">{statusMsg}</p>}
</div>

</div>

  );
};

export default BiometricApiServices;
