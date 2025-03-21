import React, { useState } from "react";
import VirtualKeyboard from "./VirtualKeyboard";

const TestValue = () => {
  const [focusedInput, setFocusedInput] = useState(null); // Track the focused input
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 }); // Track keyboard position

  const handleFocus = (e) => {
    setFocusedInput(e.target); // Set the currently focused input
  };

  const handleResetKeyboardPosition = () => {
    setKeyboardPosition({ x: 0, y: 0 }); // Reset position to default
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Virtual Keyboard Example</h1>

      {/* Inputs to use with the virtual keyboard */}
      <input
        type="text"
        placeholder="Click on the virtual keyboard1..."
        onFocus={handleFocus}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />
      <input
        type="text"
        placeholder="Click on the virtual keyboard2..."
        onFocus={handleFocus}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />
      <input
        type="text"
        placeholder="Click on the virtual keyboard3..."
        onFocus={handleFocus}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />

      {/* Reset Button */}
      <button
        onClick={handleResetKeyboardPosition}
        style={{
          marginBottom: "20px",
          padding: "10px",
          cursor: "pointer",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Reset Keyboard Position
      </button>

      {/* Virtual keyboard */}
      <VirtualKeyboard
        focusedInput={focusedInput}
        position={keyboardPosition}
        setPosition={setKeyboardPosition}
      />
    </div>
  );
};

export default TestValue;
