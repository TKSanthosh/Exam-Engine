import React, { useState } from 'react';
import './ReportTable.css'; // Import CSS for styling
import AttendanceReport from './AttendanceReport'; 
import IncompleteReport from './IncompleteReport'; 
import TimejustificationReport from './TimejustificationReport'; 
import TrackingfeedReport from './TrackingfeedReport'; 
import CandidateReport from './CandidateReport'; 
import CandidateDurationReport from './CandidateDurationReport'; 
import ExtendBulkTime from './ExtendBulkTime';
import ChangeMedium from './ChangeMedium';
import BulkTimeExtension from './BulkTimeExtension';
import GraceTimeExtension from './GraceTimeExtension';
import ImageDownload from './ImageDownload';
import DBPatch from './DBPatch';
import ScannerUpload from './ScannerUpload';
import NetbootEnableDisable from './NetbootEnableDisable';
import SecureBrowserEnableDisable from './SecureBrowserEnableDisable';
import ExamClosureSummary from './ExamClosureSummary'; 
import SkipValidation from './SkipValidation'; 
import BiometricApiServices from './BiometricApiServices'; 
import SeatManagement from './SeatManagement'; 
import ReusablePasswordDialog from "./ReusablePasswordDialog";
import CandidateTimeExtension from "./CandidateTimeExtension";
import axios from 'axios';

const examReports = [ 
    { id: 1, name: 'Attendance Report' },
    { id: 2, name: 'Incomplete Status Report' },
    { id: 3, name: 'Candidate Report' },
    { id: 4, name: 'Time Justification Report' },
    { id: 5, name: 'Candidate Duration Report' },
    { id: 6, name: 'Tracking Feed' },
    // { id: 7, name: 'exam Closure Summary' },
  
  ];

const bioReports = [
{ id: 1, name: 'API Service'},
{ id: 2, name: 'Seat Allocation'},
{ id: 3, name: 'Skip Validation' },

];

const miscellaneousReports = [
// { id: 1, name: 'Change Bulk Time Slot'},
{ id: 2, name: 'Change Medium'},
// { id: 3, name: 'Candidate Score generation'}, 
{ id: 4, name: 'Image Download'},
{ id: 5, name: 'DB Patch update'},
{ id: 6, name: 'Bulk Time Extension'},
{ id: 7, name: 'Scanner Upload'},
{ id: 8, name: 'Candidate Time Extension'},
{ id: 9, name: 'Netboot Enable/Disable'}, 
{ id: 10, name: 'Grace Time Extension'}, 
{ id: 11, name: 'Secure Browser Enable/Disable'},

];

// Utility function to split reports into chunks
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
  
};

// function formatDate(dateString) {
//     return new Date(dateString).toISOString().split('T')[0];
//   }

