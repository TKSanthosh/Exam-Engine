import React, { useState, useEffect } from "react";
import axios from "axios";

const BulkTimeExtension = () => {
  const [exam, setExam] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setselectedExam] = useState("");
  const [selectedSubject, setselectedSubject] = useState("");
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get("http://localhost:5000/exam-dropdown");
        setExam(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExam();
  }, []);

  const handleExamChange = async (event) => {
    const examCode = event.target.value;
    setselectedExam(examCode);
    try {
      const res = await axios.get(
        `http://localhost:5000/subject-dropdown/${examCode}`
      );
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkTimeExtend = async () => {
    try {
      if (parseInt(time) > 0) {
        const res = await axios.get("http://localhost:5000/bulk-time-extend/", {
          params: {
            selectedExam,
            selectedSubject,
            includeCompleted,
            time,
          },
        });
        if (res.data.message == "success" && includeCompleted == true){
            setMessage(`The Time has been extended for ${time} minutes including completed candidates`);
        }
        else if (res.data.message == "success" && includeCompleted == false) {
          setMessage(`The Time has been extended for ${time} minutes`);
        } 
         else {
          setMessage(`Kindly enter the correct values`);
        }
      } else {
        setMessage("Enter the time in correct way");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-md-6">
          {/* <div class="form-group"> */}
          <label for="examCode" class="font-weight-bold">
            Exam : &nbsp;
          </label>
          <select onChange={handleExamChange} required>
            <option value="">-Select Exam-</option>
            {exam.map((exam) => (
              <option key={exam.id} value={exam.exam_code}>
                {exam.exam_code}-{exam.exam_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label for="examCode" class="font-weight-bold">
            Subject :&nbsp;
          </label>
          <select
            onChange={(e) => {
              setselectedSubject(e.target.value);
            }}
            required
          >
            <option value="">-Select Subject-</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.subject_code}>
                {subject.subject_code}-{subject.subject_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center mt-5">

      <div className="form-check form-switch d-flex align-items-center mb-1">
      
        <input
          type="checkbox"
          className="form-check-input"
          id="includeCompletedCandidatesSwitch"
          onChange={(e) => setIncludeCompleted(e.target.checked)}   
           style={{backgroundColor: "", borderColor: "green"}}

        />
       <label
          htmlFor="includeCompletedCandidatesSwitch"
          className="form-check-label ms-2"
          >
          Include Completed Candidates
        </label>
      </div>
      </div>
      <br></br>
      <br></br>

      <div className="mb-3">
        <label htmlFor="extendedTime" className="font-weight-bold">
          Time :
        </label>
        <input
          type="number"
          className="form-control d-inline-block w-25 ms-2"
          name="extendedTime"
          min="0"
          placeholder="minutes"
          onChange={(e) => setTime(e.target.value)}
          required
        />{" "}
        in minutes
      </div>
      <br></br>
      <button
        type="submit"
        onClick={handleBulkTimeExtend}
        style={{
          width: "8vw",
          padding: "5px",
          fontSize: "15px",
        }}
      >
        Submit
      </button>
      <div className="d-flex justify-content-center mt-3">
      {message !== "" ? (
        <div
          id="statusMessage"
          className="alert alert-info mt-2"
          style={{ width: "32vw" }}
        >
          <span id="newMediumMessage" style={{ fontSize: "15px" }}>
            {message}
          </span>
        </div>
      ) : (
        <></>
      )}
      </div>
    </div>
  );
};

export default BulkTimeExtension;
