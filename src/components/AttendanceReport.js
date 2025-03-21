import React, { useEffect, useState } from "react";
import axios from "axios";
// function formatDate(dateString) {
//   return new Date(dateString).toISOString().split("T")[0];
// }

function formatDate(dateString) {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);
  return utcDate.toISOString().split('T')[0];
}
const AttendanceReport = () => {
  const [attendanceReport, setData] = useState([]);

  // const [examData, setExamData] = useState([]);
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/attendance-report/1`);
        const attendanceReport = await response.json();
        // alert(attendanceReport);
        setData(attendanceReport); // Update state with the fetched data
        // console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExamData();
    // setInterval(() => fetchExamData(), 50000);
  }, []);

  const totals = attendanceReport.reduce(
    (acc, row) => {
        acc.totalCandidates += row.total_candidates;
        acc.totalAttempted += row.total_attempted;
        acc.totalIncomplete += row.incomplete;
        acc.totalComplete += row.complete;
        return acc;
    },
    {
        totalCandidates: 0,
        totalAttempted: 0,
        totalIncomplete: 0,
        totalComplete: 0,
    }
);

  return (
    <div>
      <div className="row">
                <div className='container'>
                <table className="table table-bordered table-striped fs-6 mt-4">
                    <thead>
                    <tr>
                        <th>Exam Date</th>
                        <th>Time Slot</th>
                        <th>Total Candidates</th>
                        <th>Attended</th>
                        <th>In Complete</th>
                        <th>Complete</th>
                    </tr>
                    </thead>
                        <tbody>
                        {
                        ((attendanceReport.length) == 0) ? (
                            <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                No Attendance Report Available
                            </td>
                            </tr>
                        ) : 
                        (
                          <>
                            {attendanceReport.map((row, index) => (
                              <tr key={index}>
                                <td>{formatDate(row.exam_date)}</td>
                                <td>{row.exam_time}</td>
                                <td>{row.total_candidates}</td>
                                <td>{row.total_attempted}</td>
                                <td>{row.incomplete}</td>
                                <td>{row.complete}</td>
                              </tr>
                            ))}
                            <tr>
                              <td colSpan="2" className="fw-bold">Total</td>
                              <td>{totals.totalCandidates}</td>
                              <td>{totals.totalAttempted}</td>
                              <td>{totals.totalIncomplete}</td>
                              <td>{totals.totalComplete}</td>
                            </tr>
                          </>
                        )}
                        
                        
                        </tbody>
                </table>
        </div>
      </div>
    </div>
  );
};
export default AttendanceReport;
