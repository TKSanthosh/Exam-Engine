import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const RenderAlertForNotSaving = ({ sendDataToExamForm }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
    sendDataToExamForm(false);
  };

  return (
    <Modal open={isVisible} onClose={() => setIsVisible(false)}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.5)', // transparent background
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            padding: 3,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            Save Answer before switching questions
          </Typography>
          <Button variant="contained" color="primary" onClick={handleClick}>
            Okay
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RenderAlertForNotSaving;
