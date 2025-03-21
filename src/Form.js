// src/Form.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Form = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subjectCode: '',
    examDate: '',
  });

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
      console.log(result);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
    <form onSubmit={handleSubmit} >

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
 />
</div>
<div className="mb-3">
 <label htmlFor="subjectCode" className="form-label">
   Subject Code:
 </label>
 <input
   type="text"
   className="form-control"
   id="subjectCode"
   name="subjectCode"
   value={formData.subjectCode}
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
   value={formData.examDate}
   onChange={handleChange}
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
