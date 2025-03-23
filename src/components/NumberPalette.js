import React from "react";
import PropTypes from "prop-types";
import "./NumberPalette.css"; // Add CSS for styling if needed
import CalculatorAndRoughSheet from "./CalculatorAndRoughSheet"; // Import the CalculatorAndRoughSheet component
import SciCalculatorAndRoughSheet from "./SciCalculatorAndRoughSheet"; // Import the CalculatorAndRoughSheet component
import Draggable from "react-draggable";
const NumberPalette = ({
  totalQuestions,
  filteredQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionSelect,
  taggedQuestions,
  MembershipNo,
  QuestionPNo,
  SubjectCode,
  ExamDate,
  Calculator,
  RoughtSheet,
  Questions,
  isSaveDisabled,
  sendHandleSwitchControl,
  from,
}) => {
  const handleQuestionSelect = (index) => {
    // If the "from" variable is "sample", directly select the question
    if (from === "sample") {
      onQuestionSelect(index);
      return;
    }
    // Determine the current question and its type
    const currentQuestions =
      filteredQuestions.length > 0 ? filteredQuestions : Questions;
    let currentQuestion;
    if (filteredQuestions.length > 0) {
      currentQuestion = filteredQuestions.find(
        (question) => question.display_order == currentQuestionIndex
      );
    } else {
      currentQuestion = currentQuestions[currentQuestionIndex];
    }
    const { question_type } = currentQuestion;
    // alert(question_type);
    // Check if the question type requires saving before navigation
    const requiresSave = ["DQ", "R", "N"].includes(question_type);

    if (requiresSave && !isSaveDisabled) {
      sendHandleSwitchControl(); // Trigger save control action
    } else {
      // Handle question selection
      // alert(`${question_type} ${currentQuestionIndex}`);
      // onQuestionSelect(filteredQuestions.length > 0 ? currentQuestionIndex : index);
      onQuestionSelect(index); // Adjust index if filtered questions exist
    }
  };

  const answerConvNum = answeredQuestions.map(Number);
  const anstagged = answerConvNum.filter((element) =>
    taggedQuestions.includes(element)
  ).length;

  return (
    <>
      <div className="row number-palette">
        {/* <div className="row"> */}
        <div className="col-md-12 headingSection">
          <div className="titleCalc">
            <span className="titlenumber">Number of Questions</span>
            <span className="calc-div">
              {Calculator == "Y" ? (
                <>
                  <SciCalculatorAndRoughSheet
                    MembershipNo={MembershipNo}
                    QuestionPNo={QuestionPNo}
                    SubjectCode={SubjectCode}
                    ExamDate={ExamDate}
                    RoughtSheet={RoughtSheet}
                  />
                </>
              ) : (
                <>
                  <CalculatorAndRoughSheet
                    MembershipNo={MembershipNo}
                    QuestionPNo={QuestionPNo}
                    SubjectCode={SubjectCode}
                    ExamDate={ExamDate}
                    RoughtSheet={RoughtSheet}
                  />
                </>
              )}
            </span>
          </div>
        </div>
        <div
          className="col-md-4 row numbersection"
          style={{ marginLeft: "0px" }}
        >
          {/* {Array.from({ length: totalQuestions }, (_, index) => ( */}
          {filteredQuestions && filteredQuestions.length > 0
            ? filteredQuestions.map((filteredQuestion, index) => (
                <button
                  key={index}
                  className={`number-button 
                        ${filteredQuestion.display_order === currentQuestionIndex ? "active" : ""} 
                        ${
                          answeredQuestions.includes(
                            filteredQuestion.display_order.toString()
                          ) &&
                          taggedQuestions.includes(
                            filteredQuestion.display_order
                          )
                            ? "taganswered"
                            : answeredQuestions.includes(
                                  filteredQuestion.display_order.toString()
                                )
                              ? "answered"
                              : taggedQuestions.includes(
                                    filteredQuestion.display_order
                                  )
                                ? "tagged"
                                : ""
                        }`}
                  onClick={() => {
                    handleQuestionSelect(filteredQuestion.display_order);
                  }}
                >
                  {filteredQuestion.display_order <= 9
                    ? `Q0${filteredQuestion.display_order}`
                    : `Q${filteredQuestion.display_order}`}
                </button>
              ))
            : Array.from({ length: totalQuestions }, (_, index) => (
                <button
                  key={index}
                  className={`number-button 
                ${index === currentQuestionIndex ? "active" : ""} 
                ${
                  answeredQuestions.includes((index + 1).toString()) &&
                  taggedQuestions.includes(index + 1)
                    ? "taganswered"
                    : answeredQuestions.includes((index + 1).toString())
                      ? "answered"
                      : taggedQuestions.includes(index + 1)
                        ? "tagged"
                        : ""
                }`}
                  onClick={() => {
                    handleQuestionSelect(index);
                  }}
                >
                  {index <= 8 ? `Q0${index + 1}` : `Q${index + 1}`}
                </button>
              ))}
        </div>
        {/*<div className = "row">*/}
        <div
          className="col-md-4 status-container"
          style={{}}
          // position: "absolute",// top: "170px",// left: "25px",// height: "10vh",
        >
          <div className="col-md-3 col-sm-3 status-item answeredDiv">
            <button className="number-button-ref answered">
              {answeredQuestions.length}
            </button>
            <span>Attempted</span>
          </div>
          <div className="col-md-3 col-sm-3 status-item taggedDiv">
            <button className="number-button-ref tagged">
              {taggedQuestions.length - anstagged}
            </button>
            <span>Tagged</span>
          </div>
          <div className="col-md-3 col-sm-3 status-item tagansweredDiv">
            <button className="number-button-ref taganswered">
              {anstagged}
            </button>
            <span style={{ fontSize: "0.575rem" }}>Tagged & Attempted</span>
          </div>
          <div className="col-md-3 col-sm-3 status-item unattemptDiv">
            <button className="number-button-ref unattempt">
              {totalQuestions - answeredQuestions.length}
            </button>
            <span>Unattempted</span>
          </div>
        </div>
        {/* </div> */}
        {/* </div> */}
        <input
          type="hidden"
          value={answeredQuestions.length}
          name="AttemptedQus"
          id="AttemptedQus"
        />
        <input
          type="hidden"
          value={taggedQuestions.length - anstagged}
          name="TaggedQus"
          id="TaggedQus"
        />
        <input
          type="hidden"
          value={anstagged}
          name="TaggedAttemptedQus"
          id="TaggedAttemptedQus"
        />
        <input
          type="hidden"
          value={totalQuestions - answeredQuestions.length}
          name="UnattemptedQus"
          id="UnattemptedQus"
        />
      </div>
    </>
  );
};

NumberPalette.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  answeredQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onQuestionSelect: PropTypes.func.isRequired,
  taggedQuestions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default NumberPalette;
