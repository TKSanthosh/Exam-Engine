const db = require("./connect");
const os = require('os');
const fs = require("fs");
const path = require("path")
const CONFIG_PATH = path.join(__dirname, "./ip.json");
const crypto = require('crypto');
const { exec } = require("child_process");
const { spawn } = require("child_process");

/**
 * Formats a given date string into 'YYYY-MM-DD' format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
const formatExamDate = (dateString) => {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);
  return utcDate.toISOString().split("T")[0];
};


const formatExamDateDMY = (dateString) => {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);

  const day = String(utcDate.getDate()).padStart(2, "0");
  const month = String(utcDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = utcDate.getFullYear();

  return `${day}-${month}-${year}`;
};

// Example usage
console.log(formatExamDate("2023-12-31T23:45:00")); // Output: 31-12-2023


/**
 * Updates a password based on a mapping object.
 * @param {string} pwd - The original password.
 * @param {Object} arValue - Mapping object for character replacement.
 * @returns {string} - The updated password.
 */
const getUpdatedPwd = (pwd, arValue) => {
  return pwd
    .split("")
    .map((char) => arValue[char] || char)
    .join("");
};

/**
 * Fetches the center code and server number.
 * @returns {Promise<Object>} - Resolves with the center code and server number.
 */
// const centreAndServerNo = () => {
//   const query = "SELECT centre_code, serverno FROM qp_download";
//   // const query = "SELECT center_code, serverno FROM autofeed";
//   return new Promise((resolve, reject) => {
//     db.query(query, (err, rows) => {
//       if (err) {
//         console.error("Database query error:", err);
//         return reject("Internal Server Error");
//       }
//       // console.log(rows[0]);
//       resolve({
//         centre_code: rows[0]?.centre_code,
//         serverno: rows[0]?.serverno,
//       });
//     });
//   });
// };

const centreAndServerNo = async () => {
  try {
    // Check if the table exists
    const tableCheckQuery = `SHOW TABLES LIKE 'qp_download'`;
    const tableExists = await new Promise((resolve, reject) => {
      db.query(tableCheckQuery, (err, result) => {
        if (err) {
          console.error("Database error during table check:", err);
          return reject("Internal Server Error");
        }
        resolve(result.length > 0); // true if table exists
      });
    });

    if (!tableExists) {
      console.warn("Table does not exist.");
      throw new Error("Table does not exist.");
    }

    // Query to fetch centre_code and serverno
    const query = "SELECT centre_code, serverno FROM qp_download";
    const result = await new Promise((resolve, reject) => {
      db.query(query, (err, rows) => {
        if (err) {
          console.error("Database query error:", err);
          return reject("Internal Server Error");
        }
        resolve(rows);
      });
    });

    return {
      centre_code: result[0]?.centre_code || null,
      serverno: result[0]?.serverno || null,
    };

  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

/**
 * Retrieves subject settings or details for a specific subject.
 * @param {string} subjectCode - Subject code (optional).
 * @returns {Promise<Object>} - Subject settings or details.
 */
const getSubExamSet = (subjectCode = "") => {
  const query =
    subjectCode === ""
      ? "SELECT subject_code, display_score, display_result FROM iib_exam_subjects"
      : "SELECT display_score, display_result FROM iib_exam_subjects WHERE subject_code = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [subjectCode], (err, rows) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(err);
      }
      if (subjectCode) {
        resolve({
          score: rows[0]?.display_score,
          result: rows[0]?.display_result,
        });
      } else {
        const subjectSettings = {};
        rows.forEach((row) => {
          subjectSettings[row.subject_code] = {
            SCORE: row.display_score,
            RESULT: row.display_result,
          };
        });
        resolve(subjectSettings);
      }
    });
  });
};

/**
 * Converts buffer data to readable values in an array.
 * @param {Array} arrayConvert - Array of objects containing buffer data.
 * @returns {Array} - Updated array with converted values.
 */
const convertBufferDataAsValue = (arrayConvert) => {
  return arrayConvert.map((item) => ({
    ...item,
    Time: item.Time?.map((timeObj) => ({
      ...timeObj,
      start_time: Buffer.isBuffer(timeObj.start_time)
        ? timeObj.start_time.toString("utf8")
        : timeObj.start_time,
      end_time: Buffer.isBuffer(timeObj.end_time)
        ? timeObj.end_time.toString("utf8")
        : timeObj.end_time,
    })),
  }));
};

