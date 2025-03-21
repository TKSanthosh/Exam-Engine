import React from "react";
import Draggable from "react-draggable";
import "./VirtualKeyboard.css";

const VirtualKeyboard = ({ focusedInput, position, setPosition,sendAnswer }) => {
  //   const keys = [
  //     ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  //     ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  //     ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  //     ["Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  //     ["Space"],
  //   ];

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["0", ".", "-"],
    ["← Clear"],
  ];

  const handleKeyClick = (key) => {
    if (!focusedInput) {
      alert("Please select a text box to type!");
      return;
    }

    const currentValue = focusedInput.value;

    if (key === ".") {
      // Check if a decimal point already exists
      if (currentValue.includes(".")) {
        alert("Only one decimal point is allowed.");
        return;
      }
      // Append the decimal point
      sendAnswer(key)
      focusedInput.value += key;
    } else if (key === "-") {
      // Allow the negative sign only at the start
      if (currentValue.includes("-") || currentValue.length > 0) {
        alert("The negative sign can only appear at the beginning.");
        return;
      }
      // Append the negative sign
      sendAnswer(key)
      focusedInput.value = key + currentValue;
    } else if (key === "← Clear") {
      // Remove the last character
      sendAnswer(key)
      focusedInput.value = currentValue.slice(0, -1);
    } else {
      // Append the key
      sendAnswer(key)
      focusedInput.value += key;
    }

    // Retain focus on the input field
    focusedInput.focus();
  };

  return (
    <Draggable
      position={position}
      onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
    >
      <div
        className="virtual-keyboard"
        style={{
          position: "absolute",
          zIndex: 10,
          cursor: "move",
          background: "#ddd",
          padding: "5px",
        }}
      >
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="key-row">
            {row.map((key) => (
              <button
                key={key}
                className={`key ${key === "← Clear" ? "backspace" : ""}`}
                onClick={() => handleKeyClick(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Draggable>
  );
};

export default VirtualKeyboard;
