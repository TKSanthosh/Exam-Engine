// AlertComponent.js
import React from 'react';
import './AlertComponent.css'; // Import custom CSS

const AlertComponent = ({ message, onClose }) => {
  return (
    <div className="alert-box">
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        <button className="alert-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertComponent;
