import { useEffect, useState } from "react";
import MiscellaneousPasswordDialog from "./MiscellaneousPasswordDialog";
import axios from "axios";

const ExtendBulkTime = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [examTime, setExamTime] = useState([]);

  useEffect(() => {
    const fetchExamTime = async () => {
      try {
        const res = await axios.get("http://localhost:5000/exam-time-dropdown");
        setExamTime(res.data);
        console.log(examTime);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExamTime();
  }, []);

  const handleSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {/* {isAuthenticated ? ( */}
      <div>
        Exam Time : &nbsp;&nbsp;
        <select>
          <option value="">-Select-</option>
          {examTime.map((time) => (
            <option key={time.id} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
			<input type='button' className="button" name='sub' value='Change Time' onClick='submitForm();'/>

      {/* ) : (
        <MiscellaneousPasswordDialog onSuccess={handleSuccess} />
      )} */}
    </div>
  );
};

export default ExtendBulkTime;
