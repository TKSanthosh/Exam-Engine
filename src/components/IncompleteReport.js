import React, { useEffect, useState } from "react";
// import axios from "axios";
// function formatDate(dateString) {
//   return new Date(dateString).toISOString().split("T")[0];
// }
const IncompleteReport = () => {
  const [IncompleteReport, setData] = useState([]);

  // const [examData, setExamData] = useState([]);
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/incomplete-status-report/2`);
        const IncompleteReport = await response.json();
        // alert(IncompleteReport);
        setData(IncompleteReport); // Update state with the fetched data
        // console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExamData();
    // setInterval(() => fetchExamData(), 50000);
  }, []);

  return (
    <div className="container">
      <table className="table table-bordered table-striped fs-6 mt-4">
        <thead>
          <tr>
            <td className="fw-bold">Incomplete Candidates</td>
            <td colSpan="3">{IncompleteReport.length}</td>
          </tr>
          <tr className="fw-bold">
            <td>Membership No</td>
            <td>Exam Code</td>
            <td>Subject Code</td>
            <td>Start Time</td>
          </tr>
        </thead>
        <tbody>
          {IncompleteReport.length > 0 ? (
            IncompleteReport.map((row, index) => (
              <tr key={index}>
                <td>{row.membership_no}</td>
                <td>{row.exam_code}</td>
                <td>{row.subject_code}</td>
                <td>{row.start_time_mod}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No Data Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
};
export default IncompleteReport;
