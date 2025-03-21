import React, { useState, useEffect } from 'react';
import './Exam.css';
import sifyLogo from './assets/images/sify.png';
import axios from 'axios';
import ServerStatus from './ServerStatus'; // Import the NumberPalette component
import './Button.css';
import exit from './assets/images/exit.png';


function FeedbackForm() {
  const [feedback, setFeedback] = useState({
    loginProcess: '',
    systemWork: '',
    techProblem: '',
    questionRating: '',
    adequateTime: '',
    screenNavigationIssue: '',
    examMethodologyRating: '',
    examCode: '',
    subjectCode: '',
    membershipNo: '',
    questionpaperno: ''
  });
  const [candidateInfo, setCandidateInfo] = useState({});

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log('Feedback submitted:', feedback);
  //   // Here you can handle submission, e.g., send feedback to an API
  // };

  const colors = ['yellowgreen', '#f3a063', '#63aff3'];
  const colors0 = ['#666d72', '#dd6d1b', '#3d7db7'];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentColorIndex0, setCurrentColorIndex0] = useState(0);

  const handleColorChange = () => {
      setCurrentColorIndex((currentColorIndex + 1) % colors.length);
      setCurrentColorIndex0((currentColorIndex0 + 1) % colors0.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
  
    // Validate each field
    if (!feedback.loginProcess) {
      newErrors.loginProcess = 'Please select an option for login process.';
    }
    if (!feedback.systemWork) {
      newErrors.systemWork = 'Please select an option for system working.';
    }
    if (!feedback.techProblem) {
      newErrors.techProblem = 'Please select an option for Technical Problem.';
    }
    if (!feedback.questionRating) {
      newErrors.questionRating = 'Please select an option for Question rating.';
    }
    if (!feedback.adequateTime) {
      newErrors.adequateTime = 'Please select an option for time to complete.';
    }
    if (!feedback.screenNavigationIssue) {
      newErrors.screenNavigationIssue = 'Please select an option for navigation issue.';
    }
    if (!feedback.examMethodologyRating) {
      newErrors.examMethodologyRating = 'Please select an option for rating.';
    }
  
    // If errors exist, set the error state and stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).join('\n');
      alert(errorMessages);
      return;
    } else {
      // Merge feedback and hidden fields from candidateInfo
      const combinedFeedback = {
        ...feedback,
        examCode: candidateInfo.exam_code,
        subjectCode: candidateInfo.subject_code,
        membershipNo: candidateInfo.user,
        questionpaperno: candidateInfo.question_paper_no
      };
  
      try {
        // Send form data via Axios
        const response = await axios.post('http://localhost:5000/submitFeedback', combinedFeedback);
        console.log('Feedback submitted successfully', response.data);
        // alert('Feedback submitted successfully');
        document.querySelector('.feedback-completed').style.display = 'block';
        document.querySelector('.feedback-form-container').style.display = 'none';
      } catch (error) {
        console.log('Error submitting feedback:', error.response?.data || error.message);
        alert('Error submitting feedback, please try again.');
      }
    }
  };
  
  useEffect(() => {
   
        
    // Retrieve data from sessionStorage
    const userAuthData = sessionStorage.getItem('candidateInfo');
    // alert(userAuthData);
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
                    medium : parsedData.medium
                });
            

                // console.log('parsed subject dur', parsedData.subject_duration);
                const durationInSeconds = parsedData.subject_duration;// Convert minutes to seconds
                // setTimer(durationInSeconds);
                // Fetch clienttime from iib_response table
                // fetch(`http://localhost:5000/api/get-clienttime/${parsedData.question_paper_no}`)
                // .then(response => response.json())
                // .then(data => {
                //     if (data && data.clienttime) {
                //         setTimer(data.clienttime);
                //     } else {
                //         setTimer(durationInSeconds);
                //     }
                //     console.log('Fetched clienttime data:', data.clienttime);
                // })
                // .catch(error => {
                //     console.error('Error fetching clienttime:', error);
                //     setTimer(durationInSeconds); // Fallback in case of error
                // });
             

            } else {
                console.error('Invalid user data structure in sessionStorage.');
            }
        } catch (error) {
            console.error('Error parsing user data from sessionStorage:', error);
        }
        
    }

        // ///////////////////////////////////////////////////////

    const examSettingsData = sessionStorage.getItem('examSettings');
    // if (examSettingsData) {
    //     // Parse the JSON string to an object
    //     const parsedSettingsData = JSON.parse(examSettingsData);
    //     setExamSettings({
    //     // Access the `secure_browser` value
    //      secureBrowserValue : parsedSettingsData.secure_browser,
    //      calcEnable : parsedSettingsData.calc_enable,
    //      roughtSheetEnable : parsedSettingsData.rough_sheet_ckeditor
    //     })
    //     // Log the value
    //     // console.log('secure_browser:', secureBrowserValue);
    // } else {
    //     console.log('No exam settings found in sessionStorage.');
    // }
}, []);
  

  return (
    <>
    <ServerStatus pageValue={"client"}/>

    <div className='row header' style={{ '--dynamic-color0': colors0[currentColorIndex0] }}>
        <img src={sifyLogo} style={{ width: '140px', height: '60px' }} />
    </div>
    <center>
    <div className="infoform">
    <label class="info-title">Candidate Feedback</label>
      
    <div className="ins-content"> 
    <div className="feedback-form-container" style={{ margin: '20px auto', width: '90%' }}>
      <p>Dear Candidate,</p>
      <p>Please spend a few minutes of your valuable time in giving your feedback on the examination through this online form.</p> 
      
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="examCode" value={candidateInfo.exam_code} />
        <input type="hidden" name="subjectCode" value={candidateInfo.subject_code} />
        <input type="hidden" name="membershipNo" value={candidateInfo.user} />
        <input type="hidden" name="questionpaperno" value={candidateInfo.question_paper_no} />
        <div className="form-group mt-5">
          <label className="question_text fw-bold">Login Process was smooth</label>
          <div className="options"> 
            <label><input type="radio" name="loginProcess" value="Y" onChange={handleChange} /> Yes</label>
            <label><input type="radio" name="loginProcess" value="N" onChange={handleChange} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">System was working fine during the exam</label>
          <div className="options">
            <label><input type="radio" name="systemWork" value="Y" onChange={handleChange} /> Yes</label>
            <label><input type="radio" name="systemWork" value="N" onChange={handleChange} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">Did you have any technical problem during the exam</label>
          <div className="options">
            <label><input type="radio" name="techProblem" value="Y" onChange={handleChange} /> Yes</label>
            <label><input type="radio" name="techProblem" value="N" onChange={handleChange} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">How will you rate the questions</label>
          <div className="options">
            <label><input type="radio" name="questionRating" value="easy" onChange={handleChange} /> Easy</label>
            <label><input type="radio" name="questionRating" value="difficult" onChange={handleChange} /> Difficult</label>
            <label><input type="radio" name="questionRating" value="relevant" onChange={handleChange} /> Relevant</label>
            <label><input type="radio" name="questionRating" value="not relevant" onChange={handleChange} /> Not Relevant</label>
            <label><input type="radio" name="questionRating" value="cant say" onChange={handleChange} /> Can't say</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">Did you have adequate time to complete the questions</label>
          <div className="options">
            <label><input type="radio" name="adequateTime" value="Y" onChange={handleChange} /> Yes</label>
            <label><input type="radio" name="adequateTime" value="N" onChange={handleChange} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">Did you face any issues while navigating the screen to the next question_text(s)</label>
          <div className="options">
            <label><input type="radio" name="screenNavigationIssue" value="Y" onChange={handleChange} /> Yes</label>
            <label><input type="radio" name="screenNavigationIssue" value="N" onChange={handleChange} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label className="question_text fw-bold">Your rating on online exam methodology</label>
          <div className="options">
            <label><input type="radio" name="examMethodologyRating" value="excellent" onChange={handleChange} /> Excellent</label>
            <label><input type="radio" name="examMethodologyRating" value="very good" onChange={handleChange} /> Very Good</label>
            <label><input type="radio" name="examMethodologyRating" value="good" onChange={handleChange} /> Good</label>
            <label><input type="radio" name="examMethodologyRating" value="average" onChange={handleChange} /> Average</label>
            <label><input type="radio" name="examMethodologyRating" value="poor" onChange={handleChange} /> Poor</label>
          </div>
        </div>

        <div className="form-group" style={{ textAlign: 'center', marginLeft: '350px' }}>
          <button type="submit" style={{ padding: '5px 10px', backgroundColor: 'yellowgreen', color: 'white', border: 'none', cursor: 'pointer' }}>
            Submit
          </button>
        </div>

      </form>

      <p style={{ marginTop: '20px' }}>We value your feedback and would constantly strive to improve our service.</p>
    </div>
    <div className="feedback-completed" style={{ margin: '20px auto', width: '90%', display:'none',textAlign:'center' }}>
    <p><b>Thank you for your feedback</b></p>
    <a href='/' >
    <button type="submit" style={{ padding: '5px 10px', backgroundColor: 'yellowgreen', color: 'white', border: 'none', cursor: 'pointer' }}>
            Submit
          </button> </a>
    </div>

    </div>
    </div>
    </center>
    </>
  );
}

export default FeedbackForm;

