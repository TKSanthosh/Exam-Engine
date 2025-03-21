import axios from "axios";
import React, { useState, useEffect } from "react";
import { getCurrentTime,getCurrentFormattedTime,getCurrentDate } from './utils';


const TimejustificationReport = () => {
  const [exam, setExam] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rollno, setRollno] = useState([]);
  const [filterByIdleTime, setFilterByIdleTime] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const [selectedExam, setselectedExam] = useState(null); // To store selected category
  const [selectedSubject, setselectedSubject] = useState(null);
  const [selectedrollno, setselectedrollno] = useState(null);
  const [responcetimeChangeval, setresponcetimeChange] = useState(null);

  const [test_status, setTestStatus] = useState(null);
  const [start_time, setstart_time] = useState(null);
  const [last_updated_time, setlast_updated_time] = useState(null);
  const [total_response_count, settotal_response_count] = useState(null);
  const [mem_no, setmem_no] = useState(null);
  const [time_extended, settime_extended] = useState(null);
  const [duration, setduration] = useState(null);
  const [timeresponses, settimeresponses] = useState(null);
  const [timelogresponses, settimelogresponses] = useState(null);
  

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
    const examCode = selectedExam;
    setselectedSubject(subjectCode);
    try {
      const res = await axios.get(
        `http://localhost:5000/rollno-dropdown/${examCode}/${subjectCode}`
      );
      setRollno(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollnoChange = async (event) => {
    const rollno = event.target.value;
    // const examCode = selectedExam;
    setresponcetimeChange(rollno);
    // try {
    //   const res = await axios.get(`http://localhost:5000/rollno-dropdown/${examCode}/${subjectCode}`);
    //   setRollno(res.data);
    // } catch (err) {
    //   console.error(err);
    // }
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

  const responcetimeChange = async (event) => {
    const time = event.target.value;
    // const examCode = selectedExam;
    setselectedrollno(time);
    setFilterByIdleTime(time);
    // try {
    //   const res = await axios.get(`http://localhost:5000/rollno-dropdown/${examCode}/${subjectCode}`);
    //   setRollno(res.data);
    // } catch (err) {
    //   console.error(err);
    // }
  };

  const filterIdleTime = {
    1: " <= 1 Mins.",
    2: " > 1 Mins. and <= 5 Mins.",
    3: " > 5 Mins. and <= 10 Mins.",
    4: " > 10 Mins.",
    5: " All",
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

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const examValue = document.getElementById("examid").value;
    const subjectValue = document.getElementById("subjectid").value;
    const rollnoValue = document.getElementById("rollnoid").value;
    const idletimeValue = document.getElementById("idletimeid").value;
    // alert(rollnoValue);
    if (!examValue) {
      alert("Please select exam code");
      return;
    }
    if (!subjectValue) {
      alert("Please select subject code");
      return;
    }
    if (!rollnoValue) {
      alert("Please select roll no");
      return;
    }
    if (!idletimeValue) {
      alert("Please select response idle time");
      return;
    }

    // Set submitted value (if needed for backend)
    setSubmitted(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/process-exam-data",
        {
          submitted: true,
          examDate: getCurrentFormattedTime('date'), // Adjust as needed
          Exam_Code: exam,
          Subject_code: subjects,
          memno: rollnoValue, // Assuming rollno is a string
          filter_by_idle_time: filterByIdleTime,
        }
      );
      // alert(response.data.success);
      // Handle the response
      if (response.data.success) {
        console.log("Data processed successfully:", response.data.data_value);
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

        setTestStatus(firstItem.test_status);
        // setstart_time(firstItem.Time.start_time);
        // setlast_updated_time(firstItem.Time.last_updated_time);
        // settotal_response_count(firstItem.total_response_count);
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

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="row mt-3">
            <div className="col-md-6">
              Exam Code : &nbsp;
              <select
                id="examid"
                onChange={handleExamChange}
                style={{ width: "200px" }}
              >
                <option value="">-Select-</option>
                {exam.map((exam) => (
                  <option key={exam.id} value={exam.exam_code}>
                    {exam.exam_code}-{exam.exam_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Subject Code : &nbsp;
              <select
                id="subjectid"
                onChange={handleSubjectChange}
                style={{ width: "200px" }}
              >
                <option value="">-Select-</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.subject_code}>
                    {subject.subject_code}-{subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              &nbsp; &nbsp; &nbsp; Roll No : &nbsp;
              <select
                id="rollnoid"
                onChange={handleRollnoChange}
                style={{ width: "200px" }}
              >
                <option value="">-Select-</option>
                {rollno.map((roll) => (
                  <option key={roll.membership_no} value={roll.membership_no}>
                    {roll.membership_no}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              Response Idle Time : &nbsp;
              <select id="idletimeid" onChange={responcetimeChange}>
                <option value="">-Select-</option>
                {Object.entries(filterIdleTime).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button class="p-2" type="submit">Submit</button>
      </form>

      {/* {submitted === 'true' && ( */}
      <>
        <div className="dynamic_data" style={{ display: "none" }}>
          <tr className="greybluetext10">
            <td colSpan={2} align="center" nowrap>
              <div align="left">
                <span>
                  <b>{test_status} candidate details</b>
                </span>
              </div>
            </td>
          </tr>
          <tr className="greybluetext10">
            <td colSpan={2} align="center">
              <table class="table table-bordered table-striped fs-6"
                style={{ marginBottom: "20px" }}
                className="table-bordered"
                width="100%"
                border="1"
                cellSpacing="0"
                cellPadding="2"
                align="left"
              >
                <thead>
                  <tr className="greybluetext10">
                    <td width="1%">
                      <b>S.No.</b>
                    </td>
                    <td width="10%">
                      <b>Roll no</b>
                    </td>
                    <td width="15%">
                      <b>Start Time</b>
                    </td>
                    <td width="15%">
                      <b>End Time</b>
                    </td>
                    <td width="15%">
                      <b>Response Count</b>
                    </td>
                    {/* <td width="43%">
                      <b>
                        <span style={{ paddingRight: '20%' }}>Start Time</span>
                        <span style={{ paddingRight: '20%' }}>End Time</span>
                        <span>Response Count</span>
                      </b>
                    </td> */}
                    <td width="3%">
                      <b>Duration (H:M:S)</b>
                    </td>
                    <td width="3%">
                      <b>Extended Time (Minutes)</b>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {
                    <tr className="greybluetext10">
                      <td valign="top" className="greybluetext10">
                        1
                      </td>{" "}
                      <td valign="top" className="greybluetext10">
                        {mem_no}
                      </td>{" "}

                      <td valign="top" className="greybluetext10">
                      {start_time && start_time.length > 0 ? (
  start_time.map((time, i) => (
    <span key={i}>
      {convertToCustomFormat(time)}
      <br />
    </span>
  ))
) : (
  "NA"
)}
</td>
<td valign="top" className="greybluetext10">
{last_updated_time && last_updated_time.length > 0 ? (
  last_updated_time.map((time, i) => (
    <span key={i}>
      {convertToCustomFormat(time)}
      <br />
    </span>
  ))
) : (
  "NA"
)}
</td>
<td valign="top" className="greybluetext10">
  {total_response_count && total_response_count.length > 0 ? (
    total_response_count.map((count, i) => (
      <span key={i}>
        {count} {/* Display the individual count */}
        <br />
      </span>
    ))
  ) : (
    "NA"
  )}
</td>
{/* <td valign="top" className="greybluetext10">
        {total_response_count}
      </td> */}


                      <td valign="top" className="greybluetext10">
                        {duration}
                      </td>{" "}
                      {/* Static value */}
                      <td valign="top" className="greybluetext10">
                        {time_extended}
                      </td>{" "}
                    </tr>
                  }
                </tbody>
              </table>
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
                      {/* {arrayTimelog.map((timelogVal, timelogKey) => (
                        <tr className='greybluetext10' key={timelogKey}>
                          <td valign="top" className="greybluetext10">{timelogVal.timelog_time}</td>
                          <td valign="top" className="greybluetext10">
                            {timelogVal.timelog_client_time !== 'D' ? convertTime(timelogVal.timelog_client_time) : 'Exited'}
                          </td>
                        </tr>
                      ))} */}
                    </tbody>
                  </table>
                </td>
              </tr>
            </td>
          </tr>
        </div>
      </>
    </>
  );
};

export default TimejustificationReport;
