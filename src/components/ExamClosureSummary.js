import React, { useEffect,useState } from 'react';
import axios from 'axios';

const ExamClosureSummary = ({onSubmitSuccess}) => {
  const [SerialNumber, setSerialNumber] = useState('');
  const [ExamDate, setExamDate] = useState('');
  const [ServerNo, setServerNo] = useState('');
  const [CenterCode, setCenterCode] = useState('');
  const [ExamName, setExamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

const handleClosePopup = () => {
    setIsPopupOpen(false);
};
  
  const [formData, setFormData] = useState({candidateBatch1Scheduled: '',candidateBatch2Scheduled: '',candidateBatch3Scheduled: '',candidateBatch1Attended: '',candidateBatch2Attended: '',candidateBatch3Attended: '',labsUsed: '',testAdministrators: '',candidatesWithoutAdmitCard: '',candidatesWithoutIdentityProof: '',candidatesWithoutAdmitCardAndIdentityProof: '',candidatesReportingLate: '',candidatesRequestingCentreChange: '',candidatesIndulgingInMalpractice: '',feedback: '',attachFile: false,ServerNo:'',ExamDate:''});

  

  useEffect(() => {
    
    fetch('http://localhost:5000/serial-number')
      .then(response => response.json())
      .then(data => {
        setSerialNumber(data.serialNumber);
        // alert(data.serialNumber);
        //onSerialNumberChange(data.SerialNumber); // Call the parent function with the new serial number
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  useEffect(() => {
    
    fetch('http://localhost:5000/get-exam-date')
      .then(response => response.json())
      .then(data => {
        setExamDate(data.exam_date);
        //onSerialNumberChange(data.SerialNumber); // Call the parent function with the new serial number
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  useEffect(() => {
    
    // alert();
    fetch('http://localhost:5000/get-center-server-details')
      .then(response => response.json())
      .then(data => {
        setCenterCode(data.center_code);
        setServerNo(data.serverno);
        //onSerialNumberChange(data.SerialNumber); // Call the parent function with the new serial number
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  useEffect(() => {
    
    // alert();
    fetch('http://localhost:5000/get-exam-details')
      .then(response => response.json())
      .then(data => {
        setExamName(data.exam_name);
        //onSerialNumberChange(data.SerialNumber); // Call the parent function with the new serial number
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: type === 'checkbox' ? checked : value
  //   });
  // };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    if (type === 'text') {
      // Apply numeric validation only for input fields
      const numericValue = value.replace(/\D/g, ''); // Allow numbers only
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));
    } else {
      // Allow free text for textarea and other types
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
  const formData = new FormData(form);

  // Convert FormData to JSON (optional, for debugging or API calls)
  const data = Object.fromEntries(formData.entries());

  // alert(SerialNumber);
  
    try {
      const response = await fetch('http://localhost:5000/exam-closure-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      // Check response
      const result = await response.json();
  
      if (response.ok) {
        alert('Success: ' + result.message);
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        // handleDayClosure();
      } else {
        alert('Failed: ' + (result.message || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred during form submission.');
    }
  };

  // const handleDayClosure = async () => {
  //   // alert(batchact);

  //   try {
  //       const responseIP = await axios.get('http://localhost:5000/get-system-ip');
  //       // const hostIp = await getSystemIp();
  //       const hostIp = responseIP.data.ip;
  //       // Set loading to true if using a loading state
  //       setLoading(true);
          
  //       // Make GET request to batch closure API
  //       const response = await axios.get(`http://localhost:5000/handleDayClosure/${batchact}/${hostIp}/${SerialNumber}/${CenterCode}`);
  //   // console.log('respppp',response.statusText);
  //       if(response.statusText=='OK'){
  //             // Display alert on successful batch closure
  //             alert(`Day closure done!`);     
  //       } 
  //     } catch (err) {
  //       // Handle error
  //       console.error('Error:', err);
  //       // setError('Failed to process batch closure. Please try again.');
  //       alert('Failed to process batch closure. Please try again.');
  //     } finally {
  //       // Reset loading state to false if applicable
  //       setLoading(false);
  //     }

 

  // };

  
  return (
    <form onSubmit={handleSubmit} className="container p-4 border rounded" style={{ fontSize: 'smaller' }}>
      <input type="hidden" value={ExamDate} name="ExamDate" id="ExamDate" />
      <input type="hidden" value={ExamName} name="ExamName" id="ExamDate" />
		  <input type="hidden" value={CenterCode} name="CentreCode" id="CentreCode" />
		  <input type="hidden" value={ServerNo} name="ServerNo" id="ServerNo"/>
      <input type="hidden" value={SerialNumber} name="SerialNumber" id="SerialNumber"/>

		  <input type="hidden" value={{}} name="feed_cnt" />
		  <input type="hidden" value={{}} name="tot_att" />
		  {/* <input type="hidden" value="" name="hid_submit" id="hid_submit" /> */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="candidateBatch1Scheduled">No. of Candidate Batch 1 scheduled: <span className="text-danger" >*</span></label>
          <input type="text" id="candidateBatch1Scheduled" className="form-control" name="candidateBatch1Scheduled" maxLength="8" value={formData.candidateBatch1Scheduled} onChange={handleChange} onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidateBatch2Scheduled">No. of Candidate Batch 2 scheduled: </label>
          <input type="text" id="candidateBatch2Scheduled" className="form-control" name="candidateBatch2Scheduled" maxLength="8" value={formData.candidateBatch2Scheduled} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidateBatch3Scheduled">No. of Candidate Batch 3 scheduled: </label>
          <input type="text" id="candidateBatch3Scheduled" className="form-control" name="candidateBatch3Scheduled" maxLength="8" value={formData.candidateBatch3Scheduled} onChange={handleChange}  />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="candidateBatch1Attended">No. of Candidate Batch 1 Attended: <span className="text-danger" >*</span></label>
          <input type="text" id="candidateBatch1Attended" className="form-control" name="candidateBatch1Attended" maxLength="8" value={formData.candidateBatch1Attended} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidateBatch2Attended">No. of Candidate Batch 2 Attended: </label>
          <input type="text" id="candidateBatch2Attended" className="form-control" name="candidateBatch2Attended" maxLength="8" value={formData.candidateBatch2Attended} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidateBatch3Attended">No. of Candidate Batch 3 Attended: </label>
          <input type="text" id="candidateBatch3Attended" className="form-control" name="candidateBatch3Attended" maxLength="8" value={formData.candidateBatch3Attended} onChange={handleChange} />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="labsUsed">No. of Labs Used: <span className="text-danger" >*</span></label>
          <input type="text" id="labsUsed" className="form-control" name="labsUsed" maxLength="8" value={formData.labsUsed} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="testAdministrators">No of Test Administrators: <span className="text-danger" >*</span></label>
          <input type="text" id="testAdministrators" className="form-control" name="testAdministrators"  maxLength="8" value={formData.testAdministrators} onChange={handleChange} required />
        </div>
        <div className="col-md-4"></div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="candidatesWithoutAdmitCard">No of Candidates without Admit Card:</label>
          <input type="text" id="candidatesWithoutAdmitCard" className="form-control" name="candidatesWithoutAdmitCard"  maxLength="8" value={formData.candidatesWithoutAdmitCard} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidatesWithoutIdentityProof">No of Candidates without Identity Proof:</label>
          <input type="text" id="candidatesWithoutIdentityProof" className="form-control" name="candidatesWithoutIdentityProof"  maxLength="8" value={formData.candidatesWithoutIdentityProof} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidatesWithoutAdmitCardAndIdentityProof">No of Candidates without Admit Card & Identity Proof:</label>
          <input type="text" id="candidatesWithoutAdmitCardAndIdentityProof" className="form-control" name="candidatesWithoutAdmitCardAndIdentityProof"  maxLength="8" value={formData.candidatesWithoutAdmitCardAndIdentityProof} onChange={handleChange} />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="candidatesReportingLate">No of Candidates reporting Late for the Exam:</label>
          <input type="text" id="candidatesReportingLate" className="form-control" name="candidatesReportingLate"  maxLength="8" value={formData.candidatesReportingLate} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidatesRequestingCentreChange">No of Candidates requesting a Centre Change on the day of the Exam:</label>
          <input type="text" id="candidatesRequestingCentreChange" className="form-control" name="candidatesRequestingCentreChange"  maxLength="8" value={formData.candidatesRequestingCentreChange} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="candidatesIndulgingInMalpractice">No of Candidates found indulging in Malpractice:</label>
          <input type="text" id="candidatesIndulgingInMalpractice" className="form-control" name="candidatesIndulgingInMalpractice"  maxLength="8" value={formData.candidatesIndulgingInMalpractice} onChange={handleChange} />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="feedback">Feedback: <span className="text-danger" >*</span></label>
        <textarea id="feedback" className="form-control" name="feedback" value={formData.feedback} onChange={handleChange} required />
      </div>

      {/* <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="attachFile" name="attachFile" checked={formData.attachFile} onChange={handleChange} />
        <label className="form-check-label" htmlFor="attachFile">Do you want to attach the file?</label>
      </div> */}

      <div className="d-flex justify-content-center">
        <button type="submit" className="p-2">Save</button>
        {/* <button type="button" className="btn btn-warning">Back to Closure Summary</button> */}
      </div>

      <p className="text-center text-danger mt-3">Fields * marked are mandatory</p>
    </form>
  );
}

export default ExamClosureSummary;
