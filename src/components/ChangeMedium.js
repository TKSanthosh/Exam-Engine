import React, { useState } from "react";
import axios from "axios";

const ChangeMedium = () => {
  const [displayMedium, setDisplayMedium] = useState("");
  const [message, setMessage] = useState("");
  const [changeMedium, setChangeMedium] = useState([]);
  const [changedMedium, setChangedMedium] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isDivEnabled, setIsDivEnabled] = useState(false);
  const handleRollNo = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/get-medium/${rollNo}`);
      setDisplayMedium(res.data.candidateDisplayMedium);
      setChangeMedium(res.data.subjectLangNamesArray);
      setIsDivEnabled(true);
    } catch (err) {
      console.error(err);
    }
  };

  const changeCandidateMedium = async () => {
    try {
      if(changedMedium!=0){
      const res = await axios.get("http://localhost:5000/change-medium/", {
        params: {
          rollNo,
          changedMedium,
        },
      });
      if (res.data === "success") {
        setMessage(`Candidate Medium has changed to ${changedMedium}`);
        setDisplayMedium(changedMedium);
      } else if (res.data === "failure") {
        setMessage(`Candidate Medium hasn't changed to ${changedMedium}`);
      }}else{
        setMessage(`Select appropriate medium`);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div class="container" style={{ marginLeft: "-230px" }}>
      <div className="card shadow">
        <div class="card-body">
          <div class="form-group" style={{marginTop:"30px"}}>
            <label for="rollNo" class="font-weight-bold"  style={{marginBottom:"4px",marginTop:"5px"}}>
              Roll No:
            </label>
            <input
              type="text"
              id="rollNo"
              className="form-control"
              placeholder=" Membership Number"
              onChange={(e) => setRollNo((prev) => [...prev, e.target.value])}
              style={{width:"80%"}}
            ></input>
          </div>

          <br></br>
          <button
            type="submit"
            onClick={handleRollNo}
            style={{
              width: "8vw",
              padding: "5px",
              fontSize: "15px",
            }}
          >
            Submit
          </button>

          <div
            style={{
              display: isDivEnabled ? "block" : "none",
              opacity: isDivEnabled ? 1 : 0.5,
              pointerEvents: isDivEnabled ? "auto" : "none",
              transition: "opacity 0.5s ease",
            }}
          >
            <p class="text-center font-italic mt-3">
              Medium of the Candidate:{" "}
              <span id="currentMedium">{displayMedium}</span>
            </p>
            <br></br>

            {changeMedium.length !== 0 ? (
              <>
                <div className="form-group mt-3">
                  <label className="font-weight-bold">Select New Medium:</label>
                  <select
                    class="form-control"
                    onChange={(e) => {
                      setChangedMedium(e.target.value);
                    }}
                  >
                    <option value="0">-SELECT-</option>
                    {changeMedium.map((mediums) => (
                      <option value={mediums} key={mediums.id}>
                        {mediums}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={changeCandidateMedium}
                  style={{
                    width: "8vw",
                    padding: "5px",
                    fontSize: "15px",
                  }}
                  className="mt-2"
                >
                  Change
                </button>
              </>
            ) : (
              <span>No other subjects available</span>
            )}

            {message !== "" ? (
              <div
                id="statusMessage"
                className="alert alert-info mt-2"
                style={{width:"32vw",marginLeft: "-15px;"}}
              >
                <span id="newMediumMessage" style={{fontSize:"15px"}}>{message}</span>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeMedium;
