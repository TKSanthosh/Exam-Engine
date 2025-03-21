// YourReactComponent.js

import React, { useState } from 'react';
import './style.css';

const ReactComp = () => {
  const colors = ['#3498db', '#e74c3c', '#2ecc71'];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // Function to handle color change
  const handleColorChange = () => {
    const newIndex = (currentColorIndex + 1) % colors.length;
    setCurrentColorIndex(newIndex);
  };

  return (
    <div className="dynamic-element" style={{ '--dynamic-color': colors[currentColorIndex] }}>
      <p>This text has a dynamic color.</p>
      <button onClick={handleColorChange}>Change Color</button>
    </div>
  );
};

export default ReactComp;
