import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Exam.css";
import ServerStatus from "./ServerStatus";
import sifyLogo from "./assets/images/sify.png";
import ins1 from "./assets/images/ins1.jpg";
import RenderInsructionContent from "./RenderInsructionContent";
import axios from "axios";

let AutoSelect = null;
try {
  AutoSelect = require("./AutoSelect").default; // If file exists, import
} catch (e) {
  AutoSelect = null;
}

const Instruction = () => {
  const [candidateInfo, setCandidateInfo] = useState({});
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  useEffect(() => {
    let timeoutId;
    if (AutoSelect != null) {
      setIsChecked(true);
      timeoutId = setTimeout(() => {
        handleButtonClick({ preventDefault: () => {}, isAutoSelect: true });
      }, 5000);
    }
    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, []);

  const handleButtonClick = async (event) => {
    event.preventDefault();

    // Directly check the `isChecked` state to avoid stale state issues
    if (!isChecked && !event.isAutoSelect) {
      alert("Please read and agree to the instructions before proceeding.");
      return;
    }

    try {
      const candidateInfos = sessionStorage.getItem("candidateInfo");

      const parsedData = JSON.parse(candidateInfos);
      const { user, exam_code, subject_code, total_marks, medium } = parsedData;

      const response = await axios.get("http://localhost:5000/ontheflyqpgen/", {
        params: {
          membershipNo: user,
          examCode: exam_code,
          subjectCode: subject_code,
          medium: medium,
          totalMarks: total_marks,
        },
      });

      if (response.data) {
        parsedData.question_paper_no = response.data.question_paper_no;
        sessionStorage.setItem("candidateInfo", JSON.stringify(parsedData));
        console.log("Question paper generated successfully.");
        navigate("/sampleqp");
      }
    } catch (err) {
      setError("Unable to generate question paper. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    const candidateInfos = sessionStorage.getItem("candidateInfo");
    if (candidateInfos) {
      try {
        const parsedData = JSON.parse(candidateInfos);
        if (parsedData && parsedData.user) {
          setCandidateInfo(parsedData);
        } else {
          console.error("Invalid user data structure in sessionStorage.");
        }
      } catch (error) {
        console.error(
          "Error parsing candidateInfo from sessionStorage:",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    if (candidateInfo.subject_code) {
      const fetchInstructions = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/instructions/${candidateInfo.subject_code}`
          );
          const data = await response.json();
          setInstructions(data[0]["instruction_text"]);
        } catch (err) {
          setError("Failed to fetch instructions");
        } finally {
          setIsLoading(false);
        }
      };

      fetchInstructions();
    }
  }, [candidateInfo.subject_code]);

  if (error) return <p>{error}</p>;

  return (
    <>
      <ServerStatus pageValue="client" />

      <div className="row header" style={{ backgroundColor: "#666d72" }}>
        <img
          src={sifyLogo}
          style={{ width: "10vw", height: "100%" }}
          alt="Sify Logo"
        />
      </div>

      <div className="row">
        <center>
          <div className="infoform">
            <div className="info-title">Candidate Instruction</div>
            <div className="ins-content">
              {isLoading ? (
                <p>Loading instructions...</p>
              ) : (
                <RenderInsructionContent htmlString={instructions} />
              )}
            </div>

            <div className="instruction-container">
              <label className="agree-label" style={{ fontSize: "1.2em" }}>
                <input
                  className="agree-checkbox"
                  type="checkbox"
                  name="agree"
                  required
                  onChange={handleCheckboxChange}
                  checked={isChecked}
                />
                I agree to the instructions / मैं निर्देशों से सहमत हूं
              </label>

              <button
                className="next-button-ins"
                onClick={handleButtonClick}
                disabled={!isChecked} // Disable button until checkbox is checked
              >
                I have read the instructions - मैंने निर्देश पढ़ लिये हैं
              </button>
            </div>
          </div>
        </center>
      </div>
    </>
  );
};

export default Instruction;
