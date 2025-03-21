import React, { useState } from "react";
import { Box, Button, Typography, TextField,Grid2 } from "@mui/material";

const  ScannerUpload= ()=> {
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "");
   
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    const fileInput = document.querySelector('input[type="file"]'); // Access file input
    const file = fileInput?.files[0]; // Access the selected file
  
    if(fileName != "scan_input.csv" ){
        setMessage("Please upload scan_input.csv file.");
        return;
    }
    if (!file) {
      setMessage("Please upload a file.");
      return;
    }
  
    if (file.type !== "text/csv") {
      setMessage("Only CSV files are allowed.");
      return;
    }
    alert(file);
  
    const formData = new FormData();
    formData.append("userFile", file);
  
    try {
      const response = await fetch("http://localhost:5000/scannerUpload", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Error uploading the file.");
    }
  };
  
  const handleTemplateDownload = () => {
    const templateData = "192.168.1.1\n192.168.1.2\n192.168.1.3";
    const blob = new Blob([templateData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scan_input.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return   (  
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
    Upload CSV File
  </Typography>

  

  <TextField
    type="file"
    inputProps={{
      accept: ".csv",
    }}
    onChange={handleFileChange}
    sx={{
      '& input[type="file"]': {
        cursor: "pointer",
      },
    }}
  />

  {fileName && (
    <Typography variant="body2" color="text.secondary">
      Selected File: {fileName}
    </Typography>
  )}

<Grid2 container spacing={2} justifyContent="center">
        <Grid2 item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
          >
            Upload
          </Button>
        </Grid2>
        <Grid2 item>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleTemplateDownload}
          >
            Download Template
          </Button>
        </Grid2>
      </Grid2>


  {message && (
    <Typography
      variant="body1"
      color={message.includes("success") ? "green" : "error"}
    >
      {message}
    </Typography>
  )}
</Box>
);
}

export default ScannerUpload;
