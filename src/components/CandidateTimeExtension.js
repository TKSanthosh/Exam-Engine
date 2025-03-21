import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import $ from 'jquery';
// require("dotenv").config(); // For environment variables
const SKIPSTATUS = {
  1: "Skip the BioMetric Validation",
  2: "Enable the BioMetric Validation"
};

const SKIPVALIDSELECTMODE = {
  1: "Single Candidate Wise",
  2: "Multiple Candidate Wise",
  3: "All"
};


const CandidateTimeExtension = () => {
  const [batchtime, setBatchtime] = useState([]);
  const [selectedbatchtime, setselectedbatchtime] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [serialNumber, setSerialNumber] = useState('');
  const [formattedResult, setFormattedResult] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionsSingle, setSelectedOptionsSingle] = useState('');
  const [CandidateListValue, setCandidateList] = useState([]);
  const [message, setMessage] = useState("");

  //multiselect_Candidate

  

  const handleMultiSelectChange = (selected) => {
    setSelectedOptions(selected);
  };
  const handleSingleSelectChange = (selected) => {
    setSelectedOptionsSingle(selected);
  };

  const [multiSelectOptions, setMultiSelectOptions] = useState([]);


  useEffect(() => {
    const fetchBatchtime = async () => {
      $(".multiselect_Candidate").hide();
      $(".singleselect_Candidate").hide();
      try {
        const res = await axios.get("http://localhost:5000/get-batch-time");
        
        // Log the response for debugging
        console.log("Batch time response:", res.data);
       
  
        // Assume the response contains `result` key with array
        setBatchtime(res.data.result || []); // Default to an empty array if `result` is missing
      } catch (err) {
        console.error("Error fetching batch times:", err);
      }
    };
  
    fetchBatchtime();
  }, []);
  


  const handlebatchtime = async (event) => {
    const batchtime_val = event.target.value;
    setselectedbatchtime(batchtime_val);
  
    try {
      // Use GET request to fetch candidate list
      const res = await axios.get("http://localhost:5000/get-candidate-list", {
        params: { batchtime: batchtime_val }, // Send batchtime as query parameter
      });
  
      // Log the response for debugging
      console.log("Batch time response:", res.data);
  
      // Assuming response contains a `result` array
      // You want to add the result to the options array, without replacing it
      const updatedOptions = [
        ...multiSelectOptions,  // Keep the original options
        ...res.data.result.map((candidate) => ({
          value: candidate.membership_no,  // Assuming result contains `membership_no`
          label: candidate.membership_no,  // You can customize the label
        }))
      ];
  
      // Set the updated options in state
      setMultiSelectOptions(updatedOptions);
  
    } catch (err) {
      console.error("Error fetching batch times:", err);
      alert("Error fetching data. Please try again later.");  // More user-friendly alert
    }
  };
  
  const handleblockmode = async (event) => {
    const blockmode_val = event.target.value;
    setSelectedStatus(blockmode_val);
  };

  const handlebiostatus = async (event) => {
    
    const biostatus_val = event.target.value;
    setSelectedMode(biostatus_val);
    // alert(biostatus_val);
    if(biostatus_val=='1'){
      $(".multiselect_Candidate").hide();
      $(".singleselect_Candidate").show();
    }else if(biostatus_val=='2'){
      $(".multiselect_Candidate").show();
      $(".singleselect_Candidate").hide();
    }else{
      $(".multiselect_Candidate").hide();
      $(".singleselect_Candidate").hide();
    }
  };

  

  useEffect(() => {
    
    fetch('http://localhost:5000/serial-number')
      .then(response => response.json())
      .then(data => {
        setSerialNumber(data.serialNumber);
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const batchtimeValue = document.getElementById("batchtime").value;
    const blockmodeValue = document.getElementById("blockmode").value;
    // const biostatusValue = document.getElementById("biostatus").value;
    const extentedtimeValue = document.getElementById("extentedtime").value;
    if (!batchtimeValue) {
      alert("Please select batch time");
      return;
    }
    if (!blockmodeValue) {
      alert("Please select Mode");
      return;
    }
    // if (!biostatusValue) {
    //   alert("Please select status");
    //   return;
    // }

    if (!extentedtimeValue) {
      alert("Please enter time");
      return;
    }

    let candidateList = '';
    if(blockmodeValue=='2'){
      candidateList = selectedOptions.map(option => option.value)
    }else if(blockmodeValue=='1'){
      // candidateList = selectedOptionsSingle ;
      if (!selectedOptionsSingle) {
        alert("Please select a candidate");
        return;
      }
      candidateList = selectedOptionsSingle.value; // Single-select
      
    }else{
      candidateList = '';
    }
    // alert(batchtimeValue);
    // alert(blockmodeValue);
    // alert(extentedtimeValue);
    // alert(candidateList);
       try {
      const response = await axios.post(
        "http://localhost:5000/candidate-time-extend",
        {
          batchtime:batchtimeValue,
          blockmode:blockmodeValue,
          // biostatus:biostatusValue,
          serialNumber:serialNumber,
          // admin_ipv4:serialNumber,
          candidateList: candidateList,
          extentedtime: extentedtimeValue

        }
      );
      // alert(response.data.success);
      // Handle the response
      if (response.data.message === 'success') {
        alert(`${extentedtimeValue} minutes time extended successfully`);
      } else {
        console.error("Error processing data:", response.data.message);
        alert(`${response.data.message}`); // Display error to user
      }
      
} catch (error) {
  console.error("Error making API call:", error);
  alert(
    "An error occurred while processing your request. Please try again later."
  );
}};

  return (
    <>
  <form onSubmit={handleSubmit}>
  <div className="container mt-4">
  <div className="row">
    <div className=" mt-3 col-md-6">
  {/* Batch Time */}
  <div className="col-12 text-start">
    <label htmlFor="batchtime">Batch Time :</label>
  </div>
  <div className="col-12">
    <select
      id="batchtime"
      onChange={handlebatchtime}
      className="form-select"
    >
      <option value="">-Select-</option>
      {batchtime.map((batchtime) => (
        <option key={batchtime.slot_time} value={batchtime.slot_time}>
          {batchtime.slot_time}
        </option>
      ))}
    </select>
  </div>
</div>

<div className="mt-3 col-md-6">
  {/* Batch Time */}
  <div className="col-12 text-start">
  <label htmlFor="blockmode">Mode :</label>
  </div>
  <div className="col-12">
  <select
          id="blockmode"
          onChange={handlebiostatus}
          className="form-select"
        >
          <option value="">-Select-</option>
          {Object.entries(SKIPVALIDSELECTMODE).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
  </div>
</div>
</div>
<div className="row">
    {/* <div className="mt-3 col-md-6">
      <div className="col-12 text-start">
        <label htmlFor="biostatus">Status :</label>
      </div>
      <div className="col-md-12">
        <select
          id="biostatus"
          onChange={handleblockmode}
          className="form-select"
        >
          <option value="">-Select-</option>
          {Object.entries(SKIPSTATUS).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>
      </div> */}
      {/* Candidate List */}
      <div className="mt-3 col-md-6 multiselect_Candidate">
      <div className="col-12 text-start">
        <label htmlFor="candidateList">Candidate List :</label>
      </div>
      <div className="col-md-12">
        <Select
          options={multiSelectOptions}
          isMulti
          onChange={handleMultiSelectChange}
          value={selectedOptions}
          placeholder="Select options..."
        />
      </div>
      </div>

      <div className="mt-3 col-md-6 singleselect_Candidate">
  {/* Candidate List */}
  <div className="col-12 text-start">
    <label htmlFor="candidateList">Candidate List :</label>
  </div>
  <div className="col-12">
    <Select
      id="candidate_list_id"
      options={multiSelectOptions} // Options for the dropdown
      onChange={handleSingleSelectChange} // Handler for selection
      value={selectedOptionsSingle} // Selected value (single)
      placeholder="Select an option..."
      isSearchable={true} // Enables search functionality
    />
  </div>
</div>
<div className="mt-3 col-md-6">
    {/* Batch Time */}
    <div className="col-12 text-start">
      <label htmlFor="extentedtime">Time (Minutes):</label>
    </div>
    <div className="col-12">
      <input
        id="extentedtime"
        type="number"
        className="form-control"
        // maxLength={15}
        // onChange={handlepassword}
        placeholder="Enter Time"
        min="0"
        max="60"
      />
    </div>
  </div>
    
    </div>

    {/* <div className="row">
 
</div> */}


    {/* Submit Button */}
    <div className=" mt-3 col-md-12">
      <div className="col-md-12 text-center">
        <button className="p-2" type="submit">
          Submit
        </button>
      </div>
    </div>

  </div>
</form>


      {/* {submitted === 'true' && ( */}
    </>
  );
};

export default CandidateTimeExtension;
