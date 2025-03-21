// src/Form.js
import React, { useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Form = () => {

    
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    subjectCode: '',
    examDate: '',
  };
  const [formData, setFormData] = useState({ ...initialFormState });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  console.log(formData);
  //  console.log(filteredSubjects[0].exam_date);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
    //   console.log(result);
    //   console.log(result.status);
      if(result.status==='200'){
        alert('Candidate Informations added!');
        setFormData({ ...initialFormState });
        setSelectedSubject('');
      }else if(result.status==='400'){
        console.log(result);
        alert('All Data is required to submit the form!');
      }

    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
//   const [subjectCodes, setSubjectCodes] = useState([]);
//   const [selectedSubjectCode, setSelectedSubjectCode] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/subject-codes');
        const data = await response.json();
        setSubjects(data);
        // console.log(data+'sss')
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
    // console.log(subjects);
  }, []);

  useEffect(() => {
    // Filter subjects and set examDate when selectedSubject changes
    const filteredSubjects = subjects.filter(subject => subject.subject_code === selectedSubject);

    if (filteredSubjects.length > 0) {

        // Parse the input date string
        const inputDateString=filteredSubjects[0].exam_date;
        const date = new Date(inputDateString);

        // Get day, month, and year
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getUTCFullYear();

        // Format as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;

        console.log(formattedDate); 
        setExamDate(formattedDate);
        setFormData((prevData) => ({
            ...prevData,
            subjectCode: selectedSubject,
            examDate: inputDateString,
          }));
        } else {
        setExamDate(''); // Set to empty if no matching subject is found
        }
  }, [selectedSubject, subjects]);

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };
  return (
    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
    <form onSubmit={handleSubmit} >
    <center><h1>Itest Registration Form</h1></center>
<div className="mb-3">
<label htmlFor="name" className="form-label">
          Name:
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

 <div className="mb-3">
 <label htmlFor="email" className="form-label">
   Email:
 </label>
 <input
   type="email"
   className="form-control"
   id="email"
   name="email"
   value={formData.email}
   onChange={handleChange}
   pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
   required

 />
</div>
<div className="mb-3">
 <label htmlFor="password" className="form-label">
   Password:
 </label>
 <input
   type="password"
   className="form-control"
   id="password"
   name="password"
   value={formData.password}
   onChange={handleChange}
   required

 />
</div>
<div className="mb-3">
 

<label htmlFor="subjectCode">Select Subject Code:</label>
<select
                id="subjectCode"
                name="subjectCode"
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="form-control"
              >
                <option value="" disabled>Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subjecto_code} value={subject.subject_code}>
                  {subject.subject_name}
                  </option>
                ))}
              </select>
</div>
<div className="mb-3">
 <label htmlFor="examDate" className="form-label">
   Exam Date:
 </label>


<input
   type="text"
   className="form-control"
   id="examDate"
   name="examDate"
   value={examDate}
   onChange={handleChange} readOnly 
 />
</div>
<button type="submit" className="btn btn-primary">Submit </button>
  </form>
  </div>
  </div>


  </div>
  );
};

export default Form;
