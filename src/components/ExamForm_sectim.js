import React, { useState, useEffect } from "react";
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import "./Exam.css";
import Timer from "./Timer";
import sifyLogo from "./assets/images/sify.png";
import studentDefault from "./assets/images/student.png";
import signDefault from "./assets/images/signature.png";
import themePng from "./assets/images/theme.png";
import axios from "axios";
import RenderHtmlContent from "./RenderHtmlContent";
import NumberPalette from "./NumberPalette"; // Import the NumberPalette component
import PopUp from "./PopUp"; // Import the NumberPalette component
import ServerStatus from "./ServerStatus"; // Import the NumberPalette component
import "./Button.css";
import { formatTime, getCurrentFormattedTime, fetchClientIp } from "./utils";
import exit from "./assets/images/exit.png";
import RenderOptions from "./RenderOptions";
import { Button, TextField } from "@mui/material";
import RenderAlertForNotSaving from "./RenderAlertForNotSaving";
import RangeQues from "./RangeQues";
import { current } from "@reduxjs/toolkit";
import { sec } from "mathjs";

let AutoSelect = null;
try {
  AutoSelect = require("./AutoSelect").default; // If file exists, import
} catch (e) {
  // If AutoSelect file is missing, set it to null without any error
  AutoSelect = null;
}


