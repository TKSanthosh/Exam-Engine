// SubjectForm.js

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const SubjectForm = () => {
    const initialSubjectState = {
        scode: '',
        sname: '',
        examDate: '',
      };
  const [subject, setSubject] = useState({ ...initialSubjectState });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubject(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log('Submitted subject:', subject);
    // Handle form submission (e.g., send data to backend)

    
    try {
        const response = await fetch('http://localhost:5000/subject-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subject),
        });
  
        const result = await response.json();
        console.log(result);
        if(result.status==='200'){
            alert('Subject Informations added!');
            setSubject({ ...initialSubjectState });
        } else if(result.status==='400'){
            console.log(result);
            alert('All Data is required to submit the form!');
          }
        // Clear the form after submission
        // setSubject({ ...initialSubjectState });
  
      } catch (error) {
        console.error('Form submission error:', error);
      }
     
  };

  return (



    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
    <form onSubmit={handleSubmit} >
    <center><h1>Itest Subject Form</h1></center>
<div className="mb-3">
<label htmlFor="scode" className="form-label">
          Subject Code:
        </label>
        <input
          type="text"
          className="form-control"
          id="scode"
          name="scode"
          value={subject.scode}
          onChange={handleChange}
        />
      </div>

 <div className="mb-3">
 <label htmlFor="sname" className="form-label">
 Subject Name:
 </label>
 <input
   type="text"
   className="form-control"
   id="sname"
   name="sname"
   value={subject.sname}
   onChange={handleChange}
 />
</div>

<div className="mb-3">
 <label htmlFor="examDate" className="form-label">
   Exam Date:
 </label>
 <input
   type="date"
   className="form-control"
   id="examDate"
   name="examDate"
   value={subject.examDate}
   onChange={handleChange}
 />
</div>
<button type="submit" className="btn btn-primary">Submit </button>
  </form>
  <hr/>
  <Link className='btn btn-success' to='/qp'>Qp Upload</Link>
  </div>
  </div>
  </div>


    
  );
};

export default SubjectForm;
