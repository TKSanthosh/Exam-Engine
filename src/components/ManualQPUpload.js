import React, { useState } from "react";
import { Box, Button, Typography, TextField, Grid } from "@mui/material";
import axios from "axios";

const ManualQPUpload = () => {
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      setFileName(null);
      setSelectedFile(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setMessage("❌ Please select a file.");
      return;
    }
    if(!password){
      alert("Please enter a password.");
      return;
    }
    if (!selectedFile || !password) {
      alert("Please select a file and enter a password.");
      return;
    }

    // Validate ZIP file type
    if (selectedFile.type !== "application/zip" && selectedFile.type !== "application/x-zip-compressed") {
      setMessage("❌ Only ZIP files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("actFile", selectedFile); // Append file correctly
    formData.append("password", password);

    console.log("📂 FormData Content:", [...formData.entries()]); // Debugging

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}:5000/manualQPUpload`, formData); 
      console.log("✅ Server Response:", response.data);
      if(response.data.time!=""){
        setMessage(`✅ ${response.data.message}
          Activated - ${response.data.time} batch`);
      }else{
        setMessage("✅ File uploaded successfully!");
      }
    } catch (error) {
      console.error("❌ Upload Error:", error.response.data.error.message);
      setMessage("❌ "+error.response.data.error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: 4,
        maxWidth: 400,
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 3,
        mt: 5,
      }}
    >
      <Typography variant="h5" component="h1">
        Upload ZIP File
      </Typography>

      {/* File Input */}
      {/*<input type="file" accept=".zip" onChange={handleFileChange} />*/}
      <TextField
      type="file"
      accept=".zip"
      onChange={handleFileChange}
      variant="outlined"
      fullWidth
    />
     <TextField
        type="password"
        label="Enter Password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      {fileName && (
        <Typography variant="body2" color="text.secondary">
          Selected File: {fileName}
        </Typography>
      )}

      {/* Upload Button */}
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleFileUpload}>
            Upload
          </Button>
        </Grid>
      </Grid>

      {/* Status Message */}
      {message && (
        <Typography variant="body1" color={message.includes("✅") ? "green" : "error"}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default ManualQPUpload;
