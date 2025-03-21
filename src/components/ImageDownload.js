import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
} from "@mui/material";

const ImageDownload = () => {
  const [centerCode, setCenterCode] = useState("");
  const [serverNo, setServerNo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({
    photo: false,
    sign: false,
    checkStatus: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-center-server-no");
        setCenterCode(res.data.centre_code);
        setServerNo(res.data.serverno);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const downloadFile = async (fileName) => {
    try {
      setLoading((prev) => ({ ...prev, [fileName]: true }));

      const status = centerCode + "_" + fileName;
      const res = await axios.get(`http://localhost:5000/download-file/${status}`);
      const file = fileName[0].toUpperCase() + fileName.slice(1);
      if (res.statusText === "OK") {
        setMessage(`${file} file downloaded and extracted successfully.`);
      } else {
        setMessage(`Error while downloading ${fileName} file.`);
      }
      setLoading((prev) => ({ ...prev, [fileName]: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setLoading((prev) => ({ ...prev, checkStatus: true }));

      const res = await axios.get("http://localhost:5000/check-status");
      setMessage(res.data);
      setLoading((prev) => ({ ...prev, checkStatus: false }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
          <Box mb={3}>
          <Typography variant="body2">
            <strong>Center Code:</strong> {centerCode}
          </Typography>
          <Typography variant="body2">
            <strong>Server No:</strong> {serverNo}
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center" mb={3}>
          <Grid item>
            <Typography variant="body2">Download Photo:</Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => downloadFile("photo")}
              disabled={loading.photo}
              sx={{
                minWidth: "150px",
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading.photo ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Download"
              )}
            </Button>
          </Grid>

          <Grid item>
            <Typography variant="body2">Download Signature:</Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => downloadFile("sign")}
              disabled={loading.sign}
              sx={{
                minWidth: "150px",
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading.sign ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Download"
              )}
            </Button>
          </Grid>
        </Grid>

        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">Check Status:</Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleCheckStatus}
              disabled={loading.checkStatus}
              sx={{
                minWidth: "150px",
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading.checkStatus ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Check"
              )}
            </Button>
          </Grid>
        </Grid>

        {message && (
          <Alert
            severity={
              message.includes("successfully")
                ? "success"
                : message.includes("error")
                ? "error"
                : "warning"
            }
            sx={{ mt: 3 }}
          >
            {message}
          </Alert>
        )}
      </Card>
    </Container>
  );
};

export default ImageDownload;
