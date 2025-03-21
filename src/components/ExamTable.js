import React, { useEffect, useState } from 'react';
import './Admin.css'; // Ensure you add CSS for the loader and styling


// function formatDate(dateString) {
//   return new Date(dateString).toISOString().split('T')[0];
// }

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  const year = date.getFullYear(); // Get full year
  return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
}

const ExamTable = ({username, onExamDataUpdate }) => {
const [examData, setExamData] = useState([]);
// console.log('Exammm'+centrecode);
 
useEffect(() => {
    // Function to fetch data from the server
    const fetchExamData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/exam-data/${username}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            // console.log('exam table',data);
          setExamData(data);
          onExamDataUpdate(data); // Pass the data to the parent component
        } else {
          console.error('Fetched data is not an array:', data);
          setExamData([]);
          onExamDataUpdate([]); // Pass empty array to the parent
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        onExamDataUpdate([]); // Pass empty array to the parent in case of error
      }
    };
  
    // Call the fetch function immediately and then every 10 seconds
    fetchExamData();

    const intervalId = setInterval(fetchExamData, 10000); // 10000ms = 10 seconds
  
    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [username,onExamDataUpdate]);

//   console.log('ExamData',examData[0].exam_date);
  return (
    <div>
     <div className='row'>
        <div className='container'>
        <table className="table table-bordered table-striped schedulevtable">
            <thead>
            <tr>
                <th>Exam Date</th>
                <th>Batch</th>
                <th>Scheduled</th>
                <th>In Complete</th>
                <th>Complete</th>
            </tr>
            </thead>
                <tbody>
                {((examData.length) === 0 || examData[0].exam_date == null) ? (
                    <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                        No Exam Data Available
                    </td>
                    </tr>
                ) : (
                    examData.map((row, index) => (
                    <tr key={index}>
                        <td>{formatDate(row.exam_date)}</td>
                        <td>{row.zone_code}</td>
                        <td>{row.totalScheduled}</td>
                        <td>{row.totalIncomplete}</td>
                        <td>{row.totalComplete}</td>
                    </tr>
                    ))
                )}
                </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default ExamTable;
