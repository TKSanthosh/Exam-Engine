import React, { useState, useEffect } from "react";
import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

const GraceTimeExtension = () => {
  const [exam, setExam] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Array to hold selected subjects
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For controlling dropdown visibility

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
    setSelectedExam(examCode);
    try {
      const res = await axios.get(
        `http://localhost:5000/subject-dropdown/${examCode}`
      );
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckboxChange = (subjectCode) => {
    setSelectedSubjects(
      (prevSelected) =>
        prevSelected.includes(subjectCode)
          ? prevSelected.filter((code) => code !== subjectCode) // Remove from selected
          : [...prevSelected, subjectCode] // Add to selected
    );
  };

  const handleBulkTimeExtend = async () => {
    try {
      // console.log(selectedSubjects +" "+ typeof(selectedSubjects))
      if (parseInt(time) > 0) {
        const res = await axios.get(
          "http://localhost:5000/grace-time-extend/",
          {
            params: {
              selectedExam,
              selectedSubjects,
              time,
            },
          }
        );
        if (res.data.rowsAffected > 0) {
          setMessage(`The time has been extended for ${time} minutes`);
        } else {
          setMessage(`Kindly enter the correct values`);
        }
      } else {
        setMessage("Enter the time in the correct way");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-md-6">
          <label htmlFor="examCode" className="font-weight-bold">
            Exam: &nbsp;
          </label>
          <select onChange={handleExamChange} className=""     
           style={{ flex: "2", padding: "7px", borderRadius: "5px", border: "1px solid #f8f9fa", backgroundColor:"#f8f9fa"}} 
 required>

            <option value="">-Select Exam-</option>
            {exam.map((exam) => (
              <option key={exam.id} value={exam.exam_code}>
                {exam.exam_code}-{exam.exam_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <div className="dropdown">
            <label htmlFor="subjectCode" className="font-weight-bold">
              Subject: &nbsp;
            </label>
            <button
              className="btn btn-light dropdown-toggle"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              -Select Subject-
            </button>
            {isDropdownOpen && (
              <div
                className="dropdown-menu show dropdown-menu-end"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "130px",
                  right: "auto",
                  maxHeight: "100px", // Adjust height as needed
                  overflowY: "auto",
                  padding: "10px", // Match padding with the select dropdown
                  borderRadius: "5px", // Match border-radius with the select dropdown
                  border: "1px solid #ddd", // Same border styling
                  backgroundColor: "#fff", // Same background color
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)", // Optional: add a subtle shadow
                  width: "auto", // Adjust width based on content or fix it
                }}
              >
                {subjects.map((subject) => (
                  <div key={subject.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={subject.subject_code}
                      checked={selectedSubjects.includes(subject.subject_code)}
                      onChange={() =>
                        handleCheckboxChange(subject.subject_code)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={subject.subject_code}
                    >
                      {subject.subject_code}-{subject.subject_name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <br />
      <br />

      <div className="mb-3 mt-4">
        <label htmlFor="extendedTime" className="font-weight-bold">
          Time:
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
      <br />
      <button
        type="button"
        onClick={handleBulkTimeExtend}
        className="btn btn-primary"
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
        ) : null}
      </div>
    </div>
  );
};

export default GraceTimeExtension;
