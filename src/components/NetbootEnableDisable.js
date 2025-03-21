import React, { useEffect, useState } from "react";
import axios from "axios";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const NetbootEnableDisable = () => {
  const [enableDisable, setEnableDisable] = useState("N");
  const [message,setMessage] = useState("");
  useEffect(() => {
    try {
      const fetchValue = async () => {
        const res = await axios.get("http://localhost:5000/examSettings", {
          params: {
            variable: "netboot",
          },
        });
        console.log(res);
        if ((res.status == 200)) {
          setEnableDisable(res.data.value);
        }
      };
      fetchValue();
    } catch (err) {
      console.error(
        "Error while fetching variable value from exam_settings - netboot"
      );
    }
  }, []);

  const handleChange=(event)=>{
    setEnableDisable(event.target.value); // Update state with the selected value
  }
  const handleEnableDisableChange= async()=>{
    try{
        const res = await axios.post("http://localhost:5000/updateExamSettings",{
                variable : "netboot",
                value: enableDisable 
        })
        console.log(res)
        if(res.status == 200){
            if(res.data.returnValue == "Enabled")
                {setMessage("Netboot enabled successfully")}
            else{
                setMessage("Netboot disabled successfully")
            }
        }else{
            setMessage("Error updating setting")
        }
    }catch(err){
        console.error(err)
    }
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: 4,
        maxWidth: 400,
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 3,
        mt: 7,
      }}
    >
        
      <FormControl>
        <Typography variant="h6" component="h1" sx={{ mb: 2 }}>
          Netboot{" "}
        </Typography>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={enableDisable}
          onChange={handleChange}
          name="radio-buttons-group"
        >
          <FormControlLabel value="Y" control={<Radio />} label="Enable" />
          <FormControlLabel value="N" control={<Radio />} label="Disable" />
        </RadioGroup>
        <Button variant="contained" onClick={handleEnableDisableChange}>Submit</Button>
        </FormControl>

        {message && (
    <Typography
      variant="body1"
      color={message ? "green" : "error"}
    >
      {message}
    </Typography>
  )}
    </Box>
  );
};

export default NetbootEnableDisable;
