import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { getCurrentTime, getCurrentFormattedTime, getCurrentDate } from "./utils";
import React, { useState, useEffect } from "react";
var XLSX = require("xlsx");


const CandidateDurationReport = () => {
  const [exam, setExam] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const[subjectDuration, setSubjectDuration] = useState(0);
  const [isDivEnabled, setIsDivEnabled] = useState(false);
  const [countData, setcountData] = useState({

    examDate: 0,
    count_scheduledcandidate: 0,
    count_compcandidate: 0,
    count_incompcandidate: 0,
    count_abcandidate: 0,
    GETSUBJECTSET: [],
    array_values_comp: [],
    array_values_incomp: [],
    array_values_absenties: [],
  });

  const [selectedExam, setselectedExam] = useState(null); // To store selected category
  const [selectedSubject, setselectedSubject] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [mem_no, setmem_no] = useState(null);
    const [time_extended, settime_extended] = useState(null);
    const [duration, setduration] = useState(null);
    const [timeresponses, settimeresponses] = useState(null);
    const [timelogresponses, settimelogresponses] = useState(null);
    const [filterByIdleTime, setFilterByIdleTime] = useState(5);
    const [start_time, setstart_time] = useState(null);
    const [test_status, setTestStatus] = useState(null);
    const [last_updated_time, setlast_updated_time] = useState(null);
    const [total_response_count, settotal_response_count] = useState(null);
    const [submitted, setSubmitted] = useState(false);


    const filterIdleTime = {
      1: " <= 1 Mins.",
      2: " > 1 Mins. and <= 5 Mins.",
      3: " > 5 Mins. and <= 10 Mins.",
      4: " > 10 Mins.",
      5: " All",
    };

      // Function to convert seconds into HH:MM:SS format
  const convertTime = (seconds) => {
    const t = Math.round(seconds);
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t / 60) % 60);
    const secs = t % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };


  const convertToCustomFormat = (isoDateStr) => {
    const date = new Date(isoDateStr);

    // Extract the date parts
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-indexed month
    const year = date.getFullYear();

    // Extract the time parts
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Return in desired format
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleClose = () => {
    setOpenPopup(false);
    setSelectedCandidate(null);
  };
  
  const handleCellClick = async (candidate) => {
  
    setSelectedCandidate(candidate);
    // event.preventDefault(); // Prevent default form submission
    setOpenPopup(true);
    // const examValue = document.getElementById("examid").value;
    // const subjectValue = document.getElementById("subjectid").value;
    const rollnoid = candidate;
    const idletimeValue = 5;
    setFilterByIdleTime(idletimeValue);
  
    // Set submitted value (if needed for backend)
    setSubmitted(true);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/process-justification-exam-data",
        {
          submitted: true,
          examDate: getCurrentFormattedTime('date'), // Adjust as needed
          Exam_Code: selectedExam,
          Subject_code: selectedSubject,
          memno: rollnoid, // Assuming rollno is a string
          filter_by_idle_time: idletimeValue,
        }
      );
      // alert(response.data.success);
      // Handle the response
      if (response.data.success) {
        // console.log("Data processed successfully:", response.data.data_value);
        // const { test_status } = response.data.data.test_status; // Extract test_status from the response
        const firstItem = response.data.data_value[0]; // Assuming the array has at least one object
  
  
        // alert(firstItem.Time.start_time);
        const startTimes = firstItem.Time.map(item => item.start_time);
        const lastUpdatedTimes = firstItem.Time.map(item => item.last_updated_time);
        const TotalResponseCount = firstItem.Time.map(item => item.total_response_count);
  
        // alert(TotalResponseCount);
  
        // Now set the state with the arrays of start_times and last_updated_times
        setstart_time(startTimes);
        setlast_updated_time(lastUpdatedTimes);
        settotal_response_count(TotalResponseCount);
  
        // setTestStatus(firstItem.test_status);
        setTestStatus(rollnoid);
        
        setmem_no(firstItem.mem_no);
        settime_extended(firstItem.time_extended);
        setduration(firstItem.duration);
        settimeresponses(firstItem.responses);
        settimelogresponses(firstItem.timelogresponses);
        const dynamicDataElement = document.querySelector(".dynamic_data");
        if (dynamicDataElement) {
          dynamicDataElement.style.display = "block";
        }
      } else {
        console.error("Error processing data:", response.data.message);
        alert(`Error: ${response.data.message}`); // Display error to user
      }
    } catch (error) {
      console.error("Error making API call:", error);
      alert(
        "An error occurred while processing your request. Please try again later."
      );
    }
  };

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
  const handleSubjectChange = async (event) => {
    const subjectCode = event.target.value;
    setselectedSubject(subjectCode);
  };
  const handleSubmit = async () => {
    if (selectedExam && selectedSubject) {
      try {
        const res = await axios.get(
          "http://localhost:5000/get-candidate-duration-report/",
          {
            params: {
              examCode: selectedExam,
              subjectCode: selectedSubject,
            },
          }
        );
        setSubjectDuration(res.data.subject_duration)
        setcountData({
          examDate: res.data.examDate,
          count_scheduledcandidate: res.data.count_scheduledcandidate,
          count_compcandidate: res.data.count_compcandidate,
          count_incompcandidate: res.data.count_incompcandidate,
          count_abcandidate: res.data.count_abcandidate,
          GETSUBJECTSET: res.data.GETSUBJECTSET,
          array_values_comp: res.data.converted_array_values_comp,
          array_values_incomp: res.data.converted_array_values_incomp,
          array_values_absenties: res.data.converted_array_values_absenties,
        });
        setIsDivEnabled(true);
      } catch (err) {
        console.error(err);
      }
      console.log(subjects);
      // console.log(countData.array_values_comp[0]);
      // alert(countData.array_values_comp[0]);

    }
  };
  const downloadExcel = () => {
    const tables = document.querySelectorAll(".table-to-export");
    const wb = XLSX.utils.book_new();
    const nameArray = [
      "Total Candidate Details",
      "Complete Candidate Details",
      "Incomplete Candidate Details",
      "Absent Candidate Details",
    ];
    tables.forEach((table, index) => {
      const ws = XLSX.utils.table_to_sheet(table);

      // Append the sheet to the workbook with a unique name
      XLSX.utils.book_append_sheet(wb, ws, `${nameArray[index]}`);
    });
    const filename = `candidate_duration_(${countData.examDate})_examcode_(${selectedExam})_subjcode_(${selectedSubject})`;
    // Create a blob and download the Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };
const timeExtendedColor = "#fcd883";
return (
  <div>
    <div className="row mt-3">
      <div className="col-md-6">
        Exam Code: &nbsp;
        <select id="examid" onChange={handleExamChange}>
          <option value="">-Select-</option>
          {exam.map((exam) => (
            <option key={exam.id} value={exam.exam_code}>
              {exam.exam_code}-{exam.exam_name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        Subject Code: &nbsp;
        <select id="subjectid" onChange={handleSubjectChange}>
          <option value="">-Select-</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.subject_code}>
              {subject.subject_code}-{subject.subject_name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-12">
      <button type="submit" className="mt-3" style={{ width: "7vw", padding: "5px", fontSize: "15px" }}
        onClick={handleSubmit}
      >Submit</button>
      </div>
    </div>
    <div
      style={{
        display: isDivEnabled ? "block" : "none",
        opacity: isDivEnabled ? 1 : 0.5,
        pointerEvents: isDivEnabled ? "auto" : "none",
        transition: "opacity 0.5s ease",
      }}
    >
      {/* <div className="row mt-3">
        <div className="col-md-6">Total No.of Candidates Scheduled: {countData.count_scheduledcandidate}</div>
        <div className="col-md-6">Total No.of Candidates Completed: {countData.count_compcandidate}</div>
      </div>
      <div className="row mt-1">
        <div className="col-md-6">Total No.of Candidates In Completed: {countData.count_incompcandidate}</div>
        <div className="col-md-6">Total No.of Candidates Absent: {countData.count_abcandidate}</div>
      </div> */}
<h6 className="mt-3">Total Candidate Details</h6>
<table
        className="mt-3 table-bordered table-to-export table-striped"
        style={{ width: "100%", fontSize: "15px" }}
        border="1"
        cellPadding={2}
        cellSpacing={0}
      >
        <thead>
          <tr className="greybluetext10">
            <th>Scheduled</th>
            <th>Completed</th>
            <th>In Completed</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
            <tr style={{ background: "inherit" }} >
                <td>{countData.count_scheduledcandidate}</td>
                <td>{countData.count_compcandidate}</td>
                <td>{countData.count_incompcandidate}</td>
                <td>{countData.count_abcandidate}</td>
              </tr>
        </tbody>
      </table>

      <h6 className="mt-3">Completed Candidate Details</h6>
      <table
        className="mt-3 table-bordered table-to-export table-striped"
        style={{ width: "100%", fontSize: "15px" }}
        border="1"
        cellPadding={2}
        cellSpacing={0}
      >
        <thead>
          <tr className="greybluetext10">
            <th>S.No.</th>
            <th>Centre Code</th>
            <th>Roll no</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Response Count</th>
            <th>Duration (H:M:S)</th>
            {countData.GETSUBJECTSET.score === "Y" && <th>Score</th>}
            <th>Extended Time (Minutes)</th>
            <th>Attempted Questions Count</th>
          </tr>
        </thead>
        <tbody>
          {countData.array_values_comp.length === 0 ? (
            <tr>
              <td colSpan={15}><b>No data available</b></td>
            </tr>
          ) : (
            countData.array_values_comp.map((element, index) => (
              <tr
                key={index}
                style={{
                  background:
                    element.durationInSec > subjectDuration
                      ? "rgba(241 ,149 ,149 , 0.5)"
                      : element.timeextended > 0
                      ? `${timeExtendedColor}`
                      : "inherit",
                }}
              >
                <td>{index + 1}</td>
                <td>{element.centre_code}</td>
                {/* <td>{element.mem_no}</td> */}
                <td style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} onClick={() => handleCellClick(element.mem_no)}>{element.mem_no}</td>
                <td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.start_time}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.end_time || "NA"}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.total_response_count}
          <br />
        </span>
      ))
    : "NA"}
</td>
                <td>{element.duration}</td>
                <td>{element.timeextended}</td>
                <td>{element.attemptqpcount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h6 className="mt-3">Incomplete Candidate Details</h6>
      <table
        className="mt-3 table-bordered table-to-export"
        style={{ width: "100%", fontSize: "15px" }}
        border="1"
        cellPadding={2}
        cellSpacing={0}
      >
        <thead>
          <tr className="greybluetext10">
            <th>S.No.</th>
            <th>Centre Code</th>
            <th>Roll no</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Response Count</th>
            <th>Duration (H:M:S)</th>
            {countData.GETSUBJECTSET.score === "Y" && <th>Score</th>}
            <th>Extended Time (Minutes)</th>
            <th>Attempted Questions Count</th>
          </tr>
        </thead>
        <tbody>
          {countData.array_values_incomp.length === 0 ? (
            <tr>
              <td colSpan={15}><b>No data available</b></td>
            </tr>
          ) : (
            countData.array_values_incomp.map((element, index) => (
              <tr
                key={index}
                style={{
                  background:
                    element.durationInSec > subjectDuration
                      ? "rgba(241 ,149 ,149 , 0.5)"
                      : element.timeextended > 0
                      ? `${timeExtendedColor}`
                      : "inherit",
                }}
              >
                <td>{index + 1}</td>
<td>{element.centre_code}</td>
<td style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} onClick={() => handleCellClick(element.mem_no)}>{element.mem_no}</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.start_time}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.end_time || "NA"}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.total_response_count}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>{element.duration}</td>
<td>{element.timeextended}</td>
<td>{element.attemptqpcount}</td>


              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Absent Candidate Details */}
      <h6 className="mt-3">Absent Candidate Details</h6>
        <table
          className="mt-3 table-bordered table-to-export"
          style={{ width: "100%", fontSize: "15px" }}
          border="1"
          cellPadding={2}
          cellSpacing={0}
        >
          <thead>
            <tr className="greybluetext10">
              <td><b>S.No.</b></td>
              <td><b>Centre Code</b></td>
              <td><b>Roll no</b></td>
              <td><b>Start Time</b></td>
              <td><b>End Time</b></td>
              <td><b>Response Count</b></td>
              <td><b>Duration (H:M:S)</b></td>
              <td><b>Extended Time (Minutes)</b></td>
              <td><b>Attempted Questions Count</b></td>
            </tr>
          </thead>
          <tbody>
            {countData.array_values_absenties?.length > 0 ? (
              countData.array_values_absenties.map((element, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{element.centre_code}</td>
                  <td>{element.mem_no}</td>
                  <td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.start_time}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.end_time || "NA"}
          <br />
        </span>
      ))
    : "NA"}
</td>
<td>
  {element.Time && element.Time.length > 0
    ? element.Time.map((time, i) => (
        <span key={i}>
          {time.total_response_count}
          <br />
        </span>
      ))
    : "NA"}
</td>
                  <td>{element.duration || "NA"}</td>
                  <td>{element.timeextended || 0}</td>
                  <td>{element.attemptqpcount || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9"><b>No data available</b></td>
              </tr>
            )}
          </tbody>
        </table>


      <button className="mt-3" onClick={downloadExcel} style={{ width: "20%", padding: "5px" }}>
        Download Excel
      </button>
    </div>

    <Dialog
  open={openPopup}
  onClose={handleClose}
  fullWidth
  maxWidth="xl" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
  PaperProps={{
    style: { width: "70%",height: "95%",padding:"20px", marginLeft:"10%" },
  }}
>
<DialogTitle
    sx={{
      textAlign: "center",
      fontWeight: "bold",
      position: "relative",
    }}
  >
<b>Candidate Response Details : {test_status}</b>
    <IconButton
      aria-label="close"
      onClick={handleClose}
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
 <div className="dynamic_data" style={{ display: "none" }}>
          <tr className="greybluetext10">
            <td colSpan={2} align="center">
              
              <tr className="greybluetext10">
                <td colSpan={1} align="center" nowrap>
                  <div align="left">
                    <span style={{ color: "green" }}>
                      <b>
                        Listed {filterIdleTime[filterByIdleTime]} idle time of
                        response
                      </b>
                    </span>
                  </div>
                </td>
                <td colSpan={1} align="center" nowrap>
                  <div align="left">
                    <span>
                      <b>System auto sync logs</b>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td valign="top" width="50%">
                  <table
                  class="table table-bordered table-striped fs-6"
                    // style={{ marginBottom: "20px" }}
                    className="table-bordered"
                    width="100%"
                    border="1"
                    cellSpacing="0"
                    cellPadding="2"
                    align="left"
                  >
                    <thead>
                      <tr className="greybluetext10">
                        <td width="3%">
                          <b>S.No</b>
                        </td>
                        <td width="35%">
                          <b>Response time</b>
                        </td>
                        <td width="7%">
                          <b>Display System timer (H:M:S)</b>
                        </td>
                        <td width="7%">
                          <b>Idle time of response (H:M:S)</b>
                        </td>
                      </tr>
                    </thead>
                    <tbody>

                      {(timeresponses || []).map((response, index) => (
                        <React.Fragment key={response.response_id || index}>
                          {response.response_justification >= 0 &&
                            filterByIdleTime == 5 && (
                              <tr className="greybluetext10">
                                <td valign="top" className="greybluetext10">
                                  {index + 1}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertToCustomFormat(
                                    response.response_time
                                  )}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_client_time)}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_justification)}
                                </td>
                              </tr>
                            )}

                          {response.response_justification > 10 * 60 &&
                            filterByIdleTime == 4 && (
                              <tr className="greybluetext10">
                                <td valign="top" className="greybluetext10">
                                  {index + 1}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertToCustomFormat(
                                    response.response_time
                                  )}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_client_time)}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_justification)}
                                </td>
                              </tr>
                            )}

                          {response.response_justification > 5 * 60 &&
                            response.response_justification <= 10 * 60 &&
                            filterByIdleTime == 3 && (
                              <tr className="greybluetext10">
                                <td valign="top" className="greybluetext10">
                                  {index + 1}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertToCustomFormat(
                                    response.response_time
                                  )}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_client_time)}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_justification)}
                                </td>
                              </tr>
                            )}

                          {response.response_justification > 1 * 60 &&
                            response.response_justification <= 5 * 60 &&
                            filterByIdleTime == 2 && (
                              <tr className="greybluetext10">
                                <td valign="top" className="greybluetext10">
                                  {index + 1}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertToCustomFormat(
                                    response.response_time
                                  )}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_client_time)}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_justification)}
                                </td>
                              </tr>
                            )}

                          {response.response_justification <= 1 * 60 &&
                            filterByIdleTime == 1 && (
                              <tr className="greybluetext10">
                                <td valign="top" className="greybluetext10">
                                  {index + 1}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertToCustomFormat(
                                    response.response_time
                                  )}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_client_time)}
                                </td>
                                <td valign="top" className="greybluetext10">
                                  {convertTime(response.response_justification)}
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td valign="top">
                  <table
                  class="table table-bordered table-striped fs-6"
                    width="80%"
                    border="1"
                    cellSpacing="0"
                    cellPadding="2"
                    align="left"
                  >
                    <thead>
                      <tr className="greybluetext10">
                        <td width="5%">
                          <b>S.No</b>
                        </td>
                        <td width="15%">
                          <b>Log time</b>
                        </td>
                        <td width="10%">
                          <b>Display System timer (H:M:S)</b>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {(timelogresponses || []).map((responselog, index) => (
                        <tr
                          className="greybluetext10"
                          key={responselog.timelog_id || index}
                        >
                          <td valign="top" className="greybluetext10">
                            {index + 1}
                          </td>
                          <td valign="top" className="greybluetext10">
                            {convertToCustomFormat(responselog.timelog_time)}
                          </td>
                          <td valign="top" className="greybluetext10">
                            {convertTime(responselog.timelog_client_time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </td>
          </tr>
        </div>
        </DialogContent>
        </Dialog>
  </div>
  
);

};
export default CandidateDurationReport;