const ReportTable = ({ type, onReportSelect }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [miscPwd, setMiscPwd] = useState('');
  const [miscText, setMiscText] = useState('misc-txt');
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [report, setReport] = useState();
  const [centreCode, setCenterCode] = useState("");
  const [serverNumber, setServerNo] = useState("");
  const [pwdMatched,setPwdMatched] = useState(false)
  const [types,setType] = useState('')
  
  // const [attendanceReport, setData] = useState([]);
  // const [incompletestatusReport, setDataIncomplete] = useState([]);
  
  const handleOpenDialog = (type,report) => {
    setDialogOpen(true);
    setMiscPwd(type);
    setType(type);
    setReport(report);
};

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // setMiscPwd('');
    if(miscPwd==''){
        setMiscText('misc-txt');
    } else{
    setMiscPwd('');
    }
    // setMiscText('misc-txt');
};
const handleSubmitPassword = (password) => {
  console.log('Misc Password submitted:', password);
};
const handleValidAccess = async (vaaccess) => {
if (vaaccess !== 1) {
    alert('Access Failed!');
    setMiscText('misc-txt');
    return;
}
alert('TYEST');
try {
  const hiddenPasswordValue = document.getElementById('hiddenPassword').value;
  // alert(hiddenPasswordValue);
  // Fetch center and server details
  const { data: centerData } = await axios.get('http://localhost:5000/get-center-server-details');
  if (!centerData.center_code) {
      console.error('Error fetching center/server details:', centerData.error);
      alert('Failed to fetch center and server details.');
      return;
  }
  setCenterCode(centerData.center_code);
  setServerNo(centerData.serverno);

  // Determine module type
  const moduleType = miscPwd; 

  // Generate password
  const { data: passwordResponse } = await axios.post('http://localhost:5000/generate-password', {
      centreCode: centerData.center_code,
      serverNumber: centerData.serverno,
      module: moduleType,
  });

  if (!passwordResponse.success) {
      console.error('Password generation failed:', passwordResponse.error);
      alert('Failed to generate password.');
      return;
  }

  const generatedPassword = passwordResponse.generatedPassword;
  setGeneratedPassword(generatedPassword);
  // Check password match
  alert(generatedPassword);
  // alert(hiddenPasswordValue);
  if (hiddenPasswordValue != generatedPassword) {
    setPwdMatched(false)
      alert('Password Mismatch');
      return;
  }else{
    setPwdMatched(true);
    handleReportClick(types,report);
  }
  // Handle utility tasks
} catch (error) {
  console.error('Error handling valid access:', error.message);
  alert('An error occurred while processing the request.');
}
}
  const handleReportClick = async (type,report) => {
    setPwdMatched(true);
    setSelectedReport(report);
    setType(type)
    onReportSelect(report);
  };

  const handleClosePopup = () => {
    setSelectedReport(null);
    onReportSelect(null);
    setType(null)
  };

  // Split reports into chunks of 4 per row
  let reports = [];
  if (type === 'exam') {
    reports = examReports;
  } else if (type === 'biometric') {
    reports = bioReports;
  } else if (type === 'miscellaneous') {
    reports = miscellaneousReports;
  }
  const rows = chunkArray(reports, 2);

  return (
    <div className="report-table-container">
      <table className="report-table">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((report) => (
                // <td key={report.id} onClick={() => handleReportClick(report)}>
                // <td key={report.id} onClick={() => handleReportClick(report)}>

                <td key={report.id} onClick={() => {
                  type == 'miscellaneous' && [1,2,6,8,9,10].includes(report.id)
                    ? handleOpenDialog(type, report)
                    : handleReportClick(type,report);
                }}>
                  {report.name}
                </td>
              ))}
              {row.length < 4 && (
                <td colSpan={6 - row.length}></td> // Add empty cells if row has less than 4 items
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {setPwdMatched && selectedReport && (
        <div className="popup">
          <div className="popup-content" style={{overflow:"auto"}}>
            <span className="close-btn" onClick={handleClosePopup}>&times;</span>
            <h4>{selectedReport.name}</h4>
            {/* exam Reports */} 
                {types == 'exam' && selectedReport.id == 1 && <AttendanceReport />}
                {types == 'exam' && selectedReport.id == 2 && <IncompleteReport />}
                {types == 'exam' && selectedReport.id == 3 && <CandidateReport />}
                {types == 'exam' && selectedReport.id == 4 && <TimejustificationReport />}
                {types == 'exam' && selectedReport.id == 5 && <CandidateDurationReport />}
                {types == 'exam' && selectedReport.id == 6 && <TrackingfeedReport />} 
                {/* {types == 'exam' && selectedReport.id == 7 && <examClosureSummary />}  */}

                {types == 'biometric' && selectedReport.id == 3 && <SkipValidation />}
                {types == 'biometric' && selectedReport.id == 2 && <SeatManagement />} 
                {types == 'biometric' && selectedReport.id == 1 && <BiometricApiServices />}


            {/* miscellaneous */}
                {types == 'miscellaneous' && selectedReport.id == 1 && <ExtendBulkTime />}
                {types == 'miscellaneous' && selectedReport.id == 2 && <ChangeMedium />}
                {types == 'miscellaneous' && selectedReport.id == 4 && <ImageDownload />}
                {types == 'miscellaneous' && selectedReport.id == 5 && <DBPatch />}
                {types == 'miscellaneous' && selectedReport.id == 6 && <BulkTimeExtension />}
                {types == 'miscellaneous' && selectedReport.id == 7 && <ScannerUpload />}
                {types == 'miscellaneous' && selectedReport.id == 8 && <CandidateTimeExtension />}
                {types == 'miscellaneous' && selectedReport.id == 9 && <NetbootEnableDisable />}
                {types == 'miscellaneous' && selectedReport.id == 10 && <GraceTimeExtension />}
                {types == 'miscellaneous' && selectedReport.id == 11 && <SecureBrowserEnableDisable />}
               
                
                
          </div>
        </div>
      )}
      {type =='miscellaneous' ?
      <ReusablePasswordDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    onSubmit={handleSubmitPassword}
                    validAccess={handleValidAccess}
                    
                    title="Enter Misc Password"
                    passwordtype={miscPwd}
                    batch=''
        /> : null
      }
    </div>
  );
};

export default ReportTable;