/**
 * Fetches response count within a time range for a question paper.
 * @param {string} questionPno - Question paper number.
 * @param {string} startTime - Start time.
 * @param {string} endTime - End time.
 * @returns {Promise<number>} - Count of responses.
 */
const getResponseCount = (questionPno, startTime, endTime) => {
  const query = `
    SELECT COUNT(1) AS responseCount 
    FROM iib_response 
    WHERE question_paper_no = ? AND updatedtime BETWEEN ? AND ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [questionPno, startTime, endTime], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(err);
      }
      resolve(results[0]?.responseCount || 0);
    });
  });
};

/**
 * Converts seconds to 'HH:mm:ss' format.
 * @param {number} duration - Duration in seconds.
 * @returns {string} - Formatted time.
 */
const convertHrs = (duration) => {
  const time = new Date(null);
  time.setSeconds(duration);
  return time.toISOString().substr(11, 8);
};

/**
 * Counts downloads by section and status.
 * @param {string} downloadSec - Download section.
 * @param {string} [status=""] - Download status.
 * @returns {Promise<number>} - Count of downloads.
 */
const countDownloadByAction = (downloadSec, status = "") => {
  if (!downloadSec) return Promise.resolve(0);

  const query = `
    SELECT COUNT(DISTINCT download_sec) AS count 
    FROM qp_download 
    WHERE download_sec = ?${status ? ` AND download_status = '${status.trim()}'` : ""}
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [downloadSec.trim()], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(err);
      }
      resolve(results[0]?.count || 0);
    });
  });
};

/**
 * Executes an image download query.
 * @param {string} query - SQL query.
 * @param {string} centreCode - Centre code.
 * @param {string} serverNo - Server number.
 */
const executeImageDownloadQueryUpdate = (query, formattedTime, centreCode, serverNo) => {
  if (!query) return console.log("No query to execute in image download menu.");

  db.query(query, [formattedTime,centreCode, serverNo], (err, res) => {
    if (err) {
      console.error("Database error:", err);
    } else {
      console.log("Rows affected:", res.affectedRows);
    }
  });
};

const executeImageDownloadQueryInsert = (query,  centreCode, serverNo, formattedTime) => {
  if (!query) return console.log("No query to execute in image download menu.");

  db.query(query, [centreCode, serverNo, formattedTime], (err, res) => {
    if (err) {
      console.error("Database error:", err);
    } else {
      console.log("Rows affected:", res.affectedRows);
    }
  });
};

/**
 * Retrieves the encryption key for an exam and subject.
 * @param {string} examCode - Exam code.
 * @param {string} subjectCode - Subject code.
 * @returns {Promise<string>} - Encryption key.
 */
const getEncryKey = (examCode, subjectCode) => {
  const query = `
    SELECT qp_encry_key 
    FROM iib_exam_subjects 
    WHERE exam_code = ? AND subject_code = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [examCode, subjectCode], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(err);
      }
      resolve(results[0]?.qp_encry_key || "");
    });
  });
};


// Function to find the system's IP address
const networkInterfaces = os.networkInterfaces();

// Function to find the system's IP address
function getSystemIp() {
  const networkInterfaces = os.networkInterfaces();
  let defaultIp = ""; // Store the first non-loopback IPv4 as a fallback

  for (const interfaceName in networkInterfaces) {
    for (const interfaceDetails of networkInterfaces[interfaceName]) {
      if (interfaceDetails.family === "IPv4" && !interfaceDetails.internal) {
        if (interfaceName.toLowerCase().includes("eth") || interfaceName.toLowerCase().includes("ethernet")) {
          return interfaceDetails.address; // ✅ Return Ethernet IPv4 if found
        }
        if (!defaultIp) {
          defaultIp = interfaceDetails.address; // Store the first available non-internal IPv4
        }
      }
    }
  }

  return defaultIp; // Return fallback or error message
}

function normalizeKey(key) {
    if (Buffer.from(key, 'hex').length === 32) {
        return Buffer.from(key, 'hex'); // Already valid, return as is
    }
    return crypto.createHash('sha256').update(key).digest(); // Generate 32-byte key
}

function encryptIt(buffer, key) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const normalizedKey = normalizeKey(key);

    const cipher = crypto.createCipheriv(algorithm, normalizedKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return Buffer.concat([iv, encrypted]); // Prepend IV for decryption
}

function decryptIt(encryptedBuffer, key) {
    const algorithm = 'aes-256-cbc';
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);
    const normalizedKey = normalizeKey(key);

    const decipher = crypto.createDecipheriv(algorithm, normalizedKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted;
}


const updateConfigFile = async (userIp)=>{
    let config = {};
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        // console.log(config); // No need for .toString()
        
      } catch (error) {
        return res.status(500).json({ error: "Invalid JSON in config file" });
      }
    }
    // Update API_URL with new IP
    config.API_URL = `http://${userIp}`; // Assuming API runs on port 5000
    try{
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      return true;
    }catch(err){
      return false;
    }
}

