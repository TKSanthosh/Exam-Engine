import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import VirtualKeyboard from "./VirtualKeyboard";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import IconButton from "@mui/material/IconButton";

const RangeQues = ({
  incrementingId,
  currentQuestion,
  answers,
  handleOptionChange,
  setIsSaveDisabled,
  isSaveDisabled,
  handleSaveQuestion,
}) => {
  const [isRangeSaveDisabled, setIsRangeSaveDisabled] = useState(true);
  const [rangeAnswer, setRangeAnswer] = useState("");
  const [enableDisableVirtualKeyboard, setEnableDisableVirtualKeyboard] =
    useState(false);

  const [focusedInput, setFocusedInput] = useState(null); // Track the focused input
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 400, y: -112 }); // Track keyboard position
  const [decimalValue , setDecimalValue] = useState(0);
  const[count,setCount] = useState(0)
  const handleFocus = (e) => {
    // console.log(e.target)
    setFocusedInput(e.target); // Set the currently focused input
  };
  const questionId = document.getElementById(`question_${incrementingId}`);
  const sendAnswer = (answer) => {
    // Set decimalValue based on question type

    if (currentQuestion.question_type === "R") {
      console.log("range",currentQuestion.options[2].text);
      setDecimalValue(currentQuestion.options[2].text);
    } else if (currentQuestion.question_type === "N") {
      console.log("number",currentQuestion.options[1].text);
      setDecimalValue(currentQuestion.options[1].text);
    }
  
    console.log("Decimal Value:", decimalValue);
  
    // Update the input field and validate decimal places
    if (answer === "← Clear") {
      questionId.value = questionId.value.slice(0, -1);
    } else if (questionId.value.length < 16 && answer !== "← Clear") {
      if (Number(decimalValue) === 0) {
        if (answer !== ".") {
          questionId.value += answer;
        }
      } else {
        questionId.value += answer;
      }
    }
    
    // Validate decimal places
    if (questionId.value.includes(".")) {
      const deciIndex = questionId.value.indexOf(".");
      const decimalPart = questionId.value.slice(deciIndex + 1);
      if(Number(decimalValue) != ""){
      // Truncate if the decimal part exceeds the allowed length
      if (decimalPart.length > Number(decimalValue)) {
        questionId.value = questionId.value.slice(0, deciIndex + Number(decimalValue) + 1);
      }
    }
    }
    setRangeAnswer(questionId.value);
  
    // Reset saved value in `answers` if input is cleared
    if (questionId.value === "") {
      handleOptionChange(incrementingId, "");
    } else {
      setIsSaveDisabled(false);
      setIsRangeSaveDisabled(false);
    }
    handleOptionChange(incrementingId, questionId.value);
  };
  const handleValidation=()=>{
    if(rangeAnswer==="." || rangeAnswer ==="-"){
      alert("You can't save symbols alone")
      setIsSaveDisabled(false);
      setIsRangeSaveDisabled(false);
    }
  }

  const handleResetKeyboardPosition = () => {
    setKeyboardPosition({ x: 400, y: -110 }); // Reset position to default
  };

  return (
    <div key={incrementingId}>
      <TextField
        label="Answer"
        variant="outlined"
        className="mt-4 mx-3"
        inputProps={{ maxLength: 16,readOnly: true }}
        value={rangeAnswer || answers[incrementingId] || ""}
        id={`question_${incrementingId}`}
        name={`question_${incrementingId}`}
        onFocus={handleFocus}
        onChange={(e) => {
          handleOptionChange(incrementingId, e.target.value);
          setRangeAnswer(e.target.value);
          setIsSaveDisabled(false);
          setIsRangeSaveDisabled(false);
        }}
      />
      <br />
      <input
        type="button"
        className="mx-2 btn btn-success"
        id="saveButton"
        onClick={(e) => {
          e.preventDefault();
          handleSaveQuestion(rangeAnswer);
          handleOptionChange(incrementingId, rangeAnswer);
          setRangeAnswer("");
          setIsSaveDisabled(true);
          setIsRangeSaveDisabled(true);
          handleValidation();
          setCount(0) ;
        }}
        style={{ marginTop: "16px", padding: "4px" }}
        value="Save Answer"
        disabled={isRangeSaveDisabled} // Disable the button if true

        // Use value for the button text
      />
      <Button
        size="small"
        variant="contained"
        sx={{ mt: 2 }}
        endIcon={<KeyboardIcon />}
        onClick={(e) => {
          e.preventDefault();
          enableDisableVirtualKeyboard === false
            ? setEnableDisableVirtualKeyboard(true)
            : setEnableDisableVirtualKeyboard(false);
        }}
      >
        Virtual Keyboard
      </Button>
      {enableDisableVirtualKeyboard === true ? (
        <>
          <VirtualKeyboard
            focusedInput={focusedInput}
            position={keyboardPosition}
            setPosition={setKeyboardPosition}
            setRangeAnswer={setRangeAnswer}
            sendAnswer={sendAnswer}
          />
          {/* <br></br> */}
          <IconButton
            size="small"
            variant="contained"
            sx={{
              mt: 2,
              mx: 1,
              backgroundColor: "#1976d2", // Fill color
              border: "2px solid #1976d2", // Outline color
              color: "white", // Icon color
              "&:hover": {
                backgroundColor: "#115293", // Hover fill color
                borderColor: "#115293", // Hover outline color
              },
            }}
            onClick={handleResetKeyboardPosition}
          >
            <RestartAltIcon />
          </IconButton>
        </>
      ) : null}
    </div>
  );
};

export default RangeQues;
