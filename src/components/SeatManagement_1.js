import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from 'jquery';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReusablePasswordDialog from "./ReusablePasswordDialog";


const SeatManagement = () => {
    const [labCode, setLabCode] = useState([]); // Initialize as an empty array
    const [selectedLab, setSelectedLab] = useState(""); // To hold the selected lab name
    const [selectedLab_csv, setSelectedLab_csv] = useState(""); // To hold the selected lab name
    const [selectedLab_Block, setSelectedLab_Block] = useState(""); // To hold the selected lab name
    const [selectedFile, setSelectedFile] = useState(null);
    const [centerCode_val,setCenterCode]  = useState(null);

    const [ipList, setIpList] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [editingSeatId, setEditingSeatId] = useState(null);
    const [edithidden, setedithidden] = useState(null);

    const [labDetails, setLabDetails] = useState([]);
    // const [activeOptions, setActiveOptions] = useState('');
    // const [deactiveOptions, setDeactiveOptions] = useState('');
    const [SeatModifyHeader, setSeatModifyHeader] = useState('');

    const [activeOptions, setActiveOptions] = useState([]);
    const [deactiveOptions, setDeactiveOptions] = useState([]);
    const [selectedActive, setSelectedActive] = useState([]); // Track selected active option
    const [selectedDeactive, setSelectedDeactive] = useState([]); // Track selected deactive option

    const [dialogOpen, setDialogOpen] = useState(false);
    const [report, setReport] = useState(1);
    const [miscPwd, setMiscPwd] = useState('');
    const [type,setType] = useState('');
    const [miscText, setMiscText] = useState('misc-txt');
    const [pwdMatched,setPwdMatched] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [serverNumber, setServerNo] = useState("");
    const [biometricId, setBiometricId] = useState("");
    
    

      const handleOpenDialog = (passwordType, reportId, actionType, biometricId) => {
        setDialogOpen(true);
        setMiscPwd(passwordType); // Set password type to 'miscellaneous'
        setReport(reportId); // Set report ID
        setType(actionType); // Set action type ('edit' or 'delete')
        setBiometricId(biometricId); // Set the biometric ID
    };
    
      const handleCloseDialog = () => {
        setDialogOpen(false);
        // setMiscPwd('');
        if(miscPwd==''){
            setMiscText('misc-txt');
        } else{
        setMiscPwd('');
        }
        // setMiscText('misc-txt');
    };
    const handleSubmitPassword = (password) => {
        console.log('Misc Password submitted:', password);
        // After successful password validation, trigger the corresponding action
        if (pwdMatched) {
            if (type === "edit") {
                handleEdit(biometricId); // Trigger the edit action
            } else if (type === "delete") {
                handleDelete(biometricId); // Trigger the delete action
            }
        }
    };

    const handleValidAccess = async (vaaccess) => {
        if (vaaccess !== 1) {
            alert('Access Failed!');
            setMiscText('misc-txt');
            return;
        }
        
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
          const moduleType = miscPwd; 
        
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
            setPwdMatched(false)
              alert('Password Mismatch');
              return;
          }else{
            setPwdMatched(true);
            // handleReportClick(type,report);
            if (type === "edit") {
                handleEdit(biometricId); // Trigger the edit action
            } else if (type === "delete") {
                handleDelete(biometricId); // Trigger the delete action
            }
          }
          // Handle utility tasks
        } catch (error) {
          console.error('Error handling valid access:', error.message);
          alert('An error occurred while processing the request.');
        }
        }

        // const handleReportClick = async (type,report) => {
        //     setPwdMatched(true);
        //     setType(type)
        //   };

    useEffect(() => {
        const popup = $('.popup');
            popup.css('height', '500px');
            popup.css('width', '1100px');
            popup.css('left', '-350px');

     }, []);
    const handleActiveChange = (selected) => {
        // alert(selected);
        console.log('Selected Active:', selected);
        setSelectedActive(selected || []);
    };

    const handleDeactiveChange = (selected) => {
        console.log('Selected Deactive:', selected);
        setSelectedDeactive(selected || []);
    };

    const BlockCandidateIP = () => {
        if (selectedActive.length === 0) {
            alert("Please select at least one IP to block.");
            return;
        }
    
        axios.get('http://localhost:5000/block-candidate-ip', {
            params: { selectedips: JSON.stringify(selectedActive) },
        })
        .then(response => {
            alert("Blocked IP(s) successfully.");
            console.log("Server Response:", response.data);
            // Optionally refresh the data
            fetchBiometricData();
            setSelectedDeactive([]);
            setSelectedActive([]);
        })
        .catch(error => console.error("Error blocking IP(s):", error));
    };
    

    const UnBlockCandidateIP =() =>{

        if (selectedDeactive.length === 0) {
            alert("Please select at least one IP to Unblock.");
            return;
        }
    
        axios.get('http://localhost:5000/unblock-candidate-ip', {
            params: { selectedips: JSON.stringify(selectedDeactive) },
        })
        .then(response => {
            alert("UnBlocked IP(s) successfully.");
            console.log("Server Response:", response.data);
            // Optionally refresh the data
            fetchBiometricData();
            setSelectedDeactive([]);
            setSelectedActive([]);
        })
        .catch(error => console.error("Error Unblocking IP(s):", error));
    }

    useEffect(() => {
        axios.get('http://localhost:5000/lab-details')
            .then(response => {
                setLabDetails(response.data);
            })
            .catch(error => console.error('Error fetching lab details:', error));
    }, []);

    const fetchBiometricData = () => {
        axios.get('http://localhost:5000/biometric-data', { params: { M: 3, lab: selectedLab_Block } })
            .then(response => {
                // alert(response.data.activeOptions);
                setActiveOptions(
                    response.data.activeOptions.map(option => ({
                        value: option.biometric_id,
                        label: `${option.exam_seatno}~${option.candidate_ipaddress}`
                    }))
                );
                setDeactiveOptions(
                    response.data.deactiveOptions.map(option => ({
                        value: option.biometric_id,
                        label: `${option.exam_seatno}~${option.candidate_ipaddress}`
                    }))
                );
                alert("Data Fetched Successfully");
            })
            .catch(error => console.error('Error fetching biometric data:', error));
    };
    
    const handleViewBlockIPList = async () => {
            const BlockListipAddress = $('.BlockListipAddress');
            const ListipAddress = $('.ListipAddress');
            const uploadDiv = $('.UploadcsvDiv');
            const AddSeatDiv = $('.AddSeatDiv');
            if (BlockListipAddress.css('display') === 'none') {
                AddSeatDiv.css('display', 'none');
                uploadDiv.css('display', 'none');
                ListipAddress.css('display', 'none');
                BlockListipAddress.css('display', 'block');
                
            } else {
                uploadDiv.css('display', 'none');
            }
    };

    const handleViewIPList = async () => {
        try {
            const response = await axios.get("http://localhost:5000/view-ip-list");
            setIpList(response.data);
            setShowTable(true);
            const ListipAddress = $('.ListipAddress');
            const uploadDiv = $('.UploadcsvDiv');
            const AddSeatDiv = $('.AddSeatDiv');
            const BlockListipAddress = $('.BlockListipAddress');
            if (ListipAddress.css('display') === 'none') {
                AddSeatDiv.css('display', 'none');
                uploadDiv.css('display', 'none');
                ListipAddress.css('display', 'block');
                BlockListipAddress.css('display', 'none');
                
            } else {
                uploadDiv.css('display', 'none');
            }
            
        } catch (error) {
            console.error("Error fetching IP list:", error);
            alert("Error fetching IP list.");
        }
    };
    // const [isPopupVisible, setIsPopupVisible] = useState(false); // For Add Seats popup
    // const [isCsvUploadVisible, setIsCsvUploadVisible] = useState(false); // State to toggle CSV Upload visibility

    useEffect(() => {
        
        // alert();
        fetch('http://localhost:5000/get-center-server-details')
          .then(response => response.json())
          .then(data => {
            setCenterCode(data.center_code);
            // setServerNo(data.serverno);
            //onSerialNumberChange(data.SerialNumber); // Call the parent function with the new serial number
          })
          .catch(error => console.error('Error fetching serial number:', error));
      }, []);

    useEffect(() => {
        // jQuery logic to toggle visibility on button click
        $('#csvUploadButton').on('click', () => {
            const uploadDiv = $('.UploadcsvDiv');
            const AddSeatDiv = $('.AddSeatDiv');
            const ListipAddress = $('.ListipAddress');
            const BlockListipAddress = $('.BlockListipAddress');
            if (uploadDiv.css('display') === 'none') {
                AddSeatDiv.css('display', 'none');
                uploadDiv.css('display', 'block');
                ListipAddress.css('display', 'none');
                BlockListipAddress.css('display', 'none');

            } else {
                uploadDiv.css('display', 'none');
            }
        });

        // Cleanup event listener on component unmount
        return () => {
            $('#csvUploadButton').off('click');
        };
    }, []);

    useEffect(() => {
        // jQuery logic to toggle visibility on button click
        $('#addSeatUploadButton').on('click', () => {
            const AddSeatDiv = $('.AddSeatDiv');
            const uploadDiv = $('.UploadcsvDiv');
            const ListipAddress = $('.ListipAddress');
            const BlockListipAddress = $('.BlockListipAddress');
            if (AddSeatDiv.css('display') === 'none') {
                AddSeatDiv.css('display', 'block');
                uploadDiv.css('display', 'none');
                ListipAddress.css('display', 'none');
                BlockListipAddress.css('display', 'none');
            } else {
                AddSeatDiv.css('display', 'none');
            }
            // document.getElementById("labCodePopup").value = '';
            document.getElementById("seatNumber").value = '';
            document.getElementById("ipAddress").value = '';
            setSelectedLab(null);
            setedithidden('0');
            setSeatModifyHeader('Adding a Seat Per Lab Wise')
        });

        // Cleanup event listener on component unmount
        return () => {
            $('#addSeatUploadButton').off('click');
        };
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/get-labname') // Update with correct URL
            .then((response) => setLabCode(response.data.result)) // Set lab names in state
            .catch((error) => console.error('Error fetching lab names:', error.response || error.message));
    }, []);

    const handleLabCodeChange = (e) => {
        setSelectedLab(e.target.value); // Store the selected lab name
    };

    const handleLabCodeChange_csv = (e) => {
        setSelectedLab_csv(e.target.value); // Store the selected lab name
    };
    const handleLabCodeChange_Block = (e) => {
        setSelectedLab_Block(e.target.value); // Store the selected lab name
    };


    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleDelete = (id) => {
        // Logic to delete the row with the given id
        console.log(`Delete button clicked for ID: ${id}`);
    
        // Confirmation dialog
        if (window.confirm("Are you sure you want to delete this record?")) {
            axios
                .get(`http://localhost:5000/delete-seat/${id}`)
                .then((response) => {
                    if (response.data.success) {
                        // Refresh the table data after deletion
                        setIpList((prevList) => prevList.filter((row) => row.biometric_id !== id));
                        alert("Record deleted successfully.");
                    } else {
                        alert("Failed to delete the record.");
                    }
                })
                .catch((error) => {
                    console.error("Error deleting record:", error);
                    alert("An error occurred while deleting the record.");
                });
        }
    };

    const handleDownloadallCSV = () => {
        axios.get('http://localhost:5000/all-labs-download', { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'seatmanagement.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.error('Error downloading the file:', error);
            });
    };

    const handleDownloadSpecificCSV = () => {
        axios.get('http://localhost:5000/specific-labs-download', { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'seatmanagement_addlabname.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.error('Error downloading the file:', error);
            });
    };

    const handleImport = async () => {
        if (!selectedLab_csv) {
            alert("Please select a lab.");
            return;
        }

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
        formData.append("labCode", selectedLab_csv);
        alert(selectedLab_csv);

        axios.post('http://localhost:5000/seat-management-upload-csv', formData)
            .then((response) => {
                alert("Seat added successfully!");
                console.log("Response from server:", response.data);
            })
            .catch((error) => {
                console.error("Error adding seat:", error);
                alert("Failed to add seat. Please try again.");
            });
    };

    // const handleOpenPopup = () => {
    //     console.log("Popup Opened"); // Debug message
    //     setIsPopupVisible(true);
    // };

    // const handleClosePopup = () => {
    //     setIsPopupVisible(false);
    // };

    const handleAddSeatSubmit = (e) => {
        e.preventDefault();
    
        // Collect form data
        const exam_centre_code = document.getElementById("centerCode").value;
        const exam_lab_code = document.getElementById("labCodePopup").value;
        const exam_seatno = document.getElementById("seatNumber").value;
        const candidate_ipaddress = document.getElementById("ipAddress").value;
        const edithidden_val = document.getElementById("edithidden").value;

        
    
        // Validate form fields
        if (!exam_centre_code || !exam_lab_code || !exam_seatno || !candidate_ipaddress) {
            alert("Please fill in all the fields.");
            return;
        }
        // Validate IP Address
        if (!validateIPAddress(candidate_ipaddress)) {
            return; // Stop further execution if IP validation fails
        }
    
        // Prepare data for submission
        const seatData = {
            exam_centre_code,
            exam_lab_code,
            exam_seatno,
            candidate_ipaddress,
        };
    
        if(edithidden_val==1){

            axios.put(`http://localhost:5000/update-seat/${editingSeatId}`, seatData)
            .then(() => {
                alert("Seat updated successfully!");
                // resetForm();
            })
            .catch((error) => {
                console.error("Error updating seat:", error);
                alert("Failed to update seat. Please try again.");
            });

        }else{
        // Submit data to the backend
        axios.post('http://localhost:5000/add-seats-allocation', seatData)
        .then((response) => {
            alert("Seat added successfully!");
            console.log("Response from server:", response.data);
            // Optionally reset form fields or close popup
            document.getElementById("seatNumber").value = "";
            document.getElementById("ipAddress").value = "";
            // setIsPopupVisible(false); // Uncomment if popup needs to close
        })
        .catch((error) => {
            console.error("Error adding seat:", error);
            alert("Failed to add seat. Please try again.");
        });
        }
       
    };

    const handleEdit = (seatid) => {
            const AddSeatDiv = $('.AddSeatDiv');
            const uploadDiv = $('.UploadcsvDiv');
            const ListipAddress = $('.ListipAddress');
            const BlockListipAddress = $('.BlockListipAddress');
            if (AddSeatDiv.css('display') === 'none') {
                AddSeatDiv.css('display', 'block');
                uploadDiv.css('display', 'none');
                ListipAddress.css('display', 'none');
                BlockListipAddress.css('display', 'none');
            } else {
                AddSeatDiv.css('display', 'none');
            }

            axios.get(`http://localhost:5000/get-seat/${seatid}`)
            .then((response) => {
                const seat = response.data.result;
                // alert(seat.exam_lab_code);
                document.getElementById("labCodePopup").value = seat.exam_lab_code;
                document.getElementById("seatNumber").value = seat.exam_seatno;
                document.getElementById("ipAddress").value = seat.candidate_ipaddress;
                setSelectedLab(seat.exam_lab_code);
                setEditingSeatId(seatid); // Track which seat is being edited
                setedithidden('1');
                setSeatModifyHeader('Edit Seat');
                
            })
            .catch((error) => console.error("Error fetching seat:", error));
    };

    const handleDownload = () => {
        fetch("http://localhost:5000/download-candidate-seats")
            .then(response => response.blob())
            .then(blob => {
                // Create a download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "candidate_seat_management.csv";
                link.click();
    
                // Clean up
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Error downloading CSV:", error);
            });
    };
    
    function validateIPAddress(ipaddress) {
        // Regular expression to match a valid IPv4 address
        const pattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    
        if (!pattern.test(ipaddress)) {
            alert('Kindly enter a valid IP address'); // Show error message
            return;
        }
        return true;
    }
    

    return (
        <div style={{ padding: "20px" , fontSize: "12px"}}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <button
                onClick={handleViewBlockIPList}
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#ffc107",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Block IP Address Details
                </button>
                <button
                onClick={handleViewIPList}
                style={{
                    marginRight: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                View IP Lists
            </button>
                <button
                    id="csvUploadButton"
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    CSV Upload
                </button>
                
                <button
                    // onClick={handleOpenPopup}
                    id="addSeatUploadButton"
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Add Seats
                </button>
                {/* <span style={{ marginRight: "10px" }}>Sample CSV File:</span> */}
                <span style={{ marginRight: "10px",marginLeft:"50px" }}>Sample Files:</span>
                <button
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#f4f4f4",
                        border: "1px solid #ccc",
                    }}
                    onClick={handleDownloadallCSV}
                >
                    All Labs (CSV)
                </button>
                <button
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#f4f4f4",
                        border: "1px solid #ccc",
                    }}
                    onClick={handleDownloadSpecificCSV}
                >
                    Specific Labs (CSV)
                </button>
                <span style={{ marginRight: "10px" }}>Biometric Data:</span>
                <button
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#f4f4f4",
                        border: "1px solid #ccc",
                    }}
                    onClick={handleDownload}
                >
                    Download
                </button>
            {/* </div>

            <div style={{ marginBottom: "20px" }}> */}
                
              
            </div>
            <div className="UploadcsvDiv" style={{ marginBottom: "20px", display: "none" }}>
            <h5 style={{ color: '#4CAF50' }}>CSV Upload</h5>
            <div style={{ marginBottom: "20px",marginTop: "30px" }}>
                <label htmlFor="labCode" style={{ marginRight: "10px" }}>
                    Lab Code:
                </label>
                <select
                    id="labCode"
                    value={selectedLab_csv}
                    onChange={handleLabCodeChange_csv}
                    style={{ padding: "5px" }}
                >
                    <option value="">Select the Lab Name</option>
                    {labCode && labCode.map((lab, index) => (
                        <option key={index} value={lab.labname}>
                            {lab.labname}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <input type="file" onChange={handleFileChange} />
                <button
                    onClick={handleImport}
                    style={{
                        marginLeft: "10px",
                        backgroundColor: "yellowgreen",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Import
                </button>
            </div></div>
            {/* {isPopupVisible && ( */}
            <div className="AddSeatDiv" style={{ marginBottom: "20px", display: "none" }}>
    <h5 style={{ marginBottom: "20px", color: "#4caf50" }}>{SeatModifyHeader}</h5>
    <form onSubmit={handleAddSeatSubmit}>
        <input type="hidden" id="edithidden" value={edithidden} />

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
                <label htmlFor="centerCode" style={{ display: "block" }}>Center Code:</label>
                <input
                    type="text"
                    id="centerCode"
                    value={centerCode_val}
                    disabled
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label htmlFor="labCodePopup" style={{ display: "block" }}>Lab Code:</label>
                <select
                    id="labCodePopup"
                    value={selectedLab}
                    onChange={handleLabCodeChange}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                >
                    <option value="">Select the Lab name</option>
                    {labCode && labCode.map((lab, index) => (
                        <option key={index} value={lab.labname}>
                            {lab.labname}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
                <label htmlFor="seatNumber" style={{ display: "block" }}>Seat Number:</label>
                <input
                    type="text"
                    id="seatNumber"
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label htmlFor="ipAddress" style={{ display: "block" }}>IP Address:</label>
                <input
                    type="text"
                    id="ipAddress"
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
            </div>
        </div>

        <button
            type="submit"
            style={{
                width: "10%",
                padding: "10px",
                backgroundColor: "yellowgreen",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
            }}
        >
            Submit
        </button>
    </form>
</div>



                {/* {showTable && ipList.length > 0 && ( */}
                <div className="ListipAddress" style={{ marginBottom: "20px", display: "none" }}>
    <h5 style={{ color: '#4CAF50' }}>IP Lists</h5>
    <table border="1" className="table table-bordered table-striped fs-8 mt-4" style={{ marginTop: "20px", width: "100%", textAlign: "left" }}>
        <thead>
            <tr>
                <th>S.No</th>
                <th>Center Code</th>
                <th>Lab Name</th>
                <th>Seat Number</th>
                <th>Membership No</th>
                <th>IP Address</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {ipList.length > 0 ? (
                ipList.map((row, index) => (
                    <tr key={row.biometric_id}>
                        <td>{index + 1}</td>
                        <td>{row.exam_centre_code}</td>
                        <td>{row.exam_lab_code}</td>
                        <td>{row.exam_seatno}</td>
                        <td>N/A</td>
                        <td>{row.candidate_ipaddress}</td>
                        <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button
                                    onClick={() => handleOpenDialog("miscellaneous", "1", 'edit', row.biometric_id)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#ffc107",
                                        color: "black",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEdit} style={{ fontSize: "14px" }} />
                                </button>
                                <button
                                    // onClick={() => handleDelete(row.biometric_id)}
                                    onClick={() => handleOpenDialog("miscellaneous", "1", 'delete', row.biometric_id)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: "14px" }} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>No data available</td>
                </tr>
            )}
        </tbody>
    </table>
</div>

                <div className="BlockListipAddress" style={{ marginBottom: "20px", display: "none" }}>
            <h5 style={{ color: '#4CAF50' }}>Blocked IP Lists</h5>
            <div>
            <label htmlFor="labCode" style={{ margin: "10px" }}>
                    Lab Code:
                </label>
                <select
                    id="labCodeBlock"
                    value={selectedLab_Block}
                    onChange={handleLabCodeChange_Block}
                    style={{ padding: "5px", margin: "10px" }}
                >
                    <option value="">Select the Lab Name</option>
                    {labCode && labCode.map((lab, index) => (
                        <option key={index} value={lab.labname}>
                            {lab.labname}
                        </option>
                    ))}
                </select>
                <button style={{ padding: "5px 10px"}} onClick={fetchBiometricData}>Fetch Data</button>
            </div>
            <div style={{ width: '100%' }}>
            <div style={{ float: 'left', width: '45%' }}>
                <h4>Active IP Lists</h4>
                <Select
                    options={activeOptions}
                    isMulti
                    value={selectedActive}
                    onChange={handleActiveChange}
                    styles={{ container: (base) => ({ ...base, width: '400px' }) }}
                />
            </div>
            <div style={{ float: 'left', width: '15%', paddingTop: '1%' }}>
                <button onClick={BlockCandidateIP}>&raquo;</button><br />
                <button onClick={UnBlockCandidateIP}>&laquo;</button>
            </div>
            <div style={{ float: 'left', width: '40%' }}>
                <h6>Blocked IP Lists</h6>
                <Select
                    options={deactiveOptions}
                    isMulti
                    value={selectedDeactive}
                    onChange={handleDeactiveChange}
                    styles={{ container: (base) => ({ ...base, width: '400px' }) }}
                />
            </div>
        </div>

        </div>
        {dialogOpen && (
    <ReusablePasswordDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitPassword}
        validAccess={handleValidAccess}
        title="Enter Misc Password"
        passwordtype={miscPwd}
        batch=""
    />
)}
        </div>
    );
};
export default SeatManagement;