async function getSerialNumber() {
  return new Promise((resolve, reject) => {
    const command = spawn("wmic", ["bios", "get", "serialnumber"], {
      stdio: "pipe",
      shell: true,
      windowsHide: true,
    });

    let output = "";

    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    command.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    command.on("close", (code) => {
      if (code !== 0) {
        reject("Error retrieving serial number");
      } else {
        const lines = output.trim().split("\n");
        const serialNumber = lines[1]?.trim();
        resolve(serialNumber);
      }
    });
  });
}

const getScoreCalculation = async (questionPaperNo,encryKey,roundoff_score,graceMark,passMark)=>{
  let posscore=0,negscore=0;
  const query = `SELECT A.marks AS marks, A.negative_marks AS neg_marks, A.correct_answer AS correct_ans, CAST(AES_DECRYPT(B.answer, UNHEX(SHA2(?,256))) AS CHAR) AS response, CAST(AES_DECRYPT(A.option_1, UNHEX(SHA2(?,256))) AS CHAR) AS opt_1, CAST(AES_DECRYPT(A.option_2, UNHEX(SHA2(?,256))) AS CHAR) AS opt_2, A.question_type AS ques_type FROM iib_sq_details A LEFT JOIN iib_response B ON A.question_id = B.question_id WHERE B.question_paper_no = ? AND B.id IN ( SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id );`;
  return new Promise((resolve,reject)=>{
    db.query(query,[encryKey,encryKey,encryKey,questionPaperNo,questionPaperNo],(err,results)=>{
      if(err){
        reject('Error generating score')
      }
      results.forEach((result)=>{
        console.log("result-response+",result.response);
        if(result.ques_type=='O' && result.response!='NULL'){
          if((result.correct_ans == result.response)){
            posscore+=result.marks
          }else{
            negscore+=result.neg_marks
          }
        }
        if(result.ques_type=='R' && result.response!='NULL'){
          if((result.opt_1 <= result.response) && (result.opt_2 >= result.response)){
            posscore+=result.marks
          }else{
            negscore+=result.neg_marks
          }
        }
        if(result.ques_type=='N' && result.response!='NULL'){
          if((result.opt_1 == result.response)){
            posscore+=result.marks
          }else{
            negscore+=result.neg_marks
          }
        }
        if(result.ques_type=='DQ' && result.response!='NULL'){
          posscore+=0;
        }
      })
      let score = posscore - negscore;
      console.log(score);
      if (score < 0) score = 0;
      if (roundoff_score == "Y") score = Math.round(score);


      const examResult = score + graceMark >= passMark ? "P" : "F";
      resolve ({posscore,negscore,score,examResult});
    })
  })

}
module.exports = {
  formatExamDate,
  formatExamDateDMY,
  getUpdatedPwd,
  centreAndServerNo,
  getSubExamSet,
  convertBufferDataAsValue,
  getResponseCount,
  convertHrs,
  countDownloadByAction,
  executeImageDownloadQueryUpdate,
  executeImageDownloadQueryInsert,
  getEncryKey,
  getSystemIp,
  updateConfigFile,
  encryptIt,
  decryptIt,
  getSerialNumber,
  getScoreCalculation
};
