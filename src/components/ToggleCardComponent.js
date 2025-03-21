import React, { useState } from 'react';
import './ToggleCard.css'; // Import the CSS file
import { Switch, Card, CardContent, Typography, Box } from '@mui/material';
const ToggleCardComponent = ({ qpStatus, loading, slotCount, avg_cand_cnt, examData, col, actLoading, actButtonDisabled, buttonStyles, buttonTexts, closureButtonDisabled, batchStyles, examDataTotal, handleCheckTable, handleClosure, handleFileUpload, buttonDisabled, buttonStyle, buttonText, handleClear, clearStyles, text }) => {
    const [showCardOne, setShowCardOne] = useState(true);

    const handleToggle = () => {
        setShowCardOne(prevState => !prevState);
    };

    return (
        <div className="card-container">
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6">Switch Card</Typography>
                    <Switch
                        checked={showCardOne}
                        onChange={handleToggle}
                        color="primary"
                        sx={{ ml: 2 }}
                    />
                </Box>

            <div className={`card ${showCardOne ? 'card-show' : 'card-hide'}`}>
                <h4>
                    <p>Available in QP Download</p>
                </h4>
            </div>

            <div className={`card ${!showCardOne ? 'card-show' : 'card-hide'}`}>
                <h4>
                    <p>Status: {qpStatus} rows available in QP Download</p>
                </h4>
            </div>
        </div>
    );
};

export default ToggleCardComponent;
