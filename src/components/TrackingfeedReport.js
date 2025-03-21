import axios from "axios";
import React, { useState, useEffect } from "react";

const TrackingfeedReport = () => {
  const [feedCount, setFeedCount] = useState(0);
  const [feedCentercode, setCentercode] = useState(0);
  const [qpFiles, setQpFiles] = useState([]);
  const [feedData, setFeedData] = useState({
    feed_count: 0,
    feed_list: []
  });

  useEffect(() => {
    const fetchFeedCounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/count-files');
        const data = await response.json();
        console.log('feed cnt', data.feedCount);
        setFeedCount(data.feedCount);
      } catch (error) {
        console.error('Error fetching file counts:', error);
      }
    };

    const fetchCentercode = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-centercode");
        setCentercode(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchQPFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/qp-files');
        setQpFiles(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchFeedList = async () => {
      try {
        const response = await axios.get('http://localhost:5000/feed-list');
        setFeedData(response.data);
      } catch (error) {
        console.error('Error fetching feed list:', error);
      }
    };

    

    // Initial fetch
    fetchFeedCounts();
    fetchCentercode();
    fetchQPFiles();
    fetchFeedList();
    
    // Set up interval to fetch data every 1 minute (60,000 milliseconds)
    const intervalId = setInterval(fetchFeedCounts, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


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

  return (
    <div>
      <table class="table table-bordered table-striped fs-6 mt-4" width="100%" border="1" cellSpacing="1" cellPadding="1">
  <thead>
    <tr>
      <th width="10%">Centre Code</th>
      <th width="10%">Server</th>
      <th width="10%">No of Feed Files Generated</th>
    </tr>
  </thead>
  <tbody>
    {feedCentercode && feedCentercode.map((feed, index) => (
      <tr key={index}>
        <td>{feed.center_code}</td>
        <td>{feed.serverno}</td>
        <td>{feedCount}</td> {/* Assuming feedCount is constant or calculated elsewhere */}
      </tr>
    ))}
  </tbody>
</table>


      <br />

      <table class="table table-bordered table-striped fs-10 mt-4" width="100%" border="1" cellSpacing="1" cellPadding="1">
      <thead>
        <tr>
          <th width="30%" colSpan="3">
            <center>QP Files Downloaded</center>
          </th>
        </tr>
        {qpFiles.length > 0 ? (
          <>
            <tr>
              <th width="10%">Downloaded File</th>
              <th width="10%">Download Status</th>
              <th width="10%">Download Time</th>
            </tr>
          </>
        ) : (
          <tr>
            <td width="30%" colSpan="3">QP not downloaded yet</td>
          </tr>
        )}
      </thead>
      <tbody>
        {qpFiles.length > 0 &&
          qpFiles.map((file, index) => (
            <tr key={index}>
              <td width="10%">{file.download_sec_disp}</td>
              <td width="10%" dangerouslySetInnerHTML={{ __html: file.status_final }}></td>
              <td width="10%">{convertToCustomFormat(file.download_time)}</td>
            </tr>
          ))}
      </tbody>
    </table>

      <br />

      <table class="table table-bordered table-striped fs-10 mt-4" width="100%" border="1" cellSpacing="1" cellPadding="1">
      <thead>
  <tr>
    <td width="30%" colSpan="5">
      <center><b>Feed File List</b></center>
    </td>
  </tr>
  <tr>
    <td width="3%"><b>S.No</b></td>
    <td width="17%" colSpan="2"><b>Feed List</b></td>
    <td width="10%"><b>Feed Time</b></td>
    <td width="10%"><b>Sync Status</b></td>
  </tr>
</thead>
<tbody>
  {feedData.feed_count > 0 ? (
    feedData.feed_list.map((file, index) => (
      <tr key={index}>
        <td width="3%">{index + 1}</td>
        <td width="17%" colSpan="2">{file.file_name}</td>
        <td width="10%">{convertToCustomFormat(file.file_name_time)}</td>
        <td width="10%">{file.status === "Y" ? "Success" : "Pending"}</td>  {/* Display status or default to "N/A" */}
      </tr>
    ))
  ) : (
    <tr>
      <td width="30%" colSpan="4" className="text-center">No records found</td>
    </tr>
  )}
</tbody>

    </table>
    </div>
  );
};

export default TrackingfeedReport;
