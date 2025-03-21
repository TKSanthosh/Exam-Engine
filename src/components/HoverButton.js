import React, { useState } from 'react';
import './Button.css';


const HoverButton = ({ onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
  
    const handleClick = async () => {
      setLoading(true);
      await onSubmit();
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000); // Reset after 2 seconds
    };
  
    return (
      <button 
        className={`submit-button ${loading ? 'loading' : ''}`} 
        onClick={handleClick}
        disabled={loading || submitted} // Disable button during loading or after submission
      >
        {loading ? <div className="loader"></div> : submitted ? 'Submitted' : 'Preview Submit'}
      </button>
    );
  };
export default HoverButton;
