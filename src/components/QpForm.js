import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QpForm = () => {
  const [subjectCode, setSubjectCode] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correct_ans: '',
      mark: 1,
    },
  ]);

  const handleSubjectCodeChange = (e) => {
    setSubjectCode(e.target.value);
  };

  const handleQuestionChange = (e, questionIndex, optionIndex) => {
    const { name, value } = e.target;
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [name]: value,
      };
      return updatedQuestions;
    });
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].options[optionIndex].text = value;
      return updatedQuestions;
    });
  };

const handleMarkChange = (e,questionIndex) => {
    const { value } = e.target;
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].mark = value;
      return updatedQuestions;
    });  
}

  const handleCorrectAnsChange = (e, questionIndex) => {
    const { value } = e.target;
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].correct_ans = value;
      return updatedQuestions;
    });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data and perform submission logic here

    try {
        const response = await fetch('http://localhost:5000/submit-qp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subjectCode: subjectCode,
            questions: questions,
          }),
        });
    
        if (response.ok) {
          // Handle successful response
          console.log('Form data submitted successfully');
          alert('QP Data Uploaded for Subject Code'+subjectCode);
        } else {
          // Handle error response
          console.error('Failed to submit form data');
        }
      } catch (error) {
        // Handle network or other errors
        console.error('Error submitting form data:', error);
      }
    console.log('Subject Code:', subjectCode);
    console.log('Questions:', questions);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/subject-codes');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
 // Fetch question counts for each subject
 const fetchQuestionCounts = async () => {
    try {
        const counts = {};
        // Iterate through subjects and fetch question count for each
        for (const subject of subjects) {
          const response = await fetch(`http://localhost:5000/question-counts/${subject.subject_code}`);
          const data = await response.json();
          counts[subject.subject_code] = data.questionCount;
        }
        setQuestionCounts(counts);
      } catch (error) {
        console.error('Error fetching question counts:', error);
      }
  };

 
  fetchQuestionCounts();
    fetchSubjects();
  }, [subjects]);

  return (
    <div className="container mt-5">
        <div className="row">
        {/* <div className="col-md-12"> */}
        {subjects.map((subject) => (
            <div className='card col-md-2' key={subject.subject_code}>
                <h6>Subject Name: {subject.subject_name}</h6>
                <h6>Subject Code: {subject.subject_code}</h6>
                <h6>Question Count: <span className='badge qpcnt'>{questionCounts[subject.subject_code]}</span></h6>
            </div>
         ))}



        {/* </div> */}
        </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <center>
              <h1>Itest QP Form</h1>
            </center>

            <label htmlFor="subjectCode">Choose a Subject:</label>
            <select
              id="subjectCode"
              name="subjectCode"
              value={subjectCode}
              onChange={handleSubjectCodeChange}
              className="form-control"
              required
            >
              <option value="" disabled>
                Select Subject
              </option>
              {subjects.map((subject) => (
                <option key={subject.subject_code} value={subject.subject_code}>
                  {subject.subject_name}
                </option>
              ))}
            </select>

            {questions.map((question, questionIndex) => (
              <div key={question.id}>
                <label htmlFor={`question`}>Question:</label>
                <textarea
                  className="form-control"
                  id={`question`}
                  name={`question`}
                //   value={question.text}
                  onChange={(e) => handleQuestionChange(e, questionIndex)}
                  required
                ></textarea>

                {question.options.map((option, optionIndex) => (
                  <div key={option.id}>
                    <label htmlFor={`option-${option.id}`}>{`Option ${option.id.toUpperCase()}:`}</label>
                    <input
                      type="text"
                      id={`option-${option.id}`}
                      name={`option-${option.id}`}
                      value={option.text}
                      className="form-control"
                      onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                      required
                    />
                  </div>
                ))}

                <div className="col-md-6">
                <label htmlFor={`correct_ans`}>Correct Answer:</label>
                  <select
                    id={`correct_ans`}
                    name={`correct_ans`}
                    value={question.correct_ans}
                    onChange={(e) => handleCorrectAnsChange(e, questionIndex)}
                    className="form-control"
                    required
                  >
                    <option value="" disabled>
                      Select Correct Answer
                    </option>
                    <option value={'a'}>A</option>
                    <option value={'b'}>B</option>
                    <option value={'c'}>C</option>
                    <option value={'d'}>D</option>
                  </select>
                </div>

                <div className='col-md-6'>
                <label htmlFor={`mark`}>Marks:</label>
                    <input
                      type="text"
                      id="mark"
                      name="mark"
                      value={questions.mark}
                      className="form-control"
                      onChange={(e) => handleMarkChange(e, questionIndex)}
                      required
                    />
                </div>
              </div>
            ))}
            <br />
            <button type="submit">Submit</button>
            <Link className='btn btn-primary logout' to='/subject'>Back</Link>

          </form>
        
    </div>
    </div>
    </div>
  );
};

export default QpForm;