const ExamForm = () => {
  const [candidateInfo, setCandidateInfo] = useState({});
  const [examSettings, setExamSettings] = useState({});
  const [examStatus, setExamStatus] = useState(0);
  const [acScore, setAcScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [fontSize, setFontSize] = useState(14); // Initial font size in pixels
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [tagquestions, setTagQuestions] = useState([]);
  const [enabletag, setEnableTag] = useState(0);
  const [timer, setTimer] = useState(3500); // Default timer value
  const [timeLeft, setTimeLeft] = useState(3600); // Initial timer value in seconds
  const [filteredValues, setFilteredValues] = useState([]);
  const [imageExists, setImageExists] = useState(false);
  const [imagePUrl, setPImageUrl] = useState("");
  const [imageSUrl, setSImageUrl] = useState("");
  const [hostIp, setHostIp] = useState("");
  const [attendedQusCount, setattendedQusCount] = useState(0);
  const [Questioncount, setQuestioncount] = useState(0);
  const [displayResponse, setdisplayResponse] = useState([]);
  const [CandidateResponse, setCandidateResponse] = useState([]);
  const [dqAnswer, setDqAnswer] = useState("");
  const [currentDqAnswer, setCurrentDqAnswer] = useState("");
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [renderNotSavingAlert, setRenderNotSavingAlert] = useState(false);
  const [switchingQuestions, setSwitchingQuestions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Store questions based on selected section
  const [questionIdofSample, setQuestionIdofSample] = useState(1);
  const [totalSections,setTotalSections] = useState(0);
  const [sectionDurations,setSectionDuration] = useState();
  const [shouldRender, setShouldRender] = useState(true);

  const candidateInfos = sessionStorage.getItem("candidateInfo");  
  const parsedData = JSON.parse(candidateInfos);    
  const { display_sec_nav,display_sec_timer } = parsedData;

  const ShowCandidateResponse = async () => {
    // alert(candidateInfo.user);
    try {
      const res = await axios.get(
        `http://localhost:5000/candidate-score-responses/${candidateInfo.user}`
      );
      console.log(res.data);
      setattendedQusCount(res.data.attendedQusCount);
      setQuestioncount(res.data.Questioncount);
      setCandidateResponse(res.data.CandidateResponse);
      setdisplayResponse(res.data.displayResponse);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    ShowCandidateResponse();
  }, [candidateInfo.user]);

  useEffect(() => {
    const getIp = async () => {
      try {
        const ip = await fetchClientIp();
        setHostIp(ip);
        //   console.log('Your IP address is:', ip);
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
      }
    };

    getIp();
  }, []);

  


  // Function to increase font size
  const increaseFontSize = () => {
    setFontSize((prevSize) => prevSize + 2); // Increase font size by 2px
  };

  // Function to decrease font size
  const decreaseFontSize = () => {
    setFontSize((prevSize) => Math.max(prevSize - 2, 10)); // Decrease font size by 2px, but not below 10px
  };

  const handleSwitchControl = () => {
    setSwitchingQuestions(true);
    setRenderNotSavingAlert(true);
  };
  useEffect(() => {
    // Retrieve data from sessionStorage
    const userAuthData = sessionStorage.getItem("candidateInfo");
    // console.log(userAuthData)
    // alert(userAuthData);
    if (userAuthData) {
      try {
        const parsedData = JSON.parse(userAuthData);
        // console.log(parsedData)
        if (parsedData && parsedData.user) {
          setCandidateInfo({
            user: parsedData.user,
            candidate_name: parsedData.candidate_name,
            address: parsedData.address,
            exam_venue: parsedData.exam_venue,
            exam_code: parsedData.exam_code,
            subject_code: parsedData.subject_code,
            subject_duration: parsedData.subject_duration,
            duration_prevent: parsedData.duration_prevent,
            display_sectionname: parsedData.display_sectionname,
            display_score: parsedData.display_score,
            display_result: parsedData.display_result,
            exam_name: parsedData.exam_name,
            subject_name: parsedData.subject_name,
            exam_date: parsedData.exam_date,
            question_paper_no: parsedData.question_paper_no,
            encryptKey: parsedData.encryptKey,
            pass_mark: parsedData.pass_mark,
            section_duration : parsedData.section_duration,
          });
          // console.log("inside examfor,")
          // console.log(candidateInfo);
          // console.log('parsed subject dur', parsedData.subject_duration);
          let durationInSeconds;
          if(display_sec_timer === "Y"){
            setTotalSections((parsedData.section_duration).length);
            setSectionDuration(parsedData.section_duration);
            console.log("section duration",parsedData.section_duration);
            durationInSeconds = parsedData.section_duration[0]; // Convert minutes to seconds
            // console.log(totalSections+"totalSections");
            
          }else{
          durationInSeconds = parsedData.subject_duration; // Convert minutes to seconds
        }
          // setTimer(durationInSeconds);
          // Fetch clienttime from iib_response table
          fetch(
            `http://localhost:5000/api/get-clienttime/${parsedData.question_paper_no}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data && data.clienttime) {
                setTimer(data.clienttime);
              } else {
                setTimer(durationInSeconds);
              }
              console.log("Fetched clienttime data:", data.clienttime);
            })
            .catch((error) => {
              console.error("Error fetching clienttime:", error);
              setTimer(durationInSeconds); // Fallback in case of error
            });
        } else {
          console.error("Invalid user data structure in sessionStorage.");
        }
      } catch (error) {
        console.error("Error parsing user data from sessionStorage:", error);
      }
    }
    // ///////////////////////////////////////////////////////

    const examSettingsData = sessionStorage.getItem("examSettings");
    if (examSettingsData) {
      // Parse the JSON string to an object
      const parsedSettingsData = JSON.parse(examSettingsData);
      setExamSettings({
        // Access the `secure_browser` value
        secureBrowserValue: parsedSettingsData.secure_browser,
        calcEnable: parsedSettingsData.calc_enable,
        roughtSheetEnable: parsedSettingsData.rough_sheet_ckeditor,
      });
      // Log the value
      // console.log('secure_browser:', secureBrowserValue);
    } else {
      console.log("No exam settings found in sessionStorage.");
    }
  }, []);

  const handleNextSecOrSubmit = (action) => {
    if (action == 'next') {
      alert(timer)
      setCurrentSection((prevSection) => {
        setTimer(sectionDurations[prevSection]); // Update the timer for the new section
        const nextSection = prevSection + 1; // Increment the section
        return nextSection; // Return the updated section
      });
    } else if (action == 'submit') {
      console.log('All sections completed. Submitting...');
      handleSubmit(); // Trigger the final submit logic
    }
  };
  

  const handleTimeUpdate = (updatedSeconds) => {
    setTimeLeft(updatedSeconds);
  };

  useEffect(() => {
    const checkImage = async () => {
      console.log("useeeeeee", candidateInfo.user);
      try {
        const response = await axios.get(
          `http://localhost:5000/fetch-photo/${candidateInfo.user}`,
          {
            responseType: "blob", // important to get the image as a blob
          }
        );
        setImageExists(true);
        const imageURL = URL.createObjectURL(response.data);
        setPImageUrl(imageURL);
      } catch (error) {
        setImageExists(false);
        console.error("Image not found", error);
      }
    };

    const checkSImage = async () => {
      console.log("useeeeeee", candidateInfo.user);
      try {
        const response = await axios.get(
          `http://localhost:5000/fetch-sign/${candidateInfo.user}`,
          {
            responseType: "blob", // important to get the image as a blob
          }
        );
        setImageExists(true);
        const imageURL = URL.createObjectURL(response.data);
        setSImageUrl(imageURL);
      } catch (error) {
        setImageExists(false);
        console.error("Image not found", error);
      }
    };

    checkImage();
    checkSImage();
  }, [candidateInfo.user]);

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  useEffect(() => {
    const fetchSelQuestions = async () => {
      try {
        // console.log(candidateInfo.question_paper_no)
        const medium = sessionStorage.getItem("candidate-medium") || "EN";
        const response = await fetch(
          `http://localhost:5000/questions/${candidateInfo.question_paper_no}/${candidateInfo.encryptKey}/${medium}`
        );
        const data = await response.json();
        setQuestions(data);
        console.log("question set", data);
      } catch (error) {
        console.error("Error fetching candidate info:", error);
      }
    };

    // Check if questions are already set, if not, proceed with fetching
    if (questions.length === 0) {
      // Initially fetch questions after 1 second
      const timeoutId = setTimeout(() => {
        fetchSelQuestions();
      }, 1000); // 1000 milliseconds = 1 second

      // Then, set up an interval to fetch questions every 5 seconds
      const intervalId = setInterval(fetchSelQuestions, 5000); // 5000 milliseconds = 5 seconds

      // Cleanup the timeout and interval if the component unmounts or when the effect is re-executed
      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, [candidateInfo.question_paper_no, questions.length]);

  useEffect(() => {
    // Define an async function to fetch data
    const fetchInitialData = async () => {
      try {
        // Make an API call to fetch the data
        const response = await fetch(
          `http://localhost:5000/initialAnswers/${candidateInfo.question_paper_no}`
        );
        const data = await response.json();
        // Separate answers and tags
        const answers = {};
        const tagQuestions = [];

        Object.keys(data).forEach((questionId) => {
          // answers[questionId] = Number(data[questionId].answer);
          const answerValue = data[questionId].answer;
          console.log("ansVal", answerValue, typeof answerValue);

          if (answerValue !== 0 && answerValue != "NULL") {
            answers[questionId] = answerValue;
          }
          if (data[questionId].tag == "Y") {
            tagQuestions.push(Number(questionId));
          }
        });

        setAnswers(answers);
        setTagQuestions(tagQuestions);

        console.log("Initial Answers:", answers);
        console.log("Tags:", tagQuestions);
      } catch (error) {
        console.error("Error fetching initial answers:", error);
      }
    };

    // Call the function to fetch the data
    fetchInitialData();
  }, [candidateInfo.question_paper_no]); // Dependency array includes question_paper_no

  const insertResponse = async (lastEntry) => {
    // console.log(typeof(lastEntry));
    // console.log('resposne array',lastEntry);
    // Check if the question ID is in the array
    const isQuestionIdInArray = tagquestions.includes(Number(lastEntry[0]));

    // Define the const variable based on the check
    const tags = isQuestionIdInArray ? "Y" : "N";
    // console.log('tags',tags);
    // console.log('question-id',lastEntry[0],' - isQuestionIdInArray',tagquestions);
    try {
      const response = await fetch("http://localhost:5000/response/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: lastEntry[2], // key
          answer: lastEntry[1],
          qpno: candidateInfo.question_paper_no,
          displayorder: lastEntry[0],
          tag: tags,
          hostip: hostIp,
          updatedtime: getCurrentFormattedTime(),
          clienttime: timeLeft,
          totalTime: candidateInfo.subject_duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.error("Error inserting response:", error);
    }
  };

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
    console.log(answers);
    // setCurrentDqAnswer(optionId)
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

  //   console.log('option ans',answers);
  const renderOptions = (options, questionId, answer_order) => {
    // Reorder the options based on answerOrder
    const reorderedOptions = reorderOptions(options, answer_order) || []; // Fallback to empty array if undefined

    // Define the labels for options (assuming you have 4 options)
    const optionLabels = ["a)", "b)", "c)", "d)", "e)"].slice(
      0,
      reorderedOptions.length
    );

    return (
      <table className="options-table">
        <tbody>
          {reorderedOptions.map((option, index) => {
            if (!option || !option.text) {
              // console.warn(
              //   `Option or text is missing at index ${index}`,
              //   option
              // );
              return null; // Skip rendering if option is undefined or missing text
            }
            if (option.text !== "NULL") {
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
                      checked={answers[questionId] === value}
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
                        marginTop: "25px",
                        fontSize: `${fontSize}px`,
                      }}
                    >
                      <RenderOptions
                        className="optiontext"
                        htmlString={option.text}
                      />
                    </label>
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    );
  };
// useState for currentSection and filtered questions

useEffect(() => {
  if (currentSection && (display_sec_nav === 'Y' || display_sec_timer === "Y")) {
    // Filter questions by section code
    const sectionQuestions = questions.filter(
      (question) => question.section_code == currentSection
    );
    console.log(sectionQuestions + " sectionQuestions, currentSection: " + currentSection);
    if (sectionQuestions[0]) {
        const { display_order } = sectionQuestions[0]; // Destructure directly from the object 
        console.log("Display Order:", display_order);
        setCurrentQuestionIndex((display_order)); 
    }
    console.log(currentQuestionIndex);
    setFilteredQuestions(sectionQuestions);
// Reset current question index
  }
}, [currentSection,questions]); 
// }, [currentSection,questions]); // Re-run when currentSection or questions change

const renderCurrentQuestion = () => {
  let currentQuestion = null;
  // Check if there are filtered questions for the current section
  if(filteredQuestions.length > 0){
    if (filteredQuestions.length === 0 || filteredQuestions.length === undefined) {
      return <PopUp text={"QPPage"} />;
    }
     currentQuestion = filteredQuestions.find(
      (question) => question.display_order === currentQuestionIndex
    ); 
   }else{
    if (questions.length === 0 || questions.length === undefined) {
      return <PopUp text={"QPPage"} />;
    }
    currentQuestion = questions[currentQuestionIndex];
  }

  if (currentQuestion) {
    const incrementingId = currentQuestionIndex + 1;

    return (
      <>
        <div
          className="row"
          style={{ position: "absolute", marginTop: "-30px", width: "200px" }}
        >
          {candidateInfo.display_sectionname === "Y" ? (
            <span className="section-label">
              Section: {currentQuestion.section_name}
            </span>
          ) : (
            <></>
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
                <span className="qlabel">Q.{currentQuestion.display_order})</span>
              </div>
              <div className="main">
                <div className="watermark">{watermarks}</div>
                <span className="qtext" style={{ fontSize: `${fontSize}px` }}>
                  <RenderHtmlContent
                    htmlString={currentQuestion.text}
                    caseId={currentQuestion.case_id}
                    caseText={currentQuestion.case_text}
                    questionType={currentQuestion.question_type}
                    // incrementingId={incrementingId}
                    incrementingId={currentQuestion.display_order}
                  />
                </span>
                {/* Handle different question types */}
                {currentQuestion.question_type === "R" ||
                currentQuestion.question_type === "N" ? (
                  <>
                    <RangeQues
                      // incrementingId={incrementingId}
                      incrementingId={currentQuestion.display_order}
                      currentQuestion={currentQuestion}
                      answers={answers}
                      handleOptionChange={handleOptionChange}
                      setIsSaveDisabled={setIsSaveDisabled}
                      isSaveDisabled={isSaveDisabled}
                      handleSaveQuestion={handleSaveQuestion}
                      // handleSaveAnswer={handleSaveAnswer}
                    />
                    {(renderNotSavingAlert && !isSaveDisabled) ||
                    (renderNotSavingAlert &&
                      switchingQuestions &&
                      !isSaveDisabled) ? (
                      <RenderAlertForNotSaving
                        sendDataToExamForm={handleDataFromRenderAlert}
                      />
                    ) : null}
                  </>
                ) : null}

                {currentQuestion.question_type === "DQ" ? (
                  // <div key={incrementingId}>
                  <div key = {currentQuestion.display_order}>
                    <TextField
                      label="Answer"
                      className="mt-3 mx-2"
                      placeholder="Enter your answer here"
                      multiline
                      rows={4}
                      // value={answers[incrementingId] || ""}
                      // id={`question_${incrementingId}`}
                      // name={`question_${incrementingId}`}
                        value={answers[currentQuestion.display_order] || ""}
                      id={`question_${currentQuestion.display_order}`}
                      name={`question_${currentQuestion.display_order}`}
                      onChange={(e) => {
                        // handleOptionChange(incrementingId, e.target.value);
                        handleOptionChange(currentQuestion.display_order, e.target.value);
                        setDqAnswer(e.target.value);
                        setIsSaveDisabled(false);
                      }}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        style: {
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                        },
                      }}
                    />
                    <br />
                    <input
                      type="button"
                      className="mx-2 btn btn-success"
                      id="saveButton"
                      onClick={(e) => {
                        e.preventDefault();
                        // handleOptionChange(incrementingId, dqAnswer);
                        handleOptionChange(currentQuestion.display_order, dqAnswer);
                        setDqAnswer("");
                        setIsSaveDisabled(true);
                      }}
                      style={{ marginTop: "16px" }}
                      value="Save Answer"
                      disabled={isSaveDisabled}
                    />
                    {(renderNotSavingAlert && !isSaveDisabled) ||
                    (renderNotSavingAlert &&
                      switchingQuestions &&
                      !isSaveDisabled) ? (
                      <RenderAlertForNotSaving
                        sendDataToExamForm={handleDataFromRenderAlert}
                      />
                    ) : null}
                  </div>
                ) : (
                  <>
                    {AutoSelect && (
                      <AutoSelect
                        currentQuestion={currentQuestion}
                        onAutoSelect={handleAutoSelect}
                      />
                    )}
                    {renderOptions(
                      currentQuestion.options,
                      // incrementingId,
                      currentQuestion.display_order,
                      currentQuestion.answer_order
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};
  const handleDataFromRenderAlert = () => {
    setRenderNotSavingAlert(false);
  };
  const handleSaveQuestion = async (rangeNumericAnswer) => {
   
    const currentQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
    let currentQuestion ;
    if(filteredQuestions.length > 0){
      currentQuestion = filteredQuestions.find(
        (question) => question.display_order == currentQuestionIndex
      ); 
    }else{
      currentQuestion = currentQuestions[currentQuestionIndex];
    }

    const entries = Object.entries(answers);
    const currentqp = (filteredQuestions && filteredQuestions.length > 0) ?  currentQuestionIndex :  currentQuestionIndex + 1
   
    console.log("Answer saved:", answers);
    try {
      if (entries.length > 0) {
      if (answers.hasOwnProperty(currentqp)) {
        // Save the answer if it exists
        // alert("helo");
        await insertResponse({
          0: currentqp,
          1: rangeNumericAnswer,
          // 2: questions[currentQuestionIndex].id,
          2: currentQuestion.id,
        });
        console.log("Answer saved:", rangeNumericAnswer);
      } else {
        // Save NULL if no answer exists
        await insertResponse({
          0: currentqp,
          1: "NULL",
          // 2: questions[currentQuestionIndex].id,
          2: currentQuestion.id,
        });
        console.log("No answer provided. Saved as NULL.");
      }
    }else {
      console.error("No answers found to submit.");
      await insertResponse({
        0: currentqp,
        1: "NULL",
        2: questions[currentQuestionIndex].id,
      });

      // await insertResponse({ 0: currentqp, 1: " " });
    }

      // Reset save-disabled states and UI behavior
      setIsSaveDisabled(true);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };
  const handleNextQuestion = async () => {
    // console.log('select tag',tagquestions);
    // alert(questions[currentQuestionIndex].question_type)
    const currentQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
    let currentQuestion ;
    if(filteredQuestions.length > 0){
      currentQuestion = filteredQuestions.find(
        (question) => question.display_order === currentQuestionIndex
      ); 
    }else{
      currentQuestion = currentQuestions[currentQuestionIndex];
    }
    const { question_type } = currentQuestion;
    const requiresSave = ["DQ", "R", "N"].includes(question_type);

    if (requiresSave && !isSaveDisabled) {
      setRenderNotSavingAlert(true);
    }
    // if (//   (questions[currentQuestionIndex].question_type === "DQ" ||//     questions[currentQuestionIndex].question_type === "N" ||//     questions[currentQuestionIndex].question_type === "R") &&//   isSaveDisabled === false// ) {//// alert("Save answer before going to the next button")//   setRenderNotSavingAlert(true);// } 
    else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      const entries = Object.entries(answers);
      const currentqp = currentQuestionIndex;
      const tagqpindex = currentqp + 1;
      console.log("current", tagqpindex, "-tag", tagquestions);
      if (tagquestions.includes(tagqpindex)) {
        setEnableTag(1); // Set state to 1 if 13 is in the array
      } else {
        setEnableTag(0);
      }
      console.log("Submitted Answers id:", currentQuestion.id);
      console.log("Submitted Answers:", answers);

      if (entries.length > 0) {
        if (answers.hasOwnProperty(currentqp)) {
          // await insertResponse({ 0: questions[currentQuestionIndex].id, 1: answers[currentqp] });
          await insertResponse({
            0: currentqp,
            1: answers[currentqp],
            // 2: questions[currentQuestionIndex].id,
            2: currentQuestion.id,
          });
        } else {
          await insertResponse({
            0: currentqp,
            1: "NULL",
            // 2: questions[currentQuestionIndex].id,
            2: currentQuestion.id

          });
        }
      } else {
        console.error("No answers found to submit.");

        await insertResponse({
          0: currentqp,
          1: "NULL",
          // 2: questions[currentQuestionIndex].id,
          2: currentQuestion.id

        });
      }
    }
  };
  const handleBackQuestion = async () => {
    const currentQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
    let currentQuestion ;
    if(filteredQuestions.length > 0){
      currentQuestion = filteredQuestions.find(
        (question) => question.display_order === currentQuestionIndex
      ); 
    }else{
      currentQuestion = currentQuestions[currentQuestionIndex];
    }
    const { question_type } = currentQuestion;
    const requiresSave = ["DQ", "R", "N"].includes(question_type);

    if (requiresSave && !isSaveDisabled) {
      setRenderNotSavingAlert(true);
    }
    // if (
    //   (questions[currentQuestionIndex].question_type === "DQ" ||
    //     questions[currentQuestionIndex].question_type === "N" ||
    //     questions[currentQuestionIndex].question_type === "R") &&
    //   isSaveDisabled === false
    // ) {
    //   // alert("Save answer before going to the next button")
    //   setRenderNotSavingAlert(true);
    // }
     else {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);

      console.log("Submitted Answers:", answers);
      const entries = Object.entries(answers);
      const currentqp = currentQuestionIndex + 1;

      if (tagquestions.includes(currentQuestionIndex)) {
        setEnableTag(1); // Set state to 1 if 13 is in the array
      } else {
        setEnableTag(0);
      }

      // console.log('currentqp',currentqp);
      if (entries.length > 0) {
        if (answers.hasOwnProperty(currentqp)) {
          await insertResponse({
            0: currentqp,
            1: answers[currentqp],
            // 2: questions[currentQuestionIndex].id,
            2: currentQuestion.id
          });
        } else {
          await insertResponse({
            0: currentqp,
            1: "NULL",
            // 2: questions[currentQuestionIndex].id,
            2: currentQuestion.id,
          });
        }
      } else {
        console.error("No answers found to submit.");
        await insertResponse({
          0: currentqp,
          1: "NULL",
          // 2: questions[currentQuestionIndex].id,
          2: currentQuestion.id
        });

        // await insertResponse({ 0: currentqp, 1: " " });
      }
    }
  };
  const handleTagQuestion = () => {
    const currentQP = filteredQuestions.length > 0 ? currentQuestionIndex : currentQuestionIndex + 1;
    setEnableTag(1);
    setTagQuestions((prevTagQuestions) => {
      if (!prevTagQuestions.includes(currentQP)) {
        return [...prevTagQuestions, currentQP];
      }
      return prevTagQuestions;
    });
  };
  const handleDeTagQuestion = () => {
    const currentQP = filteredQuestions.length > 0 ? currentQuestionIndex : currentQuestionIndex + 1;
    setEnableTag(0);

    setTagQuestions((prevTagQuestions) => {
      // Check if the currentQP is already tagged
      if (prevTagQuestions.includes(currentQP)) {
        // Remove the currentQP from the array
        return prevTagQuestions.filter((question) => question !== currentQP);
      } else {
        // Add the currentQP to the array
        return [...prevTagQuestions, currentQP];
      }
    });
  };
  const handleEraseAnswer = () => {
    const currentQP = filteredQuestions.length > 0 ? currentQuestionIndex : currentQuestionIndex + 1;

    setAnswers((prevData) => {
      const { [currentQP]: _, ...newData } = prevData; // Destructure and remove the key
      return newData;
    });
  };
  const handleSubmit = async () => {
    console.log("Exam done!");
    handleNextQuestion();
    ShowCandidateResponse();
    // Calculate the total score
    const totalScore = questions.reduce((score, question) => {
      return score + (question.mark || 0);
    }, 0);
    console.log("totalScore", totalScore);
    // Calculate the actual score
    const acScore = questions.reduce((score, question) => {
      console.log(
        "Negative Marks:",
        Number(question.negative_marks) || 0,
        "Display Order:",
        question.display_order
      );

      const userAnswer =
        answers[question.display_order] !== undefined
          ? Number(answers[question.display_order])
          : 0;
      console.log(
        "User Answer:",
        userAnswer,
        "Display Order:",
        question.display_order,
        " Correct Answer:",
        question.correct_ans,
        " option_1",
        question.options[0]?.text
      );

      if (question.question_type === "O") {
        // For Objective Questions
        if (userAnswer === undefined) {
          return score; // Skip if userAnswer is undefined
        } else if (userAnswer === question.correct_ans) {
          return score + (question.mark || 0); // Add marks for correct answer
        } else {
          return score - (Number(question.negative_marks) || 0); // Subtract negative marks for wrong answer
        }
      } else if (question.question_type === "N") {
        // For Numerical Questions
        if (userAnswer === undefined) {
          return score; // Skip if userAnswer is undefined
        } else if (userAnswer === Number(question.options[0]?.text || 0)) {
          return score + (question.mark || 0); // Add marks for correct answer
        } else {
          return score - (Number(question.negative_marks) || 0); // Subtract negative marks for wrong answer
        }
      } else if (question.question_type === "R") {
        // For Range Questions
        if (userAnswer === undefined) {
          return score; // Skip if userAnswer is undefined
        } else if (
          userAnswer >= Number(question.options[0]?.text || 0) &&
          userAnswer <= Number(question.options[1]?.text || 0)
        ) {
          return score + (question.mark || 0); // Add marks if answer is within range
        } else {
          return score - (Number(question.negative_marks) || 0); // Subtract negative marks for out-of-range answer
        }
      }

      // Return the current score if no valid question type is matched
      return score;
    }, 0);

    // Update state
    setAcScore(acScore);

    setTotalScore(totalScore);

    // Notify user
    alert("Exam Completed!");
    setExamStatus(1);

    // Calculate time taken
    const time_taken = candidateInfo.subject_duration - timeLeft;
    let pass_result; // Declare the variable outside of the conditional blocks
    console.log("passmark", candidateInfo.pass_mark);
    console.log("acScore", acScore);
    if (candidateInfo.pass_mark <= acScore) {
      pass_result = "P"; // Assign value based on condition
    } else {
      pass_result = "F"; // Assign value based on condition
    }

    console.log("pass_result", pass_result);

    // Prepare data for the backend
    const requestData = {
      membershipNo: candidateInfo.user,
      exam_code: candidateInfo.exam_code,
      subject_code: candidateInfo.subject_code,
      score: acScore,
      exam_date: getCurrentFormattedTime("date"),
      time_taken: time_taken,
      result: pass_result, // This should be dynamically determined based on actual logic
      auto_submit: "N",
      updated_on: getCurrentFormattedTime(),
    };

    // Send data to the backend
    try {
      const response = await fetch("http://localhost:5000/update-exam-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Backend response:", result);
        // Handle success
      } else {
        console.error("Backend error:", response.statusText);
        // Handle error
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle fetch error
    }
  };
  const handleAutoSelect = (autoSelectedOption, currentQuestion) => {
    // Set the selected option for the current question
    setSelectedOption(autoSelectedOption);
    // console.log("",currentQuestionIndex);
    // Update the answers state for the current question
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex + 1]: autoSelectedOption,
    }));
  };

  useEffect(() => {
    if (selectedOption) {
      const intervalId = setTimeout(() => {
        if (currentQuestionIndex + 1 === questions.length) {
          handleSubmit();
        }
        if (currentQuestionIndex + 1 < questions.length) {
          handleNextQuestion();
        }
      }, 5000); // Delay 5 seconds before action

      return () => clearTimeout(intervalId); // Cleanup timeout
    }
  }, [selectedOption, currentQuestionIndex + 1]); // Dependencies include questionIdofSample

  const colors = ["yellowgreen", "#f3a063", "#63aff3"];
  const colors0 = ["#666d72", "#dd6d1b", "#3d7db7"];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentColorIndex0, setCurrentColorIndex0] = useState(0);

  const handleColorChange = () => {
    setCurrentColorIndex((currentColorIndex + 1) % colors.length);
    setCurrentColorIndex0((currentColorIndex0 + 1) % colors0.length);
  };

  // useEffect(() => {
  //     // Fetch data from the backend
  //     fetch("http://localhost:5000/responses")
  //       .then((res) => res.json())
  //       .then((data) => setData(data))
  //       .catch((err) => console.error("Error fetching data:", err));
  //   }, []);

  useEffect(() => {
    const fetchSelQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/questions/${candidateInfo.question_paper_no}/${candidateInfo.encryptKey}`
        );
        const data = await response.json();
        setQuestions(data);
        console.log("question set", data);
      } catch (error) {
        console.error("Error fetching candidate info:", error);
      }
    };

    // // Check if questions are already set, if not, proceed with fetching
    // if (questions.length === 0) {
    //     // Initially fetch questions after 1 second
    //     const timeoutId = setTimeout(() => {
    //         fetchSelQuestions();
    //     }, 1000); // 1000 milliseconds = 1 second

    //     // Then, set up an interval to fetch questions every 5 seconds
    //     const intervalId = setInterval(fetchSelQuestions, 5000); // 5000 milliseconds = 5 seconds

    //     // Cleanup the timeout and interval if the component unmounts or when the effect is re-executed
    //     return () => {
    //         clearTimeout(timeoutId);
    //         clearInterval(intervalId);
    //     };
    // }
  }, []);

  const watermarks = Array.from({ length: 390 }, (_, i) => (
    <div key={i} className="watermark-text">
      {candidateInfo.user}
    </div>
  ));

  return (
    <>
      <ServerStatus pageValue={"client"} />

      <div
        className="row header"
        style={{ "--dynamic-color0": colors0[currentColorIndex0] }}
      >
        <img src={sifyLogo} style={{ width: "140px", height: "60px" }} />
      </div>

      <div className="row">
        {examStatus === 0 ? (
          <>
            <div
              className="timer-header"
              style={{ "--dynamic-color": colors[currentColorIndex] }}
            >
              <span>
                
              </span>
              <img
                src={themePng}
                className="themescss"
                onClick={handleColorChange}
                alt="Change Theme"
              />
              <span className="subject-label">
                {candidateInfo.subject_name}    
              </span>

              {examStatus === 0 && (
                <>
                  {/* <p>{timeLeft}</p> */}
                  {/* <Timer
                    onTimerComplete={handleSubmit}
                    timers={timer}
                    dynamicColor={colors0[currentColorIndex0]}
                    onTimeUpdate={handleTimeUpdate}
                  /> */}
                 
                   <Timer
                    onTimerComplete={handleNextSecOrSubmit}
                    timers={timer}
                    dynamicColor={colors0[currentColorIndex0]}
                    onTimeUpdate={handleTimeUpdate}
                    totalSections={totalSections}
                    currentSection={currentSection}
                  />
                
                </>
              )}
            </div>
            
            <div
  className="col-md-9 examform"
  style={{ "--dynamic-color0": colors0[currentColorIndex0] }}
>
  <div className="controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    

    <button className="fontbtn" onClick={decreaseFontSize}>
      A-
    </button>
    <button className="fontbtn" onClick={increaseFontSize}>
      A+
    </button>
    {display_sec_nav === "Y"  ? (
  <FormControl size="small" sx={{ width: "auto", marginRight: "10px" }}>
    <Select
      labelId="section-select-label"
      value={currentSection}
      onChange={(event) => setCurrentSection(event.target.value)}
      label="Section"
      size="small"
      style={{ marginLeft:"10px",top:"-52.5px", background:"white"}}
      sx={{
        '& .MuiSelect-select': {
          padding: '6px 10px',
        },
        '& .MuiInputBase-root': {
          height: '36px',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent', // Remove the border when clicked/focused
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent', // Remove the outline on focus
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent', // Remove border color on hover
        },
        '&:focus .MuiSelect-select': {
          backgroundColor: 'transparent', // Prevent background color change on focus
        },
      }}
    >
      {[...new Map(questions.map((question) => [question.section_code, question.section_name]))]
        .map(([section_code, section_name], index) => (
          <MenuItem key={index} value={section_code}>
            {section_code} - {section_name}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
) : null}

  </div>
  {renderCurrentQuestion()}
</div>

            <div
              className="col-md-3 candinfo"
              style={{ "--dynamic-color": colors[currentColorIndex] }}
            >
              <div className="row candidate-segment">
                <div className="col-md-5">
                  {imageExists ? (
                    <>
                      <img src={imagePUrl} alt="Student" className="candimg" />
                      <img
                        src={imageSUrl}
                        alt="Signature"
                        className="candimg"
                      />
                    </>
                  ) : (
                    <>
                      <img
                        src={studentDefault}
                        alt="Student"
                        className="candimg"
                      />
                      <img
                        src={signDefault}
                        alt="Signature"
                        className="candimg"
                      />
                    </>
                  )}
                </div>
                <div className="col-md-7">
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
              <NumberPalette
                totalQuestions={questions.length}
                filteredQuestions={filteredQuestions}
                currentQuestionIndex={currentQuestionIndex}
                answeredQuestions={Object.keys(answers)}
                onQuestionSelect={handleQuestionSelect}
                taggedQuestions={tagquestions}
                MembershipNo={candidateInfo.user}
                QuestionPNo={candidateInfo.question_paper_no}
                SubjectCode={candidateInfo.subject_code}
                ExamDate={candidateInfo.exam_date}
                Calculator={examSettings.calcEnable}
                RoughtSheet={examSettings.roughtSheetEnable}
                Questions={questions}
                isSaveDisabled={isSaveDisabled}
                sendHandleSwitchControl={handleSwitchControl}
                from={"actual"}
              />
            </div>
            <div className="row">
              <div className="footertab">
                <div className="row">
                  <div className="col-md-4">
                    <button
                      className={`  ${
                        (filteredQuestions.length > 0 ? currentQuestionIndex == filteredQuestions[0].display_order : currentQuestionIndex == 0)
                        // currentQuestionIndex === 0
                          ? "disabled-btn"
                          : "arrow btn-prev"
                      }`}
                      onClick={handleBackQuestion}
                      disabled={
                        filteredQuestions.length > 0 ? currentQuestionIndex == filteredQuestions[0].display_order : currentQuestionIndex == 0
                        // currentQuestionIndex == 0
                      }
                    >
                      Previous Question
                    </button>

                    <button
                      id="nextQuestion"
                      className={`  ${
                        (filteredQuestions.length > 0 ? currentQuestionIndex > filteredQuestions[filteredQuestions.length - 2].display_order  : currentQuestionIndex > questions.length - 2) 
                          ? "disabled-btn"
                          : "arrow btn-nxt"
                      }`}
                      onClick={() => {
                        handleNextQuestion();
                      }}
                      disabled={filteredQuestions.length > 0 ? currentQuestionIndex > filteredQuestions[filteredQuestions.length - 2].display_order : currentQuestionIndex > questions.length - 2}
                    >
                      Next Question
                    </button>
                  </div>
                  <div className="col-md-4">
                    {enabletag === 0 ? (
                      <button
                        className="tag-button"
                        onClick={handleTagQuestion}
                      >
                        Tag Question
                      </button>
                    ) : (
                      <button
                        className="tag-button"
                        onClick={handleDeTagQuestion}
                      >
                        De-Tag Question
                      </button>
                    )}
                    <button
                      className="erase-button"
                      onClick={handleEraseAnswer}
                    >
                      Erase Answer
                    </button>
                  </div>
                  <div className="col-md-4">
                    {/* <p>Time Left in Parent: {candidateInfo.duration_prevent} seconds</p> */}
                    {/* <button 
                                        className={`arrow  ${timeLeft >= candidateInfo.duration_prevent ? 'btn-submit-disabled' : 'btn-submit'}`} 
                                        disabled={timeLeft >= candidateInfo.duration_prevent}
                                        onClick={handleSubmit}
                                        > */}
                    <button
                      className={`arrow btn-submit`}
                      onClick={handleSubmit}
                    >
                      Preview Submit
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
                style={{
                  "--dynamic-color0": colors0[currentColorIndex0],
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <label className="info-title">Candidate Exam Result</label>
                <div className="row">
                  <div className="col-md-10">
                    <table className="infodetails">
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
                          <th>Examination</th>
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
                          <th>Score</th>
                          <td>:</td>
                          <td>
                            {acScore} out of {totalScore}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {displayResponse == "N" && (
                  <>
                    <p className="mb-2" style={{ fontSize: "13px" }}>
                      <b>This is only a provisional score card</b>
                    </p>
                    <p className="mb-2" style={{ fontSize: "13px" }}>
                      Final result will be notified once your result is reviewed
                      by IIBF
                    </p>{" "}
                  </>
                )}

                <p className="mb-2" style={{ fontSize: "13px" }}>
                  <b>Thank you for taking the online examination!</b>
                </p>
                {displayResponse == "N" && (
                  <>
                    <div className="container mt-4">
                      <div className="row">
                        {attendedQusCount !== 0 && (
                          <>
                            <tr>
                              <td colSpan={6}>
                                <h5 className="text-center mb-3">
                                  <b>Response Report</b>
                                </h5>
                              </td>
                            </tr>

                            <tr>
                              <td colSpan={6}>
                                <table
                                  align="center"
                                  width="100%"
                                  cellPadding={2}
                                  cellSpacing={2}
                                  class="table table-bordered"
                                  style={{ backgroundColor: "#efecec" }}
                                >
                                  <thead>
                                    <tr>
                                      <th>Q.No</th>
                                      <th>Answer</th>
                                      <th>Correct Answers</th>
                                      <th>Q.No</th>
                                      <th>Answer</th>
                                      <th>Correct Answers</th>
                                      <th>Q.No</th>
                                      <th>Answer</th>
                                      <th>Correct Answers</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {CandidateResponse.map(
                                      (response, index) => {
                                        // Only create a new row for every third item
                                        if (index % 3 === 0) {
                                          return (
                                            <tr key={index}>
                                              {[0, 1, 2].map((offset) => {
                                                const currentIndex =
                                                  index + offset;
                                                if (
                                                  currentIndex <
                                                  CandidateResponse.length
                                                ) {
                                                  return (
                                                    <>
                                                      <td className="greybluetext10">
                                                        {currentIndex + 1}
                                                      </td>
                                                      <td className="greybluetext10">
                                                        {CandidateResponse[
                                                          currentIndex
                                                        ]["answer"] !== "" &&
                                                        CandidateResponse[
                                                          currentIndex
                                                        ]["answer"] !==
                                                          "NULL" ? (
                                                          <b>
                                                            {
                                                              CandidateResponse[
                                                                currentIndex
                                                              ]["answer"]
                                                            }
                                                          </b>
                                                        ) : (
                                                          <span> - </span>
                                                        )}
                                                      </td>
                                                      <td className="greybluetext10">
                                                        {CandidateResponse[
                                                          currentIndex
                                                        ]["correct_answer"] !==
                                                          "" &&
                                                        CandidateResponse[
                                                          currentIndex
                                                        ]["correct_answer"] !==
                                                          "NULL" ? (
                                                          <b>
                                                            {
                                                              CandidateResponse[
                                                                currentIndex
                                                              ][
                                                                "correct_answer"
                                                              ]
                                                            }
                                                          </b>
                                                        ) : (
                                                          <span> - </span>
                                                        )}
                                                      </td>
                                                    </>
                                                  );
                                                } else {
                                                  return (
                                                    <>
                                                      <td className="greybluetext10">
                                                        {" "}
                                                        -{" "}
                                                      </td>
                                                      <td className="greybluetext10">
                                                        {" "}
                                                        -{" "}
                                                      </td>
                                                    </>
                                                  );
                                                }
                                              })}
                                            </tr>
                                          );
                                        }
                                        return null; // Skip if not at the start of a new row
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <br />
                {/* </div>
                            <div className="col-md-10 container"> */}
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

                <a href="/feedback" className="exit-button">
                  <span className="icon">
                    {/* Replace with your exit icon source */}
                    <img className="exit" src={exit} alt="exit" />
                  </span>
                  Exit
                </a>
              </div>
            </center>
          </>
        )}
      </div>

      {/* <Link to='/'>
                        <img className='logout' src={shutDown} style={{ width: "40px" }} alt="Logout" />
                    </Link> */}
    </>
  );
};

export default ExamForm;
