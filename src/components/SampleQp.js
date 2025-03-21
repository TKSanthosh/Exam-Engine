import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Exam.css";
import Timer from "./Timer";
import sifyLogo from "./assets/images/sify.png";
import studentDefault from "./assets/images/student.png";
import signDefault from "./assets/images/signature.png";
import themePng from "./assets/images/theme.png";

import RenderHtmlContent from "./RenderHtmlContent";
import NumberPalette from "./NumberPalette"; // Import the NumberPalette component
import PopUp from "./PopUp"; // Import the NumberPalette component
import ServerStatus from "./ServerStatus"; // Import the NumberPalette component
// import SubmitButton from './HoverButton'; // Import the NumberPalette component
import "./Button.css";
import { formatTime, fetchClientIp, getCurrentFormattedTime } from "./utils";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import axios from "axios";

let AutoSelect = null;
try {
  AutoSelect = require("./AutoSelect").default; // If file exists, import
} catch (e) {
  AutoSelect = null;
}

const ExamSubmitConfirmation = ({ open, onClose, onConfirm, timeLeft }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: "center", bgcolor: "#f5f5f5" }}>
        Confirmation
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", px: 3, bgcolor: "#f5f5f5" }}>
        <DialogContentText>
          You have <strong>{formatTime(timeLeft)}</strong> hrs to answer
          <strong>
            {" "}
            {document.getElementById("UnattemptedQus")?.value}{" "}
          </strong>{" "}
          un-answered question(s),
          <strong> {document.getElementById("TaggedQus")?.value} </strong>{" "}
          tagged question(s),
          <strong>
            {" "}
            {document.getElementById("TaggedAttemptedQus")?.value}{" "}
          </strong>{" "}
          tagged & attempted question(s).
          <br />
          <br />
          Still, do you want to proceed with your submission?
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "center", pb: 2, bgcolor: "#f5f5f5" }}
      >
        <Button
          onClick={onClose}
          sx={{
            px: 1,
            py: 1,
            backgroundColor: "#90c723",
            color: "white",
            "&:hover": { backgroundColor: "#88b20f" },
          }}
        >
          No
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            px: 1,
            py: 1,
            backgroundColor: "#90c723",
            color: "white",
            "&:hover": { backgroundColor: "#88b20f" },
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SampleQp = () => {
  const [candidateInfo, setCandidateInfo] = useState({});
  const [examStatus, setExamStatus] = useState(0);
  const [acScore, setAcScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [fontSize, setFontSize] = useState(14); // Initial font size in pixels
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [tagquestions, setTagQuestions] = useState([]);
  const [hostip, setHostIp] = useState(); // HostIP
  const [timer, setTimer] = useState(3500); // Default timer value
  const [timeLeft, setTimeLeft] = useState(3600); // Initial timer value in seconds
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIdofSample, setQuestionIdofSample] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/sampleqp") {
      const element = document.querySelector(".numbersection");
      if (element) {
        // element.classList.replace("numbersection", "numbersection_sample");
      }
    }
  }, [location]);

  // useEffect(()=>{

  //   if(AutoSelect!=null){

  //     // setTimeout(()=>{
  //     //   handleSubmit()
  //     // },10000)
  //   }
  // },[])
  useEffect(() => {
    const getIp = async () => {
      try {
        const ip = await fetchClientIp();
        setHostIp(ip);
        console.log("Your IP address is:", ip);
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
      }
    };

    getIp();
  }, []);

  const handleTimeUpdate = (updatedSeconds) => {
    setTimeLeft(updatedSeconds);
  };
  // dispatch(timeResetStore(timer));

  // Function to increase font size
  const increaseFontSize = () => {
    setFontSize((prevSize) => prevSize + 2); // Increase font size by 2px
  };

  // Function to decrease font size
  const decreaseFontSize = () => {
    setFontSize((prevSize) => Math.max(prevSize - 2, 10)); // Decrease font size by 2px, but not below 10px
  };

  useEffect(() => {
    // Retrieve data from sessionStorage
    const userAuthData = sessionStorage.getItem("candidateInfo");

    if (userAuthData) {
      try {
        const parsedData = JSON.parse(userAuthData);
        if (parsedData && parsedData.user) {
          setCandidateInfo({
            user: parsedData.user,
            candidate_name: parsedData.candidate_name,
            address: parsedData.address,
            exam_venue: parsedData.exam_venue,
            exam_code: parsedData.exam_code,
            subject_code: parsedData.subject_code,
            subject_duration: parsedData.subject_duration,
            duration_prevent: "595",
            display_sectionname: parsedData.display_sectionname,
            display_score: parsedData.display_score,
            display_result: parsedData.display_result,
            exam_name: parsedData.exam_name,
            subject_name: parsedData.subject_name,
            exam_date: parsedData.exam_date,
            question_paper_no: parsedData.question_paper_no,
          });

          // console.log(parsedData)
          // console.log('parsed subject dur', parsedData.subject_duration);
          const durationInSeconds = parsedData.subject_duration; // Convert minutes to seconds
          setTimer("600");
        } else {
          console.error("Invalid user data structure in sessionStorage.");
        }
      } catch (error) {
        console.error("Error parsing user data from sessionStorage:", error);
      }
    }
  }, []);

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const watermarks = Array.from({ length: 390 }, (_, i) => (
    <div key={i} className="watermark-text">
      Sample Question
    </div>
  ));

  const handleStartExam = async (e) => {
    // e.preventDefault(); // Prevent the default anchor action
    const { data: centerData } = await axios.get(
      "http://localhost:5000/get-center-server-details"
    );
    if (!centerData.center_code) {
      console.error("Error fetching center/server details:", centerData.error);
      alert("Failed to fetch center and server details.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/insert-candidate-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Add your necessary data here
            membership_no: candidateInfo.user, // Example candidate ID
            exam_code: candidateInfo.exam_code,
            subject_code: candidateInfo.subject_code,
            question_paper_no: candidateInfo.question_paper_no,
            test_status: "IC",
            start_time: getCurrentFormattedTime(),
            total_time: candidateInfo.subject_duration,
            current_session: "Y",
            browser_status: "opened",
            host_ip: hostip,
            serverno: centerData.serverno,
            // Add other relevant fields
          }),
        }
      );

      if (response.ok) {
        console.log("Entry inserted successfully");
        navigate("/exam");
      } else {
        console.error("Failed to insert entry");
        alert("Failed to start the exam. Please try again.");
      }
    } catch (error) {
      console.error("Error inserting entry:", error);
      alert("Error starting the exam. Please try again.");
    }
  };

  useEffect(() => {
    const fetchSelQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/samplequestions`);
        const data = await response.json();
        // setQuestions(shuffleArray(data));
        setQuestions(data);
        // console.log(questions);
      } catch (error) {
        console.error("Error fetching candidate info:", error);
      }
    };

    if (candidateInfo.question_paper_no) {
      // Delay the API call by 20 seconds
      const timeoutId = setTimeout(() => {
        fetchSelQuestions();
      }, 1000); // 20000 milliseconds = 8 seconds

      // Cleanup the timeout if the component unmounts or candidateInfo.question_paper_no changes
      return () => clearTimeout(timeoutId);
    }
  }, [candidateInfo.question_paper_no]);

  // Function to shuffle an array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleOptionChange = (questionId, optionId) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));

    console.log("question-id", questionId, "   answer-", optionId);
  };

  const parseAnswerOrder = (answerOrder) => {
    // Convert the comma-separated string into an array of numbers
    return answerOrder.split(",").map(Number);
  };

  const reorderOptions = (options, answerOrder) => {
    const answerOrderArray = parseAnswerOrder(answerOrder);
    // Reorder the options based on the parsed answerOrder array
    return answerOrderArray.map((index) => options[index - 1]);
  };

  const renderOptions = (options, questionId, answer_order) => {
    // Reorder the options based on answerOrder
    const reorderedOptions = reorderOptions(options, answer_order);

    // Define the labels for options (assuming you have 4 options)
    const optionLabels = ["a)", "b)", "c)", "d)"].slice(
      0,
      reorderedOptions.length
    );

    return (
      <table className="options-table">
        <tbody>
          {reorderedOptions.map((option, index) => {
            // Calculate the actual value based on the position in the answerOrder
            const value = parseAnswerOrder(answer_order)[index];

            return (
              <tr key={option.id} className="option-row">
                <td className="option-input-cell">
                  <input
                    type="radio"
                    id={`option_${value}`} // Set ID based on the value from answerOrder
                    name={`question_${questionId}`}
                    value={value} // Radio button value based on the answerOrder
                    checked={
                      selectedOption === option || answers[questionId] === value
                    }
                    onChange={() => handleOptionChange(questionId, value)}
                    aria-label={`Option ${optionLabels[index]} for question ${questionId}`}
                  />
                </td>
                <td className="option-label-cell">
                  <label
                    style={{ margin: "-15px 10px", position: "absolute" }}
                    htmlFor={`option_${value}`}
                    className="option-label"
                  >
                    {optionLabels[index]}
                  </label>
                </td>
                <td className="option-text-cell">
                  <label
                    htmlFor={`option_${value}`}
                    className="option-text"
                    style={{
                      cursor: "pointer",
                      marginTop: "30px",
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    <RenderHtmlContent
                      className="optiontext"
                      htmlString={option.text}
                    />
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const handleAutoSelect = (autoSelectedOption) => {
    // Set the selected option for the current question
    setSelectedOption(autoSelectedOption);
    // Update the answers state for the current question
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIdofSample]: autoSelectedOption,
    }));
  };

  useEffect(() => {
    if (selectedOption) {
      const intervalId = setTimeout(() => {
        if (questionIdofSample <= 5) {
          // If not the last question, move to the next question
          setQuestionIdofSample((prev) => prev + 1);
        } else if (questionIdofSample === 6) {
          handleSubmit();
          setTimeout(() => {
            handleStartExam({ preventDefault: () => {} });
          }, 5000);
        }
        if (questionIdofSample < 5) {
          handleNextQuestion();
        }
      }, 5000); // Delay 5 seconds before action

      return () => clearTimeout(intervalId); // Cleanup timeout
    }
  }, [selectedOption, questionIdofSample]); // Dependencies include questionIdofSample

  const renderCurrentQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (questions.length === 0 || questions.length === undefined) {
      return <PopUp text={"SamplePage"} />;
    }

    if (currentQuestion) {
      const incrementingId = currentQuestionIndex + 1;

      return (
        <>
          {/* <div className="row" style={{position: "absolute", marginTop: "-30px", width: "200px"}}>
                
                    {candidateInfo.display_sectionname === 'Y' ? (
                        <span className='section-label'>Section: {currentQuestion.section_name}</span>
                    ) : (
                        <></>
                    )}
                  
                  <span className='mark-label'>
                    (Marks: {currentQuestion.mark}) | (Negative Marks: {currentQuestion.negative_mark})
                  </span>
                </div> */}
          <div className="label-container">
            {candidateInfo.display_sectionname === "Y" && (
              <span className="section-label">
                Section: {currentQuestion.section_name}
              </span>
            )}

            <span className="mark-label">
              (Marks: {currentQuestion.mark}) | (Negative Marks:{" "}
              {currentQuestion.negative_mark})
            </span>
          </div>
          <div key={incrementingId} className="question">
            <div className="row">
              <div className="containers">
                <div className="sidebar left">
                  <span className="qlabel">Q.{incrementingId})</span>
                </div>
                <div className="main">
                  <div className="watermark">{watermarks}</div>
                  <span className="qtext" style={{ fontSize: `${fontSize}px` }}>
                    <RenderHtmlContent
                      page="sampleQP"
                      htmlString={currentQuestion.text}
                    />
                  </span>
                  {AutoSelect && (
                    <AutoSelect
                      currentQuestion={currentQuestion}
                      onAutoSelect={handleAutoSelect}
                    />
                  )}
                  {/* Render options here */}
                  {renderOptions(
                    currentQuestion.options,
                    incrementingId,
                    currentQuestion.answer_order
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  const handleNextQuestion = async () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    console.log("Submitted Answers:", answers);
  };

  const handleBackQuestion = async () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    console.log("Submitted Answers:", answers);
  };

  // const handleTagQuestion = () => {
  //     const currentQP = currentQuestionIndex + 1;
  //     setTagQuestions((prevTagQuestions) => {
  //         if (!prevTagQuestions.includes(currentQP)) {
  //             return [...prevTagQuestions, currentQP];
  //         }
  //         return prevTagQuestions;
  //     });

  // };

  const handleTagQuestion = () => {
    const currentQP = currentQuestionIndex + 1;
    setTagQuestions((prevTagQuestions) => {
      if (prevTagQuestions.includes(currentQP)) {
        // De-tag: Remove the question from the tagged list
        return prevTagQuestions.filter((qp) => qp !== currentQP);
      } else {
        // Tag: Add the question to the tagged list
        return [...prevTagQuestions, currentQP];
      }
    });
  };

  const handleEraseAnswer = () => {
    const currentQP = currentQuestionIndex + 1;

    setAnswers((prevData) => {
      const { [currentQP]: _, ...newData } = prevData; // Destructure and remove the key
      return newData;
    });

    // alert (currentQP+" Response Cleared from "+answers[1]+" !");
    // alert (currentQP+"Response Cleared!");
    // console.log(currentQP,'--remvoed--',answers);
  };
  const handleSubmit = () => {
    setOpenDialog(true); // Show confirmation popup
  };

  const handleConfirm = () => {
    setOpenDialog(false);
    // Handle form submission with answers
    console.log("Exam done!");

    // Calculate the total score
    const totalScore = questions.reduce((score, question) => {
      return score + (question.mark || 0); // Ensure mark is a number
    }, 0);

    // Calculate the actual score
    const acScore = questions.reduce((score, question) => {
      const userAnswer = answers[question.id];
      console.log("User Answer:", userAnswer);

      if (userAnswer === undefined) {
        // If no answer is provided, do nothing
        return score;
      } else if (userAnswer === question.correct_ans) {
        // Correct answer
        return score + (question.mark || 0); // Ensure mark is a number
      } else {
        // Incorrect answer
        return score - (question.negative_mark || 0); // Ensure negative_mark is a number
      }
    }, 0);

    console.log("Total Score:", totalScore);
    console.log("Actual Score:", acScore);

    // Update state
    setAcScore(acScore);
    setTotalScore(totalScore);

    // Notify user
    // alert('Sample Exam Completed!');
    setExamStatus(1);
  };

  useEffect(() => {
    if (AutoSelect != null) {
      setTimeout(() => {}, 5000);
    }
  }, [examStatus]);
  const colors = ["yellowgreen", "#f3a063", "#63aff3"];
  const colors0 = ["#666d72", "#dd6d1b", "#3d7db7"];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentColorIndex0, setCurrentColorIndex0] = useState(0);

  const handleColorChange = () => {
    setCurrentColorIndex((currentColorIndex + 1) % colors.length);
    setCurrentColorIndex0((currentColorIndex0 + 1) % colors0.length);
  };

  return (
    <>
      <ServerStatus pageValue={"client"} />

      <div
        className="row header"
        style={{ "--dynamic-color0": colors0[currentColorIndex0] }}
      >
        <img src={sifyLogo} style={{ width: "10vw", height: "100%" }} />
      </div>

      <div className="row">
        {examStatus === 0 ? (
          <>
            <div
              className="timer-header"
              style={{ "--dynamic-color": colors[currentColorIndex] }}
            >
              <div className="colorSubject" style={{ float: "left" }}>
                <img
                  src={themePng}
                  className="themescss"
                  onClick={handleColorChange}
                  alt="Change Theme"
                />
                <span className="subject-label">
                  {candidateInfo.subject_name}
                </span>
              </div>
              {examStatus === 0 && (
                <div style={{ float: "right" }}>
                  {/* <p>{timeLeft}</p> */}
                  <Timer
                    onTimerComplete={handleSubmit}
                    timers={timer}
                    dynamicColor={colors0[currentColorIndex0]}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </div>
              )}
            </div>
            <div
              className="col-md-9 examform"
              style={{ "--dynamic-color0": colors0[currentColorIndex0] }}
            >
              <div className="controls">
                <button className="fontbtn" onClick={decreaseFontSize}>
                  A-
                </button>
                <button className="fontbtn" onClick={increaseFontSize}>
                  A+
                </button>
              </div>
              {renderCurrentQuestion()}
            </div>
            <div className="col-md-3 candinfo">
              {/* style={{ '--dynamic-color': colors[currentColorIndex] }} */}
              <div
                className=" candidate-segment"
                style={{ "--dynamic-color": colors[currentColorIndex] }}
              >
                <div className="row ">
                  <div className="col-md-5 col-sm-5">
                    <img
                      src={studentDefault}
                      alt="Student"
                      className="candimg"
                    />
                    <img
                      src={signDefault}
                      alt="Signature"
                      className="candimg candsign"
                    />
                  </div>
                  <div className="col-md-7 col-sm-7 candDetails">
                    <p className="context-label">
                      Membership Number
                      <br />
                      <span className="context">{candidateInfo.user}</span>
                    </p>
                    <p className="context-label">
                      Candidate Name
                      <br />
                      <span className="context">
                        {candidateInfo.candidate_name}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <NumberPalette
                totalQuestions={questions.length}
                currentQuestionIndex={currentQuestionIndex}
                answeredQuestions={Object.keys(answers)}
                onQuestionSelect={handleQuestionSelect}
                taggedQuestions={tagquestions}
                from={"sample"}
              />
            </div>
            <div className="row">
              <div className="footertab">
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <div className="col-md-4 col-sm-4">
                    <button
                      className={`previous-button-div  ${
                        currentQuestionIndex == 0
                          ? "disabled-btn"
                          : "arrow btn-prev"
                      }`}
                      onClick={handleBackQuestion}
                      disabled={currentQuestionIndex == 0}
                    >
                      <span>Previous Question</span>
                    </button>

                    <button
                      className={`next-button-div ${
                        currentQuestionIndex > questions.length - 2
                          ? "disabled-btn"
                          : "arrow btn-nxt"
                      }`}
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex > questions.length - 2}
                    >
                      <span>Next Question</span>
                    </button>
                  </div>
                  <div
                    className="col-md-4 col-sm-4"
                    style={{ display: "flex", flexWrap: "nowrap" }}
                    tagEraseBtn
                  >
                    <button
                      className="arrow tag-button"
                      onClick={handleTagQuestion}
                    >
                      <span>
                        {tagquestions.includes(currentQuestionIndex + 1)
                          ? "De-tag Question"
                          : "Tag Question"}
                      </span>
                    </button>

                    <button
                      className="arrow erase-button"
                      onClick={handleEraseAnswer}
                    >
                      <span>Erase Button</span>
                    </button>
                  </div>
                  <div className="col-md-4 col-sm-4">
                    {/* <p>Time Left in Parent: {candidateInfo.duration_prevent} seconds</p> */}
                    <button
                      className={`arrow  ${
                        timeLeft >= candidateInfo.duration_prevent
                          ? "btn-submit-disabled"
                          : "btn-submit"
                      }`}
                      disabled={timeLeft >= candidateInfo.duration_prevent}
                      onClick={handleSubmit}
                    >
                      <span>Preview Submit</span>
                    </button>
                    {/* <button className='arrow btn-submit' >Preview Submit</button> */}
                  </div>
                </div>
              </div>
              {/* <HoverButton/> */}
            </div>
          </>
        ) : (
          <>
            <center>
              <div
                className="infoform"
                style={{ "--dynamic-color0": colors0[currentColorIndex0] ,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div className="info-title">
                  Candidate Exam Sample Result
                </div>
                <div className="row">
                  <div className="col-md">
                    <table className="infodetails" >
                      <tbody>
                        <tr>
                          <th>Membership No</th>
                          <td>:</td>
                          <td>{candidateInfo.user}</td>
                        </tr>
                        <tr>
                          <th>Name</th>
                          <td>:</td>
                          <td>{candidateInfo.candidate_name}</td>
                        </tr>
                        <tr>
                          <th>Address</th>
                          <td>:</td>
                          <td>{candidateInfo.address}</td>
                        </tr>
                        <tr>
                          <th>Sample Examination</th>
                          <td>:</td>
                          <td>{candidateInfo.exam_name}</td>
                        </tr>
                        <tr>
                          <th>Subject Name</th>
                          <td>:</td>
                          <td>
                            {candidateInfo.subject_name}(
                            {candidateInfo.subject_code})
                          </td>
                        </tr>
                        <tr>
                          <th>Examination Center</th>
                          <td>:</td>
                          <td>{candidateInfo.exam_venue}</td>
                        </tr>
                        <tr>
                          <th>Examination Date</th>
                          <td>:</td>
                          <td>{candidateInfo.exam_date}</td>
                        </tr>
                        <tr>
                          <th>Examination Time</th>
                          <td>:</td>
                          <td>
                            {formatTime(candidateInfo.subject_duration)} hrs
                          </td>
                        </tr>
                        <tr>
                          <th>Sample Score</th>
                          <td>:</td>
                          <td>
                            {acScore} out of {totalScore}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p style={{ fontSize: "13px" }}>
                  <b>Thank you for taking the online examination!</b>
                </p>
                <br />
                <div className="row">
                  <div className="col-md-6" style={{ fontSize: "13px" }}>
                    <label>
                      Total Number of questions attempted{" "}
                      <span
                        className="badge"
                        style={{ backgroundColor: "black", color: "white" }}
                      >
                        {Object.keys(answers).length}
                      </span>
                    </label>
                  </div>
                  <div
                    className="col-md-6"
                    style={{
                      textAlign: "right",
                      paddingRight: "100px",
                      fontSize: "13px",
                    }}
                  >
                    <label>
                      Un-attempted{" "}
                      <span
                        className="badge"
                        style={{ backgroundColor: "white", color: "red" }}
                      >
                        {questions.length - Object.keys(answers).length}
                      </span>
                    </label>
                  </div>
                </div>
                <br />
                <a className="next-button" onClick={handleStartExam}>
                  Get ready to Start the Exam{" "}
                </a>
              </div>
            </center>
          </>
        )}
      </div>

      {/* <Link to='/'>
                        <img className='logout' src={shutDown} style={{ width: "40px" }} alt="Logout" />
                    </Link> */}

      <ExamSubmitConfirmation
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        timeLeft={timeLeft} // Pass the actual timeLeft variable here
      />
    </>
  );
};

export default SampleQp;
