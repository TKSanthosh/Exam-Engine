import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

const DBPatch = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get("http://localhost:5000/db-patch");
      if (res.data !== false) {
        setMessage("Patch updated successfully!");
      } else {
        setMessage("No patch available.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while updating the patch.");
    } finally {
      setLoading(false);
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
      
        <Typography variant="body2" color="text.secondary" mb={3}>
          Click the button below to check for and apply the latest DB patch.
        </Typography>

        <Box mb={3}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleUpdate}
            disabled={loading}
            sx={{
              minWidth: "150px",
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
          </Button>
        </Box>

        {message && (
          <Alert
            severity={
              message.includes("successfully")
                ? "success"
                : message.includes("error")
                ? "error"
                : "warning"
            }
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}
      </Card>
    </Container>
  );
};

export default DBPatch;
