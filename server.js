process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const express = require("express");
const mysql = require("mysql");
const mysqldump = require("mysqldump");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const { spawn } = require("child_process");
const Memcached = require("memcached");
const cron = require("node-cron");
const FormData = require("form-data");
const bcrypt = require("bcrypt");
const bcryptjs = require("bcryptjs");
const archiver = require("archiver");
const { decode } = require("html-entities");
require("dotenv").config(); // For environment variables
const cookieParser = require("cookie-parser");
const moment = require("moment-timezone");
const crypto = require("crypto");
const csvParser = require("csv-parser");
const fileUpload = require("express-fileupload");
const utils = require("./utils");
const app = express();
const { execSync } = require("child_process");
const { promisify } = require("util");
const os = require("os");
const http = require("http");
const https = require("https");
const dns = require("dns").promises;
const crc32 = require("crc-32");
// const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { waitFor } = require("@testing-library/react");
const { LineAxisSharp } = require("@mui/icons-material");
const statusMonitor = require("express-status-monitor");
app.use(statusMonitor());

//package ends


// const server = http.createServer(app); // Create the server instance
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // Middleware to parse JSON request body


// let systemIp;

// const updateSystemIp = async() => {
//   try {
//     const systemIp = await utils.getSystemIp();
//     // console.log("Updated System IP:", systemIp);
//     await utils.updateConfigFile(systemIp);
//   } catch (err) {
//     console.error("Error getting system IP:", err);
//   }
// };

// updateSystemIp();

// // Periodically update system IP
// setInterval(updateSystemIp, 30000); // Update every 30 seconds

// // // for fetching ip address of the server
const CONFIG_PATH = path.join(__dirname, "./ip.json");
// let ipFile = {};
// const loadConfig = () => {
//   try {
//     const rawData = fs.readFileSync(CONFIG_PATH, "utf8");
//     ipFile =  JSON.parse(rawData);
//     // console.log("Config updated:",  ipFile.API_URL);
//   } catch (err) {
//     console.error("Config file error:", err);
//   }
// };

// loadConfig();

// setInterval(()=>{
//   loadConfig();
// }, 30000);
// Watch for changes
// fs.watch(CONFIG_PATH, (eventType) => {
//   if (eventType === "change") {
//     loadConfig();
//   }
// });

// let allowedOrigins = [
//   'http://localhost','http://localhost:3000',ipFile.API_URL, // No need for template literals if API_URL is null/undefined
//   ipFile.API_URL ? `${ipFile.API_URL}:3000` : null // Only add if API_URL is valid
// ].filter(origin => origin); // Removes null, undefined, and empty strings

// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
//     transports: ["websocket"], // Force WebSocket only
//   }
// });

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//   });
// });


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost",
      "http://localhost:3001",
    ],
    // origin: [ 'http://localhost:3000', 'http://localhost',`${ipFile.API_URL}`,`${ipFile.API_URL}:3000` ],
    // origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);



const port = 5000;
// const mysqlPath = '"C:/mysql5/bin/mysql.exe"';
const mysqlPath = process.env.MYSQLPATH;
const formattedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
const formattedDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
const formattedDateMonthYear = moment().tz("Asia/Kolkata").format("DD-MM-YYYY");

// Set the time zone for the application
process.env.TZ = "Asia/Kolkata";
// List of tables to export
const tablesToExport = [
  "autofeed",
  "biometric_report_api",
  "descriptive_answer",
  "exam_skip_biometricvalidation",
  "iib_candidate_iway",
  "iib_candidate_scores",
  "iib_candidate_test",
  "iib_candidate_tracking",
  "iib_feedback",
  "iib_response",
  "iib_section_test",
  "netboot_ip_mapping",
  "timelog",
];

// Directory to save feed files
// const feedDir = "C:\\pro\\itest\\feed";
const feedDir = process.env.FEED_DIR;

// Create directory if it doesn't exist
if (!fs.existsSync(feedDir)) {
  fs.mkdirSync(feedDir, { recursive: true });
}

// Create a Memcached connection
const memcached = new Memcached("localhost:11211"); // Update with your Memcached server details

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// MySQL Connection Configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


const client = process.env.CLIENT;
// Define the paths to the photo and sign directories
const photoDir = "C:\\pro\\itest\\activate\\photo";
const signDir = "C:\\pro\\itest\\activate\\sign";

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
  console.log("Connected to MySQL database");
});

// Middleware


// Set a value in Memcached
memcached.set("my_key", "Hello, Memcached!", 10000, (err) => {
  // 10000 seconds TTL
  if (err) {
    console.error("Error setting value in Memcached:", err);
    return;
  }
  console.log("Value set in Memcached");
});

// const networkInterfaces = os.networkInterfaces();

// // Function to find the system's IP address
// function getSystemIp() {
//   let systemIp = '';
//   for (const interfaceName in networkInterfaces) {
//     for (const interfaceDetails of networkInterfaces[interfaceName]) {
//       // Check for IPv4 address (and ignore loopback addresses like '127.0.0.1')
//       if (interfaceDetails.family === 'IPv4' && !interfaceDetails.internal) {
//         systemIp = interfaceDetails.address;
//         break;
//       }
//     }
//     if (systemIp) break;
//   }
//   return systemIp;
// }

// Function to get system IP

app.get("/get-client-ip", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  res.json({ ip: clientIp });
});

app.get("/update-env/:ip", (req, res) => {
  const { ip } = req.params;
  const envFile = fs.readFileSync(".env", "utf8");
  const newEnvFile = envFile.replace(
    /^REACT_APP_API_URL=.*/m,
    `REACT_APP_API_URL=http://${ip}`
  );
  fs.writeFileSync(".env", newEnvFile);
  res.json({ message: "Environment variable updated successfully" });
});
app.get("/get-system-ip", (req, res) => {
  const systemIp = utils.getSystemIp();
  res.json({ ip: systemIp });
});

const examserverip = utils.getSystemIp();

// Format Date
const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTimeStamp = () => {
  const currentDate = new Date();

  const pad = (num) => num.toString().padStart(2, "0"); // Ensures 2 digits for day, month, hours, etc.

  const day = pad(currentDate.getDate());
  const month = pad(currentDate.getMonth() + 1); // Months are zero-indexed, so add 1
  const year = currentDate.getFullYear();
  const hours = pad(currentDate.getHours());
  const minutes = pad(currentDate.getMinutes());
  const seconds = pad(currentDate.getSeconds());

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

// Define the directories to be removed
const directoriesToClear = [
  path.join("C:", "pro", "itest", "activate", "photo"),
  path.join("C:", "pro", "itest", "activate", "sign"),
];
const directoriesToRemove = [
  path.join("C:", "pro", "itest", "activate", "photos"),
  path.join("C:", "pro", "itest", "feed"),
];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is up and running" });
});

// Endpoint to check the health of the Memcached server
app.get("/api/memcache-health", (req, res) => {
  // console.log('vzxzfxg');
  memcached.stats((err, stats) => {
    if (err) {
      console.error("Memcached server is down:", err);
      return res.status(500).send("Memcached server is down");
    }
    res.status(200).send("Memcached server is running");
  });
});

// Endpoint to check the health of the MySQL server
app.get("/api/mysql-health", (req, res) => {
  db.ping((err) => {
    if (err) {
      console.error("MySQL server is down:", err);
      return res.status(500).send("MySQL server is down");
    }
    res.status(200).send("MySQL server is running");
  });
});

// Define the endpoint to fetch exam settings
app.get("/api/exam-settings", (req, res) => {
  const query = "SELECT variable_name, variable_value FROM exam_settings";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching exam settings:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Transform results into an object with variable_name as keys
    const settings = results.reduce((acc, row) => {
      acc[row.variable_name] = row.variable_value;
      return acc;
    }, {});

    res.json(settings);
  });
});

app.get("/count-files", (req, res) => {
  try {
    const photoFiles = fs
      .readdirSync(photoDir)
      .filter((file) => fs.statSync(path.join(photoDir, file)).isFile());
    const signFiles = fs
      .readdirSync(signDir)
      .filter((file) => fs.statSync(path.join(signDir, file)).isFile());
    const feedFiles = fs
      .readdirSync(feedDir)
      .filter((file) => fs.statSync(path.join(feedDir, file)).isFile());

    const photoCount = photoFiles.length;
    const signCount = signFiles.length;
    const feedCount = feedFiles.length;

    res.json({
      photoCount,
      signCount,
      feedCount,
    });
  } catch (error) {
    console.error("Error reading directories:", error);
    res.status(500).json({ error: "Failed to retrieve file counts" });
  }
});

// app.get("/api/feed-sync", (req, res) => {
//   const countQuery = `SELECT COUNT(*) AS count FROM feed_filenames WHERE status = 'Y'`;

//   db.query(countQuery, (err, result) => {
//     if (err) {
//       console.error("Error fetching count:", err);
//       return res.status(500).json({ error: "Database query error" });
//     }

//     const count = result[0].count;
//     res.json({ statusYCount: count });
//   });
// });

app.get("/api/feed-sync", async (req, res) => {
  try {
    const tableCheckQuery = `SHOW TABLES LIKE 'feed_filenames'`;
    const tableExists = await queryAsync(tableCheckQuery);

    if (tableExists.length === 0) {
      return res.status(404).json({ error: "Table does not exist." });
    }
    const countQuery = `SELECT COUNT(*) AS count FROM feed_filenames WHERE status = 'Y'`;

    // Use the promisified query function
    const result = await queryAsync(countQuery);

    const count = result[0].count;
    res.json({ statusYCount: count });
  } catch (err) {
    console.error("Error fetching count:", err);
    res.status(500).json({ error: "Database query error" });
  }
});

// Function to remove all files in a directory but keep the directory itself
function clearDirectoryFiles(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Remove file
      }
    });
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.statSync(curPath).isDirectory()) {
        removeDirectory(curPath); // Recurse
      } else {
        fs.unlinkSync(curPath); // Delete file
      }
    });
    fs.rmdirSync(dirPath); // Remove directory
  }
}

//const JWT_SECRET = 'your_secret_key';
const JWT_SECRET = process.env.JWT_SECRET;

app.post("/clientlogin-old", (req, res) => {
  const { username, password, serialnumber } = req.body;

  // Validate required fields
  if (!username || !password || !serialnumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Generate an API token for external system
  const apiToken = jwt.sign({ service: "authService" }, JWT_SECRET, {
    expiresIn: "16h",
  });

  // Call the external API
  axios
    .post(
      "http://localhost:5002/checkUser",
      { username, password, serialnumber },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log("External system response:", response.data);

      // Check if the external system validates the user
      if (response.data?.response_status === "1") {
        // Generate client token
        const clientToken = jwt.sign({ username, serialnumber }, JWT_SECRET, {
          expiresIn: "24h",
        });

        // Set the client token as a secure HTTP-only cookie
        res.cookie("clientToken", clientToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true, // Ensure HTTPS in production
          maxAge: 24 * 60 * 60 * 1000, // 1 hour - 60 * 60 * 1000 // 24 hour - 24 * 60 * 60 * 1000
        });

        console.log("Cookie set with token:", clientToken);

        // Check if the record already exists in the database
        const sqlCheck =
          "SELECT * FROM qp_download WHERE centre_code = ? AND download_status = ?";
        db.query(sqlCheck, [username, "D"], (err, results) => {
          if (err) {
            console.error("MySQL select error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          if (results.length > 0) {
            // Record already exists
            return res.status(200).json({ message: "Record already exists" });
          }

          // Insert a new record
          const sqlInsert = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
          const formattedsqlInsert = db.format(sqlInsert, [
            username,
            "a",
            "Mac Address",
            "D",
            formattedTime,
          ]);
          db.query(
            sqlInsert,
            [username, "a", "Mac Address", "D", formattedTime],
            (err) => {
              if (err) {
                console.error("MySQL insert error:", err);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }

              // Insert the exact formatted query into xml_feed
              // insertIntoXmlFeed(formattedsqlInsert, (err) => {
              //   if (err) {
              //     return db.rollback(() => {
              //       console.error("Error inserting feed table:", err);
              //       res.status(500).json({ message: "Internal Server Error" });
              //     });
              //   }
              // });

              // Record successfully inserted
              return res.status(200).json({
                message: "Login successful and record inserted",
                token: clientToken,
              });
            }
          );
        });
      } else {
        // Handle invalid login
        return res
          .status(401)
          .json({ message: "Invalid username, password, or serial number." });
      }
    })
    .catch((error) => {
      // Handle external API errors
      console.error(
        "External API call error:",
        error.response?.data || error.message
      );
      res
        .status(500)
        .json({ message: "Failed to validate user with external system." });
    });
});

/**
 * curlCall equivalent in Node.js using axios
 * @param {string} url - The API endpoint URL
 * @param {object} data - Data to send in POST request
 * @param {number} req - Optional flag to return error details
 * @returns {Promise<object|string>} - Response data or error details
 */
async function curlCall(url, data, req = 0) {
  try {
    const response = await axios.post(url, qs.stringify(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }), // For SSL verification false
    });
    return response.data;
  } catch (error) {
    if (req === 1) {
      return {
        CURLINIT: error.config,
        ER: 1,
        RES: error.response ? error.response.data : error.message,
      };
    } else {
      return error.response ? error.response.data : error.message;
    }
  }
}

app.post("/clientlogin", async (req, res) => {
  try {
    const { username, password, serialnumber } = req.body;
    console.log(req.body);
    if (!username || !password || !serialnumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const apiToken = jwt.sign({ service: "authService" }, JWT_SECRET, {
      expiresIn: "16h",
    });

    // Fetch build version
    const versionResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id, build_name, build_version FROM taserver_version ORDER BY id DESC LIMIT 1",
        (err, result) => (err ? reject(err) : resolve(result[0]))
      );
    });

    if (!versionResult) {
      return res.status(500).json({ message: "Build version not found." });
    }

    const { build_name: bname, build_version: bversion } = versionResult;

    const data_eal = {
      macId: serialnumber,
      database: process.env.DB_NAME,
      ealUsername: Buffer.from(username).toString("base64"),
      taActivatePassword: Buffer.from(password).toString("base64"),
      bName: bname,
      bVersion: bversion,
      serviceCall: "EAL",
    };

    const response = await axios.post(
      `${process.env.EXAM_DASHBOARD_URL}/autoAssignServerNumber`,
      data_eal
    );
    console.log(data_eal)
    const res_eal = response.data.data.split("^$^");
    console.log(res_eal);
    const status_eal = res_eal[0];

    if (status_eal === "F" || status_eal === "NF") {
      const errorMessages = {
        1: "Serial number mismatch. Please contact Help desk.",
        2: "Invalid username/password",
        3: "Build version not found",
      };
      const error_type = res_eal[1];
      return res
        .status(500)
        .json({ message: errorMessages[error_type] || "Invalid login" });
    }

    if (status_eal !== "M") {
      return res
        .status(500)
        .json({ message: "Not valid build. Please contact Help desk." });
    }

    const clientToken = jwt.sign({ username, serialnumber }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("clientToken", clientToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("Cookie set with token:", clientToken);

    const checkQuery = `SELECT COUNT(*) AS count FROM qp_download WHERE centre_code = ?`;
    const [{ count }] = await new Promise((resolve, reject) => {
      db.query(checkQuery, [username], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (count == 0) {
      const dataServerReady = {
        m: serialnumber,
        name: process.env.DB_NAME,
        bn: bname,
        bv: bversion,
        f: "1",
        CHECKSUM: process.env.CHECKSUMKEY,
        pass: password,
      };

      const responseServerReady = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/biometricCountUpdateApi`,
        dataServerReady
      );

      const responseServerReadyVal =
        responseServerReady.data.message.split("--");
      if (responseServerReadyVal[0] !== "S") {
        return res
          .status(500)
          .json({
            message: "Server ready status not updated. Please contact admin.",
          });
      }

      const sqlInsert = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
      const values = [username, "a", "Mac Address", "N", formattedTime];
      await new Promise((resolve, reject) => {
        db.query(sqlInsert, values, (err) => (err ? reject(err) : resolve()));
      });

      // insertIntoXmlFeed(db.format(sqlInsert, values), (err) => {
      //   if (err) console.error("Error inserting feed table:", err);
      // });
    }

    res.status(200).json({
      message:
        count === 0
          ? "Login successful and record inserted"
          : "Login successful, record already exists",
      token: clientToken,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

async function getRealIPAddr(req) {
  let ip = "";

  // Check IP from shared internet
  if (req.headers["x-client-ip"]) {
    ip += req.headers["x-client-ip"] + "/";
  }

  // Check if IP is passed from a proxy
  if (req.headers["x-forwarded-for"]) {
    ip += req.headers["x-forwarded-for"] + "/";
  }

  // Remote address
  if (req.socket && req.socket.remoteAddress) {
    ip += req.socket.remoteAddress + "/";
  }

  // Get host IP from hostname
  const hostname = os.hostname();
  try {
    const hostIP = await dns.lookup(hostname);
    ip += hostIP.address;
  } catch (err) {
    console.error("DNS lookup failed:", err);
    ip += "127.0.0.1"; // Fallback to localhost
  }

  return ip;
}

function getCenterCodes() {
  return new Promise((resolve, reject) => {
    const q = "SELECT center_code, serverno FROM autofeed";
    db.query(q, (err, rows) => {
      if (err) {
        console.error("Error querying the database:", err);
        return reject(err);
      }
      if (rows.length > 0) {
        const { center_code, serverno } = rows[0]; // Assuming you need only the first record
        resolve({ center_code, serverno });
      } else {
        resolve({ center_code: null, serverno: null }); // Handle empty case
      }
    });
  });
}

// Live Working code
app.post("/Qpactivation", async (req, res) => {
  const { serialNumber, batch, batchval, password } = req.body;

  // console.log(serialNumber, batch, batchval, password);

  // const apiToken = jwt.sign({ service: 'authService' }, JWT_SECRET, { expiresIn: '16h' });
  const apiToken = req.cookies.clientToken;
  // const apiToken = req.cookies?.clientToken;
  if (!apiToken) {
    console.log("Client Token:", apiToken);
  }

  const remote_ip = await getRealIPAddr(req);
  const { center_code, serverno } = await getCenterCodes(req);
  const data_eal = {
    macId: serialNumber,
    database: process.env.DB_NAME,
    centreCode: center_code,
    serverNumber: serverno,
    pwdPos: batchval - 1,
    batchTime: batch,
    taActivatePassword: Buffer.from(password).toString("base64"),
    // ser: remote_ip, // Missing
    serviceCall: "AP",
  };

  console.log(data_eal);

  const response = await axios.post(
    `${process.env.EXAM_DASHBOARD_URL}/autoAssignServerNumber`,
    data_eal,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );

  const res_eal = response.data.data.split("^$^");
  const status_eal = res_eal[0];
  const filename = res_eal[1];
  console.log(res_eal);
  //     if(status_eal=='S'){
  //       // // Decode base64
  //       const decodedFilename = Buffer.from(filename, 'base64').toString('utf-8');

  //       // // Split the decoded string by "||"
  //       const impfile = decodedFilename.split("||");

  //       // // Split the first part by "/"
  //       const impfile1 = impfile[0].split("/");

  //       // Construct the path with .txt replacing .zip
  //       const sqlDB = path.join(process.env.QPIMGPATH, impfile1[impfile1.length - 1].replace('.zip', '.txt'));
  //       const qpfile=`${process.env.DEMOSERVER}/impfile[0]`;

  //       console.log(res_eal);
  //       console.log(sqlDB);
  //       console.log("decodedFilename",decodedFilename);

  //       // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME}.zip`);
  //   const extractPath = process.env.QPIMGPATH; // Extract directly here
  //   const downQPpath1 = process.env.QPIMGPATH;

  //   // let dumpFilePath = downQPpath1;

  //   // Fetch the file from URL
  // const response = await axios.get(qpfile, {
  //   responseType: "arraybuffer", // Ensures binary data is received
  //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
  // });

  //  // Save the ZIP file locally
  //  fs.writeFileSync(downQPpath1, response.data);
  //  console.log(`File downloaded and saved to: ${downQPpath1}`);

  //  // Extract ZIP file directly to the required folder
  //  const zip = new AdmZip(downQPpath1);
  //  zip.extractAllTo(extractPath, true);
  //  console.log(`Files extracted to: ${extractPath}`);

  //  // Delete ZIP after extraction
  //  fs.unlinkSync(downQPpath1);
  //  console.log("ZIP file deleted after extraction.");

  // const mysqlPath = process.env.MYSQLPATH;

  // // Escape special characters in password
  // const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

  // console.log(dumpFilePath);
  // // Construct the MySQL import command
  // const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
  // // console.log("Executing command:", command);

  // // try {
  // // Execute the MySQL import command
  // const { stdout, stderr } = await execAsync(command);

  // if (stderr) {
  //   console.error(`MySQL stderr: ${stderr}`);
  // }

  // if (stdout) {
  //   console.log(`MySQL stdout: ${stdout}`);
  // } else {
  //   console.log("MySQL executed successfully with no output.");
  // }

  //       // return res.status(200).json({
  //       //   response_status: "1",
  //       //   message: "Activation Password",
  //       //   actPasswordDB: password});
  //     }
  if (status_eal === "S") {
    try {
      // Decode base64 and process the filename
      const decodedFilename = Buffer.from(filename, "base64").toString("utf-8");
      const impfile = decodedFilename.split("||");
      const impfile1 = impfile[0].split("/");

      // Construct paths
      const sqlDB = impfile1[impfile1.length - 1].replace(".zip", ".txt");
      const qpfile = `${process.env.DEMOSERVER}/${impfile[0]}`;
      const extractPath = process.env.DOWNQPPATH; // Extract here
      const downQPpath1 = path.join(extractPath, path.basename(impfile[0])); // Save as ZIP

      console.log("Response:", res_eal);
      console.log("SQL DB Path:", sqlDB);
      console.log("Decoded Filename:", decodedFilename);
      console.log("Download URL:", qpfile);
      console.log("Download Path:", downQPpath1);
      console.log("Extraction Path:", extractPath);
      console.log(
        "impfile1[impfile1.length - 1]",
        impfile1[impfile1.length - 1]
      );
      const actFile = `${process.env.QPIMGPATH}\\${sqlDB}`;

      // Fetch the file
      // axios
      //   .get(qpfile, {
      //     responseType: "arraybuffer",
      //     httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      //   })
      console.log(
        "=================================================================="
      );
      console.log(impfile[0]);
      console.log(
        "=================================================================="
      );
      await axios
        .post(
          `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
          { pathcmd: Buffer.from(impfile[0]).toString("base64") }, // pathcmd is the nas path for activation file path
          {
            responseType: "arraybuffer", // Ensures binary data is received
            httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
          }
        )
        .then((response) => {
          // Save the ZIP file locally
          fs.writeFileSync(downQPpath1, response.data);
          console.log(`File downloaded and saved to: ${downQPpath1}`);

          // Extract ZIP file directly
          const zip = new AdmZip(downQPpath1);
          zip.extractAllTo(extractPath, true);
          console.log(`Files extracted to: ${extractPath}`);

          // Delete ZIP after extraction
          fs.unlinkSync(downQPpath1);
          console.log("ZIP file deleted after extraction.");

          // MySQL Import
          const mysqlPath = process.env.MYSQLPATH;
          const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');
          const dumpFilePath = path.join(extractPath, `${sqlDB}`);
          const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${actFile}"`;

          console.log("Executing MySQL Import:", command);

          return execAsync(command);
        })
        .then(({ stdout, stderr }) => {
          if (stderr) console.error("MySQL stderr:", stderr);
          console.log("MySQL stdout:", stdout || "Executed successfully");

          res.status(200).json({
            response_status: "1",
            message: "Activation Password",
            actPasswordDB: password,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        });
    } catch (error) {
      console.error("Unexpected Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(400).json({
      response_status: "0",
      message: "Activation password not found.",
    });
  }

  // Call the external API
  // axios.post("http://localhost:5002/Qpactivationcheck",{ serialNumber, batch },{headers: {
  //         Authorization: `Bearer ${apiToken}`,
  //         "Content-Type": "application/json",
  //       },
  //       withCredentials: true,
  //     }
  //   )
  //   .then((response) => {
  //     console.log("External system response:", response.data);
  //     const actPwd = response.data.user?.actPwd;
  //     if (actPwd) {
  //       // Split the actPwd string by '||'
  //       const actPwdParts = actPwd.split("||");
  //       if (batchval > 0 && batchval <= actPwdParts.length) {
  //         const actPasswordDB = actPwdParts[batchval - 1];
  //         return res.status(200).json({
  //           response_status: "1",
  //           message: "Activation Password",
  //           actPasswordDB: actPasswordDB,
  //         });
  //       } else {
  //         return res.status(400).json({
  //           response_status: "0",
  //           message: "Invalid batch value provided.",
  //         });
  //       }
  //     } else {
  //       return res.status(400).json({
  //         response_status: "0",
  //         message: "Activation password not found.",
  //       });
  //     }
  //   })
  //   .catch((error) => {
  //     // Handle external API errors
  //     console.error(
  //       "External API call error:",
  //       error.response?.data || error.message
  //     );
  //     res.status(500).json({
  //       message: "Failed to validate user with external system.",
  //     });
  //   });
});

// Demo Working code
// app.post("/Qpactivation", async (req, res) => {
//   const { serialNumber, batch, batchval, password } = req.body;

//   // console.log(serialNumber, batch, batchval, password);

//   // const apiToken = jwt.sign({ service: 'authService' }, JWT_SECRET, { expiresIn: '16h' });
//   const apiToken = req.cookies.clientToken;
//   // const apiToken = req.cookies?.clientToken;
//   if (!apiToken) {
//     console.log("Client Token:", apiToken);
//   }

//   const remote_ip = await getRealIPAddr(req);
//   const { center_code, serverno } = await getCenterCodes(req);
//   const data_eal = {
//     macId: serialNumber,
//     database: process.env.DB_NAME_DASH,
//     centreCode: center_code,
//     serverNumber: serverno,
//     pwdPos : (batchval-1),
//     batchTime: batch,
//     taActivatePassword: Buffer.from(password).toString('base64'),
//     // ser: remote_ip, // Missing
//     serviceCall: 'AP'
//   };

//   console.log(data_eal);

//   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/autoAssignServerNumber`,(data_eal),
//     {headers: { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//           withCredentials: true,});

//     const res_eal = response.data.data.split('^$^');
//     const status_eal = res_eal[0];
//     const filename = res_eal[1];
//     console.log(res_eal);
// //     if(status_eal=='S'){
// //       // // Decode base64
// //       const decodedFilename = Buffer.from(filename, 'base64').toString('utf-8');

// //       // // Split the decoded string by "||"
// //       const impfile = decodedFilename.split("||");

// //       // // Split the first part by "/"
// //       const impfile1 = impfile[0].split("/");

// //       // Construct the path with .txt replacing .zip
// //       const sqlDB = path.join(process.env.QPIMGPATH, impfile1[impfile1.length - 1].replace('.zip', '.txt'));
// //       const qpfile=`${process.env.DEMOSERVER}/impfile[0]`;

// //       console.log(res_eal);
// //       console.log(sqlDB);
// //       console.log("decodedFilename",decodedFilename);

// //       // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME_DASH}.zip`);
// //   const extractPath = process.env.QPIMGPATH; // Extract directly here
// //   const downQPpath1 = process.env.QPIMGPATH;

// //   // let dumpFilePath = downQPpath1;

// //   // Fetch the file from URL
// // const response = await axios.get(qpfile, {
// //   responseType: "arraybuffer", // Ensures binary data is received
// //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
// // });

// //  // Save the ZIP file locally
// //  fs.writeFileSync(downQPpath1, response.data);
// //  console.log(`File downloaded and saved to: ${downQPpath1}`);

// //  // Extract ZIP file directly to the required folder
// //  const zip = new AdmZip(downQPpath1);
// //  zip.extractAllTo(extractPath, true);
// //  console.log(`Files extracted to: ${extractPath}`);

// //  // Delete ZIP after extraction
// //  fs.unlinkSync(downQPpath1);
// //  console.log("ZIP file deleted after extraction.");

// // const mysqlPath = process.env.MYSQLPATH;

// // // Escape special characters in password
// // const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

// // const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

// // console.log(dumpFilePath);
// // // Construct the MySQL import command
// // const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
// // // console.log("Executing command:", command);

// // // try {
// // // Execute the MySQL import command
// // const { stdout, stderr } = await execAsync(command);

// // if (stderr) {
// //   console.error(`MySQL stderr: ${stderr}`);
// // }

// // if (stdout) {
// //   console.log(`MySQL stdout: ${stdout}`);
// // } else {
// //   console.log("MySQL executed successfully with no output.");
// // }

// //       // return res.status(200).json({
// //       //   response_status: "1",
// //       //   message: "Activation Password",
// //       //   actPasswordDB: password});
// //     }
// if (status_eal === "S") {
//   try {
//     // Decode base64 and process the filename
//     const decodedFilename = Buffer.from(filename, "base64").toString("utf-8");
//     const impfile = decodedFilename.split("||");
//     const impfile1 = impfile[0].split("/");

//     // Construct paths
//     const sqlDB = impfile1[impfile1.length - 1].replace(".zip", ".txt");
//     const qpfile = `${process.env.DEMOSERVER}/${impfile[0]}`;
//     const extractPath = process.env.DOWNQPPATH; // Extract here
//     const downQPpath1 = path.join(extractPath, path.basename(impfile[0])); // Save as ZIP

//     console.log("Response:", res_eal);
//     console.log("SQL DB Path:", sqlDB);
//     console.log("Decoded Filename:", decodedFilename);
//     console.log("Download URL:", qpfile);
//     console.log("Download Path:", downQPpath1);
//     console.log("Extraction Path:", extractPath);
//     console.log("impfile1[impfile1.length - 1]", impfile1[impfile1.length - 1]);
//     const actFile = `${process.env.QPIMGPATH}\\${sqlDB}`;

//     // const data_ealThree = {pathcmd :dPathOne }

//     // const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,(data_ealThree), {
//     //   responseType: "arraybuffer", // Ensures binary data is received
//     //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // });

//     // Fetch the file
//     axios
//       .get(qpfile, {
//         responseType: "arraybuffer",
//         httpsAgent: new https.Agent({ rejectUnauthorized: false }),
//       })
//       .then((response) => {
//         // Save the ZIP file locally
//         fs.writeFileSync(downQPpath1, response.data);
//         console.log(`File downloaded and saved to: ${downQPpath1}`);

//         // Extract ZIP file directly
//         const zip = new AdmZip(downQPpath1);
//         zip.extractAllTo(extractPath, true);
//         console.log(`Files extracted to: ${extractPath}`);

//         // Delete ZIP after extraction
//         fs.unlinkSync(downQPpath1);
//         console.log("ZIP file deleted after extraction.");

//         // MySQL Import
//         const mysqlPath = process.env.MYSQLPATH;
//         const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');
//         const dumpFilePath = path.join(extractPath, `${sqlDB}`);
//         const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${actFile}"`;

//         console.log("Executing MySQL Import:", command);

//         return execAsync(command);
//       })
//       .then(({ stdout, stderr }) => {
//         if (stderr) console.error("MySQL stderr:", stderr);
//         console.log("MySQL stdout:", stdout || "Executed successfully");

//         res.status(200).json({
//           response_status: "1",
//           message: "Activation Password",
//           actPasswordDB: password,
//         });
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//       });
//   } catch (error) {
//     console.error("Unexpected Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
//     else {
//       return res.status(400).json({
//         response_status: "0",
//         message: "Activation password not found.",
//       });
//     }

//   // Call the external API
//   // axios.post("http://localhost:5002/Qpactivationcheck",{ serialNumber, batch },{headers: {
//   //         Authorization: `Bearer ${apiToken}`,
//   //         "Content-Type": "application/json",
//   //       },
//   //       withCredentials: true,
//   //     }
//   //   )
//   //   .then((response) => {
//   //     console.log("External system response:", response.data);
//   //     const actPwd = response.data.user?.actPwd;
//   //     if (actPwd) {
//   //       // Split the actPwd string by '||'
//   //       const actPwdParts = actPwd.split("||");
//   //       if (batchval > 0 && batchval <= actPwdParts.length) {
//   //         const actPasswordDB = actPwdParts[batchval - 1];
//   //         return res.status(200).json({
//   //           response_status: "1",
//   //           message: "Activation Password",
//   //           actPasswordDB: actPasswordDB,
//   //         });
//   //       } else {
//   //         return res.status(400).json({
//   //           response_status: "0",
//   //           message: "Invalid batch value provided.",
//   //         });
//   //       }
//   //     } else {
//   //       return res.status(400).json({
//   //         response_status: "0",
//   //         message: "Activation password not found.",
//   //       });
//   //     }
//   //   })
//   //   .catch((error) => {
//   //     // Handle external API errors
//   //     console.error(
//   //       "External API call error:",
//   //       error.response?.data || error.message
//   //     );
//   //     res.status(500).json({
//   //       message: "Failed to validate user with external system.",
//   //     });
//   //   });
// });

app.get("/checkauth", (req, res) => {
  const token = req.cookies.clientToken;
  // console.log(token);
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ isAuthenticated: true });
  } catch (err) {
    res.json({ isAuthenticated: false });
  }
});

app.get("/clientlogout", (req, res) => {
  const clientToken = req.cookies.clientToken;

  if (!clientToken) {
    return res.sendStatus(204); // No content if no token is found
  }

  // Clear the clientToken cookie from the response
  res
    .clearCookie("clientToken", {
      httpOnly: true, // Ensure the cookie is only accessible by the server
      sameSite: "None", // Adjust this depending on your CORS requirements
      secure: true, // Ensure the cookie is sent over HTTPS (for production)
    })
    .sendStatus(204); // Send 204 No Content after clearing the cookie
  console.log(clientToken);
});

// Assuming you're using Express.js
app.get("/qp-status", async (req, res) => {
  try {
    // const tableCheckQuery = `SHOW TABLES LIKE 'qp_download'`;
    // const tableExists = await queryAsync(tableCheckQuery);

    // if (tableExists.length === 0) {
    //   return res.status(404).json({ error: "Table does not exist." });
    // }
    const sql = "SELECT COUNT(*) as count FROM qp_download";
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json({ count: result[0].count });
    });
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/serial-number", (req, res) => {
  const command = spawn("wmic", ["bios", "get", "serialnumber"], {
    stdio: "pipe", // Keep the output in the pipe, no terminal window should open
    shell: true, // Use the shell to execute the command
    windowsHide: true, // Hide the terminal window
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
      return res.status(500).send("Error retrieving serial number");
    }

    const lines = output.trim().split("\n");
    const serialNumber = lines[1]?.trim();

    if (serialNumber) {
      res.send({ serialNumber });
    } else {
      res.status(404).send("Serial number not found");
    }
  });
});

// app.get("/download-zip/:status/:batch", async (req, res) => {
//   const status = req.params.status;
//   const batch = req.params.batch;
//   console.log("Gop:", batch);

//   const file =
//     status === "Base"
//       ? process.env.CLIENT
//       : status === "Act"
//         ? batch == "10:00:00"
//           ? "b4681-100000"
//           : "78192-150000"
//         : status;

//   // const file =
//   //   status === "Base"
//   //     ? process.env.CLIENT
//   //     : status === "Act"
//   //       ? batch == "11:00:00"
//   //         ? "bac7a-110000"
//   //         : "78192-150000"
//   //       : status;

//   const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;
//   // const url = `https://202.191.132.85/livedata/${file}.zip`;

//   console.log("URL:", url);

//   // Define directories
//   const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
//   const extractDir = path.join("C:", "pro", "itest", "activate");
//   const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
//   const signDir = path.join("C:", "pro", "itest", "activate", "sign");
//   const zipFilePath = path.join(tempDir, `${file}.zip`);

//   // Create the temp directory if it doesn't exist
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//   }

//   try {
//     // Step 1: Download the file
//     const response = await axios.get(url, { responseType: "stream" });
//     const writer = fs.createWriteStream(zipFilePath);
//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });

//     console.log("File downloaded successfully");

//     // Step 2: Unzip the file
//     const zip = new AdmZip(zipFilePath);
//     if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
//       zip.extractAllTo(extractDir, true);
//       console.log(`File extracted successfully to ${extractDir}`);
//     } else {
//       if (status.endsWith("_photo")) {
//         zip.extractAllTo(photoDir, true);
//         console.log(`Photo File extracted successfully to ${photoDir}`);
//       }
//       if (status.endsWith("_sign")) {
//         zip.extractAllTo(signDir, true);
//         console.log(`Sign File extracted successfully to ${signDir}`);
//       }
//     }

//     // Step 3: Modify content of .sql files if qpStatus is not 'Base'
//     if (status !== "Base") {
//       fs.readdirSync(extractDir).forEach((file) => {
//         const filePath = path.join(extractDir, file);

//         if (
//           fs.lstatSync(filePath).isFile() &&
//           path.extname(filePath) === ".sql"
//         ) {
//           // Read the file contents
//           let fileContent = fs.readFileSync(filePath, "utf8");

//           // Replace '_temp' with an empty string
//           fileContent = fileContent.replace(/_temp/g, "");

//           // Write the modified content back to the file
//           fs.writeFileSync(filePath, fileContent, "utf8");
//           console.log(`File content modified: ${filePath}`);
//         }
//       });
//     }

//     // Optionally delete the zip file after extraction
//     fs.unlinkSync(zipFilePath);

//     res.send("File downloaded, extracted, and content modified successfully");
//   } catch (error) {
//     console.error("Error during download or extraction:", error);
//     res.status(500).send("Error during the process");
//   }
// });

// app.get("/serial-number", async (req, res) => {
//   const serialNumber = await utils.getSerialNumber();
//   if (serialNumber) {
//     res.send({ serialNumber });
//   } else {
//     res.status(404).send("Serial number not found");
//   }
// });

const pm2Path = "C:/Program Files/nodejs/pm2.cmd"; // Adjust if needed
// Define a GET route for starting PM2
app.get("/start-pm2", (req, res) => {
  // Start pm2 restart in the background
  const pm2 = spawn(pm2Path, ["restart", "itest"], {
    detached: true, // Run in a separate process
    stdio: "ignore", // Ignore the output (optional)
  });

  // Unref the process so that the parent can exit independently
  pm2.unref();
  res.send("PM2 process started successfully");
});

// Upload and import route
app.post("/upload", upload.single("file"), (req, res) => {
  const dumpFilePath = path.join(__dirname, "uploads", req.file.filename);

  // const mysqlPath = "C:/mysql5/bin/mysql.exe";
  const mysqlPath = process.env.MYSQLPATH;

  // Escape special characters in the password if needed
  const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // Construct the command
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;

  exec(command, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error importing dump file");
    }
    // console.log(`stdout: ${stdout}`);
    res.send("Dump file imported successfully");
  });
});

// Live Working code
app.post("/activate/:status/:batch/:serialNumber/:qpStatus",async (req, res) => {
  const { status, batch, serialNumber, qpStatus } = req.params;
  const controller = new AbortController();
  if (status == "Act") {
    // Send the response after both operations are successful
    return res.status(200).json({"message":
      "Dump file imported and PM2 process restarted successfully"}
    );
  }

  if (status == "Base" && qpStatus == 1) {
    try{
      const data_eal = {
        process: "1",
        macId: serialNumber,
        database: process.env.DB_NAME,
        action: "",
        serverNumber: "",
      };

      console.log(data_eal);
      const response = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
        data_eal
        // {headers:
        //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
        //       withCredentials: true,}
      );
      console.log(response.message);
      const res_eal = response.data.data.split("^$^");
      const responseCurl = res_eal[0];
      const autoID = res_eal[1];
      const pre = res_eal[2];
      const pos = res_eal[3];
      const dPath = res_eal[4];
      const servernoVal = res_eal[5];
      const ccode = res_eal[6];

      const data_ealOne = {
        process: "1",
        macId: serialNumber,
        database: process.env.DB_NAME,
        action: "",
        serverNumber: servernoVal,
        centreCode: ccode,
      };

      // console.log(data_ealOne);

      const responseOne = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
        data_ealOne
        // {headers:
        //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
        //       withCredentials: true,}
      );

      const res_ealOne = responseOne.data.data.split("^$^");
      const responseCurlOne = res_ealOne[0];
      const autoIDOne = res_ealOne[1];
      const preOne = res_ealOne[2];
      const posOne = res_ealOne[3];
      const dPathOne = res_ealOne[4];
      const servernoValOne = res_ealOne[5];
      const ccodeOne = res_ealOne[6];

      console.log("ONE", res_ealOne);
      if (responseCurlOne == "S") {
        const data_ealTwo = {
          process: "1",
          macId: serialNumber,
          database: process.env.DB_NAME,
          action: "OI",
          serverNumber: servernoVal,
          centreCode: ccode,
        };

        console.log("Two", data_ealTwo);

        const responseTwo = await axios.post(
          `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
          data_ealTwo
          // {headers:
          //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
          //       withCredentials: true,}
        );

        const res_ealTwo = responseTwo.data.data.split("^$^");
        const responseCurlTwo = res_ealTwo[0];
        const autoIDTwo = res_ealTwo[1];
        const preTwo = res_ealTwo[2];
        const posTwo = res_ealTwo[3];
        const dPathTwo = res_ealTwo[4];
        const servernoValTwo = res_ealTwo[5];
        const ccodeTwo = res_ealTwo[6];

        console.log(res_ealTwo);
      }

      if (status == "Base") {
        if (responseCurlOne == "A") {
          // const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${process.env.DB_NAME}.zip`;
          const downQPpath1 = `${process.env.DOWNQPPATH}\\${process.env.DB_NAME}.zip`;
          const sqlDB = process.env.DB_NAME;
          const filename = Buffer.from(
            `${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${process.env.DB_NAME}`
          ).toString("base64");

          // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME}.zip`);
          const extractPath = process.env.DOWNQPPATH; // Extract directly here

          // let dumpFilePath = downQPpath1;
          try {
            const response = await axios.post(
              `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
              { pathcmd: filename },
              {
                responseType: "stream", // ✅ Use "stream" to track progress properly
                httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
                signal: controller.signal,
              }
            );

            if (response.status !== 200) {
              console.error(
                `Failed to download file. HTTP Status: ${response.status}`
              );
              return res
                .status(response.status)
                .json({
                  success: "false",
                  message: "Failed to download the file.",
                });
            }
            const totalSize = response.headers["content-length"] || 0;
            let downloadedSize = 0;
            let lastChunkTime = Date.now();
            console.log("starting the download")
            const writer = fs.createWriteStream(downQPpath1);

            response.data.on("data", (chunk) => {
              downloadedSize += chunk.length;
              lastChunkTime = Date.now();
              const downloadPercentage = ((downloadedSize / totalSize) *100).toFixed(2);
              // io.emit("download-base", {percentage: downloadPercentage,});
              console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
            });

            const downloadInterval = setInterval(() => {
              if (Date.now() - lastChunkTime > 60000) {
                console.warn("Download stalled, aborting...");
                controller.abort();
                // if (!responseSent) {
                //   responseSent = true;
                clearInterval(downloadInterval);
                return res.status(500).send({
                  success: "false",
                  message: "Download failed due to inactivity.",
                });
                // }
              }
            }, 100);

            response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

            // Save the ZIP file locally
            await new Promise((resolve, reject) => {
              writer.on("finish", async () => {
                clearInterval(downloadInterval);
                if (totalSize && downloadedSize.toString() !== totalSize) {
                  console.error("File might be incomplete!");
                  await fs.promises.unlink(downQPpath1);
                  return reject(new Error("Incomplete file download"));
                }

                console.log("Download complete!");
                return resolve();
              });

              writer.on("error", async (err) => {
                clearInterval(downloadInterval);
                await fs.promises.unlink(downQPpath1);
                return reject(err);
              });
            });

            console.log(`File downloaded and saved to: ${downQPpath1}`);

            // Extract ZIP file directly to the required folder
            const zip = new AdmZip(downQPpath1);
            zip.extractAllTo(extractPath, true);
            console.log(`Files extracted to: ${extractPath}`);

            // Delete ZIP after extraction
            await fs.promises.unlink(downQPpath1);
            console.log("ZIP file deleted after extraction.");
          } catch (err) {
            console.log(err);
            return res
              .status(500)
              .json({"message":"Error during zip extraction" });
          }
          // Fetch the file from URL
          const mysqlPath = process.env.MYSQLPATH;

          // Escape special characters in password
          const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

          const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

          console.log(dumpFilePath);
          // Construct the MySQL import command
          const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
          // console.log("Executing command:", command);

          try {
            // Execute the MySQL import command
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
              console.error(`MySQL stderr: ${stderr}`);
            }

            if (stdout) {
              console.log(`MySQL stdout: ${stdout}`);
            } else {
              console.log("MySQL executed successfully with no output.");
            }
            // let autoID= "1";
            let autoID = autoIDOne;
            // if (autoID !== "" && mockDB === "") {
            if (autoID !== "") {
              const queries = [
                `ALTER TABLE iib_candidate_test AUTO_INCREMENT = ${autoID}`,
                `ALTER TABLE iib_candidate_scores AUTO_INCREMENT = ${autoID}`,
              ];

              queries.forEach((query) => {
                db.query(query, (err, result) => {
                  if (err) {
                    console.error("Error updating AUTO_INCREMENT:", err);
                  } else {
                    console.log(
                      "AUTO_INCREMENT updated successfully for:",
                      query
                    );
                  }
                });
              });
            }

            // Insert into autofeed
            const insertAutofeedSQL =
              "INSERT INTO autofeed (center_code, serverno, autoid) VALUES (?, ?, ?)";
            const formattedinsertAutofeedSQL = db.format(insertAutofeedSQL, [
              ccode,
              servernoVal,
              1,
            ]);
            db.query(
              insertAutofeedSQL,
              [ccode, servernoVal, 1],
              async (err) => {
                if (err) {
                  console.error("MySQL insert error:", err);
                  return res
                    .status(500)
                    .json({ message: "Error inserting data into autofeed." });
                }

                // Insert the exact formatted query into xml_feed
                //  insertIntoXmlFeed(formattedinsertAutofeedSQL, (err) => {
                //    if (err) {
                //      return db.rollback(() => {
                //        console.error("Error inserting feed table:", err);
                //        res.status(500).json({ message: "Internal Server Error" });
                //      });
                //    }
                //  });
              }
            );

            // const sqlInsert = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
            const sqlUpdate = `UPDATE qp_download SET serverno = ? , download_status = ? , download_time = ? WHERE centre_code = ? AND download_sec = ? `;
            // const sqlUpdate = `UPDATE qp_download SET serverno = ? , download_status = ? WHERE centre_code = ?`;
            const UpdateVal = [
              servernoValOne,
              "D",
              formattedTime,
              ccodeOne,
              "Mac Address",
            ];
            const formattedsqlUpdate = db.format(sqlUpdate, UpdateVal);
            db.query(sqlUpdate, UpdateVal, (err) => {
              if (err) {
                console.error("MySQL insert error:", err);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }

              // Insert the exact formatted query into xml_feed
              // insertIntoXmlFeed(formattedsqlUpdate, (err) => {
              //   if (err) {
              //     return db.rollback(() => {
              //       console.error("Error inserting feed table:", err);
              //       res.status(500).json({ message: "Internal Server Error" });
              //     });
              //   }
              // });
            });

            const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
            const formattedsqlInsertBase = db.format(sqlInsertBase, [
              ccodeOne,
              servernoValOne,
              "Base QP",
              "D",
              formattedTime,
            ]);
            db.query(
              sqlInsertBase,
              [ccodeOne, servernoValOne, "Base QP", "D", formattedTime],
              (err) => {
                if (err) {
                  console.error("MySQL insert error:", err);
                  return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
                }

                // Insert the exact formatted query into xml_feed
                // insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
                //   if (err) {
                //     return db.rollback(() => {
                //       console.error("Error inserting feed table:", err);
                //       res.status(500).json({ message: "Internal Server Error" });
                //     });
                //   }
                // });
              }
            );
            // Send the response after both operations are successful
            return res.status(200).json({message:"Dump file imported and PM2 process restarted successfully"});
          } catch (error) {
            console.error("Error during process:", error);
            return res.status(500).json({message:"Error importing dump file or restarting PM2"});
          }
        }
      }
    }catch(error){
      console.error("Error during process:", error.message);
      return res.status(500).json({"message":"Error during base download"});
    }
    
  }

  if (status != "Base" && status != "Act" && qpStatus == 2) {
    // console.log("statusstatusstatus",status);
    const data_eal = {
      process: "1",
      macId: serialNumber,
      database: process.env.DB_NAME,
      action: "",
      serverNumber: "",
    };

    console.log(data_eal);
    try{
      const response = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
        data_eal
        // {headers:
        //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
        //       withCredentials: true,}
      );

      const res_eal = response.data.data.split("^$^");
      const responseCurl = res_eal[0];
      const autoID = res_eal[1];
      const pre = res_eal[2];
      const pos = res_eal[3];
      const dPath = res_eal[4];
      const servernoVal = res_eal[5];
      const ccode = res_eal[6];

      const data_ealOne = {
        process: "2",
        macId: serialNumber,
        database: process.env.DB_NAME,
        action: "",
        serverNumber: servernoVal,
        centreCode: ccode,
      };

      // console.log(data_ealOne);

      const responseOne = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
        data_ealOne
        // {headers:
        //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
        //       withCredentials: true,}
      );

      const res_ealOne = responseOne.data.data.split("^$^");
      const responseCurlOne = res_ealOne[0];
      const autoIDOne = res_ealOne[1];
      const preOne = res_ealOne[2];
      const posOne = res_ealOne[3];
      const dPathOne = res_ealOne[4];
      const servernoValOne = res_ealOne[5];
      const ccodeOne = res_ealOne[6];

      console.log("ONE", res_ealOne);

      if (responseCurlOne == "A") {
        const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}.zip`;
        const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}.zip`;
        const sqlDB = status; // centre code = status
        const filename = Buffer.from(
          `${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}`
        ).toString("base64");

        // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME}.zip`);
        const extractPath = process.env.DOWNQPPATH; // Extract directly here

        // let dumpFilePath = downQPpath1;

        const response = await axios.post(
          `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
          { pathcmd: filename },
          {
            responseType: "stream", // ✅ Use "stream" to track progress properly
            httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
            signal: controller.signal,
          }
        );

        if (response.status !== 200) {
          console.error(
            `Failed to download file. HTTP Status: ${response.status}`
          );
          return res.status(500).json({
            success: "false",
            message: "Failed to download the file.",
          });
        }
        const totalSize = response.headers["content-length"];
        let downloadedSize = 0;
        let lastChunkTime = Date.now();

        const writer = fs.createWriteStream(downQPpath1);

        response.data.on("data", (chunk) => {
          downloadedSize += chunk.length;
          lastChunkTime = Date.now();
          const downloadPercentage = (
            (downloadedSize / totalSize) *
            100
          ).toFixed(2);
          // io.emit("download-centerqp", { percentage: downloadPercentage });
          console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
        });

        const downloadInterval = setInterval(() => {
          if (Date.now() - lastChunkTime > 60000) {
            console.warn("Download stalled, aborting...");
            controller.abort();
            // if (!responseSent) {
            //   responseSent = true;
            clearInterval(downloadInterval);
            return res.status(500).json({
              success: "false",
              message: "Download failed due to inactivity.",
            });
            // }
          }
        }, 100);

        response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

        // Save the ZIP file locally
        await new Promise((resolve, reject) => {
          writer.on("finish", () => {
            clearInterval(downloadInterval);
            if (totalSize && downloadedSize.toString() !== totalSize) {
              console.error("File might be incomplete!");
              fs.unlinkSync(downQPpath1);
              return reject(new Error("Incomplete file download"));
            }

            console.log("Download complete!");
            return resolve();
          });

          writer.on("error", (err) => {
            clearInterval(downloadInterval);
            fs.unlinkSync(downQPpath1);
            return reject(err);
          });
        });

        console.log(`File downloaded and saved to: ${downQPpath1}`);

        // Extract ZIP file directly to the required folder
        const zip = new AdmZip(downQPpath1);
        zip.extractAllTo(extractPath, true);
        console.log(`Files extracted to: ${extractPath}`);

        const qp_output = path.join(extractPath, `${status}.sql`);
        let sqlContent = fs.readFileSync(qp_output, "utf8");
        sqlContent = sqlContent.replace(/_temp/g, "");
        fs.writeFileSync(qp_output, sqlContent, "utf8");

        // Delete ZIP after extraction
        fs.unlinkSync(downQPpath1);
        console.log("ZIP file deleted after extraction.");

        const mysqlPath = process.env.MYSQLPATH;

        // Escape special characters in password
        const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

        const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

        console.log(dumpFilePath);
        // Construct the MySQL import command
        const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
        // console.log("Executing command:", command);

        try {
          // Execute the MySQL import command
          const { stdout, stderr } = await execAsync(command);

          if (stderr) {
            console.error(`MySQL stderr: ${stderr}`);
          }

          if (stdout) {
            console.log(`MySQL stdout: ${stdout}`);
          } else {
            console.log("MySQL executed successfully with no output.");
          }
          // let autoID= "1";

          const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
          const formattedsqlInsertBase = db.format(sqlInsertBase, [
            ccodeOne,
            servernoValOne,
            "Center QP",
            "D",
            formattedTime,
          ]);
          db.query(
            sqlInsertBase,
            [ccodeOne, servernoValOne, "Center QP", "D", formattedTime],
            (err) => {
              if (err) {
                console.error("MySQL insert error:", err);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }

              // Insert the exact formatted query into xml_feed
              // insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
              //   if (err) {
              //     return db.rollback(() => {
              //       console.error("Error inserting feed table:", err);
              //       res.status(500).json({ message: "Internal Server Error" });
              //     });
              //   }
              // });
            }
          );

          const data_ealTwo = {
            process: "3",
            macId: serialNumber,
            database: process.env.DB_NAME,
            action: "",
            serverNumber: servernoVal,
            centreCode: ccode,
          };

          // console.log(data_ealOne);

          const responseTwo = await axios.post(
            `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
            data_ealTwo
            // {headers:
            //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
            //       withCredentials: true,}
          );

          const res_ealTwo = responseTwo.data.data.split("^$^");
          const responseCurlTwo = res_ealTwo[0];
          const autoIDTwo = res_ealTwo[1];
          const preTwo = res_ealTwo[2];
          const posTwo = res_ealTwo[3];
          const dPathTwo = res_ealTwo[4];
          const servernoValTwo = res_ealTwo[5];
          const ccodeTwo = res_ealTwo[6];

          console.log("Two", res_ealTwo);

          if (responseCurlTwo == "A") {
            const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathTwo, "base64").toString()}/images.zip`;
            const downQPpath1 = `${process.env.DOWNQPPATH}\\images.zip`;
            const sqlDB = "images";
            const filename = Buffer.from(
              `${Buffer.from(dPathTwo, "base64").toString()}/${sqlDB}.zip||${status}`
            ).toString("base64");

            // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME}.zip`);
            // const extractPath = process.env.DOWNQPPATH; // Extract directly here
            const extractPath = `${process.env.DOWNQPPATH}/image`;

            // let dumpFilePath = downQPpath1;

            // Fetch the file from URL

            const response = await axios.post(
              `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
              { pathcmd: filename },
              {
                responseType: "stream", // ✅ Use "stream" to track progress properly
                httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
                signal: controller.signal,
              }
            );

            if (response.status !== 200) {
              console.error(
                `Failed to download file. HTTP Status: ${response.status}`
              );
              return res.status(500).json({
                success: "false",
                message: "Failed to download the file.",
              });
            }
            const totalSize = response.headers["content-length"];
            let downloadedSize = 0;
            let lastChunkTime = Date.now();

            const writer = fs.createWriteStream(downQPpath1);

            response.data.on("data", (chunk) => {
              downloadedSize += chunk.length;
              lastChunkTime = Date.now();
              const downloadPercentage = (
                (downloadedSize / totalSize) *
                100
              ).toFixed(2);
              // io.emit("download-percentage", {
              //   percentage: downloadPercentage,
              // });
              console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
            });

            const downloadInterval = setInterval(() => {
              if (Date.now() - lastChunkTime > 60000) {
                console.warn("Download stalled, aborting...");
                controller.abort();
                // if (!responseSent) {
                //   responseSent = true;
                clearInterval(downloadInterval);
                return res.status(500).json({
                  success: "false",
                  message: "Download failed due to inactivity.",
                });
                // }
              }
            }, 100);

            response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

            // Save the ZIP file locally
            await new Promise((resolve, reject) => {
              writer.on("finish", () => {
                clearInterval(downloadInterval);
                if (totalSize && downloadedSize.toString() !== totalSize) {
                  console.error("File might be incomplete!");
                  fs.unlinkSync(downQPpath1);
                  return reject(new Error("Incomplete file download"));
                }

                console.log("Download complete!");
                return resolve();
              });

              writer.on("error", (err) => {
                clearInterval(downloadInterval);
                fs.unlinkSync(downQPpath1);
                return reject(err);
              });
            });

            console.log(`File downloaded and saved to: ${downQPpath1}`);

            // Extract ZIP file directly to the required folder
            const zip = new AdmZip(downQPpath1);
            zip.extractAllTo(extractPath, true);
            console.log(`Files extracted to: ${extractPath}`);

            // Delete ZIP after extraction
            fs.unlinkSync(downQPpath1);
            console.log("ZIP file deleted after extraction.");

            try {
              const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
              const formattedsqlInsertBase = db.format(sqlInsertBase, [
                ccodeTwo,
                servernoValTwo,
                "Image",
                "D",
                formattedTime,
              ]);
              db.query(
                sqlInsertBase,
                [ccodeTwo, servernoValTwo, "Image", "D", formattedTime],
                (err) => {
                  if (err) {
                    console.error("MySQL insert error:", err);
                    return res
                      .status(500)
                      .json({ message: "Internal Server Error" });
                  }

                  // Insert the exact formatted query into xml_feed
                  // insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
                  //   if (err) {
                  //     return db.rollback(() => {
                  //       console.error("Error inserting feed table:", err);
                  //       res.status(500).json({ message: "Internal Server Error" });
                  //     });
                  //   }
                  // });
                }
              );

              // Send the response after both operations are successful
              // return res.send("Dump file imported and PM2 process restarted successfully");
            } catch (error) {
              console.error("Error during process:", error);
              return res
                .status(500)
                .json({message:"Error importing dump file or restarting PM2"});
            }
            // }
          }
          // }

          // Send the response after both operations are successful
          return res
            .status(200)
            .json({
              message:
                "Dump file imported and PM2 process restarted successfully",
            });
        } catch (error) {
          console.error("Error during process:", error);
          return res
            .status(500)
            .json({message:"Error importing dump file or restarting PM2"});
        }
        // }
      }
    }catch(err){console.error("Error during process:", err.message);
      return res.status(500).json({"message":"Error during Center QP download"});}
    
  }

  if (status != "Base" && status != "Act" && qpStatus == 4) {
    // console.log("statusstatusstatus",status);
    const data_eal = {
      process: "1",
      macId: serialNumber,
      database: process.env.DB_NAME,
      action: "",
      serverNumber: "",
    };

    console.log(data_eal);
try{
const response = await axios.post(
  `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
  data_eal
  // {headers:
  //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
  //       withCredentials: true,}
);

const res_eal = response.data.data.split("^$^");
const responseCurl = res_eal[0];
const autoID = res_eal[1];
const pre = res_eal[2];
const pos = res_eal[3];
const dPath = res_eal[4];
const servernoVal = res_eal[5];
const ccode = res_eal[6];

const data_ealOne = {
  process: "4",
  macId: serialNumber,
  database: process.env.DB_NAME,
  action: "",
  serverNumber: servernoVal,
  centreCode: ccode,
};

// console.log(data_ealOne);

const responseOne = await axios.post(
  `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
  data_ealOne
  // {headers:
  //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
  //       withCredentials: true,}
);

const res_ealOne = responseOne.data.data.split("^$^");
const responseCurlOne = res_ealOne[0];
const autoIDOne = res_ealOne[1];
const preOne = res_ealOne[2];
const posOne = res_ealOne[3];
const dPathOne = res_ealOne[4];
const servernoValOne = res_ealOne[5];
const ccodeOne = res_ealOne[6];

console.log("ONE", res_ealOne);

if (responseCurlOne == "A") {
  const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}_photo.zip`;
  const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}_photo.zip`;
  const sqlDB = `${status}_photo`; // centre_code_photo
  const filename = Buffer.from(
    `${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}_photo`
  ).toString("base64");

  const extractPath = `${process.env.DOWNQPPATH}/photo`;

  // let dumpFilePath = downQPpath1;

  // Fetch the file from URL

  const response = await axios.post(
    `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
    { pathcmd: filename },
    {
      responseType: "stream", // ✅ Use "stream" to track progress properly
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
      signal: controller.signal,
    }
  );

  if (response.status !== 200) {
    console.error(
      `Failed to download file. HTTP Status: ${response.status}`
    );
    return res.status(500).json({
      success: "false",
      message: "Failed to download the file.",
    });
  }
  const totalSize = response.headers["content-length"];
  let downloadedSize = 0;
  let lastChunkTime = Date.now();

  const writer = fs.createWriteStream(downQPpath1);

  response.data.on("data", (chunk) => {
    downloadedSize += chunk.length;
    lastChunkTime = Date.now();
    const downloadPercentage = (
      (downloadedSize / totalSize) *
      100
    ).toFixed(2);
    // io.emit("download-photos", { percentage: downloadPercentage });
    console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
  });

  const downloadInterval = setInterval(() => {
    if (Date.now() - lastChunkTime > 60000) {
      console.warn("Download stalled, aborting...");
      controller.abort();
      // if (!responseSent) {
      //   responseSent = true;
      clearInterval(downloadInterval);
      return res.status(500).json({
        success: "false",
        message: "Download failed due to inactivity.",
      });
      // }
    }
  }, 100);

  response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

  // Save the ZIP file locally
  await new Promise((resolve, reject) => {
    writer.on("finish", () => {
      clearInterval(downloadInterval);
      if (totalSize && downloadedSize.toString() !== totalSize) {
        console.error("File might be incomplete!");
        fs.unlinkSync(downQPpath1);
        return reject(new Error("Incomplete file download"));
      }

      console.log("Download complete!");
      return resolve();
    });

    writer.on("error", (err) => {
      clearInterval(downloadInterval);
      fs.unlinkSync(downQPpath1);
      return reject(err);
    });
  });

  console.log(`File downloaded and saved to: ${downQPpath1}`);

  // Extract ZIP file directly to the required folder
  const zip = new AdmZip(downQPpath1);
  zip.extractAllTo(extractPath, true);
  console.log(`Files extracted to: ${extractPath}`);

  // Delete ZIP after extraction
  fs.unlinkSync(downQPpath1);
  console.log("ZIP file deleted after extraction.");

  try {
    const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
    const formattedsqlInsertBase = db.format(sqlInsertBase, [
      ccodeOne,
      servernoValOne,
      "Photos",
      "D",
      formattedTime,
    ]);
    db.query(
      sqlInsertBase,
      [ccodeOne, servernoValOne, "Photos", "D", formattedTime],
      (err) => {
        if (err) {
          console.error("MySQL insert error:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error" });
        }

        // Insert the exact formatted query into xml_feed
        // insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
        //   if (err) {
        //     return db.rollback(() => {
        //       console.error("Error inserting feed table:", err);
        //       res.status(500).json({ message: "Internal Server Error" });
        //     });
        //   }
        // });
      }
    );

    // Send the response after both operations are successful
    return res
      .status(200)
      .json({
        message:
          "Dump file imported and PM2 process restarted successfully",
      });
  } catch (error) {
    console.error("Error during process:", error);
    return res
      .status(500)
      .send("Error importing dump file or restarting PM2");
  }
}

}catch(err){
console.error("Error during process:", err.message);
      return res.status(500).json({"message":"Error during data download"});
}
 
  }

  if (status != "Base" && status != "Act" && qpStatus == 5) {
    // console.log("statusstatusstatus",status);
    const data_eal = {
      process: "1",
      macId: serialNumber,
      database: process.env.DB_NAME,
      action: "",
      serverNumber: "",
    };

    console.log(data_eal);
try{

const response = await axios.post(
  `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
  data_eal
  // {headers:
  //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
  //       withCredentials: true,}
);

const res_eal = response.data.data.split("^$^");
const responseCurl = res_eal[0];
const autoID = res_eal[1];
const pre = res_eal[2];
const pos = res_eal[3];
const dPath = res_eal[4];
const servernoVal = res_eal[5];
const ccode = res_eal[6];

const data_ealOne = {
  process: "5",
  macId: serialNumber,
  database: process.env.DB_NAME,
  action: "",
  serverNumber: servernoVal,
  centreCode: ccode,
};

// console.log(data_ealOne);

const responseOne = await axios.post(
  `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
  data_ealOne
  // {headers:
  //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
  //       withCredentials: true,}
);

const res_ealOne = responseOne.data.data.split("^$^");
const responseCurlOne = res_ealOne[0];
const autoIDOne = res_ealOne[1];
const preOne = res_ealOne[2];
const posOne = res_ealOne[3];
const dPathOne = res_ealOne[4];
const servernoValOne = res_ealOne[5];
const ccodeOne = res_ealOne[6];

console.log("ONE", res_ealOne);

if (responseCurlOne == "A") {
  const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}_sign.zip`;
  const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}_sign.zip`;
  const sqlDB = `${status}_sign`; // centre_code_sign
  const filename = Buffer.from(
    `${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}_sign`
  ).toString("base64");

  // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME}.zip`);
  const extractPath = `${process.env.DOWNQPPATH}/sign`; // Extract directly here

  // let dumpFilePath = downQPpath1;

  // Fetch the file from URL
  console.log("starting download")
  const response = await axios.post(
    `${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,
    { pathcmd: filename },
    {
      responseType: "stream", // ✅ Use "stream" to track progress properly
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
      signal: controller.signal,
    }
  );

  if (response.status !== 200) {
    console.error(
      `Failed to download file. HTTP Status: ${response.status}`
    );
    return res.json({
      success: "false",
      message: "Failed to download the file.",
    });
  }
  const totalSize = response.headers["content-length"];
  let downloadedSize = 0;
  let lastChunkTime = Date.now();

  const writer = fs.createWriteStream(downQPpath1);

  response.data.on("data", (chunk) => {
    downloadedSize += chunk.length;
    lastChunkTime = Date.now();
    const downloadPercentage = (
      (downloadedSize / totalSize) *
      100
    ).toFixed(2);
    // io.emit("download-sign", { percentage: downloadPercentage });
    console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
  });

  const downloadInterval = setInterval(() => {
    if (Date.now() - lastChunkTime > 60000) {
      console.warn("Download stalled, aborting...");
      controller.abort();
      // if (!responseSent) {
      //   responseSent = true;
      clearInterval(downloadInterval);
      return res.status(500).send({
        success: "false",
        message: "Download failed due to inactivity.",
      });
      // }
    }
  }, 100);

  response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

  // Save the ZIP file locally
  await new Promise((resolve, reject) => {
    writer.on("finish", () => {
      clearInterval(downloadInterval);
      if (totalSize && downloadedSize.toString() !== totalSize) {
        console.error("File might be incomplete!");
        fs.unlinkSync(downQPpath1);
        return reject(new Error("Incomplete file download"));
      }

      console.log("Download complete!");
      return resolve();
    });

    writer.on("error", (err) => {
      clearInterval(downloadInterval);
      fs.unlinkSync(downQPpath1);
      return reject(err);
    });
  });

  console.log(`File downloaded and saved to: ${downQPpath1}`);

  // Extract ZIP file directly to the required folder
  const zip = new AdmZip(downQPpath1);
  zip.extractAllTo(extractPath, true);
  console.log(`Files extracted to: ${extractPath}`);

  // Delete ZIP after extraction
  fs.unlinkSync(downQPpath1);
  console.log("ZIP file deleted after extraction.");

  try {
    const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
    const formattedsqlInsertBase = db.format(sqlInsertBase, [
      ccodeOne,
      servernoValOne,
      "Sign",
      "D",
      formattedTime,
    ]);
    db.query(
      sqlInsertBase,
      [ccodeOne, servernoValOne, "Sign", "D", formattedTime],
      (err) => {
        if (err) {
          console.error("MySQL insert error:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error" });
        }

        // Insert the exact formatted query into xml_feed
        // insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
        //   if (err) {
        //     return db.rollback(() => {
        //       console.error("Error inserting feed table:", err);
        //       res.status(500).json({ message: "Internal Server Error" });
        //     });
        //   }
        // });
      }
    );

    const data_ealStatus = {
      process: "6",
      macId: serialNumber,
      database: process.env.DB_NAME,
      serverNumber: servernoVal,
    };

    // console.log(data_ealOne);

    const responseStatus = await axios.post(
      `${process.env.EXAM_DASHBOARD_URL}/dataDownload`,
      data_ealStatus
      // {headers:
      //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
      //       withCredentials: true,}
    );
    console.log(responseStatus);

    // Send the response after both operations are successful
    return res
      .status(200)
      .json({
        message:
          "Dump file imported and PM2 process restarted successfully",
      });
  } catch (error) {
    console.error("Error during process:", error);
    return res
      .status(500)
      .json({"message":"Error importing dump file or restarting PM2"});
  }
}
}catch(err){
console.error("Error during process:", err.message);
      return res.status(500).json({"message":"Error during data download"});
}
  
  }
}
);

//  Demo Working code
// app.post("/activate/:status/:batch/:serialNumber/:qpStatus", async (req, res) => {
//   const { status, batch, serialNumber, qpStatus} = req.params;
//   const controller = new AbortController();
//   let lastChunkTime = Date.now();
//   let responseSent = false; // Flag to prevent multiple responses
//   if(status=="Act"){
//     // Send the response after both operations are successful
//     return res.send("Dump file imported and PM2 process restarted successfully");
//   }

//   if(status == "Base" && qpStatus == 1){

//     const data_eal = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : ''
//     }

//     console.log(data_eal);

//   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_eal),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_eal = response.data.data.split('^$^');
//   const responseCurl = res_eal[0];
//   const autoID = res_eal[1];
//   const pre = res_eal[2];
//   const pos = res_eal[3];
//   const dPath = res_eal[4];
//   const servernoVal = res_eal[5];
//   const ccode = res_eal[6];

//     const data_ealOne = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : servernoVal,
//       centreCode : ccode
//     }

//     // console.log(data_ealOne);

//   const responseOne = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealOne),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_ealOne = responseOne.data.data.split('^$^');
//   const responseCurlOne = res_ealOne[0];
//   const autoIDOne = res_ealOne[1];
//   const preOne = res_ealOne[2];
//   const posOne = res_ealOne[3];
//   const dPathOne = res_ealOne[4];
//   const servernoValOne = res_ealOne[5];
//   const ccodeOne = res_ealOne[6];

//   console.log("ONE",res_ealOne);
//   if(responseCurlOne=="B"){
//     return res.status(500).json({ message: "Download time should be between Pre Grace and Post Grace time" });
//   }
//   if(responseCurlOne=="S"){

//     const data_ealTwo = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : 'OI',
//       serverNumber : servernoVal,
//       centreCode : ccode
//     }

//     console.log("Two",data_ealTwo);

//   const responseTwo = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealTwo),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_ealTwo = responseTwo.data.data.split('^$^');
//   const responseCurlTwo = res_ealTwo[0];
//   const autoIDTwo = res_ealTwo[1];
//   const preTwo = res_ealTwo[2];
//   const posTwo = res_ealTwo[3];
//   const dPathTwo = res_ealTwo[4];
//   const servernoValTwo = res_ealTwo[5];
//   const ccodeTwo = res_ealTwo[6];

//   console.log(res_ealTwo);
//   }
// if(status=="Base"){
// if(responseCurlOne=="A"){
//   const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${process.env.DB_NAME_DASH}.zip`;
//   const downQPpath1 = `${process.env.DOWNQPPATH}\\${process.env.DB_NAME_DASH}.zip`;
//   const sqlDB = process.env.DB_NAME_DASH;
//   const filename = Buffer.from(`${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${process.env.DB_NAME_DASH}`).toString("base64");

//   // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME_DASH}.zip`);
//   const extractPath = process.env.DOWNQPPATH; // Extract directly here
//     // Fetch the file from URL
//   const response = await axios.get(qpfile, {
//     responseType: "arraybuffer", // Ensures binary data is received
//     httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // signal: controller.signal,
//   });

//   // const response = await axios.get(qpfile,{
//   //   responseType: "stream", // ✅ Use "stream" to track progress properly
//   //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
//   //   signal: controller.signal,
//   // });

//   if (response.status !== 200) {
//     console.error(`Failed to download file. HTTP Status: ${response.status}`);
//     return res.json({success:"false",message:"Failed to download the file."});
//   }
//   const totalSize = response.headers["content-length"];
//   let downloadedSize = 0;
//   let lastChunkTime = Date.now();

//   const writer = fs.createWriteStream(downQPpath1);

//  response.data.on("data", (chunk) => {
//       downloadedSize += chunk.length;
//       lastChunkTime = Date.now();
//       const downloadPercentage = ((downloadedSize / totalSize) * 100).toFixed(2);
//       io.emit("download-percentage", { percentage: downloadPercentage });
//       console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
// });

//     const downloadInterval = setInterval(() => {
//       if (Date.now() - lastChunkTime > 5000) {
//         console.warn("Download stalled, aborting...");
//         controller.abort();
//         // if (!responseSent) {
//         //   responseSent = true;
//           clearInterval(downloadInterval);
//           return res.json({success:"false",message:"Download failed due to inactivity."});
//         // }
//       }
//     }, 100);

//     response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

//    // Save the ZIP file locally
//    await new Promise((resolve, reject) => {
//     writer.on("finish", () => {
//       clearInterval(downloadInterval);
//       if (totalSize && downloadedSize.toString() !== totalSize) {
//         console.error("File might be incomplete!");
//         fs.unlinkSync(downQPpath1);
//         return reject(new Error("Incomplete file download"));
//       }

//       console.log("Download complete!");
//       return resolve();
//     });

//     writer.on("error", (err) => {
//       clearInterval(downloadInterval);
//       fs.unlinkSync(downQPpath1);
//       return reject(err);
//     });
//   });
//    console.log(`File downloaded and saved to: ${downQPpath1}`);

//    // Extract ZIP file directly to the required folder
//    const zip = new AdmZip(downQPpath1);
//    zip.extractAllTo(extractPath, true);
//    console.log(`Files extracted to: ${extractPath}`);

//    // Delete ZIP after extraction
//    fs.unlinkSync(downQPpath1);
//    console.log("ZIP file deleted after extraction.");

//   const mysqlPath = process.env.MYSQLPATH;

// // Escape special characters in password
// const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

// const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

// console.log(dumpFilePath);
// // Construct the MySQL import command
// const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
// // console.log("Executing command:", command);

// try {
//   // Execute the MySQL import command
//   const { stdout, stderr } = await execAsync(command);

//   if (stderr) {
//     console.error(`MySQL stderr: ${stderr}`);
//   }

//   if (stdout) {
//     console.log(`MySQL stdout: ${stdout}`);
//   } else {
//     console.log("MySQL executed successfully with no output.");
//   }
//   // let autoID= "1";
//   let autoID= autoIDOne;
//   // if (autoID !== "" && mockDB === "") {
//   if (autoID !== "") {
//     const queries = [
//       `ALTER TABLE iib_candidate_test AUTO_INCREMENT = ${autoID}`,
//       `ALTER TABLE iib_candidate_scores AUTO_INCREMENT = ${autoID}`
//     ];

//     queries.forEach((query) => {
//       db.query(query, (err, result) => {
//         if (err) {
//           console.error("Error updating AUTO_INCREMENT:", err);
//         } else {
//           console.log("AUTO_INCREMENT updated successfully for:", query);
//         }
//       });
//     });
//   }

//   // Insert into autofeed
//   const insertAutofeedSQL = "INSERT INTO autofeed (center_code, serverno, autoid) VALUES (?, ?, ?)";
//   const formattedinsertAutofeedSQL = db.format(insertAutofeedSQL, [ccode, servernoVal, 1]);
//   db.query(insertAutofeedSQL, [ccode, servernoVal, 1], async (err) => {
//     if (err) {
//       console.error("MySQL insert error:", err);
//       return res.status(500).json({ message: "Error inserting data into autofeed." });
//     }

//    // Insert the exact formatted query into xml_feed
//    insertIntoXmlFeed(formattedinsertAutofeedSQL, (err) => {
//      if (err) {
//        return db.rollback(() => {
//          console.error("Error inserting feed table:", err);
//          res.status(500).json({ message: "Internal Server Error" });
//        });
//      }
//    });

//    })

//   // const sqlInsert = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//   const sqlUpdate = `UPDATE qp_download SET serverno = ? , download_status = ? , download_time = ? WHERE centre_code = ? AND download_sec = ? `;
//   // const sqlUpdate = `UPDATE qp_download SET serverno = ? , download_status = ? WHERE centre_code = ?`;
//   const UpdateVal =[servernoValOne, "D", formattedTime, ccodeOne, "Mac Address"];
//   const formattedsqlUpdate = db.format(sqlUpdate, UpdateVal);
//   db.query(sqlUpdate, UpdateVal,
//     (err) => {
//       if (err) {
//         console.error("MySQL insert error:", err);
//         return res.status(500).json({ message: "Internal Server Error" });
//       }

//       // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedsqlUpdate, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting feed table:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });
//     });

//     const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//   const formattedsqlInsertBase = db.format(sqlInsertBase, [ccodeOne, servernoValOne,"Base QP","D",formattedTime]);
//   db.query(sqlInsertBase,
//     [ccodeOne, servernoValOne, "Base QP", "D", formattedTime],
//     (err) => {
//       if (err) {
//         console.error("MySQL insert error:", err);
//         return res.status(500).json({ message: "Internal Server Error" });
//       }

//       // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting feed table:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });
//     });

//   // Send the response after both operations are successful
//   return res.send("Dump file imported and PM2 process restarted successfully");

// } catch (error) {
//   console.error("Error during process:", error);
//   return res.status(500).send("Error importing dump file or restarting PM2");
// }
//   // }
// }
// }
//   }

//   if((status != "Base" && status != "Act") && qpStatus==2){

//     // console.log("statusstatusstatus",status);
//     const data_eal = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : ''
//     }

//     console.log(data_eal);

//   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_eal),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_eal = response.data.data.split('^$^');
//   const responseCurl = res_eal[0];
//   const autoID = res_eal[1];
//   const pre = res_eal[2];
//   const pos = res_eal[3];
//   const dPath = res_eal[4];
//   const servernoVal = res_eal[5];
//   const ccode = res_eal[6];

//     const data_ealOne = {
//       process :'2',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : servernoVal,
//       centreCode : ccode
//     }

//     // console.log(data_ealOne);

//   const responseOne = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealOne),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_ealOne = responseOne.data.data.split('^$^');
//   const responseCurlOne = res_ealOne[0];
//   const autoIDOne = res_ealOne[1];
//   const preOne = res_ealOne[2];
//   const posOne = res_ealOne[3];
//   const dPathOne = res_ealOne[4];
//   const servernoValOne = res_ealOne[5];
//   const ccodeOne = res_ealOne[6];

//   console.log("ONE",res_ealOne);

//     if(responseCurlOne=="A"){
//       const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}.zip`;
//       const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}.zip`;
//       const sqlDB = status;
//       const filename = Buffer.from(`${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}`).toString("base64");

//       // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME_DASH}.zip`);
//       const extractPath = process.env.DOWNQPPATH; // Extract directly here

//         // let dumpFilePath = downQPpath1;
//         // const data_ealThree = {pathcmd :dPathOne }

//     // const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,(data_ealThree), {
//     //   responseType: "arraybuffer", // Ensures binary data is received
//     //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // });

//         // Fetch the file from URL
//       // const response = await axios.get(qpfile, {
//       //   responseType: "arraybuffer", // Ensures binary data is received
//       //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//       // });
//       const response = await axios({
//         method: "get",
//         url: qpfile,
//         responseType: "stream", // ✅ Use "stream" to track progress properly
//         httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
//         signal: controller.signal,
//       });

//       if (response.status !== 200) {
//         console.error(`Failed to download file. HTTP Status: ${response.status}`);
//         return res.json({success:"false",message:"Failed to download the file."});
//       }
//       const totalSize = response.headers["content-length"];
//       let downloadedSize = 0;
//       let lastChunkTime = Date.now();

//       const writer = fs.createWriteStream(downQPpath1);

//      response.data.on("data", (chunk) => {
//           downloadedSize += chunk.length;
//           lastChunkTime = Date.now();
//           const downloadPercentage = ((downloadedSize / totalSize) * 100).toFixed(2);
//           io.emit("download-percentage", { percentage: downloadPercentage });
//           console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
//     });

//         const downloadInterval = setInterval(() => {
//           if (Date.now() - lastChunkTime > 5000) {
//             console.warn("Download stalled, aborting...");
//             controller.abort();
//             // if (!responseSent) {
//             //   responseSent = true;
//               clearInterval(downloadInterval);
//               return res.json({success:"false",message:"Download failed due to inactivity."});
//             // }
//           }
//         }, 100);

//         response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

//        // Save the ZIP file locally
//        await new Promise((resolve, reject) => {
//         writer.on("finish", () => {
//           clearInterval(downloadInterval);
//           if (totalSize && downloadedSize.toString() !== totalSize) {
//             console.error("File might be incomplete!");
//             fs.unlinkSync(downQPpath1);
//             return reject(new Error("Incomplete file download"));
//           }

//           console.log("Download complete!");
//           return resolve();
//         });

//         writer.on("error", (err) => {
//           clearInterval(downloadInterval);
//           fs.unlinkSync(downQPpath1);
//           return reject(err);
//         });
//       });

//        // Save the ZIP file locally
//       //  fs.writeFileSync(downQPpath1, response.data);
//        console.log(`File downloaded and saved to: ${downQPpath1}`);

//        // Extract ZIP file directly to the required folder
//        const zip = new AdmZip(downQPpath1);
//        zip.extractAllTo(extractPath, true);
//        console.log(`Files extracted to: ${extractPath}`);

//        // Delete ZIP after extraction
//        fs.unlinkSync(downQPpath1);
//        console.log("ZIP file deleted after extraction.");

//       const mysqlPath = process.env.MYSQLPATH;

//     // Escape special characters in password
//     const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

//     const dumpFilePath = path.join(extractPath, `${sqlDB}.sql`);

//     console.log(dumpFilePath);
//     // Construct the MySQL import command
//     const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
//     // console.log("Executing command:", command);

//     try {
//       // Execute the MySQL import command
//       const { stdout, stderr } = await execAsync(command);

//       if (stderr) {
//         console.error(`MySQL stderr: ${stderr}`);
//       }

//       if (stdout) {
//         console.log(`MySQL stdout: ${stdout}`);
//       } else {
//         console.log("MySQL executed successfully with no output.");
//       }
//       // let autoID= "1";

//         const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//       const formattedsqlInsertBase = db.format(sqlInsertBase, [ccodeOne, servernoValOne,"Center QP","D",formattedTime]);
//       db.query(sqlInsertBase,
//         [ccodeOne, servernoValOne, "Center QP", "D", formattedTime],
//         (err) => {
//           if (err) {
//             console.error("MySQL insert error:", err);
//             return res.status(500).json({ message: "Internal Server Error" });
//           }

//           // Insert the exact formatted query into xml_feed
//           insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting feed table:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });
//         });

//           const data_ealTwo = {
//             process :'4',
//             macId: serialNumber,
//             database: process.env.DB_NAME_DASH,
//             action : '',
//             serverNumber : servernoVal,
//             centreCode : ccode
//           }

//           // console.log(data_ealOne);

//           const responseTwo = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealTwo),
//           // {headers:
//           //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//           //       withCredentials: true,}
//               );

//         const res_ealTwo = responseTwo.data.data.split('^$^');
//         const responseCurlTwo = res_ealTwo[0];
//         const autoIDTwo = res_ealTwo[1];
//         const preTwo = res_ealTwo[2];
//         const posTwo = res_ealTwo[3];
//         const dPathTwo = res_ealTwo[4];
//         const servernoValTwo = res_ealTwo[5];
//         const ccodeTwo = res_ealTwo[6];

//         console.log("Two",res_ealTwo);

//           if(responseCurlTwo=="A"){
//             const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathTwo, "base64").toString()}/images.zip`;
//             const downQPpath1 = `${process.env.DOWNQPPATH}\\images.zip`;
//             const sqlDB = status;
//             // const filename = Buffer.from(`${Buffer.from(dPathTwo, "base64").toString()}/${sqlDB}.zip||${status}`).toString("base64");

//             // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME_DASH}.zip`);
//             // const extractPath = process.env.DOWNQPPATH; // Extract directly here
//             const extractPath = `${process.env.DOWNQPPATH}/image`;

//               // let dumpFilePath = downQPpath1;

//               // const data_ealThree = {pathcmd :dPathOne }

//     // const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,(data_ealThree), {
//     //   responseType: "arraybuffer", // Ensures binary data is received
//     //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // });

//               // Fetch the file from URL
//               const response = await axios({
//                 method: "get",
//                 url: qpfile,
//                 responseType: "stream", // ✅ Use "stream" to track progress properly
//                 httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ⚠️ Only use in dev if SSL issues exist
//                 signal: controller.signal,
//               });

//               if (response.status !== 200) {
//                 console.error(`Failed to download file. HTTP Status: ${response.status}`);
//                 return res.json({success:"false",message:"Failed to download the file."});
//               }
//               const totalSize = response.headers["content-length"];
//               let downloadedSize = 0;
//               let lastChunkTime = Date.now();

//               const writer = fs.createWriteStream(downQPpath1);

//              response.data.on("data", (chunk) => {
//                   downloadedSize += chunk.length;
//                   lastChunkTime = Date.now();
//                   const downloadPercentage = ((downloadedSize / totalSize) * 100).toFixed(2);
//                   io.emit("download-percentage", { percentage: downloadPercentage });
//                   console.log(`Downloaded: ${downloadedSize} / ${totalSize} bytes`);
//             });

//                 const downloadInterval = setInterval(() => {
//                   if (Date.now() - lastChunkTime > 5000) {
//                     console.warn("Download stalled, aborting...");
//                     controller.abort();
//                     // if (!responseSent) {
//                     //   responseSent = true;
//                       clearInterval(downloadInterval);
//                       return res.json({success:"false",message:"Download failed due to inactivity."});
//                     // }
//                   }
//                 }, 100);

//                 response.data.pipe(writer); // ✅ Stream file to disk instead of `writeFileSync`

//                // Save the ZIP file locally
//                await new Promise((resolve, reject) => {
//                 writer.on("finish", () => {
//                   clearInterval(downloadInterval);
//                   if (totalSize && downloadedSize.toString() !== totalSize) {
//                     console.error("File might be incomplete!");
//                     fs.unlinkSync(downQPpath1);
//                     return reject(new Error("Incomplete file download"));
//                   }

//                   console.log("Download complete!");
//                   return resolve();
//                 });

//                 writer.on("error", (err) => {
//                   clearInterval(downloadInterval);
//                   fs.unlinkSync(downQPpath1);
//                   return reject(err);
//                 });
//               });
//              console.log(`File downloaded and saved to: ${downQPpath1}`);

//              // Extract ZIP file directly to the required folder
//              const zip = new AdmZip(downQPpath1);
//              zip.extractAllTo(extractPath, true);
//              console.log(`Files extracted to: ${extractPath}`);

//              // Delete ZIP after extraction
//              fs.unlinkSync(downQPpath1);
//              console.log("ZIP file deleted after extraction.");

//           try {

//               const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//             const formattedsqlInsertBase = db.format(sqlInsertBase, [ccodeTwo, servernoValTwo,"Image","D",formattedTime]);
//             db.query(sqlInsertBase,
//               [ccodeTwo, servernoValTwo, "Image", "D", formattedTime],
//               (err) => {
//                 if (err) {
//                   console.error("MySQL insert error:", err);
//                   return res.status(500).json({ message: "Internal Server Error" });
//                 }

//                 // Insert the exact formatted query into xml_feed
//                 insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       console.error("Error inserting feed table:", err);
//                       res.status(500).json({ message: "Internal Server Error" });
//                     });
//                   }
//                 });
//               });

//             // Send the response after both operations are successful
//             // return res.send("Dump file imported and PM2 process restarted successfully");

//           } catch (error) {
//             console.error("Error during process:", error);
//             return res.status(500).send("Error importing dump file or restarting PM2");
//           }
//             // }
//           }
//         // }

//       // Send the response after both operations are successful
//       return res.send("Dump file imported and PM2 process restarted successfully");

//     } catch (error) {
//       console.error("Error during process:", error);
//       return res.status(500).send("Error importing dump file or restarting PM2");
//     }
//       // }
//     }
//   }

//   if((status != "Base" && status != "Act") && qpStatus==4){

//     // console.log("statusstatusstatus",status);
//     const data_eal = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : ''
//     }

//     console.log(data_eal);

//   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_eal),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_eal = response.data.data.split('^$^');
//   const responseCurl = res_eal[0];
//   const autoID = res_eal[1];
//   const pre = res_eal[2];
//   const pos = res_eal[3];
//   const dPath = res_eal[4];
//   const servernoVal = res_eal[5];
//   const ccode = res_eal[6];

//     const data_ealOne = {
//       process :'4',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : servernoVal,
//       centreCode : ccode
//     }

//     // console.log(data_ealOne);

//   const responseOne = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealOne),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_ealOne = responseOne.data.data.split('^$^');
//   const responseCurlOne = res_ealOne[0];
//   const autoIDOne = res_ealOne[1];
//   const preOne = res_ealOne[2];
//   const posOne = res_ealOne[3];
//   const dPathOne = res_ealOne[4];
//   const servernoValOne = res_ealOne[5];
//   const ccodeOne = res_ealOne[6];

//   console.log("ONE",res_ealOne);

//     if(responseCurlOne=="A"){
//       const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}_photo.zip`;
//       const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}_photo.zip`;
//       const sqlDB = `${status}_photo`;
//       const filename = Buffer.from(`${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}_photo`).toString("base64");

//       const extractPath = `${process.env.DOWNQPPATH}/photo`;

//         // let dumpFilePath = downQPpath1;
//     // const data_ealThree = {pathcmd :dPathOne }

//     // const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,(data_ealThree), {
//     //   responseType: "arraybuffer", // Ensures binary data is received
//     //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // });

//         // Fetch the file from URL
//       const response = await axios.get(qpfile, {
//         responseType: "arraybuffer", // Ensures binary data is received
//         httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//       });

//        // Save the ZIP file locally
//        fs.writeFileSync(downQPpath1, response.data);
//        console.log(`File downloaded and saved to: ${downQPpath1}`);

//        // Extract ZIP file directly to the required folder
//        const zip = new AdmZip(downQPpath1);
//        zip.extractAllTo(extractPath, true);
//        console.log(`Files extracted to: ${extractPath}`);

//        // Delete ZIP after extraction
//        fs.unlinkSync(downQPpath1);
//        console.log("ZIP file deleted after extraction.");

//     try {

//         const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//       const formattedsqlInsertBase = db.format(sqlInsertBase, [ccodeOne, servernoValOne,"Photos","D",formattedTime]);
//       db.query(sqlInsertBase,
//         [ccodeOne, servernoValOne, "Photos", "D", formattedTime],
//         (err) => {
//           if (err) {
//             console.error("MySQL insert error:", err);
//             return res.status(500).json({ message: "Internal Server Error" });
//           }

//           // Insert the exact formatted query into xml_feed
//           insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting feed table:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });
//         });

//       // Send the response after both operations are successful
//       return res.send("Dump file imported and PM2 process restarted successfully");

//     } catch (error) {
//       console.error("Error during process:", error);
//       return res.status(500).send("Error importing dump file or restarting PM2");
//     }
//     }
//   }

//   if((status != "Base" && status != "Act") && qpStatus==5){

//     // console.log("statusstatusstatus",status);
//     const data_eal = {
//       process :'1',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : ''
//     }

//     console.log(data_eal);

//   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_eal),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_eal = response.data.data.split('^$^');
//   const responseCurl = res_eal[0];
//   const autoID = res_eal[1];
//   const pre = res_eal[2];
//   const pos = res_eal[3];
//   const dPath = res_eal[4];
//   const servernoVal = res_eal[5];
//   const ccode = res_eal[6];

//     const data_ealOne = {
//       process :'5',
//       macId: serialNumber,
//       database: process.env.DB_NAME_DASH,
//       action : '',
//       serverNumber : servernoVal,
//       centreCode : ccode
//     }

//     // console.log(data_ealOne);

//   const responseOne = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealOne),
//     // {headers:
//     //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//     //       withCredentials: true,}
//         );

//   const res_ealOne = responseOne.data.data.split('^$^');
//   const responseCurlOne = res_ealOne[0];
//   const autoIDOne = res_ealOne[1];
//   const preOne = res_ealOne[2];
//   const posOne = res_ealOne[3];
//   const dPathOne = res_ealOne[4];
//   const servernoValOne = res_ealOne[5];
//   const ccodeOne = res_ealOne[6];

//   console.log("ONE",res_ealOne);

//     if(responseCurlOne=="A"){
//       const qpfile = `${process.env.DEMOSERVER}${Buffer.from(dPathOne, "base64").toString()}/${status}_sign.zip`;
//       const downQPpath1 = `${process.env.DOWNQPPATH}\\${status}_sign.zip`;
//       const sqlDB = `${status}_sign`;
//       const filename = Buffer.from(`${Buffer.from(dPathOne, "base64").toString()}/${sqlDB}.zip||${status}_sign`).toString("base64");

//       // const downQPpath1 = path.join("C:/pro/itest/activate", `${process.env.DB_NAME_DASH}.zip`);
//       const extractPath = `${process.env.DOWNQPPATH}/sign`; // Extract directly here

//         // let dumpFilePath = downQPpath1;
//         // const data_ealThree = {pathcmd :dPathOne }

//     // const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/getServerFiles`,(data_ealThree), {
//     //   responseType: "arraybuffer", // Ensures binary data is received
//     //   httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//     // });

//         // Fetch the file from URL
//       const response = await axios.get(qpfile, {
//         responseType: "arraybuffer", // Ensures binary data is received
//         httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignores SSL errors if any
//       });

//        // Save the ZIP file locally
//        fs.writeFileSync(downQPpath1, response.data);
//        console.log(`File downloaded and saved to: ${downQPpath1}`);

//        // Extract ZIP file directly to the required folder
//        const zip = new AdmZip(downQPpath1);
//        zip.extractAllTo(extractPath, true);
//        console.log(`Files extracted to: ${extractPath}`);

//        // Delete ZIP after extraction
//        fs.unlinkSync(downQPpath1);
//        console.log("ZIP file deleted after extraction.");

//     try {
//       const sqlInsertBase = `INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)`;
//       const formattedsqlInsertBase = db.format(sqlInsertBase, [ccodeOne, servernoValOne,"Sign","D",formattedTime]);
//       db.query(sqlInsertBase,
//         [ccodeOne, servernoValOne, "Sign", "D", formattedTime],
//         (err) => {
//           if (err) {
//             console.error("MySQL insert error:", err);
//             return res.status(500).json({ message: "Internal Server Error" });
//           }

//           // Insert the exact formatted query into xml_feed
//           insertIntoXmlFeed(formattedsqlInsertBase, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting feed table:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });
//         });

//         const data_ealStatus = {
//           process :'6',
//           macId: serialNumber,
//           database: process.env.DB_NAME_DASH,
//           serverNumber : servernoVal
//         }

//         // console.log(data_ealOne);

//       const responseStatus = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_ealStatus),
//         // {headers:
//         //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
//         //       withCredentials: true,}
//       );
//       console.log(responseStatus);

//       // Send the response after both operations are successful
//       return res.send("Dump file imported and PM2 process restarted successfully");

//     } catch (error) {
//       console.error("Error during process:", error);
//       return res.status(500).send("Error importing dump file or restarting PM2");
//     }
//     }
//   }

// });

const execAsync = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// Helper function to restart PM2
// const restartPm2 = () => {
//   return new Promise((resolve, reject) => {
//     console.log("Attempting to restart PM2...");  // Debug log to check if the function is being called

//     exec(`"${pm2Path}" restart server`, { windowsHide: true }, (pm2Error, pm2Stdout, pm2Stderr) => {
//       if (pm2Error) {
//         console.error(`PM2 Error: ${pm2Error.message}`);
//         console.error(`stderr: ${pm2Stderr}`);
//         reject(`PM2 Error: ${pm2Error.message}`);
//       } else {
//         console.log(`PM2 stdout: ${pm2Stdout}`);  // Log the stdout for PM2
//         resolve(pm2Stdout);
//       }
//     });

//   });
// };

app.post("/insert-base", async (req, res) => {
  try {
    const { centre_code, serverno, download_sec, batchValue } = req.body;

    if (!centre_code || !serverno || !download_sec) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Fetch serial number
    // const result = await axios.get("http://localhost:5000/serial-number/");
    // const serialNumber = result.data.serialNumber;
    const serialNumber = await utils.getSerialNumber();
    const checkSql =
      "SELECT COUNT(*) AS count FROM qp_download WHERE centre_code = ? AND serverno = ? AND download_sec = ?";
    const checkValues = [centre_code, serverno, download_sec];

    db.query(checkSql, checkValues, (err, checkResult) => {
      if (err) {
        console.error("MySQL select error:", err);
        return res
          .status(500)
          .json({ message: "Error checking data in the database." });
      }

      if (checkResult[0].count > 0) {
        return res.status(409).json({ message: "Record already exists." });
      }

      const [activate_status, batch_time] = download_sec.split("-"); // Split download_sec
      if (activate_status == "Activated") {
        // Insert into qp_download
        const insertDownloadSQL =
          "INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)";
        const downloadValues = [
          centre_code,
          serverno,
          download_sec,
          "D",
          formattedTime,
        ];
        const formattedinsertDownloadSQL = db.format(
          insertDownloadSQL,
          downloadValues
        );
        db.query(insertDownloadSQL, downloadValues, (err) => {
          if (err) {
            console.error("MySQL insert error:", err);
            return res
              .status(500)
              .json({ message: "Error inserting data into qp_download." });
          }

          // Insert the exact formatted query into xml_feed
          // insertIntoXmlFeed(formattedinsertDownloadSQL, (err) => {
          //   if (err) {
          //     return db.rollback(() => {
          //       console.error("Error inserting feed table:", err);
          //       res.status(500).json({ message: "Internal Server Error" });
          //     });
          //   }
          // });

          // Call external API only if status is "Activated"
          const data_eal = {
            macId: serialNumber,
            database: process.env.DB_NAME,
            centreCode: centre_code,
            serverNumber: serverno,
            pwdPos: batchValue - 1,
            batchTime: batch_time,
            serviceCall: "AK",
          };

          console.log(data_eal);

          axios
            .post(
              `${process.env.EXAM_DASHBOARD_URL}/autoAssignServerNumber`,
              data_eal
            )
            .then((response) => {
              console.log("Server response:", response.data);
              res.status(200).json({ message: "Data inserted successfully." });
            })
            .catch((error) => {
              console.error("Error calling external API:", error.message);
              res.status(500).json({ message: "Error calling external API." });
            });
        });
      } else {
        res.status(200).json({ message: "Data inserted successfully." });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Endpoint to get exam slot count
app.get("/exam-slot-count", (req, res) => {
  const query = `SELECT COUNT(*) as slotCount FROM iib_exam_slots`;

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ slotCount: results[0].slotCount });
  });
});

// Route to clear data
app.get("/clear", (req, res) => {
  const queries = [
    `DROP DATABASE ${process.env.DB_NAME}`,
    `CREATE DATABASE ${process.env.DB_NAME}`,
  ];

  // Remove the directories
  directoriesToClear.forEach(clearDirectoryFiles);
  directoriesToRemove.forEach(removeDirectory);

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Function to execute queries within a transaction
    const executeQueriesInTransaction = (index) => {
      if (index >= queries.length) {
        return db.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          // res.send("All queries executed and committed successfully");

          const dumpFilePath = "C:/pro/itest/activate/db.dmp";
          // const mysqlPath = "C:/mysql5/bin/mysql.exe";
          const mysqlPath = process.env.MYSQLPATH;

          // Escape special characters in the password if needed
          const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

          // Construct the command
          const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
          console.log(command);
          exec(command, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              console.error(`stderr: ${stderr}`);
              return res.status(500).send("Error importing dump file");
            }
            console.log(`stdout: ${stdout}`);
            res.status(200).send("Dump file imported successfully");
          });
        });
      }

      db.query(queries[index], (err) => {
        if (err) {
          console.error("Error executing query:", err);
          return db.rollback(() => {
            insertIntoXmlFeed;
            res.status(500).json({ error: "Internal Server Error" });
          });
        }
        executeQueriesInTransaction(index + 1); // Execute the next query
      });
    };

    executeQueriesInTransaction(0); // Start executing queries
  });
});

// Define a route to fetch the data
// app.get("/exam-data/:centrecode", (req, res) => {
//   // SQL query to join the tables
//   const centrecode = req.params.centrecode;
//   try {
//   //  console.log(centrecode);
//   const query = `SELECT  DATE_FORMAT(slot.exam_date, '%Y-%m-%d') AS exam_date,slot.zone_code,COUNT(distinct(slot.membership_no)) AS totalScheduled, COUNT(CASE WHEN test.test_status = "C" THEN 1 END) AS totalComplete,COUNT(CASE WHEN test.test_status = "IC" THEN 1 END) AS totalIncomplete FROM  iib_candidate_iway slot LEFT JOIN  iib_candidate_test test ON slot.membership_no = test.membership_no and slot.centre_code = ? group by slot.exam_time`;
//   db.query(query, [centrecode], (err, results) => {
//     if (err) {
//       console.error("Error querying the database:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }

//     res.json(results);
//   });
// } catch (err) {
//   console.error("Error querying the database:", err);
//   res.status(500).json({ error: "Internal Server Error" });
// }
// });

app.get("/exam-data/:centrecode", async (req, res) => {
  try {
    const centrecode = req.params.centrecode;

    // Check if the table exists
    // const tableCheckQuery = `SHOW TABLES LIKE 'iib_candidate_iway'`;
    // const tableExists = await queryAsync(tableCheckQuery);

    // if (tableExists.length === 0) {
    //   return res.status(404).json({ error: "Table does not exist." });
    // }

    const query = `SELECT DATE_FORMAT(slot.exam_date, '%Y-%m-%d') AS exam_date, slot.zone_code, COUNT(DISTINCT slot.membership_no) AS totalScheduled, COUNT(DISTINCT CASE WHEN test.test_status = 'C' THEN slot.membership_no END) AS totalComplete, COUNT(DISTINCT CASE WHEN test.test_status = 'IC' THEN slot.membership_no END) AS totalIncomplete FROM iib_candidate_iway slot LEFT JOIN iib_candidate_test test 
    ON slot.membership_no = test.membership_no WHERE slot.centre_code = ? GROUP BY slot.exam_time`;

    const results = await queryAsync(query, [centrecode]);
    res.json(results);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle response submissions
app.post("/response", (req, res) => {
  const {
    questionId,
    answer,
    qpno,
    displayorder,
    tag,
    hostip,
    updatedtime,
    clienttime,
    totalTime,
    encryptKey,
  } = req.body;
  if (!questionId || !answer || !qpno || !displayorder || !tag || !hostip) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  const time_taken = totalTime - clienttime;
  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    try {
      // Function to get question type
      const getQuestionType = (questionId) => {
        const query =
          "SELECT question_type FROM iib_sq_details WHERE question_id = ?";
        return new Promise((resolve, reject) => {
          db.query(query, [questionId], (err, results) => {
            if (err) {
              console.error("Error querying the database:", err);
              return reject(new Error("Internal Server Error"));
            }
            if (results.length === 0) {
              return reject(new Error("Question type not found"));
            }
            resolve(results[0].question_type);
          });
        });
      };

      const quesType = await getQuestionType(questionId);

      // Format the insert query based on question type
      const insertResponseSql =
        "INSERT INTO iib_response (question_paper_no, question_id, answer, display_order, tag, host_ip, updatedtime, clienttime) VALUES (?, ?, AES_ENCRYPT(?,UNHEX(SHA2(?, 256))), ?, ?, ?, ?, ?)";
      const formattedInsertResponseSql = db.format(insertResponseSql, [
        qpno,
        questionId,
        quesType === "DQ" ? "DQ" : answer,
        encryptKey,
        displayorder,
        tag,
        hostip,
        updatedtime,
        clienttime,
      ]);

      // Insert response into the database
      const insertResult = await new Promise((resolve, reject) => {
        db.query(formattedInsertResponseSql, (err, result) => {
          if (err) {
            return reject(new Error("MySQL insert error"));
          }
          resolve(result);
        });
      });

      const lastInsertedId = insertResult.insertId;

      // Insert into descriptive_answer if question type is DQ
      if (quesType === "DQ") {
        const insertDqQuery =
          "INSERT INTO descriptive_answer (response_id, question_id, question_paper_no, desc_ans) VALUES (?, ?, ?, AES_ENCRYPT(?,UNHEX(SHA2(?, 256))))";

        const formattedinsertDqQuery = db.format(insertDqQuery, [
          lastInsertedId,
          questionId,
          qpno,
          answer,
        ]);

        await new Promise((resolve, reject) => {
          db.query(
            insertDqQuery,
            [lastInsertedId, questionId, qpno, answer, encryptKey],
            (err) => {
              if (err) {
                return reject(
                  new Error("Error inserting into descriptive_answer")
                );
              }
              resolve();
            }
          );
        });

        // Insert the exact formatted query into xml_feed
        await new Promise((resolve, reject) => {
          insertIntoXmlFeed(formattedinsertDqQuery, (err) => {
            if (err) {
              return reject(new Error("Error inserting feed table"));
            }
            resolve();
          });
        });
      }

      // Insert the exact formatted query into xml_feed
      await new Promise((resolve, reject) => {
        insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
          if (err) {
            return reject(new Error("Error inserting feed table"));
          }
          resolve();
        });
      });

      // Format and execute the update query
      // const updateTestSql =
      //   "UPDATE iib_candidate_test SET last_updated_time = ?, time_taken = ?, time_left = ?, clienttime = ? WHERE host_ip = ? AND question_paper_no = ?";
      // const formattedUpdateTestSql = db.format(updateTestSql, [updatedtime,time_taken,clienttime,clienttime,hostip,qpno]);

      // This logic implemented for same host_ip

      // const updateTestSql = `UPDATE iib_candidate_test SET last_updated_time = ?, time_taken = ?, time_left = ?, clienttime = ?  WHERE host_ip = ? AND question_paper_no = ? AND start_time = (SELECT MAX(start_time) FROM iib_candidate_test WHERE host_ip = ? ND question_paper_no = ?)`;
      const updateTestSql = ` UPDATE iib_candidate_test SET last_updated_time = ?, time_taken = ?, time_left = ?, clienttime = ? WHERE host_ip = ? AND question_paper_no = ? AND start_time = (SELECT MAX(start_time) FROM (SELECT start_time FROM iib_candidate_test WHERE host_ip = ? AND question_paper_no = ? ORDER BY start_time DESC LIMIT 1) AS t)`;

      const formattedUpdateTestSql = db.format(updateTestSql, [
        updatedtime,
        time_taken,
        clienttime,
        clienttime,
        hostip,
        qpno,
        hostip,
        qpno,
      ]);

      // console.log(formattedUpdateTestSql);

      await new Promise((resolve, reject) => {
        db.query(formattedUpdateTestSql, (err) => {
          if (err) {
            return reject(new Error("MySQL update error"));
          }
          resolve();
        });
      });

      // Insert update query into xml_feed
      await new Promise((resolve, reject) => {
        insertIntoXmlFeed(formattedUpdateTestSql, (err) => {
          if (err) {
            return reject(
              new Error("Error inserting update query into xml_feed")
            );
          }
          resolve();
        });
      });

      // Commit transaction
      db.commit((commitErr) => {
        if (commitErr) {
          console.error("Transaction commit error:", commitErr);
          return db.rollback(() => {
            res.status(500).json({ message: "Internal Server Error" });
          });
        }

        res.json({
          status: "200",
          message: "Data inserted and test updated successfully",
        });
      });
    } catch (error) {
      console.error("Transaction error:", error.message);
      db.rollback(() => {
        res.status(500).json({ message: error.message });
      });
    }
  });
});

// Route to handle exam completion
app.post("/update-exam-status", (req, res) => {
  const {
    membershipNo,
    exam_code,
    subject_code,
    score,
    exam_date,
    time_taken,
    result,
    auto_submit,
    updated_on,
  } = req.body;

  if (!membershipNo || !subject_code || score === undefined) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Insert into iib_candidate_score
    const insertScoreSql =
      "INSERT INTO iib_candidate_scores (membership_no, exam_code, subject_code,  score, exam_date, time_taken, result, auto_submit, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const formattedinsertScoreSql = db.format(insertScoreSql, [
      membershipNo,
      exam_code,
      subject_code,
      score,
      exam_date,
      time_taken,
      result,
      auto_submit,
      updated_on,
    ]);

    db.query(formattedinsertScoreSql, (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("MySQL insert error:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }

      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(formattedinsertScoreSql, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });

      // Update iib_candidate_test
      const updateTestSql =
        "UPDATE iib_candidate_test SET  test_status = ?, end_time = ? WHERE membership_no = ? and subject_code = ?";
      const formattedupdateTestSql = db.format(updateTestSql, [
        "C",
        updated_on,
        membershipNo,
        subject_code,
      ]);
      db.query(
        updateTestSql,
        ["C", updated_on, membershipNo, subject_code],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error("MySQL update error:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }

          // Insert the exact formatted query into xml_feed
          insertIntoXmlFeed(formattedupdateTestSql, (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting feed table:", err);
                res.status(500).json({ message: "Internal Server Error" });
              });
            }
          });

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Transaction commit error:", err);
                res.status(500).json({ message: "Internal Server Error" });
              });
            }

            res.json({
              status: "200",
              message: "Exam status updated and score inserted successfully",
            });
          });
        }
      );
    });
  });
});

// Route to handle form submissions
app.post("/submit-form", (req, res) => {
  const { name, email, password, subjectCode, examDate } = req.body;
  if (!name || !email || !password || !subjectCode || !examDate) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql =
    "INSERT INTO user_data (name, email, password, subject_code, exam_date) VALUES (?, ?, ?, ?, ?)";
  const formattedsql = db.format(sql, [
    name,
    email,
    hashedPassword,
    subjectCode,
    examDate,
  ]);
  db.query(
    sql,
    [name, email, hashedPassword, subjectCode, examDate],
    (err, result) => {
      if (err) {
        console.error("MySQL insert error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        insertIntoXmlFeed(formattedsql, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting feed table:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
        res.json({ status: "200", message: "Data inserted successfully" });
      }
      // Insert the exact formatted query into xml_feed
    }
  );
});

// Route to handle Subject submission
app.post("/subject-form", (req, res) => {
  const { scode, sname, examDate } = req.body;
  if (!scode || !sname || !examDate) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  const sql =
    "INSERT INTO subject_data (subject_code, subject_name, exam_date) VALUES (?, ?, ?)";
  const formattedsql = db.format(sql, [scode, sname, examDate]);
  db.query(sql, [scode, sname, examDate], (err, result) => {
    if (err) {
      console.error("MySQL insert error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(formattedsql, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      res.json({ status: "200", message: "Data inserted successfully" });
    }
  });
});

// Route to handle Question submission
app.post("/submit-qp", (req, res) => {
  const { subjectCode, questions } = req.body;
  const sql =
    "INSERT INTO questions (subject_code, question_text, option_a, option_b, option_c, option_d, correct_ans, mark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  questions.forEach((question) => {
    const formattedsql = db.format(sql, [
      subjectCode,
      question.question,
      question.options[0].text,
      question.options[1].text,
      question.options[2].text,
      question.options[3].text,
      question.correct_ans,
      question.mark,
    ]);

    db.query(
      sql,
      [
        subjectCode,
        question.question,
        question.options[0].text,
        question.options[1].text,
        question.options[2].text,
        question.options[3].text,
        question.correct_ans,
        question.mark,
      ],
      (err, result) => {
        if (err) {
          console.error("MySQL insert error:", err);
          res.status(500).json({ message: "Internal Server Error" });
        }
        // Insert the exact formatted query into xml_feed
        insertIntoXmlFeed(formattedsql, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting feed table:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
      }
    );
  });
  res.json({ status: "200", message: "Data inserted successfully" });
});

// Route to get subject codes
app.get("/subject-codes", (req, res) => {
  const query =
    "SELECT subject_code, subject_name, exam_date FROM iib_exam_subjects";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Route to get question counts
app.get("/question-counts/:subjectCode", (req, res) => {
  const subjectCode = req.params.subjectCode;
  const sql = "SELECT COUNT(*) as count FROM questions WHERE subject_code = ?";
  db.query(sql, [subjectCode], (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const questionCount = result[0] ? result[0].count : 0;
      res.json({ subjectCode, questionCount });
    }
  });
});

app.get("/questions/:questionPaperNo/:encryptKey/:lang", (req, res) => {
  const questionPaperNo = req.params.questionPaperNo;
  const encryptKey = req.params.encryptKey;
  const lang = req.params.lang;

  // const lang = "TN";
  if (!questionPaperNo) {
    return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
  }
  // const lang = sessionStorage.getItem('candidate-medium');

  console.log(lang);

  // Determine which table and condition to use based on language
  let sql;
  if (lang == "EN") {
    sql = `
    SELECT 
      a.*, 
      a.display_order as display_order,
      b.question_id AS question_id,
      AES_DECRYPT(b.question_text, UNHEX(SHA2(?, 256))) AS question_text, 
      AES_DECRYPT(b.option_1, UNHEX(SHA2(?, 256))) AS option_1, 
      AES_DECRYPT(b.option_2, UNHEX(SHA2(?, 256))) AS option_2, 
      AES_DECRYPT(b.option_3, UNHEX(SHA2(?, 256))) AS option_3, 
      AES_DECRYPT(b.option_4, UNHEX(SHA2(?, 256))) AS option_4, 
      AES_DECRYPT(b.option_5, UNHEX(SHA2(?, 256))) AS option_5, 
      b.correct_answer, 
      b.marks, 
      b.negative_marks, 
      b.case_id,
      b.subject_code,
      b.section_code,
      b.question_type,
      b.section_code,
      c.*
    FROM iib_question_paper_details AS a
    JOIN iib_sq_details AS b 
      ON a.subject_code = b.subject_code 
    JOIN iib_subject_sections AS c 
      ON b.section_code = c.section_code AND b.subject_code = c.subject_code AND a.question_id = b.question_id
    WHERE a.question_paper_no = ? 
    GROUP BY b.question_id 
    ORDER BY display_order
  `;
  } else {
    sql = `
    SELECT 
      a.*, 
      a.display_order as display_order,
      b.question_id AS question_id,
      AES_DECRYPT(d.question_text, UNHEX(SHA2(?, 256))) AS question_text, 
      AES_DECRYPT(d.option_1, UNHEX(SHA2(?, 256))) AS option_1, 
      AES_DECRYPT(d.option_2, UNHEX(SHA2(?, 256))) AS option_2, 
      AES_DECRYPT(d.option_3, UNHEX(SHA2(?, 256))) AS option_3, 
      AES_DECRYPT(d.option_4, UNHEX(SHA2(?, 256))) AS option_4, 
      AES_DECRYPT(d.option_5, UNHEX(SHA2(?, 256))) AS option_5, 
      b.correct_answer, 
       b.question_type,
      b.marks, 
      b.negative_marks,
      b.case_id, 
      b.section_code,
      c.*
    FROM iib_question_paper_details AS a
    JOIN iib_sq_details AS b 
      ON a.subject_code = b.subject_code 
    JOIN iib_subject_sections AS c 
      ON b.section_code = c.section_code AND b.subject_code = c.subject_code AND a.question_id = b.question_id
    JOIN iib_sq_unicode_details AS d 
      ON d.question_id = b.question_id
    WHERE a.question_paper_no = ? AND lang_code = ? 
    GROUP BY b.question_id 
    ORDER BY display_order
  `;
  }

  // Now you have your sql query depending on the value of `lang`

  const queryParams = [
    encryptKey, // For AES_DECRYPT (question_text)
    encryptKey, // For AES_DECRYPT (option_1)
    encryptKey, // For AES_DECRYPT (option_2)
    encryptKey, // For AES_DECRYPT (option_3)
    encryptKey, // For AES_DECRYPT (option_4)
    encryptKey, // For AES_DECRYPT (option_5)
    questionPaperNo, // For a.question_paper_no
  ];
  if (lang !== "EN") {
    queryParams.push(lang);
  }
  const getCaseQuestionText = (case_id, subject_code, section_code, lang) => {
    if (case_id > 0 && case_id != null) {
      try {
        console.log(typeof case_id, case_id, subject_code, section_code);
        let getCaseText;
        if (lang == "EN") {
          getCaseText =
            "select AES_DECRYPT(case_text,UNHEX(SHA2(?, 256))) as case_text from iib_sc_details where case_id = ? and subject_code = ? and section_code = ?";
        } else {
          getCaseText =
            "select AES_DECRYPT(case_text,UNHEX(SHA2(?, 256))) as case_text from iib_sc_unicode_details where case_id = ? and subject_code = ? and section_code = ? and lang_code = ?";
        }

        return new Promise((resolve, reject) => {
          db.query(
            getCaseText,
            [encryptKey, case_id, subject_code, section_code, lang],
            (err, result) => {
              if (err) {
                console.error("MySQL error:", err);
                return reject(
                  res.status(500).json({ error: "Internal Server Error" })
                );
              } else {
                console.log(result[0].case_text.toString());
                return resolve(result[0].case_text.toString());
              }
            }
          );
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      return "";
    }
  };
  // const gatherCaseQuestion= async (case_id, subject_code,section_code)=>{
  //     return await getCaseQuestionText(case_id, subject_code,section_code)
  // }
  db.query(sql, queryParams, async (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } else {
      // const resultdata = result.map( (question, index) => ({
      //   id: question.question_id,
      //   // id: index + 1,
      //   text: decode(question.question_text),
      //   subject_code: question.subject_code,
      //   section_name: question.section_name,
      //   answer_order: question.answer_order,
      //   case_id:question.case_id,
      //   case_text: gatherCaseQuestion(question.case_id,question.subject_code,question.section_code),
      //   options: [
      //     { id: "a", text: decode(question.option_1) },
      //     { id: "b", text: decode(question.option_2) },
      //     { id: "c", text: decode(question.option_3) },
      //     { id: "d", text: decode(question.option_4) },
      //     { id: "e", text: decode(question.option_5) },

      //   ],
      //   correct_ans: Number(question.correct_answer),
      //   // correct_ans: 2,

      //   mark: question.marks,
      //   negative_mark: question.negative_marks,
      // }));
      const resultdata = await Promise.all(
        result.map(async (question) => ({
          id: question.question_id,
          display_order: question.display_order,
          text: decode(question.question_text),
          question_type: question.question_type,
          subject_code: question.subject_code,
          section_name: question.section_name,
          answer_order: question.answer_order,
          section_code: question.section_code,
          case_id: question.case_id,
          case_text: decode(
            await getCaseQuestionText(
              question.case_id,
              question.subject_code,
              question.section_code,
              lang
            )
          ),
          options: [
            { id: "a", text: decode(question.option_1) },
            { id: "b", text: decode(question.option_2) },
            { id: "c", text: decode(question.option_3) },
            { id: "d", text: decode(question.option_4) },
            { id: "e", text: decode(question.option_5) },
          ],
          correct_ans: Number(question.correct_answer),
          mark: question.marks,
          negative_mark: question.negative_marks,
          question_type: question.question_type,
        }))
      );

      //   console.log(resultdata);
      res.json(resultdata);
    }
  });
});

app.get("/fetch-photo/:membershipno", (req, res) => {
  const membershipno = req.params.membershipno;
  const filePath = path.join(
    __dirname,
    "activate",
    "photo",
    "p" + membershipno + ".jpg"
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
  });
});

app.get("/fetch-sign/:membershipno", (req, res) => {
  const membershipno = req.params.membershipno;
  const filePath = path.join(
    __dirname,
    "activate",
    "sign",
    "s" + membershipno + ".jpg"
  );
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
  });
});

app.get("/initialAnswers/:questionPaperNo/:encryptKey", async (req, res) => {
  const { questionPaperNo, encryptKey } = req.params;

  if (!questionPaperNo) {
    return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
  }

  // Function to fetch correct descriptive answers if the answer is "DQ"
  const getCorrectAns = async (answer, quesId, qpno) => {
    if (answer === "DQ") {
      const query = `SELECT CONVERT(AES_DECRYPT(desc_ans, UNHEX(SHA2(?, 256))) USING 'utf8') AS desc_ans FROM descriptive_answer WHERE question_id = ? AND question_paper_no = ? AND response_id = (SELECT MAX(response_id) FROM descriptive_answer WHERE question_id = ? AND question_paper_no = ?)`;

      return new Promise((resolve, reject) => {
        db.query(
          query,
          [encryptKey, quesId, qpno, quesId, qpno],
          (err, result) => {
            if (err) {
              console.error("MySQL query error:", err);
              return reject(new Error("Internal Server Error"));
            }
            resolve(result[0]?.desc_ans || ""); // Handle empty results
          }
        );
      });
    }
    return answer && answer !== "NULL" ? answer : "";
  };

  // SQL query to get the latest response for each question and exclude NULL answers
  const sql = `SELECT r1.display_order,CONVERT(AES_DECRYPT(CAST(r1.answer AS BINARY), UNHEX(SHA2(?, 256))) USING 'utf8') AS answer, r1.tag, r1.question_id, r1.question_paper_no FROM iib_response AS r1 WHERE r1.question_paper_no = ? AND r1.id = (SELECT MAX(r2.id) FROM iib_response AS r2 WHERE r2.question_id = r1.question_id AND r2.question_paper_no = ?)`;

  db.query(
    sql,
    [encryptKey, questionPaperNo, questionPaperNo],
    async (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // const filteredResults = results.filter(row => row.answer !== "NULL");
      // const filteredResults = results.filter(row => row.answer !== null);
      // const filteredResults = results.filter(
      //   (row) => row.answer !== "NULL" || (row.answer == 'NULL' && row.tag == 'Y')
      // );

      const formattedAnswers = await results.reduce(
        async (accPromise, curr) => {
          const acc = await accPromise;
          acc[curr.display_order] = {
            answer: await getCorrectAns(
              curr.answer,
              curr.question_id,
              curr.question_paper_no
            ),
            tag: curr.tag,
          };

          console.log(acc);
          return acc;
        },
        Promise.resolve({})
      );
      res.json(formattedAnswers);
    }
  );
});

// Route to get sample questions
app.get("/samplequestions", (req, res) => {
  const sql = `SELECT * from sample_qp`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } else {
      const resultdata = result.map((question, index) => ({
        id: index + 1,
        text: decode(question.question),
        subject_code: "999",
        section_name: "Sample Sections",
        answer_order: "1,2,3,4",
        options: [
          { id: "a", text: decode(question.option1) },
          { id: "b", text: decode(question.option2) },
          { id: "c", text: decode(question.option3) },
          { id: "d", text: decode(question.option4) },
        ],
        correct_ans: Number(question.correct_answer),
        // correct_ans: 2,

        mark: question.mark,
        negative_mark: question.negative_mark,
      }));
      // console.log(resultdata);
      res.json(resultdata);
    }
  });
});

// Route to get candidate details
app.get("/candidate_details/:user", async (req, res) => {
  const user = req.params.user;
  let sql;

  const getCheckQP = async (user) => {
    const checkQp = "select * from iib_question_paper where membership_no = ?";

    return new Promise((resolve, reject) => {
      db.query(checkQp, [user], (err, result) => {
        if (err) {
          reject("error with getCheckQP query");
        }

        return resolve(result);
      });
    });
  };
  const getSectionDuration = (subjectCode) => {
    const query =
      "SELECT section_code,section_duration FROM iib_subject_sections WHERE subject_code = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [subjectCode], (err, result) => {
        if (err) {
          reject("error with getSectionDuration query");
        }
        const sectionDurationObj = {};
        result.forEach((element) => {
          sectionDurationObj[element.section_code] = element.section_duration;
        });
        return resolve(sectionDurationObj);
      });
    });
  };
  const checkQP = await getCheckQP(user);

  if (checkQP.length > 0 && checkQP[0].question_paper_no != "") {
    sql =
      "SELECT * FROM iib_candidate_iway as a JOIN iib_exam_subjects as b ON a.subject_code = b.subject_code JOIN iib_question_paper AS c ON a.membership_no = c.membership_no JOIN iib_candidate AS d ON a.membership_no = d.membership_no JOIN iib_iway_details AS e ON a.centre_code = e.centre_code JOIN iib_exam AS f ON b.exam_code = f.exam_code WHERE a.membership_no = ?";
  } else {
    sql =
      "SELECT * FROM iib_candidate_iway as a JOIN iib_exam_subjects as b ON a.subject_code = b.subject_code  JOIN iib_candidate AS d ON a.membership_no = d.membership_no JOIN iib_iway_details AS e ON a.centre_code = e.centre_code JOIN iib_exam AS f ON b.exam_code = f.exam_code WHERE a.membership_no = ?";
  }
  db.query(sql, [user], async (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const userId = result[0] ? result[0].id : null;
      const CandidateName = result[0] ? result[0].name : null;
      const Address = result[0] ? result[0].address1 : null;
      const examVenue = result[0] ? result[0].iway_name : null;
      const examCode = result[0] ? result[0].exam_code : null;
      const subjectCode = result[0] ? result[0].subject_code : null;
      const subjectDuration = result[0] ? result[0].subject_duration : null;
      const durationPrevent = result[0] ? result[0].duration_prevent : null;
      const displaySectionname = result[0]
        ? result[0].display_sectionname
        : null;
      const displayScore = result[0] ? result[0].display_score : null;
      const displayResult = result[0] ? result[0].display_result : null;
      const examName = result[0] ? result[0].exam_name : null;
      const subjectName = result[0] ? result[0].subject_name : null;
      const examDate = result[0] ? formatDate(result[0].exam_date) : null;
      const questionPaperNo = result[0] ? result[0].question_paper_no : null;
      const encryptKey = result[0] ? result[0].qp_encry_key : null;
      const pass_mark = result[0] ? result[0].pass_mark : null;
      const total_marks = result[0] ? result[0].total_marks : null;
      const display_sec_nav = result[0] ? result[0].display_sec_nav : null;
      const display_sec_timer = result[0] ? result[0].display_sec_timer : null;
      const graceMark = result[0] ? result[0].grace_mark : null;
      const roundoff_score = result[0] ? result[0].roundoff_score : null;
      const section_duration = await getSectionDuration(subjectCode);
      // console.log(section_duration)
      res.json({
        userId,
        CandidateName,
        Address,
        examVenue,
        examCode,
        subjectCode,
        subjectDuration,
        durationPrevent,
        displaySectionname,
        displayScore,
        displayResult,
        examName,
        subjectName,
        examDate,
        questionPaperNo,
        encryptKey,
        pass_mark,
        total_marks,
        display_sec_nav,
        display_sec_timer,
        section_duration,
        graceMark,
        roundoff_score,
      });
    }
  });
});

// API endpoint to get clienttime from iib_response table
app.get("/get-clienttime/:question_paper_no", (req, res) => {
  const question_paper_no = req.params.question_paper_no;

  // const queryClientTime = `SELECT MIN(clienttime) AS clienttime FROM iib_response WHERE question_paper_no = ?`;
  const queryClientTime = `SELECT clienttime FROM iib_response WHERE question_paper_no = ? ORDER BY id DESC LIMIT 1`;
  const queryTimeExtended = `SELECT time_extended FROM iib_candidate_test WHERE question_paper_no = ? ORDER BY test_id DESC LIMIT 1`;

  // First, fetch time_extended from iib_candidate_test
  db.query(queryTimeExtended, [question_paper_no], (err, timeResult) => {
    if (err) {
      console.error("Error fetching time_extended:", err);
      return res.status(500).send("Server error");
    }

    const time_extended =
      timeResult.length > 0 ? Number(timeResult[0].time_extended) : 0;
    // console.log("time_extended", time_extended);

    // Next, fetch clienttime from iib_response
    db.query(queryClientTime, [question_paper_no], (err, clientResult) => {
      if (err) {
        console.error("Error fetching clienttime:", err);
        return res.status(500).send("Server error");
      }

      if (clientResult.length > 0 && clientResult[0].clienttime !== null) {
        const clienttime = Number(clientResult[0].clienttime);
        // console.log("clienttime", clienttime);

        const finalClientTime = clienttime + time_extended;
        // console.log("finalClientTime", finalClientTime);

        res.json({ clienttime: finalClientTime });
      } else {
        res.json({ clienttime: null }); // No entry found
      }
    });
  });
});

//Get RoughSheet Data
app.post("/api/get-rough-sheet", (req, res) => {
  const { membership_no, subject_code, question_paper_no, exam_date } =
    req.body;
  // console.log('member--',membership_no, subject_code, question_paper_no, exam_date);
  // Query the database to find the rough sheet data
  const query = `SELECT message FROM member_rough_sheet WHERE membership_no = ? AND subject_code = ? AND question_paper_no = ? AND exam_date = ?`;

  db.query(
    query,
    [membership_no, subject_code, question_paper_no, exam_date],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(200).json({ message: results[0].message });
      } else {
        return res.status(404).json({ message: "" });
      }
    }
  );
});

// Save rough sheet data
app.post("/api/save-rough-sheet", (req, res) => {
  const { membership_no, question_paper_no, subject_code, exam_date, text } =
    req.body;

  // Check if record exists
  const checkQuery =
    "SELECT COUNT(*) AS count FROM member_rough_sheet WHERE membership_no = ? AND question_paper_no = ? AND subject_code = ? AND exam_date = ?";

  db.query(
    checkQuery,
    [membership_no, question_paper_no, subject_code, exam_date],
    (err, results) => {
      if (err) {
        console.error("Error checking data existence:", err);
        res.status(500).send("Error");
        return;
      }

      const recordExists = results[0].count > 0;

      let query;
      let queryParams;
      const formattedTime = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
      if (recordExists) {
        // Update existing record
        query = `UPDATE member_rough_sheet SET message = ?, updated_at = ? WHERE membership_no = ? AND question_paper_no = ? AND subject_code = ? AND exam_date = ?`;
        queryParams = [
          text,
          formattedTime,
          membership_no,
          question_paper_no,
          subject_code,
          exam_date,
        ];
      } else {
        // Insert new record
        query = `INSERT INTO member_rough_sheet (membership_no, question_paper_no, subject_code, exam_date, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        queryParams = [
          membership_no,
          question_paper_no,
          subject_code,
          exam_date,
          text,
          formattedTime,
          formattedTime,
        ];
      }

      const formattedquery = db.format(query, queryParams);

      // Execute the appropriate query
      db.query(query, queryParams, (err) => {
        if (err) {
          console.error("Error saving data:", err);
          res.status(500).send("Error saving");
          return;
        }
        // Insert the exact formatted query into xml_feed
        insertIntoXmlFeed(formattedquery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting feed table:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
        res.status(200).send("Saved successfully");
      });
    }
  );
});

app.post("/talogin", (req, res) => {
  const { username, password, HostIp } = req.body;
  const center_code = username.replace("iwfr_", "").toUpperCase();
  const hostIP = HostIp;

  const checkExamSql =
    "SELECT * FROM exam_closure_summary WHERE centre_code= ?";
  db.query(checkExamSql, [center_code], (err, resultExam) => {
    if (err) return handleError(res, "Error checking exam status", err);

    if (resultExam.length > 0) {
      return res
        .status(402)
        .json({ success: false, message: "Exam completed!" });
    }

    const loginSql =
      "SELECT * FROM iib_ta_details WHERE ta_login = ? AND ta_password = PASSWORD(?)";
    db.query(loginSql, [username, password], (err, results) => {
      if (err) return handleError(res, "Database query error", err);

      if (results.length > 0) {
        trackTALogin(username, center_code, hostIP, 1, (trackErr) => {
          if (trackErr)
            return handleError(res, "Error tracking TA login", trackErr);
          res.json({ success: true, message: "Login successful" });
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    });
  });
});

// Handle errors consistently
function handleError(res, message, err) {
  console.error(message, err);
  res.status(500).json({ success: false, message });
}

// Optimized tracking function
function trackTALogin(taLogin, cafeID, hostIP, sessionID, callback) {
  const sqlInsert = `INSERT INTO iib_ta_tracking (ta_login, cafe_id, host_ip, session_id) VALUES (?, ?, ?, ?)`;

  const formattedInsertQuery = db.format(sqlInsert, [
    taLogin,
    cafeID,
    hostIP,
    sessionID,
  ]);
  // Insert the exact formatted query into xml_feed
  insertIntoXmlFeed(formattedInsertQuery, (err) => {
    if (err) {
      return db.rollback(() => {
        console.error("Error inserting feed table:", err);
        res.status(500).json({ message: "Internal Server Error" });
      });
    }
  });
  db.query(sqlInsert, [taLogin, cafeID, hostIP, sessionID], (err) => {
    if (err) return callback(err);

    console.log("Inserted ta tracking");
    callback(null);
  });
}

function getTALoginByHostIP(hostIP) {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT ta_login FROM iib_ta_tracking WHERE host_ip = ?";
    db.query(sqlQuery, [hostIP], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0].ta_login : null);
    });
  });
}

function getUserAgent(req) {
  return req.headers["user-agent"] || "Unknown";
}

function handleError(res, message, error) {
  console.error(message, error);
  res.status(500).json({ success: false, message });
}

// function trackCandidateLogin(membershipNo,taLogin,cafeID,hostIP,sessionID,examCode,subjCode,browser,callback) {
//   const sqlInsert = `INSERT INTO iib_candidate_tracking
//     (ta_login, membership_no, cafe_id, host_ip, session_id, browser_details, exam_code, subject_code)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   db.query(
//     sqlInsert,
//     [taLogin, membershipNo, cafeID, hostIP, sessionID, browser, examCode, subjCode],
//     (err) => {
//       if (err) return callback(err);
//       console.log("Candidate login tracked successfully.");
//       callback(null);
//     }
//   );
// }

function trackCandidateLogin(
  membershipNo,
  taLogin,
  cafeID,
  hostIP,
  sessionID,
  examCode,
  subjCode,
  browser,
  callback
) {
  const checkQuery = `
    SELECT * FROM iib_candidate_tracking 
    WHERE ta_login = ? AND membership_no = ? AND exam_code = ? AND subject_code = ?`;

  db.query(
    checkQuery,
    [taLogin, membershipNo, examCode, subjCode],
    (err, results) => {
      if (err) return callback(err);

      if (results.length > 0) {
        // Record exists: update updated_time
        const updateQuery = `
        UPDATE iib_candidate_tracking 
        SET updated_time = ? 
        WHERE ta_login = ? AND membership_no = ? AND exam_code = ? AND subject_code = ?`;

        db.query(
          updateQuery,
          [formattedTime, taLogin, membershipNo, examCode, subjCode],
          (updateErr) => {
            if (updateErr) return callback(updateErr);
            console.log("Updated 'updated_time' successfully.");
            callback(null); // Success
          }
        );
      } else {
        // Insert new record
        const insertQuery = `
        INSERT INTO iib_candidate_tracking 
        (ta_login, membership_no, cafe_id, host_ip, session_id, browser_details, exam_code, subject_code) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(
          insertQuery,
          [
            taLogin,
            membershipNo,
            cafeID,
            hostIP,
            sessionID,
            browser,
            examCode,
            subjCode,
          ],
          (insertErr) => {
            if (insertErr) return callback(insertErr);
            console.log("Candidate login tracked successfully.");
            callback(null); // Success
          }
        );
      }
    }
  );
}

app.post("/login", async (req, res) => {
  const { username, password, centre_code, HostIp } = req.body;
  const hostIP = HostIp;

  try {
    const sqlCheckCredentials = `SELECT * FROM iib_candidate AS a JOIN iib_candidate_iway AS b ON a.membership_no = b.membership_no WHERE a.membership_no = ? AND a.raw_password = ? AND b.centre_code = ?`;

    const credentialsResult = await new Promise((resolve, reject) => {
      db.query(
        sqlCheckCredentials,
        [username, password, centre_code],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (credentialsResult.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const sqlCheckExamDate = `SELECT exam_date, exam_code, subject_code FROM iib_candidate_iway WHERE membership_no = ?`;

    const examResult = await new Promise((resolve, reject) => {
      db.query(sqlCheckExamDate, [username], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (examResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Membership number not found in iib_candidate_iway",
      });
    }

    const examDate = new Date(examResult[0].exam_date);
    const currentDate = new Date();
    const exam_code = examResult[0].exam_code;
    const subject_code = examResult[0].subject_code;

    if (
      examDate.getFullYear() === currentDate.getFullYear() &&
      examDate.getMonth() === currentDate.getMonth() &&
      examDate.getDate() === currentDate.getDate()
    ) {
      const ta_login = await getTALoginByHostIP(hostIP);
      const browser = getUserAgent(req);

      trackCandidateLogin(
        username,
        ta_login,
        hostIP,
        hostIP,
        1,
        exam_code,
        subject_code,
        browser,
        (trackErr) => {
          if (trackErr)
            return handleError(
              res,
              "Error during candidate login tracking",
              trackErr
            );
          res.json({ success: true, message: "Login successful" });
        }
      );
    } else {
      res.status(402).json({
        success: false,
        message: "Exam date does not match today's date",
      });
    }
  } catch (error) {
    handleError(res, "Internal Server Error", error);
  }
});

app.post("/get-candidate-test-status", (req, res) => {
  const { membership_no, exam_code, subject_code } = req.body;

  const checkQuery = `
    SELECT user_status FROM iib_candidate_tracking 
    WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

  db.query(
    checkQuery,
    [membership_no, exam_code, subject_code],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      // console.log("results[0].user_status",results[0].user_status);
      if (results.length > 0) {
        return res.json({ success: true, user_status: results[0].user_status });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Status not found" });
      }
    }
  );
});

app.post("/update-candidate-test-status", (req, res) => {
  const { membership_no, exam_code, subject_code } = req.body;

  const checkQuery = `
    SELECT user_status FROM iib_candidate_tracking 
    WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

  db.query(
    checkQuery,
    [membership_no, exam_code, subject_code],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (results.length > 0) {
        // ✅ Update user_status = 0
        const updateQuery = `
        UPDATE iib_candidate_tracking 
        SET user_status = 0 , updated_time = ?
        WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

        db.query(
          updateQuery,
          [formattedTime, membership_no, exam_code, subject_code],
          (updateErr) => {
            if (updateErr) {
              console.error("Error updating user_status:", updateErr);
              return res
                .status(500)
                .json({ success: false, message: "Update error" });
            }
            return res.json({
              success: true,
              message: "User status updated",
              user_status: 0,
            });
          }
        );
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Status not found" });
      }
    }
  );
});

app.post("/update-exam-date", (req, res) => {
  const { membershipNo, examDate } = req.body;

  // SQL query to update exam_date in iib_candidate_iway, iib_exam_schedule, and iib_ta_iway
  const updateQuery = `
        UPDATE iib_candidate_iway, iib_exam_schedule, iib_ta_iway SET iib_candidate_iway.exam_date = ?,iib_exam_schedule.exam_date = ?, iib_ta_iway.exam_date = ?`;

  const formattedupdateQuery = db.format(updateQuery, [
    examDate,
    examDate,
    examDate,
  ]);

  db.query(updateQuery, [examDate, examDate, examDate], (err, result) => {
    if (err) {
      console.error("Error updating exam date:", err);
      return res.status(500).json({ message: "Failed to update exam date." });
    }
    // Insert the exact formatted query into xml_feed
    // insertIntoXmlFeed(formattedupdateQuery, (err) => {
    //   if (err) {
    //     return db.rollback(() => {
    //       console.error("Error inserting feed table:", err);
    //       res.status(500).json({ message: "Internal Server Error" });
    //     });
    //   }
    // });
    res.json({ message: "Exam date updated successfully." });
  });
});

app.get("/check-batch-closure/:batchId", async (req, res) => {
  const { batchId } = req.params;
  const query = `SELECT COUNT(*) as count FROM batchwise_closure_summary WHERE closure_batch_time = ?`;
  try {
    const result = await queryAsync(query, [batchId]); // assuming batchId is used for closure_batch_time
    const count = result[0].count;

    if (count > 0) {
      res.status(200).json({ exists: true, count });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking batch closure:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define the endpoint to fetch instructions
app.get("/api/instructions/:subjectCode", (req, res) => {
  const subjectCode = req.params.subjectCode;

  const sql =
    "SELECT instruction_text FROM iib_instructions_template WHERE subject_code = ?";
  //   console.log(subjectCode);
  db.query(sql, [subjectCode], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
      //   console.log(results);
    }
  });
});

// Fetch test status
app.get("/get-test-status/:membershipNo/:hostIp", (req, res) => {
  const membershipNo = req.params.membershipNo; // Use query parameter for GET request
  const hostIp = req.params.hostIp; // Use query parameter for GET request
  // console.log('Received membershipNo:', membershipNo); // Debugging statement
  const query =
    "SELECT test_status FROM iib_candidate_test WHERE membership_no = ? and host_ip = ?";
  db.query(query, [membershipNo, hostIp], (err, results) => {
    if (err) {
      console.error("Error fetching test status:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    // console.log("query", query);
    // console.log("resss", results);
    if (results.length > 0) {
      res.json({ status: results[0].test_status });
    } else {
      res.json({ status: null }); // No entry found
    }
  });
});

// const queryAsync = (query, values) => {
//   return new Promise((resolve, reject) => {
//     db.query(query, values, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results); // Return results directly instead of wrapping in an array
    });
  });
}

app.get(
  "/handleBatchClosure/:batchId/:hostIp/:serialNumber/:centreCode/:serverNo",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode, serverNo } = req.params;
    // console.log("Processing batch closure for:", { batchId, hostIp, serialNumber, centreCode });

    try {
      const zipFileName = await mergeAndZipFiles(
        centreCode,
        serialNumber,
        serverNo
      );
      const batch_feed_filename = zipFileName;
      const zipFilePath = path.join(process.env.FEED_DIR, zipFileName);

      const [{ count_feed_all }] = await queryAsync(
        "SELECT COUNT(1) AS count_feed_all FROM feed_filenames"
      );
      const [{ start_id, end_id }] = await queryAsync(
        "SELECT MIN(start_id) AS start_id, MAX(end_id) AS end_id FROM feed_filenames WHERE start_id > 0 AND status = 'N'"
      );

      let whr_feed = "";
      if (count_feed_all > 0) {
        whr_feed = `WHERE id BETWEEN ${start_id} AND ${end_id}`;
      }

      const xmlFeedResult = await queryAsync(
        `SELECT * FROM xml_feed ${whr_feed}`
      );
      if (xmlFeedResult.length > 0) {
        fs.writeFileSync(batch_feed_filename, "");
        let writeError = false;

        xmlFeedResult.forEach((row) => {
          const content = row?.content || ""; // Ensure content is defined
          const createFeed =
            Buffer.from(content.trim()).toString("base64") + "; \n\n";

          try {
            fs.appendFileSync(batch_feed_filename, createFeed);
          } catch (err) {
            writeError = true;
            console.error("File write error:", err);
          }
        });

        if (writeError) return;
      }

      const sql_tadetails =
        "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
      const taDetails = await new Promise((resolve, reject) => {
        db.query(sql_tadetails, (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        });
      });

      if (!taDetails) {
        console.error("No TA details found.");
        return "TA details missing.";
      }

      const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

      const reqChkSumStr = `${sTaLoginID}${sTaPassword}${process.env.DB_NAME}`;
      // const reqChkSumVal = crypto.createHash("md5").update(reqChkSumStr).digest("hex");
      const reqChkSumVal = crypto
        .createHash("sha256")
        .update(reqChkSumStr + process.env.CHECKSUMKEY)
        .digest("hex");
      const attend_candidate_count = await getCandidateAttendExam();

      const formData = new FormData();
      formData.append("name", process.env.DB_NAME);
      formData.append("user", sTaLoginID);
      formData.append("pass", sTaPassword);
      formData.append("closureBatchTime", batchId);
      formData.append("closureExamDate", formattedDate);
      formData.append("attendedCandidateCount", attend_candidate_count);
      formData.append("CHECKSUM", reqChkSumVal);

      // formData.append('filename', fs.createReadStream(zipFilePath));
      if (fs.existsSync(zipFilePath)) {
        const isFileAttached = "1";
        formData.append("isFileAttached", isFileAttached);
        formData.append("file", fs.createReadStream(zipFilePath));
      } else {
        const isFileAttached = "0";
        formData.append("isFileAttached", isFileAttached);
        formData.append("filename", zipFileName);
      }

      //  const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/closureBatchFeed`, formData, { headers });
      const response = await axios.post(
        `${process.env.EXAM_DASHBOARD_URL}/closureBatchFeed`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      if (response.data.responseMessage == "File upload success.") {
        const insertSummaryQuery = `INSERT INTO batchwise_closure_summary (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) VALUES (?, ?, ?, ?, ?, 'C', ?, ?, ?, ?)`;
        await queryAsync(insertSummaryQuery, [
          formattedDate,
          centreCode,
          serverNo,
          batchId,
          zipFileName,
          serialNumber,
          formattedDate,
          formattedDate,
          hostIp,
        ]);

        const formattedInsertSummaryQuery = db.format(insertSummaryQuery, [
          formattedDate,
          centreCode,
          serverNo,
          batchId,
          zipFileName,
          serialNumber,
          formattedDate,
          formattedDate,
          hostIp,
        ]);
        await insertIntoXmlFeed(formattedInsertSummaryQuery, (err) => {
          if (err) {
            console.error("Error inserting feed table:", err);
            return callback(err);
          }
          // console.log(`Score for candidate ${membershipNo} successfully processed and inserted into xml_feed`);
          // callback(null);
        });

        res.status(200).json({
          message:
            "Batch closure processed successfully with files merged, zipped, sent, and status updated",
          incompleteCandidatesCount: 0,
          zipFileName,
        });
      } else {
        console.error("Syncing failed:", response.data);
        res.status(500).json({ message: "Syncing failed." });
      }
    } catch (err) {
      console.error("Error handling batch closure:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

async function generateScoreForCandidate(
  questionPaperNo,
  membershipNo,
  examCode,
  subjectCode,
  passMark,
  roundoff_score,
  graceMark,
  timeTaken,
  auto_submit,
  callback
) {
  console.log("Generating score for candidate:", membershipNo);

  if (typeof callback !== "function") {
    console.error("Callback is not a function");
    return;
  }
  const getExamSubjectCode = async (questionPaperNo) => {
    const getExamSubjectCodeQuery =
      "select exam_code,subject_code from iib_question_paper where question_paper_no = ?";

    return new Promise((resolve, reject) => {
      db.query(getExamSubjectCodeQuery, [questionPaperNo], (err, result) => {
        if (err) {
          console.error("Error getting exam code and subject code:", err);

          return reject(callback(err));
        }

        return resolve({
          examCodeQP: result[0].exam_code,

          subjectCodeQP: result[0].subject_code,
        });
      });
    });
  };

  const { examCodeQP, subjectCodeQP } =
    await getExamSubjectCode(questionPaperNo);

  const encryKey = await utils.getEncryKey(examCodeQP, subjectCodeQP);

  const { posscore, negscore, score, examResult } =
    await utils.getScoreCalculation(
      questionPaperNo,
      encryKey,
      roundoff_score,
      graceMark,
      passMark
    );

  // let score = posscore - negscore;
  //         if (score < 0) score = 0;
  //         if (roundoff_score === "Y") score = Math.round(score);

  //         console.log(`Final score for candidate ${membershipNo}: ${score}`);

  //         const examResult = score + graceMark >= passMark ? "P" : "F";
  console.log(`Final score for candidate ${membershipNo}: ${score}`);

  const scoreCheckQuery = `
                SELECT COUNT(1) AS cnt_score_chk
                FROM iib_candidate_scores
                WHERE membership_no = ? AND exam_code = ? AND subject_code = ?
            `;

  db.query(
    scoreCheckQuery,
    [membershipNo, examCode, subjectCode],
    (err, rowsScoreCheck) => {
      if (err) {
        console.error("Error checking existing scores:", err);
        return callback(err);
      }

      const cnt_score_chk = rowsScoreCheck[0]?.cnt_score_chk || 0;

      const insertOrUpdateScoreQuery =
        cnt_score_chk === 0
          ? `INSERT INTO iib_candidate_scores (membership_no, exam_code, subject_code, score, exam_date, time_taken, result, auto_submit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          : `UPDATE iib_candidate_scores SET score = ?, exam_date = ?, time_taken = ?, result = ?, auto_submit = ? WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

      const queryParams =
        cnt_score_chk === 0
          ? [
              membershipNo,
              examCode,
              subjectCode,
              score,
              formattedTime,
              timeTaken,
              examResult,
              auto_submit,
            ]
          : [
              score,
              formattedTime,
              timeTaken,
              examResult,
              auto_submit,
              membershipNo,
              examCode,
              subjectCode,
            ];

      const formattedinsertOrUpdateScoreQuery = db.format(
        insertOrUpdateScoreQuery,
        [queryParams]
      );

      db.query(insertOrUpdateScoreQuery, queryParams, (err) => {
        if (err) {
          console.error("Error inserting/updating score:", err);
          return callback(err);
        }
        console.log("Inserting score into xml_feed...");
        insertIntoXmlFeed(formattedinsertOrUpdateScoreQuery, (err) => {
          if (err) {
            console.error("Error inserting feed table:", err);
            return callback(err);
          }
          console.log(
            `Score for candidate ${membershipNo} successfully processed and inserted into xml_feed`
          );
          callback(null, score);
        });
      });
    }
  );
}

app.post("/getScoreOfcandidate", async (req, res) => {
  const { questionPaperNo, encryKey, roundoff_score, graceMark, passMark } =
    req.body;
  // console.log("from getscore",req.body)
  const { posScore, negScore, score, examResult } =
    await utils.getScoreCalculation(
      questionPaperNo,
      encryKey,
      roundoff_score,
      graceMark,
      passMark
    );
  res.json({ posScore, negScore, score, examResult });
});

app.get(
  "/handleDayClosure/:batchId/:hostIp/:serialNumber/:centreCode",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode } = req.params;

    let allUniqueTestIds = [];

    const getMaxTestId =
      "SELECT MAX(test_id) as max FROM iib_candidate_test GROUP BY membership_no, exam_code, subject_code";
    const maxTestid = await queryAsync(getMaxTestId);
    for (const row of maxTestid) {
      const getUniqueTestid =
        "SELECT test_id FROM iib_candidate_test WHERE test_id = ? AND test_status  = 'IC'";
      const uniqueTestId = await queryAsync(getUniqueTestid, [row.max]);
      if (uniqueTestId.length > 0) {
        // Check if result is not empty
        console.log(uniqueTestId[0].test_id);
        allUniqueTestIds.push(uniqueTestId[0].test_id);
      }
    }
    console.log(allUniqueTestIds);
    const incompleteCandidatesQuery = `
        SELECT a.question_paper_no AS questionPaperNo, a.membership_no AS membershipNo, a.exam_code AS examCode, a.subject_code AS subjectCode, c.pass_mark AS passMark, c.roundoff_score AS roundoff_score, c.grace_mark AS graceMark,c.subject_duration AS timeTaken
        FROM iib_candidate_test AS a JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code WHERE a.test_status = 'IC' and a.test_id in (?) GROUP BY a.test_id`;

    try {
      let incompleteCandidates;
      // Fetch incomplete candidates
      if (allUniqueTestIds.length > 0) {
        incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
          allUniqueTestIds,
        ]);
      }
      // console.log(incompleteCandidates.length);
      // return false;
      if (allUniqueTestIds.length > 0) {
        let remainingCandidates = incompleteCandidates.length;

        for (const candidate of incompleteCandidates) {
          const {
            questionPaperNo,
            membershipNo,
            examCode,
            subjectCode,
            passMark,
            roundoff_score,
            graceMark,
            timeTaken,
          } = candidate;

          console.log("Sending generated score for candidate:", membershipNo);

          try {
            // Generate score for the candidate
            const score = await new Promise((resolve, reject) => {
              generateScoreForCandidate(
                questionPaperNo,
                membershipNo,
                examCode,
                subjectCode,
                passMark,
                roundoff_score,
                graceMark,
                timeTaken,
                "Y",
                (err, score) => {
                  if (err) return reject(err);
                  resolve(score);
                }
              );
            });

            console.log(
              `Generated score for candidate ${membershipNo}: ${score}`
            );

            // Update candidate status
            const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
            await queryAsync(updateCandidateQuery, [membershipNo]);
            const formattedupdateCandidateQuery = db.format(
              updateCandidateQuery,

              [membershipNo]
            );

            // Insert the exact formatted query into xml_feed

            insertIntoXmlFeed(formattedupdateCandidateQuery, (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error inserting feed table:", err);

                  res.status(500).json({ message: "Internal Server Error" });
                });
              }
            });
            remainingCandidates--;

            // If all candidates processed, merge and zip files
            if (remainingCandidates === 0) {
              // Handle case when no incomplete candidates are found
              const result = await utils.centreAndServerNo();
              const closure_path = process.env.CLOSURE_PATH;
              const databasename = process.env.DB_NAME; // For Demo
              // const databasename = process.env.DB_NAME; // For Live
              // const ip_addr = await getRealIPAddr(req);
              const ip_addr = examserverip;
              const closure_exam_date = await getCurrentExamDate();
              const processDataResult = await processData(
                centreCode,
                result.serverno,
                databasename,
                closure_exam_date, // Added missing parameter
                ip_addr,
                closure_path
              );
              console.log(processDataResult);
              if (processDataResult == "Process Data successfully completed") {
                const processFeedResult = await processFeed(
                  centreCode,
                  result.serverno,
                  databasename,
                  closure_exam_date, // Added missing parameter
                  ip_addr,
                  closure_path
                );
                console.log(processFeedResult);
                if (processFeedResult == "Feed process completed") {
                  const processSyncResult = await processSync(
                    centreCode,
                    result.serverno,
                    databasename,
                    closure_exam_date, // Added missing parameter
                    ip_addr,
                    closure_path
                  );
                  console.log(processSyncResult);

                  if (processSyncResult == "Sync Process completed") {
                    const attend_candidate_count =
                      await getCandidateAttendExam();
                    const assign_serial_no = serialNumber;
                    const processdownloadDBDump = await downloadDBDump(
                      centreCode,
                      result.serverno,
                      databasename,
                      assign_serial_no,
                      attend_candidate_count,
                      closure_exam_date, // Added missing parameter
                      ip_addr,
                      closure_exam_date,
                      closure_path
                    );
                    if (
                      processdownloadDBDump ==
                      "Dump Downloaded and synced to the central server"
                    ) {
                      return res.json({
                        message: "Day closure processed successfully",
                        processStatus: 1,
                      });
                    }
                    // downloadDBDump(center_code, serverno, database, assign_serial_no, attend_candidate_count, curlpath_feed, closure_exam_date, ip_addr, todaydate)
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              "Error generating score or updating candidate:",
              error
            );
            // Continue processing other candidates even if one fails
          }
        }
      } else {
        // Handle case when no incomplete candidates are found
        const result = await utils.centreAndServerNo();
        const closure_path = process.env.CLOSURE_PATH;
        const databasename = process.env.DB_NAME; // For Demo
        // const databasename = process.env.DB_NAME; // For Live
        // const ip_addr = await getRealIPAddr(req);
        const ip_addr = examserverip;
        const closure_exam_date = await getCurrentExamDate();
        const processDataResult = await processData(
          centreCode,
          result.serverno,
          databasename,
          closure_exam_date, // Added missing parameter
          ip_addr,
          closure_path
        );
        console.log(processDataResult);
        if (processDataResult == "Process Data successfully completed") {
          const processFeedResult = await processFeed(
            centreCode,
            result.serverno,
            databasename,
            closure_exam_date, // Added missing parameter
            ip_addr,
            closure_path
          );
          console.log(processFeedResult);
          if (processFeedResult == "Feed process completed") {
            const processSyncResult = await processSync(
              centreCode,
              result.serverno,
              databasename,
              closure_exam_date, // Added missing parameter
              ip_addr,
              closure_path
            );
            console.log(processSyncResult);

            if (processSyncResult == "Sync Process completed") {
              const attend_candidate_count = await getCandidateAttendExam();
              const assign_serial_no = serialNumber;
              const processdownloadDBDump = await downloadDBDump(
                centreCode,
                result.serverno,
                databasename,
                assign_serial_no,
                attend_candidate_count,
                closure_exam_date, // Added missing parameter
                ip_addr,
                closure_exam_date,
                closure_path
              );
              if (
                processdownloadDBDump ==
                "Dump Downloaded and synced to the central server"
              ) {
                return res.json({
                  message: "Day closure processed successfully",
                  processStatus: 1,
                });
              }
              // downloadDBDump(center_code, serverno, database, assign_serial_no, attend_candidate_count, curlpath_feed, closure_exam_date, ip_addr, todaydate)
            }
          }
        }
      }
    } catch (err) {
      console.error("Error retrieving incomplete candidates:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

async function processData(
  center_code,
  serverno,
  database,
  closure_exam_date,
  ip_addr,
  closure_path
) {
  try {
    let msg = "",
      backup_status = "",
      countfile = 0;
    const date_time = new Date().toISOString().replace(/[-T:.Z]/g, "");
    const lbl = "Process Data";
    // const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Ensure proper datetime format

    // Ensure the directory exists
    if (!fs.existsSync(closure_path)) {
      fs.mkdirSync(closure_path, { recursive: true });
    }

    // Fetch TA details
    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return "TA details missing.";
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

    // Count files in the directory
    const files = fs.readdirSync(closure_path);
    countfile = files.length;

    const feedname = `${database}_${center_code}_${serverno}_${date_time}_Closure_All_Feed.txt`;
    const filename = path.join(closure_path, feedname);
    const fileHandle = fs.createWriteStream(filename);

    // Fetch XML feed data
    const contentSearch = "SELECT * FROM xml_feed";
    const contentResults = await new Promise((resolve, reject) => {
      db.query(contentSearch, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    for (const row of contentResults) {
      if (!row || !row.query) {
        console.warn("Skipping invalid row:", row);
        continue;
      }

      const createFeed =
        Buffer.from(row.query.trim()).toString("base64") + ";\n\n";
      fileHandle.write(createFeed);
    }
    fileHandle.end(); // Ensure the file stream is properly closed
    const curlpath_process_data = `${process.env.EXAM_DASHBOARD_URL}/closureProcessFeed`;
    // Sync process data to central server
    const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
    const reqChkSumVal = crypto
      .createHash("sha256")
      .update(reqChkSumStr + process.env.CHECKSUMKEY)
      .digest("hex");
    // const reqChkSumVal = process.env.CHECKSUMKEY;
    const filename_sync = `${database}_${center_code}_${serverno}_${date_time}.tmp`;
    const data = {
      name: database,
      user: sTaLoginID,
      pass: sTaPassword,
      closure_exam_date,
      CHECKSUM: reqChkSumVal,
      file: filename_sync,
    };

    // Send data to the server
    // const response = await axios.post(curlpath_process_data, data);

    // if(response.data.responseMessage=='Data updated successfully.'){
    // Create ZIP file
    const process_zip_name = `${database}_${center_code}_${serverno}_${date_time}_Closure_All_Feed.zip`;
    const process_zip_path = path.join(closure_path, process_zip_name);

    console.log(process_zip_name);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(process_zip_path);
      const archive = archiver("zip");

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.append(fs.createReadStream(filename), { name: feedname });
      archive.finalize();
    });

    backup_status = "D";

    // Insert or update closure summary
    const selectQuery =
      "SELECT id FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action=?";
    const result = await new Promise((resolve, reject) => {
      db.query(selectQuery, [center_code, serverno, lbl], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    if (result.length === 0) {
      const insertQuery = `INSERT INTO exam_closure_summary (exam_date, centre_code, serverno, file_path, closure_action, closure_status, added_on, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      await new Promise((resolve, reject) => {
        db.query(
          insertQuery,
          [
            closure_exam_date,
            center_code,
            serverno,
            process_zip_name,
            lbl,
            backup_status,
            formattedTime,
            ip_addr,
          ],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    } else {
      const updateQuery = `UPDATE exam_closure_summary SET file_path=?, closure_status=?, updated_on=?, ip_address=? WHERE centre_code=? AND serverno=? AND closure_action=?`;
      await new Promise((resolve, reject) => {
        db.query(
          updateQuery,
          [
            process_zip_name,
            backup_status,
            formattedTime,
            ip_addr,
            center_code,
            serverno,
            lbl,
          ],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    return msg || "Process Data successfully completed";
    // }
  } catch (error) {
    console.error("Error in processData:", error.data);
    return "An error occurred while processing data.";
  }
}

async function processFeed(
  center_code,
  serverno,
  database,
  closure_exam_date,
  ip_addr,
  closure_path
) {
  try {
    if (!center_code || !serverno) {
      return "Feed not downloaded yet";
    }

    // const validExamTime = checkExamTime(center_code); // Implement checkExamTime
    // if (!validExamTime) {
    //   return "Please download the Feed once the exam time has been completed";
    // }
    const date_time = new Date().toISOString().replace(/[-T:.Z]/g, ""); // Use movement.js
    const feed_path = path.join(__dirname, "feed");
    const download_name = `feed_${database}_${center_code}_${serverno}_${date_time}.zip`;
    const dmppath = path.join(__dirname, "feed", download_name);
    const remove_exist_zip = path.join(
      __dirname,
      "feed",
      `feed_${database}_${center_code}_${serverno}_*.zip`
    );

    // Remove existing ZIP files
    fs.rmSync(remove_exist_zip, { force: true, recursive: true });

    // Create ZIP file
    const result = await createZip(feed_path, dmppath);
    if (!result) {
      throw new Error("Oops!! Feed creation failed");
    }

    // Fetch TA details
    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return "TA details missing.";
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

    // Sync feed data
    // const reqChkSumStr = sTaLoginID + sTaPassword + database;
    // const reqChkSumVal = crypto.createHash('sha256').update(reqChkSumStr + process.env.CHECKSUMKEY).digest('hex');
    const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
    const reqChkSumVal = crypto
      .createHash("sha256")
      .update(reqChkSumStr + process.env.CHECKSUMKEY)
      .digest("hex");
    // const reqChkSumVal = process.env.CHECKSUMKEY;
    // const data = {
    //   name: database,
    //   user: sTaLoginID,
    //   pass: sTaPassword,
    //   CHECKSUM: reqChkSumVal,
    //   file: `@${dmppath}`
    // };
    // // console.log(data);
    const curlpath_process_feed = `${process.env.EXAM_DASHBOARD_URL}/dbDumpFeed`;
    // const response = await axios.post(curlpath_feed, data);
    const formData = new FormData();
    formData.append("name", database);
    formData.append("user", sTaLoginID);
    formData.append("pass", sTaPassword);
    formData.append("CHECKSUM", reqChkSumVal);
    formData.append("file", fs.createReadStream(dmppath)); // Ensure this is a valid file path

    const response = await axios.post(curlpath_process_feed, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log(response.data);
    // return;
    // console.log("Feed Sync Response:", response.data);
    if (response.data.responseMessage == "File upload success.") {
      // Insert/Update closure report
      const todaydate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const checkClosureReport =
        "SELECT * FROM iib_closure_report WHERE exam_date=?";
      const closureReport = await new Promise((resolve, reject) => {
        db.query(checkClosureReport, [todaydate], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (closureReport.length === 0) {
        const insertQuery =
          "INSERT INTO iib_closure_report (feed_status, db_dump_status, exam_date) VALUES ('1', '0', ?)";
        await new Promise((resolve, reject) => {
          db.query(insertQuery, [todaydate], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      } else {
        const updateQuery =
          "UPDATE iib_closure_report SET feed_status='1' WHERE exam_date=?";
        await new Promise((resolve, reject) => {
          db.query(updateQuery, [todaydate], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }

      // Insert/Update closure summary
      const lbl = "Post Exam Feed";
      const checkClosureSummary =
        "SELECT id FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action=?";
      const closureSummary = await new Promise((resolve, reject) => {
        db.query(
          checkClosureSummary,
          [center_code, serverno, lbl],
          (err, res) => {
            if (err) return reject(err);
            resolve(res);
          }
        );
      });

      if (closureSummary.length === 0) {
        const insertClosureSummary =
          "INSERT INTO exam_closure_summary (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) VALUES (?, ?, ?, ?, 'D', ?, ?)";
        await new Promise((resolve, reject) => {
          db.query(
            insertClosureSummary,
            [
              closure_exam_date,
              center_code,
              serverno,
              lbl,
              formattedTime,
              ip_addr,
            ],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      } else {
        const updateClosureSummary =
          "UPDATE exam_closure_summary SET closure_status='D', updated_on = ?, ip_address=? WHERE centre_code=? AND serverno=? AND closure_action=?";
        await new Promise((resolve, reject) => {
          db.query(
            updateClosureSummary,
            [formattedTime, ip_addr, center_code, serverno, lbl],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      // Redirect to exam closure report
      const en_process = Buffer.from("Sync Process Data").toString("base64");
      const feed_result = "Feed process completed";
      return feed_result;
    }
  } catch (error) {
    console.error("Error in processFeed:", error);
    return "An error occurred while processing feed.";
  }
}

async function processSync(
  center_code,
  serverno,
  database,
  closure_exam_date,
  ip_addr,
  closure_path
) {
  try {
    let lbl = "Sync Process Data";
    let sync_status = "";

    if (!center_code || !serverno) {
      return "QP not downloaded yet";
    }

    // const validExamTime = checkExamTime(center_code); // Implement this function
    // if (!validExamTime) {
    //   return "Please download the DB once the exam time has been completed";
    // }

    // Fetch latest file path from exam_closure_summary
    const qry_ecs_process = `SELECT id, file_path FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action='Process Data' ORDER BY id DESC LIMIT 1
    `;

    const [ecs_process] = await new Promise((resolve, reject) => {
      db.query(qry_ecs_process, [center_code, serverno], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    if (!ecs_process) {
      return "Backup path not available";
    }

    const { id: id_ecs_process, file_path: file_ecs_process } = ecs_process;
    const dmppath = path.join(closure_path, file_ecs_process);

    if (!dmppath || !file_ecs_process) {
      return "Backup path not available";
    }

    // Fetch TA details
    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return "TA details missing.";
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;
    const curlpath_sync_data = `${process.env.EXAM_DASHBOARD_URL}/closureSyncFeed`;

    // Prepare checksum and send sync request
    // const reqChkSumStr = sTaLoginID + sTaPassword + database;
    // const reqChkSumVal = crypto.createHash('sha256').update(reqChkSumStr + process.env.CHECKSUMKEY).digest('hex');
    const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
    const reqChkSumVal = crypto
      .createHash("sha256")
      .update(reqChkSumStr + process.env.CHECKSUMKEY)
      .digest("hex");
    // const reqChkSumVal = process.env.CHECKSUMKEY;
    // const data = {
    //   name: database,
    //   user: sTaLoginID,
    //   pass: sTaPassword,
    //   closure_exam_date,
    //   CHECKSUM: reqChkSumVal,
    //   file: `@${dmppath}`
    // };

    // console.log('file', dmppath);
    const formData = new FormData();
    formData.append("name", database);
    formData.append("user", sTaLoginID);
    formData.append("pass", sTaPassword);
    // formData.append('closure_exam_date', closure_exam_date);
    formData.append("CHECKSUM", reqChkSumVal);
    formData.append("file", fs.createReadStream(dmppath)); // Ensure this is a valid file path

    const response = await axios.post(curlpath_sync_data, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log(response.data.responseMessage);
    // return;

    if (response.data.responseMessage == "File upload success.") {
      // const content = response.data.trim();
      // console.log("Sync Response:", content);
      const content = response.data.responseMessage;

      let isEnableDump = false;
      if (content == "File upload success.") {
        sync_status = "U";
        isEnableDump = true;
      } else {
        sync_status = "UF";
      }

      // Check if sync action already exists
      const qrySel_ecs = `SELECT id FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action=?`;

      const existingSync = await new Promise((resolve, reject) => {
        db.query(qrySel_ecs, [center_code, serverno, lbl], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (existingSync.length === 0) {
        const insert_qp_dl = `INSERT INTO exam_closure_summary (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await new Promise((resolve, reject) => {
          db.query(
            insert_qp_dl,
            [
              closure_exam_date,
              center_code,
              serverno,
              lbl,
              sync_status,
              formattedTime,
              ip_addr,
            ],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      } else {
        const update_qp_dl = `UPDATE exam_closure_summary SET closure_status=?, updated_on=?, ip_address=? WHERE centre_code=? AND serverno=? AND closure_action=?`;
        await new Promise((resolve, reject) => {
          db.query(
            update_qp_dl,
            [sync_status, formattedTime, ip_addr, center_code, serverno, lbl],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      // Redirect if dump is enabled
      if (isEnableDump) {
        const en_process = Buffer.from("Download DB Dump").toString("base64");
        // return `exam_closure_report.php?ll=${en_process}`;
        const result_value = "Sync Process completed";
        return result_value;

        // return `exam_closure_report.php?ll=${en_process}`;
      }

      return sync_status === "U"
        ? "Syncing success"
        : `${content} Syncing failed`;
    }
  } catch (error) {
    console.error("Error in processSync:", error);
    return "An error occurred while syncing data.";
  }
}

async function downloadDBDump(
  center_code,
  serverno,
  database,
  assign_serial_no,
  attend_candidate_count,
  closure_exam_date,
  ip_addr,
  todaydate,
  value
) {
  try {
    if (!center_code || !serverno) {
      return "QP not downloaded yet";
    }

    // const validExamTime = checkExamTime(center_code);
    // if (!validExamTime) {
    //     return "Please download the DB once the exam time has been completed";
    // }

    // Fetch TA details
    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return "TA details missing.";
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

    // const date_time = new Date().toISOString().replace(/[-:T\.]/g, '').substring(0, 14);
    const date_time = new Date().toISOString().replace(/[-T:.Z]/g, "");
    const dmppath = path.join(
      value,
      `${database}_${center_code}_${serverno}_${date_time}_${assign_serial_no}.dmp`
    );
    const backup_tables_str =
      Array.isArray(tablesToExport) && tablesToExport.length
        ? tablesToExport.join(" ")
        : "";
    const mysqlPath = process.env.MYSQLPATHDUMP;
    // Escape special characters in the password if needed
    const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

    const dumpCommand = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} ${backup_tables_str} > "${dmppath}"`;
    // console.log(dumpCommand);

    const dumpResult = await new Promise((resolve, reject) => {
      exec(dumpCommand, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
        if (error) {
          console.error("Dump creation error:", stderr);
          return reject("Oops!! Dump creation failed");
        }
        resolve(true);
      });
    });

    if (!dumpResult) return "Oops!! Dump creation failed";

    const existingRecord = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id FROM qp_download WHERE centre_code = ? AND serverno = ? AND download_sec = 'Post Exam QP'",
        [center_code, serverno],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0 ? results[0].id : null);
        }
      );
    });

    let insert_id;
    if (!existingRecord) {
      insert_id = await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, 'Post Exam QP', 'D', ?)",
          [center_code, serverno, formattedTime],
          (err, res) => {
            if (err) return reject(err);
            resolve(res.insertId);
          }
        );
      });
    } else {
      insert_id = existingRecord;
    }

    // const insert_id = insertResult;

    // Validate dump file
    const fileLines = fs.readFileSync(dmppath, "utf8").split("\n");
    let isCompleteDump = fileLines
      .slice(-6)
      .some((line) => /^-- Dump completed on/i.test(line));

    if (isCompleteDump) {
      await db.query(
        "UPDATE qp_download SET download_status = 'DV' WHERE id = ?",
        [insert_id]
      );
    }

    if (isCompleteDump) {
      const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
      const reqChkSumVal = crypto
        .createHash("sha256")
        .update(reqChkSumStr + process.env.CHECKSUMKEY)
        .digest("hex");
      // const reqChkSumVal = process.env.CHECKSUMKEY;

      const curlpath_process_downloadDBDump = `${process.env.EXAM_DASHBOARD_URL}/dbDumpFeed`;

      const formData = new FormData();
      formData.append("name", database);
      formData.append("user", sTaLoginID);
      formData.append("pass", sTaPassword);
      formData.append("attendedCandidate", attend_candidate_count);
      formData.append("CHECKSUM", reqChkSumVal);
      formData.append("file", fs.createReadStream(dmppath)); // Ensure this is a valid file path

      const response = await axios.post(
        curlpath_process_downloadDBDump,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log(response.data.responseMessage);

      // const response = await axios.post(curlpath_process_downloadDBDump, data);
      // const content = response.data.trim();
      if (response.data.responseMessage == "File upload success.") {
        // const content = response.data.trim();
        // console.log("Sync Response:", content);
        const content = response.data.responseMessage;

        if (content == "File upload success.") {
          await db.query(
            "UPDATE qp_download SET download_status = 'U' WHERE id = ?",
            [insert_id]
          );

          const existingReport = await db.query(
            "SELECT * FROM iib_closure_report WHERE exam_date = ?",
            [todaydate]
          );

          if (existingReport.length === 0) {
            await db.query(
              "INSERT INTO iib_closure_report (feed_status, db_dump_status, exam_date) VALUES (0, 1, ?)",
              [todaydate]
            );
          } else {
            await db.query(
              "UPDATE iib_closure_report SET db_dump_status = 1 WHERE exam_date = ?",
              [todaydate]
            );
          }

          return "Dump Downloaded and synced to the central server";
        } else {
          await db.query(
            "UPDATE qp_download SET download_status = 'UF' WHERE id = ?",
            [insert_id]
          );
          return content + " QP downloaded but Dump Syncing failed";
        }
      } else {
        await db.query(
          "UPDATE qp_download SET download_status = 'DC' WHERE id = ?",
          [insert_id]
        );
        return "Oops!! Dump creation failed. Please try again.";
      }
    }
  } catch (error) {
    console.error("Error in downloadDBDump:", error);
    return "An error occurred while downloading the DB dump.";
  }
}

function getCandidateAttendExam() {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT COUNT(DISTINCT membership_no) AS count FROM iib_candidate_test";

    db.query(query, (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return reject(error);
      }
      resolve(results[0].count);
    });
  });
}

// Function to create a ZIP file
async function createZip(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    output.on("close", () => resolve(true));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
app.get("/api/backup/:centrecode/:serialNumber", async (req, res) => {
  const { centrecode, serialNumber } = req.params;

  console.log("backupapi", centrecode[0], "--", serialNumber);
  try {
    // Call your backup function here, e.g., exportTablesAsDump
    await exportTablesAsDump(centrecode, serialNumber);

    // Send a success response
    res.status(200).json({ message: "Backup successful" });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: "Backup failed" });
  }
});

// Route to handle candidate test insertion
// app.post("/insert-candidate-test", (req, res) => {
//   const {membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,host_ip,serverno} = req.body;

//   // Query to check if an entry with the same membership_no and question_paper_no already exists
//   const checkQuery = `SELECT time_extended FROM iib_candidate_test WHERE membership_no = ? AND question_paper_no = ? ORDER BY test_id DESC`;

//   db.query(checkQuery, [membership_no, question_paper_no], (err, results) => {
//     if (err) {
//       console.error("Error during SQL query execution:", {
//         error: err.message,
//         query: checkQuery,
//         parameters: [membership_no, question_paper_no],
//       });
//       return res
//         .status(500)
//         .json({ error: "An error occurred while checking for existing data." });
//     }

//     const time_extended = results[0].time_extended;

//     // if (count > 0) {
//     //   // Entry already exists
//     //   res.json({ message: "Data already inserted successfully", results });
//     // } else {
//       // Proceed to insert the data if no existing entry is found
//       if(time_extended){

//         const insertQuery = `
//         INSERT INTO iib_candidate_test (membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,time_extended,host_ip,serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

//         const formattedInsertQuery = db.format(insertQuery, [membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,time_extended,host_ip,serverno]);

//       }else{
//         const insertQuery = `
//         INSERT INTO iib_candidate_test (membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,host_ip,serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

//         const formattedInsertQuery = db.format(insertQuery, [membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,host_ip,serverno,
//         ]);
//       }

//       db.query(formattedInsertQuery, (err, results) => {
//         if (err) {
//           console.error("Error during SQL query execution:", {
//             error: err.message,
//             query: formattedInsertQuery,
//           });
//           return res
//             .status(500)
//             .json({ error: "An error occurred while inserting data." });
//         }

//         // After a successful insertion, log the query into xml_feed
//         insertIntoXmlFeed(formattedInsertQuery, (err) => {
//           if (err) {
//             console.error("Error inserting feed table:", err);
//             return res
//               .status(500)
//               .json({ error: "An error occurred while logging the query." });
//           }

//           res.json({
//             message: "Data inserted successfully and query logged",
//             results,
//           });
//         });
//       });
//     // }
//   });
// });

// app.post("/insert-candidate-test", (req, res) => {
//   const {membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,host_ip,serverno} = req.body;

//   // Query to check if an entry with the same membership_no and question_paper_no already exists
//   const checkQuery = `SELECT time_extended FROM iib_candidate_test WHERE membership_no = ? AND question_paper_no = ? ORDER BY test_id DESC`;

//   db.query(checkQuery, [membership_no, question_paper_no], (err, results) => {
//     if (err) {
//       console.error("Error during SQL query execution:", {
//         error: err.message,
//         query: checkQuery,
//         parameters: [membership_no, question_paper_no],
//       });
//       return res
//         .status(500)
//         .json({ error: "An error occurred while checking for existing data." });
//     }

//     const time_extended = results.length > 0 ? results[0].time_extended : null;

//     // Construct insert query based on time_extended availability
//     const insertQuery = time_extended
//       ? `INSERT INTO iib_candidate_test (membership_no, exam_code, subject_code, question_paper_no, test_status, start_time, total_time, current_session, browser_status, time_extended, host_ip, serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
//       : `INSERT INTO iib_candidate_test (membership_no, exam_code, subject_code, question_paper_no, test_status, start_time, total_time, current_session, browser_status, host_ip, serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const params = time_extended
//       ? [membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,time_extended,host_ip,serverno
//         ]
//       : [membership_no,exam_code,subject_code,question_paper_no,test_status,start_time,total_time,current_session,browser_status,host_ip,serverno
//         ];

//     const formattedInsertQuery = db.format(insertQuery, params);

//     const updateQuery = `
//         UPDATE iib_candidate_tracking
//         SET updated_time = ? , user_status = ?
//         WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

//       db.query(updateQuery, [formattedTime, 1, membership_no, exam_code, subject_code], (updateErr) => {
//         if (updateErr) return callback(updateErr);
//         console.log("Updated 'updated_time' successfully.");
//         callback(null); // Success
//       });

//       const formattedUpdateQuery = db.format(updateQuery, [formattedTime, 1, membership_no, exam_code, subject_code]);

//     db.query(formattedInsertQuery, (err, results) => {
//       if (err) {
//         console.error("Error during SQL query execution:", {
//           error: err.message,
//           query: formattedInsertQuery,
//         });
//         return res
//           .status(500)
//           .json({ error: "An error occurred while inserting data." });
//       }

//       insertIntoXmlFeed(formattedUpdateQuery, (err) => {
//         if (err) {
//           console.error("Error inserting feed table:", err);
//           return res
//             .status(500)
//             .json({ error: "An error occurred while logging the query." });
//         }
//       });

//       // After successful insertion, log the query into xml_feed
//       insertIntoXmlFeed(formattedInsertQuery, (err) => {
//         if (err) {
//           console.error("Error inserting feed table:", err);
//           return res
//             .status(500)
//             .json({ error: "An error occurred while logging the query." });
//         }

//         res.json({
//           message: "Data inserted successfully and query logged",
//           results,
//         });
//       });
//     });
//   });
// });

app.post("/insert-candidate-test", (req, res) => {
  const {
    membership_no,
    exam_code,
    subject_code,
    question_paper_no,
    test_status,
    start_time,
    total_time,
    current_session,
    browser_status,
    host_ip,
    serverno,
  } = req.body;

  // ✅ Check if entry exists
  const checkQuery = `
    SELECT time_extended FROM iib_candidate_test 
    WHERE membership_no = ? AND question_paper_no = ? 
    ORDER BY test_id DESC`;

  db.query(checkQuery, [membership_no, question_paper_no], (err, results) => {
    if (err) {
      console.error("Error during SQL query execution:", err.message);
      return res
        .status(500)
        .json({ error: "Error checking for existing data." });
    }

    const time_extended = results.length > 0 ? results[0].time_extended : null;

    // ✅ Prepare Insert Query
    const insertQuery = time_extended
      ? `INSERT INTO iib_candidate_test (membership_no, exam_code, subject_code, question_paper_no, test_status, start_time, total_time, current_session, browser_status, time_extended, host_ip, serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      : `INSERT INTO iib_candidate_test (membership_no, exam_code, subject_code, question_paper_no, test_status, start_time, total_time, current_session, browser_status, host_ip, serverno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = time_extended
      ? [
          membership_no,
          exam_code,
          subject_code,
          question_paper_no,
          test_status,
          start_time,
          total_time,
          current_session,
          browser_status,
          time_extended,
          host_ip,
          serverno,
        ]
      : [
          membership_no,
          exam_code,
          subject_code,
          question_paper_no,
          test_status,
          start_time,
          total_time,
          current_session,
          browser_status,
          host_ip,
          serverno,
        ];

    const formattedInsertQuery = db.format(insertQuery, params);

    // ✅ Insert into iib_candidate_test
    db.query(formattedInsertQuery, (err, insertResults) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        return res
          .status(500)
          .json({ error: "Error inserting candidate test data." });
      }

      // ✅ Update iib_candidate_tracking after successful insert
      const updateQuery = `UPDATE iib_candidate_tracking SET updated_time = ?, user_status = ?
        WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

      db.query(
        updateQuery,
        [formattedTime, 1, membership_no, exam_code, subject_code],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating tracking:", updateErr.message);
            return res
              .status(500)
              .json({ error: "Error updating candidate tracking." });
          }

          // ✅ Insert query logs into xml_feed
          insertIntoXmlFeed(formattedInsertQuery, (feedErr) => {
            if (feedErr) {
              console.error("Error inserting feed log:", feedErr);
              return res
                .status(500)
                .json({ error: "Error logging query into feed." });
            }

            res.json({
              success: true,
              message:
                "Data inserted, tracking updated, and query logged successfully.",
              results: insertResults,
            });
          });
        }
      );
    });
  });
});

app.get("/check-table", (req, res) => {
  const tableName = req.query.tableName;

  // Use a raw query to count the number of rows in the table
  const query = `SELECT COUNT(*) AS count FROM ${tableName}`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Assuming that the table exists if the query doesn't throw an error
    const tableExists = results[0].count; // If the table has rows, this works; otherwise, it should return 0 but still means the table exists
    res.json({ exists: tableExists });
  });
});

app.post("/log-internet-speed", (req, res) => {
  const { status, level } = req.body;

  // Get the current date and timestamp
  const date = new Date();
  let formattedDate = date.toISOString().slice(0, 10); // Format: YYYY-MM-DD
  const timestamp = date.toISOString().slice(11, 19).replace(/:/g, ""); // Format: HHMMSS

  // Log directory and file paths
  const logDir = "C:\\pro\\itest\\log";
  const logFile = path.join(logDir, `internetspeed-${formattedDate}.txt`);

  // Backup directory (named after the current date)
  const backupDir = path.join(logDir, formattedDate);
  const backupFile = path.join(
    backupDir,
    `internetspeed-${formattedDate}-${timestamp}.txt`
  );

  // Ensure log and backup directories exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Helper function to append log entry
  const appendLogEntry = (logPath, status, level) => {
    const logEntry = `[${new Date().toLocaleTimeString()}] Internet Status: ${status}, Speed Level: ${level}\n`;
    return new Promise((resolve, reject) => {
      fs.appendFile(logPath, logEntry, (err) => {
        if (err) {
          return reject("Error writing to log file.");
        }
        resolve();
      });
    });
  };

  // Helper function to move log file to backup folder
  const backupLogFile = (currentLogPath) => {
    return new Promise((resolve, reject) => {
      fs.rename(currentLogPath, backupFile, (err) => {
        if (err) {
          return reject("Error moving log file to backup folder.");
        }
        console.log("Backup created:", backupFile);
        resolve();
      });
    });
  };

  // Main logic
  if (status === "Off") {
    if (fs.existsSync(logFile)) {
      // Append log entry and create backup
      appendLogEntry(logFile, status, level)
        .then(() => backupLogFile(logFile))
        .then(() => {
          // Create a new log file
          fs.writeFile(logFile, "", (err) => {
            if (err) {
              console.error("Error creating new log file:", err);
              return res.status(500).send("Error creating new log file.");
            }
            res.send("Internet speed logged and backup created successfully.");
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send(err);
        });
    } else {
      // Log the entry if no file exists
      appendLogEntry(logFile, status, level)
        .then(() => res.send("Internet speed logged successfully."))
        .catch((err) => {
          console.error(err);
          res.status(500).send(err);
        });
    }
  } else {
    // Log for status 'On'
    appendLogEntry(logFile, status, level)
      .then(() => res.send("Internet speed logged successfully."))
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  }
});

// API to check if "Slow" is logged 10 times consecutively
app.get("/api/check-speed", (req, res) => {
  // Get the current date
  const date = new Date();
  let formattedDate = date.toISOString().slice(0, 10); // Format: YYYY-MM-DD

  // Log file path
  const logFilePath = path.join(
    "C:\\pro\\itest\\log",
    `internetspeed-${formattedDate}.txt`
  );

  // Check if file exists
  if (fs.existsSync(logFilePath)) {
    checkConsecutiveFlag(logFilePath, (err, isConsecutive) => {
      if (err) {
        return res.status(500).send("Error reading log file.");
      }

      // Return JSON response
      if (isConsecutive) {
        return res.json({ mediumCount: 10 });
      } else {
        return res.json({ mediumCount: 0 });
      }
    });
  } else {
    res.status(404).send("Log file not found.");
  }
});

app.get("/api/iib_exam_subjects", (req, res) => {
  const subjectCode = req.query.subjectCode;
  // console.log(subjectCode)
  const query = `SELECT * FROM iib_exam_subjects where subject_code = ?`;
  return new Promise((resolve, reject) => {
    db.query(query, [subjectCode], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(res.json(results));
    });
  });
});
// Shutdown endpoint
app.post("/shutdown", (req, res) => {
  console.log("Shutdown endpoint triggered");
  exec("shutdown /s /t 0", (error, stdout, stderr) => {
    // Adjust command for your OS
    if (error) {
      console.error(`Error: ${error.message}`);
      return res
        .status(500)
        .send(`Failed to shut down the system. Error: ${error.message}`);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res
        .status(500)
        .send(`Failed to shut down the system. Stderr: ${stderr}`);
    }
    console.log(`Shutdown initiated: ${stdout}`);
    res.send("Shutdown initiated successfully.");
  });
});

app.post("/restart", (req, res) => {
  // Command to restart the system
  exec("shutdown /r /t 0", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting the system: ${error.message}`);
      return res.status(500).send("Failed to restart the system.");
    }

    console.log("System restart initiated:", stdout);
    res.send("System is restarting...");
  });
});

function insertIntoXmlFeed(query, callback) {
  const finalquery = query + ";";
  const insertFeedSql = "INSERT INTO xml_feed (query) VALUES (?)";
  db.query(insertFeedSql, [finalquery], (err, result) => {
    if (err) {
      console.error("Error inserting feed table:", err);
      return callback(err);
    }
    callback(null, result);
  });
}

// Function to convert the query to base64 and write it to a file
async function processXmlFeed() {
  // Query to get all records with status 'N'
  const selectQuery = `SELECT id, query FROM xml_feed WHERE status = 'N'`;
  const { centre_code, serverno } = await utils.centreAndServerNo();

  // console.log("serverno",serverno);

  db.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("Error fetching xml_feed data:", err);
      return;
    }

    if (rows.length > 0) {
      // Create a variable to accumulate all base64 queries
      let combinedBase64Queries = "";
      let startId = rows[0].id; // Start ID from the first record
      let endId = rows[rows.length - 1].id; // End ID from the last record

      rows.forEach((row) => {
        // Convert query to base64
        const base64Query = Buffer.from(row.query).toString("base64");
        combinedBase64Queries += base64Query + "\n"; // Add newline for separation
      });

      // Get the next file name incrementally
      const files = fs
        .readdirSync(feedDir)
        .filter((file) => file.startsWith("feed_") && file.endsWith(".txt"));
      const nextFileNumber = files.length + 1;
      const fileName = `feed_${centre_code}_${serverno}_${nextFileNumber}.txt`;
      // const fileName = `feed_${nextFileNumber}.txt`;

      // Write all base64 queries to a single file
      fs.writeFileSync(
        path.join(feedDir, fileName),
        combinedBase64Queries,
        "utf8"
      );

      // Insert record into feed_filenames table
      const insertQuery = `INSERT INTO feed_filenames (filename, start_id, end_id, status) VALUES (?, ?, ?, 'N')`;

      const formattedinsertQuery = db.format(insertQuery, [
        fileName,
        startId,
        endId,
      ]);

      db.query(insertQuery, [fileName, startId, endId], (err) => {
        if (err) {
          console.error("Error inserting into feed_filenames:", err);
        }

        // // Insert the exact formatted query into xml_feed
        // insertIntoXmlFeed(formattedinsertQuery, (err) => {
        //   if (err) {
        //     return db.rollback(() => {
        //       console.error("Error inserting feed table:", err);
        //       res.status(500).json({ message: "Internal Server Error" });
        //     });
        //   }
        // });
      });

      // Update the status to 'Y' for all processed records
      const updateQuery = `UPDATE xml_feed SET status = 'Y' WHERE status = 'N'`;
      db.query(updateQuery, (err) => {
        if (err) {
          console.error("Error updating xml_feed status:", err);
        }
        // Insert the exact formatted query into xml_feed
        // insertIntoXmlFeed(updateQuery, (err) => {
        //   if (err) {
        //     return db.rollback(() => {
        //       console.error("Error inserting feed table:", err);
        //       res.status(500).json({ message: "Internal Server Error" });
        //     });
        //   }
        // });
      });
    } else {
      console.log("No records found with status N.");
    }
  });
}

// Function to merge files and create a zip

async function mergeAndZipFiles(centreCode, serialNumber) {
  return new Promise((resolve, reject) => {
    try {
      // 1. Merge files into one
      const mergedFileName = `feedbatch_${centreCode}_a_${serialNumber}_${new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")}.txt`;
      const mergedFilePath = path.join(feedDir, mergedFileName);
      const filesToMerge = fs
        .readdirSync(feedDir)
        .filter((file) => file.endsWith(".txt"));

      const writeStream = fs.createWriteStream(mergedFilePath);

      writeStream.on("finish", () => {
        console.log(`Merged files into: ${mergedFileName}`);

        // 2. Zip the merged file
        const zipFileName = `${path.basename(mergedFileName, ".txt")}.zip`; // Ensure .zip extension
        const zipFilePath = path.join(feedDir, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", function () {
          console.log(
            `Zip file created: ${zipFileName} (${archive.pointer()} total bytes)`
          );
          resolve(zipFileName); // Pass the zip file name to the API
        });

        archive.on("error", function (err) {
          reject(err); // Handle errors
        });

        archive.pipe(output);
        archive.append(fs.createReadStream(mergedFilePath), {
          name: path.basename(mergedFileName),
        });
        archive.finalize();
      });

      writeStream.on("error", (err) => {
        reject(err); // Handle errors
      });

      // Merge files into the write stream
      (async () => {
        for (const file of filesToMerge) {
          const fileContent = fs.readFileSync(
            path.join(feedDir, file),
            "utf-8"
          );
          writeStream.write(fileContent + "\n");
        }
        writeStream.end(); // Close the stream after writing
      })();
    } catch (error) {
      reject(error); // Catch any synchronous errors
    }
  });
}

// Function to check the log file for consecutive "Slow" entries
async function checkConsecutiveFlag(logFilePath, callback) {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      return callback(err, null);
    }

    // Split the log file into lines
    const logLines = data.split("\n").filter((line) => line.trim() !== "");

    let slowCount = 0;
    for (let i = logLines.length - 1; i >= 0; i--) {
      const line = logLines[i];

      // Check if the log line contains "Speed Level: Slow"
      if (line.includes("Speed Level: Slow")) {
        slowCount++;
        if (slowCount === 10) {
          return callback(null, true); // Found 10 consecutive "Slow"
        }
      } else {
        slowCount = 0; // Reset count if it's not "Slow"
      }
    }

    // If the loop finishes and we don't have 10 consecutive, return false
    return callback(null, false);
  });
}

// async function processAndSendFile() {
//   try {
//     // Check if the table exists
//         const tableCheckQuery = `SHOW TABLES LIKE 'feed_filenames'`;
//         const tableExists = await queryAsync(tableCheckQuery);

//         if (tableExists.length === 0) {
//           return res.status(404).json({ error: "Table does not exist." });
//         }
//     // Query to get all filenames with status 'N'
//     const selectQuery = `SELECT id, filename FROM feed_filenames WHERE status = 'N'`;

//     db.query(selectQuery, async (err, rows) => {
//       if (err) {
//         console.error("Error fetching feed_filenames data:", err);
//         return;
//       }

//       if (rows.length > 0) {
//         // Import fetch dynamically
//         const { default: fetch } = await import("node-fetch");

//         for (const fileRecord of rows) {
//           const fileName = fileRecord.filename;
//           const filePath = path.join(feedDir, fileName);

//           if (fs.existsSync(filePath)) {
//             const form = new FormData();
//             form.append("feedFile", fs.createReadStream(filePath));
//             console.log("filename", filePath);

//             try {
//               const response = await fetch(
//                 "https://demo70.sifyitest.com/livedata/upload.php",
//                 {
//                   method: "POST",
//                   body: form,
//                   headers: form.getHeaders(),
//                 }
//               );

//               if (!response.ok) {
//                 const responseBody = await response.text();
//                 throw new Error(
//                   `Failed to send file ${fileName}. Status: ${response.status}, Response: ${responseBody}`
//                 );
//               }

//               console.log(`File ${fileName} sent successfully.`);

//               // Update the status to 'Y' for the processed record
//               const updateQuery = `UPDATE feed_filenames SET status = 'Y' WHERE id = ?`;
//               const formattedupdateQuery = db.format(updateQuery, [
//                 fileRecord.id,
//               ]);
//               db.query(updateQuery, [fileRecord.id], (err) => {
//                 if (err) {
//                   console.error("Error updating feed_filenames status:", err);
//                 }

//                 // Insert the exact formatted query into xml_feed
//                 insertIntoXmlFeed(formattedupdateQuery, (err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       console.error("Error inserting feed table:", err);
//                       res
//                         .status(500)
//                         .json({ message: "Internal Server Error" });
//                     });
//                   }
//                 });
//               });
//             } catch (error) {
//               console.error("Error sending file:", error);
//             }
//           } else {
//             console.log(`File ${fileName} does not exist.`);
//           }
//         }
//       } else {
//         console.log("No records found with status N.");
//       }
//     });
//   } catch (error) {
//     console.error("Error processing and sending files:", error);
//   }
// }

// Schedule the task to run every 10 minutes

async function processAndSendFile() {
  try {
    // Check if the table exists
    const tableCheckQuery = `SHOW TABLES LIKE 'feed_filenames'`;
    db.query(tableCheckQuery, async (err, tableExists) => {
      if (err) {
        console.error("Database query error:", err);
        return;
      }

      if (tableExists.length === 0) {
        console.error("Table 'feed_filenames' does not exist.");
        return;
      }

      // Fetch filenames with status 'N'
      const selectQuery =
        "SELECT `id`, `filename` FROM feed_filenames WHERE status = 'N'";
      db.query(selectQuery, async (err, rows) => {
        if (err) {
          console.error("Error fetching feed_filenames data:", err);
          return;
        }

        if (rows.length === 0) {
          console.log("No records found with status N.");
          return;
        }

        // Fetch TA details
        const sql_tadetails =
          "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
        db.query(sql_tadetails, async (err, results) => {
          if (err) {
            console.error("Error fetching TA details:", err);
            return;
          }

          if (results.length === 0) {
            console.error("No TA details found.");
            return;
          }

          const sTaLoginID = results[0].ta_login;

          const saltRounds = 10;
          // const hashedPassword = await bcryptjs.hash(results[0].ta_password,saltRounds);
          const hashedPassword = results[0].ta_password;
          const checkSumValue =
            sTaLoginID + hashedPassword + process.env.DB_NAME;

          const validateCheckSum = crypto
            .createHash("sha256")
            .update(checkSumValue + process.env.CHECKSUMKEY)
            .digest("hex");

          const sTaPassword = crypto
            .createHash("md5")
            .update(results[0].ta_password)
            .digest("hex");

          for (const feedInfo of rows) {
            // console.log(rows);
            const feedFilename = path.join(
              process.env.FEED_DIR,
              feedInfo.filename
            );
            // const feedFilename = feedInfo.filename;
            // const validateCheckSum = crypto.createHash('sha256').update(checkSumValue + serverCheckSum).digest('hex');
            const reqChkSumStr = sTaLoginID + sTaPassword + process.env.DB_NAME;
            // const reqChkSumVal = crc32.bstr(reqChkSumStr + process.env.CHECKSUMKEY);
            const reqChkSumVal = validateCheckSum;

            // **Create FormData**
            const form = new FormData();
            form.append("name", process.env.DB_NAME);
            form.append("user", sTaLoginID);
            form.append("pass", sTaPassword);
            form.append("CHECKSUM", reqChkSumVal);
            form.append("file", fs.createReadStream(feedFilename));

            // console.log({
            //   name: process.env.DB_NAME,
            //   user: sTaLoginID,
            //   pass: sTaPassword,
            //   CHECKSUM: reqChkSumVal,
            //   file: feedFilename,
            // });

            try {
              const response = await axios.post(
                `${process.env.EXAM_DASHBOARD_URL}/feed`,
                form,
                {
                  headers: {
                    ...form.getHeaders(),
                  },
                }
              );

              console.log(`Response for ${feedInfo.filename}:`, response.data);

              if (response.data.success == "File upload success") {
                const updateQuery = `UPDATE feed_filenames SET status = 'Y' WHERE id = ?`;
                console.log(updateQuery);
                db.query(updateQuery, [feedInfo.id], (err) => {
                  if (err) {
                    console.error(
                      `Error updating status for ${feedInfo.filename}:`,
                      err
                    );
                  }
                });
                const formattedupdateQuery = db.format(updateQuery, [
                  feedInfo.id,
                ]);
                // insertIntoXmlFeed(formattedupdateQuery, (err) => {
                //   if (err) {
                //     return db.rollback(() => {
                //       console.error("Error inserting feed table:", err);
                //       res.status(500).json({ message: "Internal Server Error" });
                //     });
                //   }
                // });
              } else {
                logError(feedInfo.filename, response.data);
              }
            } catch (error) {
              console.error(
                `Error sending file ${feedInfo.filename}:`,
                error.data
              );
            }
          }
        });
      });
    });
  } catch (error) {
    console.error("Error processing and sending files:", error.data);
  }
}

cron.schedule("*/10 * * * *", () => {
  console.log("Running the processAndSendFile task");
  processAndSendFile();
});

const zipFiles = (files, outputZipPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Compression level
    });

    output.on("close", () => {
      console.log(
        `Zip file created: ${outputZipPath} (${archive.pointer()} total bytes)`
      );
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Append each file to the archive
    files.forEach((file) => {
      const filePath = path.join("C:\\pro\\itest\\feed", file);
      archive.file(filePath, { name: file });
    });

    archive.finalize();
  });
};

// Function to export tables and store them as a .dmp file
const exportTablesAsDump = async (centreCode, serialNumber) => {
  try {
    const currentDate = formatDateTimeStamp();

    const dumpFileName = `${client}_${centreCode}_a_${currentDate}_${serialNumber}.dmp`;
    const dumpFilePath = path.join(
      "C:",
      "pro",
      "itest",
      "Closure",
      dumpFileName
    ); // Change to .dmp if necessary
    // console.log('start export dump',dumpFilePath);
    // Check if the directory exists, if not, create it
    const folderPath = path.join("C:", "pro", "itest", "Closure");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Perform the dump using environment variables from the connection config
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
      dumpToFile: dumpFilePath,
      tables: tablesToExport, // Specify the tables to export
    });

    console.log(`Dump file successfully created at: ${dumpFilePath}`);

    // const form = new FormData();
    // form.append("feedFile", fs.createReadStream(dumpFilePath));

    // const { default: fetch } = await import("node-fetch");
    // const response = await fetch(
    //   "https://demo70.sifyitest.com/livedata/upload.php",
    //   {
    //     method: "POST",
    //     body: form,
    //     headers: form.getHeaders(),
    //   }
    // );

    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";
    db.query(sql_tadetails, async (err, results) => {
      if (err) {
        console.error("Error fetching TA details:", err);
        return;
      }

      if (results.length === 0) {
        console.error("No TA details found.");
        return;
      }

      const sTaLoginID = results[0].ta_login;
      const hashedPassword = results[0].ta_password;
      const checkSumValue =
        sTaLoginID + hashedPassword + process.env.DB_NAME_DASH;
      const validateCheckSum = crypto
        .createHash("sha256")
        .update(checkSumValue + process.env.CHECKSUMKEY)
        .digest("hex");
      const sTaPassword = crypto
        .createHash("md5")
        .update(results[0].ta_password)
        .digest("hex");
      const reqChkSumVal = validateCheckSum;

      // **Create FormData**
      const form = new FormData();
      form.append("name", process.env.DB_NAME_DASH);
      form.append("user", sTaLoginID);
      form.append("pass", sTaPassword);
      form.append("CHECKSUM", reqChkSumVal);
      form.append("file", fs.createReadStream(dumpFilePath));

      console.log({
        name: process.env.DB_NAME_DASH,
        user: sTaLoginID,
        pass: sTaPassword,
        CHECKSUM: reqChkSumVal,
        file: dumpFilePath,
      });

      try {
        const response = await axios.post(
          `${process.env.EXAM_DASHBOARD_URL}/dbDumpFeed`,
          form,
          {
            headers: {
              ...form.getHeaders(),
            },
          }
        );

        // console.log(`Response for ${feedInfo.filename}:`, response.data);

        // if (response.data.success === "Feed synced successfully.") {

        //   const updateQuery = `UPDATE feed_filenames SET status = 'Y' WHERE id = ?`;
        //  //  console.log(updateQuery);
        //   db.query(updateQuery, [feedInfo.id], (err) => {
        //     if (err) {
        //       // console.error(`Error updating status for ${feedInfo.filename}:`, err);
        //     }
        //   });
        //   const formattedupdateQuery = db.format(updateQuery, [feedInfo.id]);
        //   insertIntoXmlFeed(formattedupdateQuery, (err) => {
        //     if (err) {
        //       return db.rollback(() => {
        //         console.error("Error inserting feed table:", err);
        //         res.status(500).json({ message: "Internal Server Error" });
        //       });
        //     }
        //   });
        // } else {
        //   logError(feedInfo.filename, response.data);
        // }
      } catch (error) {
        console.error(`Error sending file ${feedInfo.filename}:`, error);
      }
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `Failed to send dump file ${dumpFileName}. Status: ${response.status}, Response: ${responseBody}`
      );
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error exporting tables:", error);
    return false;
  }
};

// Schedule the task to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("Running the processXmlFeed task");
  processXmlFeed();
});

app.get("/attendance-report/:reportid", (req, res) => {
  const reportid = req.params.reportid; // Get exam date from request parameters
  console.log(reportid);
  const sql_examDate = `SELECT exam_date FROM iib_exam_schedule LIMIT 1`;

  // Execute the query to get exam date
  db.query(sql_examDate, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Error fetching exam date.");
    }

    // Check if results are returned
    if (results.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    const examDate = results[0].exam_date; // Use the exam date from the database

    // Ensure the exam date from parameters is valid
    if (!examDate) {
      return res.status(400).send("Exam date is required.");
    }

    const sql = `SELECT exam_time, count(1) as cnt FROM iib_candidate_iway WHERE exam_date = ? GROUP BY exam_date, exam_time`;

    // Execute the main query for attendance report
    db.query(sql, [examDate], (error, results) => {
      if (error) {
        return res.status(500).send("Error fetching attendance report.");
      }

      const attendanceReport = [];
      let completedQueries = 0;

      results.forEach((row) => {
        const { exam_time, cnt } = row;

        // Query for incomplete count
        const sqlIncomplete = `SELECT COUNT(DISTINCT b.membership_no) as incompleteCount FROM iib_candidate_iway a JOIN iib_candidate_test b ON a.membership_no = b.membership_no WHERE b.test_status='IC' AND current_session='Y' AND a.exam_code = b.exam_code AND a.subject_code = b.subject_code AND a.exam_date = ? AND a.exam_time = ?`;

        db.query(
          sqlIncomplete,
          [examDate, exam_time],
          (error, resIncomplete) => {
            const incompleteCount = resIncomplete.length
              ? resIncomplete[0].incompleteCount
              : 0;

            // Query for complete count
            const sqlAttended = `SELECT count(1) as completeCount FROM iib_candidate_iway a JOIN iib_candidate_scores b ON a.membership_no = b.membership_no WHERE a.exam_code = b.exam_code AND a.subject_code = b.subject_code AND a.exam_date = ? AND a.exam_time = ?
            `;

            db.query(
              sqlAttended,
              [examDate, exam_time],
              (error, resAttended) => {
                const completeCount = resAttended.length
                  ? resAttended[0].completeCount
                  : 0;

                const totalAttempted = incompleteCount + completeCount;

                // Add to the attendance report
                attendanceReport.push({
                  exam_date: examDate,
                  exam_time,
                  total_candidates: cnt,
                  total_attempted: totalAttempted,
                  incomplete: incompleteCount,
                  complete: completeCount,
                });

                completedQueries++;

                // Send response once all queries are done
                if (completedQueries === results.length) {
                  res.json(attendanceReport);
                }
              }
            );
          }
        );
      });

      // Handle case where results.length is zero immediately
      if (results.length === 0) {
        res.json(attendanceReport);
      }
    });
  });
});

function formatDate_db(dateString) {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);
  return utcDate.toISOString().split("T")[0];
}

app.get("/incomplete-status-report/:reportid", (req, res) => {
  const reportid = req.params.reportid; // Get report ID from request parameters

  const sql_examDate = `SELECT exam_date FROM iib_exam_schedule LIMIT 1`;
  // console.log(sql_examDate);
  // Execute the query to get the exam date
  db.query(sql_examDate, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Error fetching exam date.");
    }

    // Check if results are returned
    if (results.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    console.log("SQL Query:", sql_examDate);

    const examDate = formatDate_db(results[0].exam_date); // Use the exam date from the database

    // const examDate = "2024-09-16"; // Use the exam date from the database

    // Prepare the date range for the query
    const examDate1 = `${examDate} 00:00:00`;
    const examDate2 = `${examDate} 23:59:59`;

    const sql = `
            SELECT a.membership_no, a.exam_code, a.subject_code, DATE_FORMAT(a.start_time, '%T') AS start_time_mod
            FROM iib_candidate_test a 
            LEFT JOIN iib_candidate_scores b ON a.membership_no = b.membership_no 
            AND a.exam_code = b.exam_code AND a.subject_code = b.subject_code 
            WHERE b.subject_code IS NULL AND a.start_time BETWEEN ? AND ? 
            GROUP BY a.membership_no, a.exam_code, a.subject_code
        `;

    console.log("Start Date:", examDate1); // Log the SQL query for debugging
    console.log("End Date:", examDate2); // Log the SQL query for debugging

    // Execute the main query to fetch incomplete status report
    db.query(sql, [examDate1, examDate2], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).send("Error fetching incomplete status report.");
      }

      // Prepare the attendance report
      const incompletestatusReport = results.map((row) => ({
        membership_no: row.membership_no,
        exam_code: row.exam_code,
        subject_code: row.subject_code,
        start_time_mod: row.start_time_mod,
      }));

      console.log("Incomplete Status Report:", results); // Log the report for debugging
      // console.log(sql);
      // Send the response with the attendance report
      res.json(incompletestatusReport);
    });
  });
});

app.get("/exam-time-dropdown", (req, res) => {
  const q =
    "SELECT distinct(exam_time) as exam_time FROM iib_candidate_iway order by exam_time";
  let exam_time = [];
  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      rows.forEach((row) => {
        exam_time.push(row.exam_time.toString()); // Convert buffer to string
      });
      return res.json(exam_time);
    }
  });
});
app.get("/exam-dropdown", (req, res) => {
  const q =
    "select trim(b.exam_code) exam_code ,trim(b.exam_name) exam_name from iib_exam_subjects a, iib_exam b where a.exam_code=b.exam_code group by a.exam_code order by b.exam_code ";
  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        exam_code: row.exam_code.toString(), // Convert buffer to string
        exam_name: row.exam_name,
      }));
      return res.json(result);
    }
  });
});

app.get("/exam-time-dropdown", (req, res) => {
  const q =
    "SELECT distinct(exam_time) as exam_time FROM iib_candidate_iway order by exam_time";

  let exam_time = [];

  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);

      res.status(500).json({ error: "Internal Server Error" });

      return;
    }

    if (rows.length > 0) {
      rows.forEach((row) => {
        exam_time.push(row.exam_time.toString()); // Convert buffer to string
      });

      return res.json(exam_time);
    }
  });
});

app.get("/subject-dropdown/:exam", (req, res) => {
  const { exam } = req.params;
  const q =
    "select trim(subject_code) as subject_code, trim(subject_name) as subject_name,subject_duration from iib_exam_subjects where exam_code = ? order by subject_code";
  db.query(q, [exam], (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        subject_code: row.subject_code.toString(), // Convert buffer to string
        subject_name: row.subject_name,
        subject_duration: row.subject_duration,
      }));
      return res.json(result);
    }
  });
});

app.get("/rollno-dropdown/:exam/:subject_code", (req, res) => {
  const { exam, subject_code } = req.params;
  const q =
    "SELECT distinct membership_no from iib_candidate_test where exam_code = ? and subject_code = ?";
  db.query(q, [exam, subject_code], (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        //   subject_code: row.subject_code.toString(), // Convert buffer to string
        membership_no: row.membership_no,
      }));
      return res.json(result);
    }
  });
});

app.post("/process-exam-data", async (req, res) => {
  const {
    submitted,
    examDate,
    Exam_Code,
    Subject_code,
    memno,
    filter_by_idle_time,
  } = req.body;

  if (
    submitted &&
    examDate &&
    Exam_Code &&
    Subject_code &&
    memno &&
    filter_by_idle_time
  ) {
    const examCodeValue = Array.isArray(Exam_Code)
      ? Exam_Code[0].exam_code
      : Exam_Code.exam_code;
    const subjectCodeValue = Array.isArray(Subject_code)
      ? Subject_code[0].subject_code
      : Subject_code.subject_code;

    try {
      // Get time extended for each membership number
      // const q = `
      //   SELECT membership_no, SUM(time_extended) AS time_extended
      //   FROM iib_candidate_test
      //   WHERE exam_code = ? AND subject_code = ?
      //   GROUP BY membership_no`;
      const q = `SELECT membership_no, time_extended FROM iib_candidate_test WHERE exam_code = ? AND subject_code = ? GROUP BY membership_no`;

      // Query to fetch time extensions
      const timeExtendResults = await new Promise((resolve, reject) => {
        db.query(q, [examCodeValue, subjectCodeValue], (err, rows) => {
          if (err) {
            console.error("Error querying the database:", err);
            return reject(err);
          }
          resolve(rows);
        });
      });

      console.log("Query Result:", timeExtendResults);
      if (!Array.isArray(timeExtendResults) || timeExtendResults.length === 0) {
        console.error("No results for time extensions:", timeExtendResults);
        // return res.status(500).json({ error: "Internal Server Error" });
      }

      const arrTimeextend = {};
      // const time_extended=0;
      // Initialize arrTimeextend for each membership_no
      const timeExtensions = [];

      // Loop through the timeExtendResults to collect time extensions
      for (const row of timeExtendResults) {
        const convertedTime = convertHrs(row.time_extended || 0); // Convert the time
        timeExtensions.push(convertedTime); // Add the converted time to the array
      }

      // Log the resulting array of time extensions
      // console.log('Time Extensions:', timeExtensions[0]);

      // for (const row of timeExtendResults) {
      //   const membershipNo = row.membership_no; // Assuming membership_no is a string like 'DRUN000001'
      //   const timeExtended = convertHrs(row.time_extended || 0); // Handle undefined case
      //   arrTimeextend[membershipNo] = timeExtended; // Assigning the converted time to the corresponding membership_no
      // }

      // console.log('Time Extended Array:', arrTimeextend);

      const mainArray = [];

      const memnoArray = Array.isArray(memno) ? memno : [memno];

      console.log(memnoArray);

      // Process each membership number
      for (const membershipNo of memnoArray) {
        const membershipNoValue = membershipNo; // Assign the current membership number
        // Now you can use membershipNoValue in your logic

        // Fetch test data for each membership number
        const timeResults = await new Promise((resolve, reject) => {
          db.query(
            `SELECT start_time, last_updated_time, TIME_TO_SEC(DATE_FORMAT(last_updated_time, '%T')) - TIME_TO_SEC(DATE_FORMAT(start_time, '%T')) AS duration,test_status, question_paper_no, total_time FROM iib_candidate_test WHERE membership_no = ? AND exam_code = ? AND subject_code = ? ORDER BY last_updated_time ASC`,
            [membershipNoValue, examCodeValue, subjectCodeValue],
            (error, results) => {
              if (error) {
                console.error("Database query error:", error);
                return reject(error);
              }
              resolve(results);
            }
          );
        });

        console.log(
          "Input Values:",
          membershipNoValue,
          examCodeValue,
          subjectCodeValue
        );
        // console.log("Query Results:", timeResults);
        // const responselength = 0;
        let responselength = 0;
        if (timeResults.length > 0) {
          let dur = 0;
          const candidateData = { mem_no: membershipNoValue, Time: [] };
          const arrayResponse = [];
          const array_timelog = [];
          for (const row of timeResults) {
            const {
              start_time,
              last_updated_time,
              duration,
              test_status,
              question_paper_no,
              total_time,
            } = row;

            // Fetch the total response count for each paper
            const totalResponseCount = await getResponseCount(
              question_paper_no,
              start_time,
              last_updated_time
            );
            // console.log("Count", totalResponseCount);
            candidateData.total_response_count = totalResponseCount;
            candidateData.Time.push({
              start_time,
              last_updated_time,
              client_time: total_time,
              total_response_count: totalResponseCount,
            });

            dur += duration;

            responselength += 1;
            // console.log(responselength);

            if (responselength == 1) {
              // console.log("question_paper_no", question_paper_no);
              // Fetch responses for the question paper
              const responseResults = await new Promise((resolve, reject) => {
                db.query(
                  `SELECT id, updatedtime, clienttime FROM iib_response WHERE question_paper_no = ? ORDER BY id`,
                  [question_paper_no],
                  (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                  }
                );
              });
              // Process responses and calculate justification
              // const responselength = responseResults.length
              for (let loop = 0; loop < responseResults.length; loop++) {
                const { id, updatedtime, clienttime } = responseResults[loop];
                arrayResponse.push({
                  response_id: id,
                  response_time: updatedtime,
                  response_client_time: clienttime,
                  response_justification:
                    loop > 0
                      ? arrayResponse[loop - 1].response_client_time -
                        clienttime
                      : candidateData.Time[0].client_time - clienttime,
                });
              }
              // const membershipNos = Array.isArray(memno) ? memno : [memno]; // Ensure it's an array
              // Fetch time logs (previously in PHP)
              const timeLogResults = await db.query(
                `SELECT id, servertime, clienttime FROM timelog WHERE questionpaperno = ? AND membership_no= ? ORDER BY id`,
                [question_paper_no, membershipNoValue]
              );

              // Process and push time logs into array_timelog
              for (let loop = 0; loop < timeLogResults.length; loop++) {
                const { id, servertime, clienttime } = timeLogResults[loop];

                array_timelog.push({
                  timelog_id: id,
                  timelog_time: servertime,
                  timelog_client_time: clienttime,
                });
              }
            }
          }

          candidateData.start_time = timeResults[0].start_time;
          candidateData.last_updated_time = timeResults[0].last_updated_time;
          candidateData.time_extended = timeExtensions[0];
          candidateData.duration = convertTime(dur);
          // candidateData.timeextended = arrTimeextend[membershipNo] || '--';
          candidateData.test_status =
            timeResults[0].test_status === "C" ? "Completed" : "Incomplete";
          candidateData.responses = arrayResponse;
          candidateData.timelogresponses = array_timelog;

          mainArray.push(candidateData);
        }
      }

      // console.log("Final Processed Data:", mainArray);
      return res.json({ success: true, data_value: mainArray });
    } catch (error) {
      console.error("Error processing data:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error processing data" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }
});

app.post("/process-justification-exam-data", async (req, res) => {
  const {
    submitted,
    examDate,
    Exam_Code,
    Subject_code,
    memno,
    filter_by_idle_time,
  } = req.body;

  if (
    submitted &&
    examDate &&
    Exam_Code &&
    Subject_code &&
    memno &&
    filter_by_idle_time
  ) {
    const examCodeValue = Exam_Code;
    const subjectCodeValue = Subject_code;

    try {
      const q = `SELECT membership_no, time_extended FROM iib_candidate_test WHERE exam_code = ? AND subject_code = ? GROUP BY membership_no`;

      // Query to fetch time extensions
      const timeExtendResults = await new Promise((resolve, reject) => {
        db.query(q, [examCodeValue, subjectCodeValue], (err, rows) => {
          if (err) {
            console.error("Error querying the database:", err);
            return reject(err);
          }
          resolve(rows);
        });
      });

      // console.log("Query Result:", timeExtendResults);
      if (!Array.isArray(timeExtendResults) || timeExtendResults.length === 0) {
        console.error("No results for time extensions:", timeExtendResults);
        // return res.status(500).json({ error: "Internal Server Error" });
      }

      const arrTimeextend = {};
      // const time_extended=0;
      // Initialize arrTimeextend for each membership_no
      const timeExtensions = [];

      // Loop through the timeExtendResults to collect time extensions
      for (const row of timeExtendResults) {
        const convertedTime = convertHrs(row.time_extended || 0); // Convert the time
        timeExtensions.push(convertedTime); // Add the converted time to the array
      }

      const mainArray = [];

      const memnoArray = Array.isArray(memno) ? memno : [memno];

      // console.log(memnoArray);

      // Process each membership number
      for (const membershipNo of memnoArray) {
        const membershipNoValue = membershipNo; // Assign the current membership number
        // Now you can use membershipNoValue in your logic

        // Fetch test data for each membership number
        const timeResults = await new Promise((resolve, reject) => {
          db.query(
            `SELECT start_time, last_updated_time, TIME_TO_SEC(DATE_FORMAT(last_updated_time, '%T')) - TIME_TO_SEC(DATE_FORMAT(start_time, '%T')) AS duration,test_status, question_paper_no, total_time FROM iib_candidate_test WHERE membership_no = ? AND exam_code = ? AND subject_code = ? ORDER BY last_updated_time ASC`,
            [membershipNoValue, examCodeValue, subjectCodeValue],
            (error, results) => {
              if (error) {
                console.error("Database query error:", error);
                return reject(error);
              }
              resolve(results);
            }
          );
        });
        // console.log(
        //   "Input Values:",
        //   membershipNoValue,
        //   examCodeValue,
        //   subjectCodeValue
        // );
        // console.log("Query Results:", timeResults);
        // const responselength = 0;
        let responselength = 0;
        if (timeResults.length > 0) {
          let dur = 0;
          const candidateData = { mem_no: membershipNoValue, Time: [] };
          const arrayResponse = [];
          const array_timelog = [];
          for (const row of timeResults) {
            const {
              start_time,
              last_updated_time,
              duration,
              test_status,
              question_paper_no,
              total_time,
            } = row;

            // Fetch the total response count for each paper
            const totalResponseCount = await getResponseCount(
              question_paper_no,
              start_time,
              last_updated_time
            );
            // console.log("Count", totalResponseCount);
            candidateData.total_response_count = totalResponseCount;
            candidateData.Time.push({
              start_time,
              last_updated_time,
              client_time: total_time,
              total_response_count: totalResponseCount,
            });

            dur += duration;

            responselength += 1;
            // console.log(responselength);

            if (responselength == 1) {
              // console.log("question_paper_no", question_paper_no);
              // Fetch responses for the question paper
              const responseResults = await new Promise((resolve, reject) => {
                db.query(
                  `SELECT id, updatedtime, clienttime FROM iib_response WHERE question_paper_no = ? ORDER BY id`,
                  [question_paper_no],
                  (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                  }
                );
              });
              // Process responses and calculate justification
              // const responselength = responseResults.length
              for (let loop = 0; loop < responseResults.length; loop++) {
                const { id, updatedtime, clienttime } = responseResults[loop];
                arrayResponse.push({
                  response_id: id,
                  response_time: updatedtime,
                  response_client_time: clienttime,
                  response_justification:
                    loop > 0
                      ? arrayResponse[loop - 1].response_client_time -
                        clienttime
                      : candidateData.Time[0].client_time - clienttime,
                });
              }
              // const membershipNos = Array.isArray(memno) ? memno : [memno]; // Ensure it's an array
              // Fetch time logs (previously in PHP)
              const timeLogResults = await db.query(
                `SELECT id, servertime, clienttime FROM timelog WHERE questionpaperno = ? AND membership_no= ? ORDER BY id`,
                [question_paper_no, membershipNoValue]
              );

              // Process and push time logs into array_timelog
              for (let loop = 0; loop < timeLogResults.length; loop++) {
                const { id, servertime, clienttime } = timeLogResults[loop];

                array_timelog.push({
                  timelog_id: id,
                  timelog_time: servertime,
                  timelog_client_time: clienttime,
                });
              }
            }
          }

          candidateData.start_time = timeResults[0].start_time;
          candidateData.last_updated_time = timeResults[0].last_updated_time;
          candidateData.time_extended = timeExtensions[0];
          candidateData.duration = convertTime(dur);
          // candidateData.timeextended = arrTimeextend[membershipNo] || '--';
          candidateData.test_status =
            timeResults[0].test_status === "C" ? "Completed" : "Incomplete";
          candidateData.responses = arrayResponse;
          candidateData.timelogresponses = array_timelog;

          mainArray.push(candidateData);
        }
      }

      // console.log("Final Processed Data:", mainArray);
      return res.json({ success: true, data_value: mainArray });
    } catch (error) {
      console.error("Error processing data:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error processing data" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }
});

const convertHrs = (durationVal) => {
  let dispTimeHrs = Math.floor(durationVal / 3600);
  let dispTimeMin;

  if (durationVal % 3600 === 0) {
    dispTimeHrs = durationVal / 3600;
    dispTimeMin = "00";
  } else {
    dispTimeMin = Math.floor((durationVal % 3600) / 60);
    if (dispTimeMin === 60) {
      dispTimeHrs += 1;
      dispTimeMin = "00";
    }
  }

  return `${dispTimeHrs}:${String(dispTimeMin).padStart(2, "0")}`;
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

// Function to get the count of responses based on question paper number and time range
const getResponseCount = async (questionPno, startTime, endTime) => {
  const query = `
    SELECT COUNT(1) AS responseCount
    FROM iib_response 
    WHERE question_paper_no = ? AND updatedtime >= ? AND updatedtime <= ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [questionPno, startTime, endTime], (error, results) => {
      if (error) return reject(error);
      resolve(results[0].responseCount); // Access the count from the result
    });
  });
};

app.get("/get-centercode", (req, res) => {
  const q = "SELECT center_code, serverno FROM autofeed";

  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (rows.length > 0) {
      const result = rows.map((row) => ({
        center_code: row.center_code,
        serverno: row.serverno,
      }));
      res.json(result);
    } else {
      // res.status(200).json({ message: "No data found" });
      const result = rows.map((row) => ({
        center_code: "111111",
        serverno: "a",
      }));
      res.json(result);
    }
  });
});

app.get("/qp-files", (req, res) => {
  const query = `SELECT download_sec, download_status, download_time FROM qp_download`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length > 0) {
      const data = results.map((row) => {
        let download_sec_disp = row.download_sec;
        if (row.download_sec === "Base QP") download_sec_disp = "Base QP"; // Modify based on actual logic

        let status_final = "";
        switch (row.download_status) {
          case "D":
            status_final = "Success";
            break;
          case "DV":
            status_final =
              '<span style="color:red"><b>Verified Success</b></span>';
            break;
          case "U":
            status_final =
              '<span style="color:green"><b>Upload Success</b></span>';
            break;
          case "DC":
            status_final = '<span style="color:red"><b>Dump Crashed</b></span>';
            break;
          case "UF":
            status_final =
              '<span style="color:red"><b>Upload Failed</b></span>';
            break;
          case "NF":
            status_final = "File does not exist.";
            break;
          case "F":
            status_final = "Failed";
            break;
          default:
            status_final = "";
        }

        return {
          download_sec_disp,
          status_final,
          download_time: row.download_time,
        };
      });

      return res.json(data);
    } else {
      return res.json({ message: "QP not downloaded yet" });
    }
  });
});

const feed_path = "feed";

// app.get("/feed-list", (req, res) => {
//   fs.readdir(feed_path, (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read feed directory" });
//     }

//     if (files.length === 0) {
//       return res.json({ feed_count: 0, feed_list: [] });
//     }

//     const feed_list = files
//       .map((file) => {
//         const filePath = path.join(feed_path, file);
//         const stats = fs.statSync(filePath); // Get the file stats
//         const file_name_time = stats.mtime.toISOString(); // Get the modification time

//         return { file_name: file, file_name_time, mtime: stats.mtime }; // Include `mtime` for sorting
//       })
//       .sort((a, b) => b.mtime - a.mtime); // Sort by modification time in descending order

//     res.json({
//       feed_count: files.length,
//       feed_list: feed_list.map(({ file_name, file_name_time }) => ({
//         file_name,
//         file_name_time,
//       })), // Return the file name and time without the `mtime`
//     });
//   });
// });

app.get("/feed-list", (req, res) => {
  fs.readdir(feed_path, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read feed directory" });
    }

    if (files.length === 0) {
      return res.json({ feed_count: 0, feed_list: [] });
    }

    const feed_list = files
      .map((file) => {
        const filePath = path.join(feed_path, file);
        const stats = fs.statSync(filePath);
        const file_name_time = stats.mtime.toISOString(); // Modification time

        return { file_name: file, file_name_time, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time (latest first)

    // Fetch sync status from DB
    const fileNames = feed_list.map((f) => f.file_name);
    if (fileNames.length === 0) {
      return res.json({ feed_count: 0, feed_list: [] });
    }

    const query = `SELECT filename, status FROM feed_filenames WHERE filename IN (?)`;
    db.query(query, [fileNames], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      // Map statuses to filenames
      const statusMap = {};
      result.forEach((row) => {
        statusMap[row.filename] = row.status;
      });

      // Merge status into the feed list
      const finalFeedList = feed_list.map((file) => ({
        file_name: file.file_name,
        file_name_time: file.file_name_time,
        status: statusMap[file.file_name] || "N/A", // Default to "N/A" if status is missing
      }));

      res.json({ feed_count: finalFeedList.length, feed_list: finalFeedList });
    });
  });
});

app.post("/submitFeedback", (req, res) => {
  const {
    loginProcess,
    systemWork,
    techProblem,
    questionRating,
    adequateTime,
    screenNavigationIssue,
    examMethodologyRating,
    examCode,
    subjectCode,
    membershipNo,
    questionpaperno,
  } = req.body;
  const txtfeedback = (problem_questions = "");
  let msg = "";
  console.log(req.body.examCode);

  const feedback_enable_query =
    "SELECT variable_value FROM exam_settings WHERE variable_name='feedback_enable'";
  db.query(feedback_enable_query, (err, feedbackrslt) => {
    if (err) {
      errorlog("err95", `QUERY: ${feedback_enable_query} ${err}`);
      return res.status(500).send("Database error");
    }

    if (examMethodologyRating) {
      const sqlSelect = `SELECT COUNT(1) FROM iib_feedback WHERE membership_no='${membershipNo}' AND exam_code='${examCode}' AND subject_code='${subjectCode}'`;
      db.query(sqlSelect, (err, result) => {
        if (err) {
          errorlog("err05", `QUERY: ${sqlSelect} ${err}`);
          return res.status(500).send("Database error");
        }

        const nRows = result[0]["COUNT(1)"];

        let display_questions =
          (question_asked_twice =
          answer_not_relevant =
          question_not_display =
          answer_not_display =
          display_image_issue =
          Display_issue_notdisprop =
          Junk_Char_observed =
            "");

        if (nRows == 0) {
          const sqlInsert = `
                      INSERT INTO iib_feedback (membership_no, exam_code, subject_code, login_process, system_work, tech_prob, q_rating, adeq_time, navigate_issue, rating, feedback_text, diplay_questions, problem_questions, question_asked_twice, answer_not_relevant, question_not_display, answer_not_display, display_image_issue, Display_issue_notdisprop, Junk_Char_observed) 
                      VALUES ('${membershipNo}', '${examCode}', '${subjectCode}', '${loginProcess}', '${systemWork}', '${techProblem}', '${questionRating}', '${adequateTime}', '${screenNavigationIssue}', '${examMethodologyRating}', '${txtfeedback}', '${display_questions}', '${problem_questions}', '${question_asked_twice}', '${answer_not_relevant}', '${question_not_display}', '${answer_not_display}', '${display_image_issue}', '${Display_issue_notdisprop}', '${Junk_Char_observed}')`;

          db.query(sqlInsert, (err) => {
            if (err) {
              errorlog("err08", `QUERY: ${sqlInsert} ${err}`);
              return res.status(500).send("Database error");
            }
            msg = "Thank you for your feedback.";
            const feed = `INSERT INTO xml_feed(query) VALUES("${sqlInsert}")`;
            db.query(feed);
            res.send(msg);
          });
        } else {
          const sqlUpdate = `UPDATE iib_feedback SET login_process='${loginProcess}', system_work='${systemWork}', tech_prob='${techProblem}', q_rating='${questionRating}', adeq_time='${adequateTime}', navigate_issue='${screenNavigationIssue}', rating='${examMethodologyRating}', feedback_text='${txtfeedback}', diplay_questions='${display_questions}', problem_questions='${problem_questions}', question_asked_twice='${question_asked_twice}', answer_not_relevant='${answer_not_relevant}', question_not_display='${question_not_display}', answer_not_display='${answer_not_display}', display_image_issue='${display_image_issue}', Display_issue_notdisprop='${Display_issue_notdisprop}', Junk_Char_observed='${Junk_Char_observed}' 
          WHERE membership_no='${membershipNo}' AND exam_code='${examCode}' AND subject_code='${subjectCode}'`;

          // console.log(sqlUpdate);

          db.query(sqlUpdate, (err) => {
            if (err) {
              errorlog("err06", `QUERY: ${sqlUpdate} ${err}`);
              return res.status(500).send("Database error");
            }
            msg = "Thank you for your feedback.";
            const feed = `INSERT INTO xml_feed(query) VALUES("${sqlUpdate}")`;
            db.query(feed);
            res.send(msg);
          });
        }
      });
    }
  });
});

app.get("/get-candidate-duration-report/", async (req, res) => {
  const { examCode, subjectCode } = req.query;
  const flag_result = {
    F: "Fail",
    P: "Pass",
    "--": "--",
  };
  // let GETSUBJECTSET={};
  const GETSUBJECTSET = await utils.getSubExamSet(subjectCode);
  // console.log(GETSUBJECTSET);
  const arrTimeextend = {};
  const arrQPCount = {};

  const getExamDate = "SELECT exam_date FROM iib_exam_schedule LIMIT 1";

  db.query(getExamDate, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Error fetching exam date.");
    }

    if (result.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    const examDate = utils.formatExamDate(result[0].exam_date);
    const filename = `candidate_duration_(${examDate})_examcode_(${examCode})_subjcode_(${subjectCode})`;
    const subjectCodeDuration = async (subjectCode) => {
      return new Promise((resolve, reject) => {
        const query =
          "select subject_duration from iib_exam_subjects where exam_code = ? and subject_code = ?";
        db.query(query, [examCode, subjectCode], (err, res) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          return resolve(res[0].subject_duration);
        });
      });
    };
    let subject_duration;
    const getSubjectDuration = async () => {
      subject_duration = await subjectCodeDuration(subjectCode);
    };
    getSubjectDuration();
    if (!examDate) {
      return res.status(400).send("Exam date is required.");
    }

    // const sql1 = `
    // SELECT membership_no, SUM(time_extended) AS time_extended
    // FROM iib_candidate_test
    // WHERE exam_code = ? AND subject_code = ?
    // GROUP BY membership_no
    // `;

    // const sql1 = `
    // SELECT membership_no, SUM(time_extended) AS time_extended
    // FROM iib_candidate_test
    // WHERE exam_code = ? AND subject_code = ?
    // `;
    // const sql1 = `SELECT membership_no, SUM(time_extended) AS time_extended FROM iib_candidate_test WHERE exam_code = ? AND subject_code = ?`;
    const sql1 = `SELECT membership_no, time_extended FROM iib_candidate_test WHERE exam_code = ? AND subject_code = ?`;
    db.query(sql1, [examCode, subjectCode], (err, rows) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      rows.forEach((row) => {
        arrTimeextend[row.membership_no] = utils.convertHrs(row.time_extended);
      });

      const questionPaperNoQuery = `SELECT question_paper_no AS qpNo FROM iib_question_paper_details WHERE subject_code= ? GROUP BY question_paper_no`;

      db.query(questionPaperNoQuery, [subjectCode], (err, rows) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const qpPromises = rows.map((row) => {
          const getAttemptedCountQuery = `
            SELECT question_paper_no, COUNT(id) AS attemptedcount 
            FROM iib_response 
            WHERE question_paper_no = ? 
              AND id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id) 
              AND answer != '' 
            GROUP BY question_paper_no
          `;

          return new Promise((resolve, reject) => {
            db.query(
              getAttemptedCountQuery,
              [row.qpNo, row.qpNo],
              (err, rows2) => {
                if (err) {
                  reject(err);
                } else {
                  rows2.forEach((row2) => {
                    arrQPCount[row2.question_paper_no] = row2.attemptedcount;
                  });
                  resolve();
                }
              }
            );
          });
        });

        Promise.all(qpPromises)
          .then(() => {
            const sqlMembershipNoQuery = `
              SELECT TRIM(membership_no) AS mem_no, UPPER(TRIM(centre_code)) AS centre_code 
              FROM iib_candidate_iway 
              WHERE exam_date = ? AND exam_code = ? AND subject_code = ?
            `;

            db.query(
              sqlMembershipNoQuery,
              [examDate, examCode, subjectCode],
              (err, rows3) => {
                if (err) {
                  console.error("Problem fetching membership list:", err);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }

                const array_values_comp = [];
                const array_values_incomp = [];
                const array_values_absenties = [];
                let i = 0;

                const processMemberships = rows3.map((row3) => {
                  return new Promise((resolve, reject) => {
                    const sqlTimeQuery = `SELECT TRIM(start_time) AS start_time, TRIM(last_updated_time) AS last_updated_time, TIME_TO_SEC(DATE_FORMAT(TRIM(last_updated_time), '%T')) - TIME_TO_SEC(DATE_FORMAT(TRIM(start_time), '%T')) AS duration, TRIM(test_status) AS test_status, question_paper_no FROM iib_candidate_test WHERE membership_no = ? AND exam_code = ? AND subject_code = ? ORDER BY last_updated_time ASC`;

                    db.query(
                      sqlTimeQuery,
                      [row3.mem_no, examCode, subjectCode],
                      (err, rows4) => {
                        if (err) {
                          reject(err);
                        } else {
                          const main_array = {};
                          main_array[row3.mem_no] = {
                            centre_code: row3.centre_code,
                          };

                          if (rows4.length > 0) {
                            let dur = 0;
                            let test_status = "";
                            let QPNO = "";

                            rows4.forEach(async (row, index) => {
                              // console.log(row.converted_last_update_time);
                              // console.log(row.converted_start_time);
                              const {
                                start_time,
                                last_updated_time: end_time,
                                duration,
                                test_status: status,
                                question_paper_no,
                              } = row;
                              dur += duration;
                              test_status = status;
                              QPNO = question_paper_no;
                              const total_response_count =
                                await utils.getResponseCount(
                                  row.question_paper_no,
                                  row.start_time,
                                  row.last_updated_time
                                );
                              // console.log(total_response_count);
                              if (!main_array[row3.mem_no].Time) {
                                main_array[row3.mem_no].Time = [];
                              }

                              main_array[row3.mem_no].Time.push({
                                start_time,
                                end_time,
                                total_response_count,
                              });
                            });
                            main_array[row3.mem_no].durationInSec = dur;
                            main_array[row3.mem_no].duration =
                              utils.convertHrs(dur);

                            if (test_status === "C") {
                              // Completed candidates logic
                              const sql_score = `
                            SELECT TRIM(score) AS score, TRIM(result) AS result 
                            FROM iib_candidate_scores 
                            WHERE membership_no = ? AND exam_code = ? AND subject_code = ?
                          `;

                              db.query(
                                sql_score,
                                [row3.mem_no, examCode, subjectCode],
                                (err, res_score) => {
                                  if (err) {
                                    reject(err);
                                  } else {
                                    let score = res_score[0]?.score || "--";
                                    let result = res_score[0]?.result || "--";
                                    result = flag_result[result] || result;
                                    main_array[row3.mem_no].mem_no =
                                      row3.mem_no;
                                    main_array[row3.mem_no].score = score;
                                    main_array[row3.mem_no].result = result;
                                    main_array[row3.mem_no].timeextended =
                                      arrTimeextend[row3.mem_no] || "--";
                                    main_array[row3.mem_no].attemptqpcount =
                                      arrQPCount[QPNO] || 0;

                                    array_values_comp.push(
                                      main_array[row3.mem_no]
                                    );
                                    resolve();
                                  }
                                }
                              );
                            } else {
                              // Incomplete candidates logic
                              main_array[row3.mem_no].mem_no = row3.mem_no;
                              main_array[row3.mem_no].score = "--";
                              main_array[row3.mem_no].result = "--";
                              main_array[row3.mem_no].timeextended =
                                arrTimeextend[row3.mem_no] || "--";
                              main_array[row3.mem_no].attemptqpcount =
                                arrQPCount[QPNO] || 0;
                              array_values_incomp.push(main_array[row3.mem_no]);
                              resolve();
                            }
                          } else {
                            // Absent candidates logic
                            const absentData = {
                              mem_no: row3.mem_no,
                              centre_code: row3.centre_code,
                              Time: [
                                {
                                  start_time: "--",
                                  end_time: "--",
                                  total_response_count: "0",
                                },
                              ],
                              duration: "--",
                              score: "--",
                              result: "--",
                              timeextended: "--",
                              attemptqpcount: "--",
                            };
                            array_values_absenties.push(absentData);
                            resolve();
                          }
                        }
                      }
                    );
                  });
                });

                Promise.all(processMemberships)
                  .then(() => {
                    const count_scheduledcandidate =
                      array_values_absenties.length +
                      array_values_incomp.length +
                      array_values_comp.length;
                    const count_compcandidate = array_values_comp.length;
                    const count_incompcandidate = array_values_incomp.length;
                    const count_abcandidate = array_values_absenties.length;

                    const converted_array_values_comp =
                      utils.convertBufferDataAsValue(array_values_comp);
                    const converted_array_values_incomp =
                      utils.convertBufferDataAsValue(array_values_incomp);
                    const converted_array_values_absenties =
                      utils.convertBufferDataAsValue(array_values_absenties);
                    res.json({
                      subject_duration,
                      examDate,
                      count_scheduledcandidate,
                      count_compcandidate,
                      count_incompcandidate,
                      count_abcandidate,
                      GETSUBJECTSET,
                      converted_array_values_comp,
                      converted_array_values_incomp,
                      converted_array_values_absenties,
                    });
                    // console.log(GETSUBJECTSET)
                  })
                  .catch((err) => {
                    console.error("Error processing membership data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                  });
              }
            );
          })
          .catch((err) => {
            console.error("Error querying attempted counts:", err);
            res.status(500).json({ error: "Internal Server Error" });
          });
      });
    });
  });
});

// Function to get candidate report

// app.get("/candidate-report/:rollNum", async (req, res) => {
//   const { rollNum } = req.params;
//   let iwayAddress = "", strMedium = "", dispExamDate = "", iwayCentreCode = "", encryKey = "", iwayExamTime = "";

//   const examCodeQuery = `SELECT DISTINCT e.exam_code, e.exam_name FROM iib_exam e, iib_candidate_scores s WHERE s.exam_code=e.exam_code AND online='Y' AND membership_no= ? `;
//   db.query(examCodeQuery, [rollNum], (err, rowsExam) => {
//     if (err) {
//       console.error("Error querying the database:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     rowsExam.forEach((rowExam) => {
//       const examCode = rowExam.exam_code;
//       const examName = rowExam.exam_name;
//       const subjectCodeQuery ="SELECT DISTINCT e.subject_code, e.subject_name, e.qp_encry_key FROM iib_exam_subjects e, iib_candidate_scores s WHERE e.subject_code=s.subject_code AND online='Y' AND e.exam_code=? AND membership_no=? ";

//       db.query(subjectCodeQuery, [examCode, rollNum], (err, rowsSubject) => {
//         if (err) {
//           console.error("Error querying the database:", err);
//           res.status(500).json({ error: "Internal Server Error" });
//           return;
//         }

//         rowsSubject.forEach((rowSubject) => {
//           const subjectCode = rowSubject.subject_code;
//           const subjectName = rowSubject.subject_name;
//           const encryptKey = rowSubject.qp_encry_key;
//           return new Promise((resolve, reject) => {
//             const sqlQuestions ="SELECT question_paper_no FROM iib_candidate_test WHERE exam_code=? AND subject_code=? AND test_status='C' AND membership_no=?";
//             db.query(
//               sqlQuestions,
//               [examCode, subjectCode, rollNum],
//               (err, rowsSelQues) => {
//                 if (err) {
//                   console.error("Error querying the database:", err);
//                   res.status(500).json({ error: "Internal Server Error" });
//                   reject(err);
//                 } else {
//                   rowsSelQues.forEach((rowSelQues) => {
//                     const questionPaperNo = rowSelQues.question_paper_no;
//                     const sqlMember ="SELECT name, address1, address2, address3, address4, address5, address6, pin_code FROM iib_candidate WHERE membership_no=?";

//                     db.query(sqlMember, [rollNum], (err, rowsSqlMember) => {
//                       if (err) {
//                         console.error("Error querying the database:", err);
//                         res
//                           .status(500)
//                           .json({ error: "Internal Server Error" });
//                         return;
//                       }
//                       rowsSqlMember.forEach((rowSqlMember) => {
//                         const memberName = rowSqlMember.name;
//                         const c_addr1 = rowSqlMember.address1;
//                         const c_addr2 = rowSqlMember.address2;
//                         const c_addr3 = rowSqlMember.address3;
//                         const c_addr4 = rowSqlMember.address4;
//                         const c_addr5 = rowSqlMember.address5;
//                         const c_addr6 = rowSqlMember.address6;
//                         const c_pin = rowSqlMember.pin_code;

//                         let memberAddress = [c_addr1, c_addr2, c_addr3, c_addr4, c_addr5, c_addr6, c_pin]
//   .filter(addr => addr !== "").join(" ");

//                         const sqlIway =" SELECT centre_code, exam_date, exam_time FROM iib_candidate_iway WHERE  exam_code= ? AND subject_code= ? AND membership_no= ? ";
//                         db.query(sqlIway,[examCode, subjectCode, rollNum],(err, rowsSqlIway) => {
//                             if (err) {
//                               console.error("Error querying the database:",err);
//                               res.status(500).json({ error: "Internal Server Error" });
//                               return;
//                             }
//                             if (rowsSqlIway.length > 0) {
//                               rowsSqlIway.forEach((rowSqlIway) => {
//                                 const iwayExamDate = rowSqlIway.exam_date;
//                                 iwayCentreCode = rowSqlIway.centre_code;
//                                 iwayExamTime = rowSqlIway.exam_time;
//                                 let aDate;
//                                 if (iwayExamDate != "") {
//                                   aDate = utils.formatExamDate(iwayExamDate).split("-");
//                                 }
//                                 dispExamDate = aDate[2] + "/" + aDate[1] + "/" + aDate[0];

//                                 const sqlIwayAddress ="SELECT iway_address1, iway_address2, iway_city, iway_state, iway_pin_code FROM iib_iway_details WHERE centre_code= ?";

//                                 db.query(sqlIwayAddress,[iwayCentreCode],(err, rowsSqlIwayAddress) => {
//                                     if (err) {
//                                       console.error("Error querying the database:",err);
//                                       res.status(500).json({ error: "Internal Server Error",});
//                                       return;
//                                     }

//                                     rowsSqlIwayAddress[0].iway_address1 != "" ? (iwayAddress += rowsSqlIwayAddress[0].iway_address1) : (iwayAddress += "");
//                                     rowsSqlIwayAddress[0].iway_address2 != "" ? (iwayAddress +=" "+ rowsSqlIwayAddress[0].iway_address2) : (iwayAddress += "");rowsSqlIwayAddress[0].iway_city != "" ? (iwayAddress += " " + rowsSqlIwayAddress[0].iway_city) : (iwayAddress += "");
//                                     rowsSqlIwayAddress[0].iway_pin_code != "" ? (iwayAddress += " " + rowsSqlIwayAddress[0].iway_pin_code) : (iwayAddress += "");
//                                     rowsSqlIwayAddress[0].iway_state != "" ? (iwayAddress += " " + rowsSqlIwayAddress[0].iway_state) : (iwayAddress += "");
//                                   }
//                                 );
//                               });
//                             }
//                             //medium
//                             const sqlMedium =
//                               "SELECT e.medium_code as medium_code, institution_name  FROM iib_exam_candidate e, iib_candidate c WHERE c.membership_no= ? AND c.membership_no=e.membership_no AND exam_code= ? AND subject_code= ?";
//                             db.query(
//                               sqlMedium,
//                               [rollNum, examCode, subjectCode],
//                               (err, rowsSqlMedium) => {
//                                 if (err) {
//                                   console.error("Error querying the database:",err);
//                                   res.status(500).json({ error: "Internal Server Error" });
//                                   return;
//                                 }

//                                 if (rowsSqlMedium[0].medium_code == "E" || rowsSqlMedium[0].medium_code == "EN" || rowsSqlMedium[0].medium_code == "ENGLISH") {
//                                   strMedium = "ENGLISH";
//                                 } else if (rowsSqlMedium[0].medium_code == "H" ||rowsSqlMedium[0].medium_code == "HINDI") {
//                                   strMedium = "HINDI";
//                                 }
//                                 const institutionName = rowsSqlMedium[0].institution_name;
//                                 // console.log(strMedium);
//                                 const sqlMarks = "SELECT total_marks, pass_mark FROM iib_exam_subjects WHERE exam_code = ? AND subject_code= ? AND online='Y' ";

//                                 db.query(sqlMarks,[examCode, subjectCode],(err, rowsSqlMarks) => {
//                                     if (err) {
//                                       console.error("Error querying the database:",err);
//                                       res.status(500).json({error: "Internal Server Error"});
//                                       return;
//                                     }
//                                     rowsSqlMarks.forEach((rowSqlMarks) => {
//                                       const totalMarks = rowSqlMarks.total_marks;
//                                       const passMark = rowSqlMarks.pass_mark;

//                                       const sqlScores ="SELECT score FROM iib_candidate_scores WHERE membership_no= ? AND subject_code= ? ";
//                                       db.query(sqlScores,[rollNum, subjectCode],(err, rowsSqlScores) => {
//                                           if (err) {
//                                             console.error("Error querying the database:",err);
//                                             res.status(500).json({error: "Internal Server Error",});
//                                             return;
//                                           }
//                                           const scores = rowsSqlScores[0].score;
//                                           const sqlQnsIds ="SELECT question_id FROM iib_question_paper_details WHERE question_paper_no= ?  ORDER BY display_order";

//                                           db.query(sqlQnsIds,[questionPaperNo],(err, rowsSqlQnsIds) => {
//                                               if (err) {
//                                                 console.error("Error querying the database:",err);
//                                                 res.status(500).json({error:"Internal Server Error",});
//                                                 return;
//                                               }
//                                               let quesIdsArr = [];
//                                               const qnsSum = rowsSqlQnsIds.length;
//                                               rowsSqlQnsIds.forEach((rowSqlQnsIds) => {
//                                                   quesIdsArr.push(rowSqlQnsIds.question_id);
//                                                 });
//                                               const sqlQns ="select question_id, CONVERT(AES_DECRYPT(answer, ?) USING 'utf8') as answer from iib_response where id in ( select  max(id) from iib_response where question_paper_no = ? group by question_id) ORDER BY display_order";

//                                               db.query(
//                                                 sqlQns,
//                                                 [encryptKey, questionPaperNo],
//                                                 (err, rowsSqlQns) => {
//                                                   let unAttQns = 0 , attQns = 0;
//                                                   let aQuestions = {} , ansQuesAnswer ={};
//                                                   let ansQuestionId = [];
//                                                   rowsSqlQns.forEach(
//                                                     (rowSqlQns) => {ansQuestionId.push(rowSqlQns.question_id);
//                                                       ansQuesAnswer[rowSqlQns.question_id] = rowSqlQns.answer;
//                                                     }
//                                                   );
//                                                   let arrDiffQID =quesIdsArr.filter((item) =>!ansQuestionId.includes(item));

//                                                   arrDiffQID.forEach((qUnAnsVal) => {
//                                                       if (qUnAnsVal !== "") {
//                                                         ansQuesAnswer[qUnAnsVal] = "";
//                                                       }
//                                                     }
//                                                   );
//                                                   // Second loop - categorizing questions as attempted or unattempted
//                                                   quesIdsArr.forEach(
//                                                     (ansKey) => {
//                                                       if (ansQuesAnswer[ansKey] === "") {
//                                                         unAttQns += 1; // Increment unattempted questions count
//                                                         aQuestions[ansKey] = ansQuesAnswer[ansKey]; // Store unattempted question
//                                                       } else {
//                                                         attQns += 1; // Increment attempted questions count
//                                                         aQuestions[ansKey] = ansQuesAnswer[ansKey]; // Store attempted question
//                                                       }
//                                                     }
//                                                   );
//                                                   // console.log(aQuestions);

//                                                   let tableName = "";
//                                                   if (strMedium === "HINDI") {
//                                                     tableName = `iib_section_questions_hindi`;
//                                                   } else if (
//                                                     strMedium === "ENGLISH"
//                                                   ) {
//                                                     tableName = `iib_sq_details`;
//                                                   }
//                                                   let questionTextArray = [], correctAnswerArray = [], marksArray = [], markedAnswerArray = [], cAns = [], mAns = [];

//                                                   let encryKey = "";
//                                                   const getEncryKey = (exam_code,subject_code) => {
//                                                     return new Promise((resolve, reject) => {
//                                                         const encryKeySql = `select qp_encry_key from iib_exam_subjects where exam_code = ? and subject_code = ?`;
//                                                         db.query(encryKeySql,[exam_code,subject_code],
//                                                           (err,rowEncryKeySql) => {
//                                                             if (err) {
//                                                               console.error("Error querying the database:",err);
//                                                               return reject("Internal Server Error");
//                                                             }
//                                                             return resolve(rowEncryKeySql[0].qp_encry_key);
//                                                           }
//                                                         );
//                                                       }
//                                                     );
//                                                   };
//                                                   const getQuestionData = (questionID,markedAnswer,encryKey) => {
//                                                     return new Promise(
//                                                       (resolve, reject) => {
//                                                         const aQuestionsSql = `SELECT AES_DECRYPT(question_text, ?) as question_text, correct_answer, marks FROM ${tableName} WHERE question_id = ?`;
//                                                         db.query(aQuestionsSql,[encryKey,questionID],(err,rowsaQuestions) => {
//                                                             if (err) {
//                                                               console.error("Error querying the database:",err);
//                                                               return reject("Internal Server Error");
//                                                             }
//                                                             // Populate arrays with question data
//                                                             questionTextArray.push(decode(rowsaQuestions[0].question_text? rowsaQuestions[0].question_text.toString("utf8") : null));
//                                                             correctAnswerArray.push(decode(rowsaQuestions[0].correct_answer.toString("utf8")));
//                                                             marksArray.push(rowsaQuestions[0].marks);
//                                                             markedAnswerArray.push(markedAnswer);
//                                                             const correctAnswer = rowsaQuestions[0].correct_answer;

//                                                             // Handle correct answer
//                                                             if (correctAnswer !=="") {
//                                                               const sqlCorrectAnswer = `SELECT AES_DECRYPT(option_${correctAnswer},?) as correctAns FROM ${tableName} WHERE question_id= ?`;
//                                                               db.query(sqlCorrectAnswer,[encryKey,questionID],(err,rowsCorrectAnswer) => {
//                                                                   if (err)
//                                                                     return reject(err);
//                                                                   cAns.push(decode(rowsCorrectAnswer[0].correctAns ? rowsCorrectAnswer[0].correctAns.toString("utf-8") : null));
//                                                                   resolve(); // Resolve when the correct answer query is done
//                                                                 });
//                                                             } else {
//                                                               cAns.push("");
//                                                               resolve(); // Resolve immediately if there's no correct answer
//                                                             }

//                                                             // Handle marked answer
//                                                             if (markedAnswer && markedAnswer !== "NULL")
//                                                               {
//                                                               const sqlMarkedAnswer = `SELECT AES_DECRYPT(option_${markedAnswer},?) as markedAns FROM ${tableName} WHERE question_id= ?`;
//                                                               db.query(sqlMarkedAnswer, [encryKey, questionID], (err, rowsMarkedAnswer) => {
//                                                                 if (err) return reject(err);

//                                                                 mAns.push(decode(rowsMarkedAnswer[0]?.markedAns?.toString("utf8") || null));
//                                                                 resolve(); // Resolve when the marked answer query is done
//                                                               });

//                                                             } else {
//                                                               mAns.push("");
//                                                               resolve(); // Resolve immediately if there's no marked answer
//                                                             }
//                                                           }
//                                                         );
//                                                       }
//                                                     );
//                                                   };

//                                                   // Async function to gather data from aQuestions
//                                                   const gatherQuestionsData =
//                                                     async () => {
//                                                       encryKey = await getEncryKey(examCode, subjectCode);
//                                                       for (const [questionID, markedAnswer] of Object.entries(aQuestions)) {
//                                                         await getQuestionData(questionID, markedAnswer, encryKey);
//                                                       }
//                                                       // All data is collected; you can access your arrays here
//                                                       const aQuestionsLength =
//                                                         aQuestions.length;
//                                                       return res.json({questionTextArray,correctAnswerArray,markedAnswerArray,marksArray,cAns,mAns,memberName,memberAddress,iwayExamTime,strMedium,iwayAddress,examCode,examName,subjectCode,subjectName,institutionName,totalMarks,passMark,iwayCentreCode,dispExamDate,scores,qnsSum,quesIdsArr,ansQuestionId,ansQuesAnswer,arrDiffQID,unAttQns,attQns,aQuestionsLength,
//                                                       });
//                                                     };

//                                                   // Call the function to gather data
//                                                   gatherQuestionsData().catch(
//                                                     (error) => {
//                                                       console.error(
//                                                         "Error gathering question data:",
//                                                         error
//                                                       );
//                                                     }
//                                                   );
//                                                 }
//                                               );
//                                             }
//                                           );
//                                         }
//                                       );
//                                     });
//                                   }
//                                 );
//                               }
//                             );
//                           }
//                         );
//                       });
//                     });
//                   });
//                   resolve();
//                 }
//               }
//             );
//           });
//         });
//       });
//     });
//   });
// });

app.get("/candidate-report/:rollNum", async (req, res) => {
  try {
    const { rollNum } = req.params;
    let iwayAddress = "",
      strMedium = "",
      dispExamDate = "",
      iwayCentreCode = "",
      institutionName = "",
      questionTextArray = [];

    // Fetch exam details
    const examCodeQuery = `
      SELECT DISTINCT e.exam_code, e.exam_name
      FROM iib_exam e
      JOIN iib_candidate_scores s ON s.exam_code = e.exam_code
      WHERE online = 'Y' AND s.membership_no = ?`;
    const exams = await queryDB(examCodeQuery, [rollNum]);

    if (!exams.length) return res.status(404).json({ error: "No exams found" });

    const results = [];

    for (const { exam_code: examCode, exam_name: examName } of exams) {
      const subjectCodeQuery = `
        SELECT DISTINCT e.subject_code, e.subject_name, e.qp_encry_key
        FROM iib_exam_subjects e
        JOIN iib_candidate_scores s ON e.subject_code = s.subject_code
        WHERE e.exam_code = ? AND s.membership_no = ? AND online = 'Y'`;
      const subjects = await queryDB(subjectCodeQuery, [examCode, rollNum]);

      for (const {
        subject_code: subjectCode,
        subject_name: subjectName,
        qp_encry_key: encryptKey,
      } of subjects) {
        // Fetch question paper details
        const questionQuery = `
          SELECT question_paper_no
          FROM iib_candidate_test
          WHERE exam_code = ? AND subject_code = ? AND test_status = 'C' AND membership_no = ?`;
        const questions = await queryDB(questionQuery, [
          examCode,
          subjectCode,
          rollNum,
        ]);

        if (!questions.length) continue;
        const questionPaperNo = questions[0].question_paper_no;

        // Fetch member details
        const memberQuery = `
          SELECT name, address1, address2, address3, address4, address5, address6, pin_code
          FROM iib_candidate WHERE membership_no = ?`;
        const members = await queryDB(memberQuery, [rollNum]);
        if (!members.length) continue;
        const member = members[0];

        // Construct member address
        const memberAddress = [
          member.address1,
          member.address2,
          member.address3,
          member.address4,
          member.address5,
          member.address6,
          member.pin_code,
        ]
          .filter((addr) => addr)
          .join(" ");

        // Fetch iway details
        const iwayQuery = `
          SELECT centre_code, exam_date, exam_time
          FROM iib_candidate_iway
          WHERE exam_code = ? AND subject_code = ? AND membership_no = ?`;
        const iwayDetails = await queryDB(iwayQuery, [
          examCode,
          subjectCode,
          rollNum,
        ]);
        if (iwayDetails.length) {
          const iway = iwayDetails[0];
          iwayCentreCode = iway.centre_code;
          iwayExamTime = iway.exam_time;
          dispExamDate = iway.exam_date
            ? utils.formatExamDateDMY(iway.exam_date)
            : "";
        }

        // Fetch iway address
        if (iwayCentreCode) {
          const iwayAddressQuery = `
            SELECT iway_address1, iway_address2, iway_city, iway_state, iway_pin_code
            FROM iib_iway_details WHERE centre_code = ?`;
          const iwayAddresses = await queryDB(iwayAddressQuery, [
            iwayCentreCode,
          ]);
          if (iwayAddresses.length) {
            const addr = iwayAddresses[0];
            iwayAddress = [
              addr.iway_address1,
              addr.iway_address2,
              addr.iway_city,
              addr.iway_pin_code,
              addr.iway_state,
            ]
              .filter((a) => a)
              .join(" ");
          }
        }

        // Fetch exam medium
        const mediumQuery = `
          SELECT e.medium_code, institution_name 
          FROM iib_exam_candidate e 
          JOIN iib_candidate c ON c.membership_no = e.membership_no 
          WHERE c.membership_no = ? AND e.exam_code = ? AND e.subject_code = ?`;
        const mediums = await queryDB(mediumQuery, [
          rollNum,
          examCode,
          subjectCode,
        ]);
        if (mediums.length) {
          const {
            medium_code: mediumCode,
            institution_name: institutionNameFromDB,
          } = mediums[0];
          strMedium = ["EN", "E", "ENGLISH"].includes(mediumCode)
            ? "ENGLISH"
            : ["HI", "H", "HINDI"].includes(mediumCode)
              ? "HINDI"
              : "ENGLISH";
        }

        // Fetch question answers
        const sqlQns = `SELECT question_id, CONVERT(AES_DECRYPT(answer, UNHEX(SHA2(?, 256))) USING 'utf8') AS answer FROM iib_response WHERE id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id) ORDER BY display_order`;

        const rowsSqlQns = await queryDB(sqlQns, [encryptKey, questionPaperNo]);

        let unAttQns = 0,
          attQns = 0;
        let ansQuesAnswer = {},
          markedAnswerArray = [];

        rowsSqlQns.forEach((row) => {
          ansQuesAnswer[row.question_id] = row.answer;
          markedAnswerArray.push(row.answer);
        });

        // Fetch question IDs
        const rowsSqlQnsIds = await queryDB(
          `SELECT question_id FROM iib_question_paper_details WHERE question_paper_no = ? ORDER BY display_order`,
          [questionPaperNo]
        );

        console.log(markedAnswerArray);

        questionTextArray = rowsSqlQnsIds.map((row) => ({
          question_id: row.question_id,
          answer: ansQuesAnswer[row.question_id] || "",
        }));

        // Count attempted and unattempted questions
        questionTextArray.forEach((q) => {
          if (q.answer) attQns++;
          else unAttQns++;
        });

        const qnsSum = rowsSqlQnsIds.length;

        // Fetch marks
        const marksQuery = `SELECT total_marks, pass_mark FROM iib_exam_subjects WHERE exam_code = ? AND subject_code = ? AND online = 'Y'`;
        const marks = await queryDB(marksQuery, [examCode, subjectCode]);
        if (!marks.length) continue;
        const { total_marks: totalMarks, pass_mark: passMark } = marks[0];

        // Fetch scores
        const scoresQuery = `
          SELECT score
          FROM iib_candidate_scores
          WHERE membership_no = ? AND subject_code = ?`;
        const scores = await queryDB(scoresQuery, [rollNum, subjectCode]);
        const score = scores.length ? scores[0].score : 0;

        results.push({
          examCode,
          examName,
          subjectCode,
          subjectName,
          encryptKey,
          memberName: member.name,
          memberAddress,
          iwayExamTime,
          strMedium,
          iwayAddress,
          totalMarks,
          passMark,
          iwayCentreCode,
          dispExamDate,
          score,
          institutionName,
          qnsSum,
          unAttQns,
          attQns,
          questionTextArray,
          aQuestionsLength: qnsSum,
          markedAnswerArray,
        });
      }
    }

    return res.json(results);
  } catch (error) {
    console.error("Error fetching candidate report:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/candidate-report/:rollNum", async (req, res) => {
//   const { rollNum } = req.params;
//   let iwayAddress = "", strMedium = "", dispExamDate = "", iwayCentreCode = "", encryKey = "", iwayExamTime = "";

//   try {
//     // Query for exam details
//     const rowsExam = await queryDB(
//       `SELECT DISTINCT e.exam_code, e.exam_name
//        FROM iib_exam e
//        JOIN iib_candidate_scores s ON s.exam_code = e.exam_code
//        WHERE online='Y' AND s.membership_no = ?`,
//       [rollNum]
//     );

//     for (const rowExam of rowsExam) {
//       const { exam_code: examCode, exam_name: examName } = rowExam;

//       // Query for subject details
//       const rowsSubject = await queryDB(
//         `SELECT DISTINCT e.subject_code, e.subject_name, e.qp_encry_key
//          FROM iib_exam_subjects e
//          JOIN iib_candidate_scores s ON s.subject_code = e.subject_code
//          WHERE e.exam_code = ? AND s.membership_no = ?`,
//         [examCode, rollNum]
//       );

//       for (const rowSubject of rowsSubject) {
//         const { subject_code: subjectCode, subject_name: subjectName, qp_encry_key: encryptKey } = rowSubject;

//         // Get question paper details
//         const rowsSelQues = await queryDB(
//           `SELECT question_paper_no
//            FROM iib_candidate_test
//            WHERE exam_code = ? AND subject_code = ? AND test_status = 'C' AND membership_no = ?`,
//           [examCode, subjectCode, rollNum]
//         );

//         for (const rowSelQues of rowsSelQues) {
//           const { question_paper_no: questionPaperNo } = rowSelQues;

//           // Fetch member details
//           const rowsSqlMember = await queryDB(
//             `SELECT name, address1, address2, address3, address4, address5, address6, pin_code
//              FROM iib_candidate
//              WHERE membership_no = ?`,
//             [rollNum]
//           );

//           const rowSqlMember = rowsSqlMember[0];
//           const memberName = rowSqlMember.name;
//           const memberAddress = [rowSqlMember.address1, rowSqlMember.address2, rowSqlMember.address3, rowSqlMember.address4, rowSqlMember.address5, rowSqlMember.address6, rowSqlMember.pin_code]
//             .filter(addr => addr).join(" ");

//           // Fetch exam center details
//           const rowsSqlIway = await queryDB(
//             `SELECT centre_code, exam_date, exam_time
//              FROM iib_candidate_iway
//              WHERE exam_code = ? AND subject_code = ? AND membership_no = ?`,
//             [examCode, subjectCode, rollNum]
//           );

//           if (rowsSqlIway.length > 0) {
//             const { exam_date: iwayExamDate, centre_code: iwayCentreCode, exam_time: iwayExamTime } = rowsSqlIway[0];
//             if (iwayExamDate) {
//               const formattedDate = utils.formatExamDate(iwayExamDate).split("-");
//               dispExamDate = `${formattedDate[2]}/${formattedDate[1]}/${formattedDate[0]}`;
//             }

//             // Fetch iway address
//             const rowsSqlIwayAddress = await queryDB(
//               `SELECT iway_address1, iway_address2, iway_city, iway_state, iway_pin_code
//                FROM iib_iway_details
//                WHERE centre_code = ?`,
//               [iwayCentreCode]
//             );

//             const iwayAddressRow = rowsSqlIwayAddress[0];
//             iwayAddress = [iwayAddressRow.iway_address1, iwayAddressRow.iway_address2, iwayAddressRow.iway_city, iwayAddressRow.iway_pin_code, iwayAddressRow.iway_state]
//               .filter(addr => addr).join(" ");
//           }

//           // Fetch medium and institution details
//           const rowsSqlMedium = await queryDB(
//             `SELECT e.medium_code, institution_name
//              FROM iib_exam_candidate e
//              JOIN iib_candidate c ON c.membership_no = e.membership_no
//              WHERE e.exam_code = ? AND e.subject_code = ? AND c.membership_no = ?`,
//             [examCode, subjectCode, rollNum]
//           );

//           strMedium = rowsSqlMedium[0].medium_code === "E" || rowsSqlMedium[0].medium_code === "EN" || rowsSqlMedium[0].medium_code === "ENGLISH"
//             ? "ENGLISH"
//             : "HINDI";

//           const institutionName = rowsSqlMedium[0].institution_name;

//           // Fetch total marks and pass mark
//           const rowsSqlMarks = await queryDB(
//             `SELECT total_marks, pass_mark
//              FROM iib_exam_subjects
//              WHERE exam_code = ? AND subject_code = ? AND online = 'Y'`,
//             [examCode, subjectCode]
//           );

//           const { total_marks: totalMarks, pass_mark: passMark } = rowsSqlMarks[0];

//           // Fetch score details
//           const rowsSqlScores = await queryDB(
//             `SELECT score
//              FROM iib_candidate_scores
//              WHERE membership_no = ? AND subject_code = ?`,
//             [rollNum, subjectCode]
//           );

//           const scores = rowsSqlScores[0].score;

//           // Fetch question IDs
//           const rowsSqlQnsIds = await queryDB(
//             `SELECT question_id
//              FROM iib_question_paper_details
//              WHERE question_paper_no = ?
//              ORDER BY display_order`,
//             [questionPaperNo]
//           );

//           const quesIdsArr = rowsSqlQnsIds.map(row => row.question_id);
//           const qnsSum = quesIdsArr.length;

//           // Fetch answers and correct answers
//           const rowsSqlQns = await queryDB(
//             `SELECT question_id,
//                     CONVERT(AES_DECRYPT(answer, ?) USING 'utf8') as answer
//              FROM iib_response
//              WHERE id IN (SELECT max(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
//              ORDER BY display_order`,
//             [encryptKey, questionPaperNo]
//           );

//           const ansQuesAnswer = {};
//           const ansQuestionId = [];
//           let unAttQns = 0, attQns = 0;

//           rowsSqlQns.forEach(row => {
//             ansQuestionId.push(row.question_id);
//             ansQuesAnswer[row.question_id] = row.answer;
//           });

//           // Handle unattempted questions
//           quesIdsArr.forEach(qId => {
//             if (!ansQuesAnswer[qId]) {
//               ansQuesAnswer[qId] = "";
//               unAttQns++;
//             } else {
//               attQns++;
//             }
//           });

//           // Final response
//           return res.json({
//             questionTextArray: [],
//             correctAnswerArray: [],
//             markedAnswerArray: [],
//             marksArray: [],
//             cAns: [],
//             mAns: [],
//             memberName,
//             memberAddress,
//             iwayExamTime,
//             strMedium,
//             iwayAddress,
//             examCode,
//             examName,
//             subjectCode,
//             subjectName,
//             institutionName,
//             totalMarks,
//             passMark,
//             iwayCentreCode,
//             dispExamDate,
//             scores,
//             qnsSum,
//             quesIdsArr,
//             ansQuestionId,
//             ansQuesAnswer,
//             unAttQns,
//             attQns,
//             aQuestionsLength: quesIdsArr.length
//           });
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Error querying the database:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Helper function to run queries as promises
const queryDB = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

app.get("/bulk-time-extend/", async (req, res) => {
  const { selectedExam, selectedSubject, includeCompleted, time } = req.query;
  let rowsAffectedTotally = 0;
  let timeExtensionUpdate = time * 60;
  let test_ids = [],
    membership_nos = [];
  const getTestAndMemNos = async (selectedExam, selectedSubject) => {
    const query =
      "select max(test_id) as test_id,membership_no from iib_candidate_test where exam_code=? and subject_code = ? group by membership_no";
    return new Promise((resolve, reject) => {
      db.query(query, [selectedExam, selectedSubject], (err, results) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        results.forEach((result) => {
          test_ids.push(result.test_id);
          membership_nos.push(result.membership_no);
        });
        return resolve([test_ids, membership_nos]);
      });
    });
  };

  const updatingExtendTime = async (
    test_ids,
    membership_nos,
    includeCompleted,
    time
  ) => {
    return new Promise((resolve, reject) => {
      if (test_ids.length !== membership_nos.length) {
        return reject("some problem with test_ids and membership_nos");
      }
      test_ids.forEach((test_id, index) => {
        if (includeCompleted === "true") {
          updateTestWithCompleted(test_id, timeExtensionUpdate)
            .then((affectedRows_1) =>
              deleteCandidateScores(
                membership_nos[index],
                selectedSubject
              ).then((affectedRows_2) =>
                resolve(affectedRows_1 + affectedRows_2)
              )
            )
            .catch((error) => reject(error));
        } else {
          const query =
            "select test_status from iib_candidate_test where test_id = ? ";
          db.query(query, [test_id], (err, results) => {
            if (err) {
              console.error(err);
              return reject(err);
            }
            results.forEach((result) => {
              if (result.test_status == "IC") {
                // console.log(test_id + result.test_status);
                updateTestWithoutCompleted(test_id, timeExtensionUpdate)
                  .then((affectedRows) => resolve(affectedRows))
                  .catch((error) => reject(error));
              }
            });
          });
        }
      });
    });
  };
  const updateTestWithoutCompleted = (test_id, timeExtensionUpdate) => {
    return new Promise((resolve, reject) => {
      const updateQuery =
        "UPDATE iib_candidate_test SET time_extended = time_extended + ? WHERE test_id = ?";
      const formattedupdateQuery = db.format(updateQuery, [
        timeExtensionUpdate,
        test_id,
      ]);
      // Insert update query into xml_feed
      insertIntoXmlFeed(formattedupdateQuery, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      db.query(updateQuery, [timeExtensionUpdate, test_id], (err, result) => {
        if (err) return reject(err);
        return resolve(result.affectedRows);
      });
    });
  };

  const updateTestWithCompleted = (test_id, timeExtensionUpdate) => {
    return new Promise((resolve, reject) => {
      const updateQuery =
        "UPDATE iib_candidate_test SET time_extended = time_extended + ?, test_status = 'IC' WHERE test_id = ?";
      const formattedupdateQuery = db.format(updateQuery, [
        timeExtensionUpdate,
        test_id,
      ]);
      // Insert update query into xml_feed
      insertIntoXmlFeed(formattedupdateQuery, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      db.query(updateQuery, [timeExtensionUpdate, test_id], (err, result) => {
        if (err) return reject(err);
        console.log(result.affectedRows + "updateTestwith");
        return resolve(result.affectedRows);
      });
    });
  };

  const deleteCandidateScores = (membership_no, selectedSubject) => {
    return new Promise((resolve, reject) => {
      const deleteQuery =
        "DELETE FROM iib_candidate_scores WHERE membership_no = ? AND subject_code = ?";
      const formatteddeleteQuery = db.format(deleteQuery, [
        membership_no,
        selectedSubject,
      ]);
      // Insert update query into xml_feed
      insertIntoXmlFeed(formatteddeleteQuery, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      db.query(deleteQuery, [membership_no, selectedSubject], (err, result) => {
        if (err) return reject(err);
        return resolve(result.affectedRows);
      });
    });
  };
  const gettingAndUpdatingExtendTime = async () => {
    const [test_ids, membership_nos] = await getTestAndMemNos(
      selectedExam,
      selectedSubject
    );
    try {
      const rowsAffected = await updatingExtendTime(
        test_ids,
        membership_nos,
        includeCompleted,
        time
      );
      return res.json({ message: "success" });
    } catch (err) {
      return res.json({ message: err });
    }
  };
  gettingAndUpdatingExtendTime().catch((error) => {
    console.error("Error extending bulk time ", error);
  });
});
app.get("/grace-time-extend/", async (req, res) => {
  const { selectedExam, selectedSubjects, time } = req.query;
  const updateGraceTime = async (exam, subjects, timeExtension) => {
    const query = `UPDATE iib_exam_subjects SET grace_post = grace_post + ? WHERE subject_code IN (?)`;

    const formattedquery = db.format(query, [timeExtension, subjects]);
    // Insert update query into xml_feed
    insertIntoXmlFeed(formattedquery, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting feed table:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });
    return new Promise((resolve, reject) => {
      db.query(query, [timeExtension, subjects], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        return resolve(res.affectedRows); // Correct property for affected rows
      });
    });
  };
  const funcUpdateGraceTime = async () => {
    const timeExtension = time * 60;
    const rowsAffected = await updateGraceTime(
      selectedExam,
      selectedSubjects,
      timeExtension
    );
    return res.json({
      rowsAffected,
    });
  };
  funcUpdateGraceTime().catch((error) => {
    console.error("Error updating Grace Time ", error);
  });
});
app.get("/get-medium/:rollNo", async (req, res) => {
  const { rollNo } = req.params;
  // res.json(rollNo);
  try {
    let examCode, subjectCode, langName, allLangCode;
    let displayMedium;
    const examSubjectCode = (rollNo) => {
      const query =
        "select exam_code,subject_code from iib_exam_candidate where membership_no = ?";
      try {
        return new Promise((resolve, reject) => {
          db.query(query, [rollNo], (err, res) => {
            if (err) {
              console.error(err);
              reject(err);
            }
            if (res.length > 0) {
              examCode = res[0].exam_code;
              subjectCode = res[0].subject_code;
              return resolve();
            }
          });
        });
      } catch (err) {
        console.error("Error fetching exam and subject codes:", err);
        throw err; // Re-throw the error if needed
      }
    };

    const getLanguageName = async (langCode) => {
      const query = "select lang_name from iib_languages where lang_code = ?";
      return new Promise((resolve, reject) => {
        db.query(query, [langCode], (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          return resolve(res[0].lang_name);
        });
      });
    };

    const mediumCode = (rollNo) => {
      const query =
        "select medium_code from iib_exam_candidate where membership_no = ?";
      return new Promise((resolve, reject) => {
        db.query(query, [rollNo], async (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          await examSubjectCode(rollNo);
          return resolve(res[0].medium_code);
        });
      });
    };

    const getLangCode = async (examCode, subjectCode) => {
      const query =
        "select languages from iib_exam_subjects where exam_code = ? and subject_code = ?";
      return new Promise((resolve, reject) => {
        db.query(query, [examCode, subjectCode], (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          langArray = res[0].languages.split(",");
          return resolve(langArray);
        });
      });
    };

    const getMedium = async () => {
      candidateDisplayMedium = await mediumCode(rollNo);
      if (candidateDisplayMedium == "E" || candidateDisplayMedium == "EN") {
        candidateDisplayMedium = await getLanguageName("EN");
      } else if (
        candidateDisplayMedium == "H" ||
        candidateDisplayMedium == "HI"
      ) {
        candidateDisplayMedium = await getLanguageName("HI");
      } else {
        candidateDisplayMedium = await getLanguageName(candidateDisplayMedium);
      }

      console.log(candidateDisplayMedium);
      // await examSubjectCode(rollNo);

      allLangCode = await getLangCode(examCode, subjectCode);

      // console.log(allLangCode)
      const subjectLangNamesArray = await Promise.all(
        allLangCode.map(async (subject) => {
          return await getLanguageName(subject);
        })
      ).then((subjectLangNamesArray) =>
        subjectLangNamesArray.filter(
          (langName) => !candidateDisplayMedium.includes(langName)
        )
      );
      // console.log(subjectLangNamesArray);
      // displayMedium =

      return res.json({
        candidateDisplayMedium,
        subjectLangNamesArray,
      });
    };
    getMedium().catch((error) => {
      console.error("Error getting Medium Code", error);
    });
  } catch (err) {
    console.error("Error getting medium code for the candidate - ", rollNo);
  }
  // res.json(displayMedium)
});
app.get("/change-medium/", async (req, res) => {
  const { rollNo, changedMedium } = req.query;
  const updatingMedium = async () => {
    const query =
      "update iib_exam_candidate set medium_code = (select lang_code from iib_languages where lang_name= ?) where membership_no = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [changedMedium, rollNo], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (res.affectedRows > 0) {
          return resolve("success");
        } else {
          return resolve("failure");
        }
      });
    });
  };

  const getUpdate = async () => {
    const result = await updatingMedium(rollNo, changedMedium);
    return res.json(result);
  };
  getUpdate().catch((error) => {
    console.error("Error updating Medium Code", error);
  });
});
app.get("/get-center-server-no", (req, res) => {
  const getCenterAndServer = async () => {
    const result = await utils.centreAndServerNo();
    return res.json(result);
  };
  getCenterAndServer().catch((error) => {
    console.error("Error getting center Code and server no", error);
  });
});
// app.get("/download-file/:status", async (req, res) => {
//   const status = req.params.status;
//   const { centreCode, serverNo } = utils.centreAndServerNo();
//   // const batch = req.params.batch;
//   // console.log("Gop:", status);

//   // let file = status === 'Base' ? process.env.CLIENT : status;
//   // const file =
//     // status === "Base"
//     //   ? process.env.CLIENT
//     //   : status === "Act"
//     //     ? batch == "11:00:00"
//     //       ? "bac7a-110000"
//     //       : "78192-150000"
//     //     : status;
//   const file = status === "Base" ? process.env.CLIENT : status === "Act" ? batch == "10:00:00" ? "b4681-100000" : "3b62f-150000" : status;
//   const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;
//   // const url = `https://202.191.132.85/livedata/${file}.zip`;

// //   const { center_code, serverno } = await getCenterCodes(req);

// //   const data_eal = {
// //     process :'1',
// //     macId: serialnumber,
// //     database: process.env.DB_NAME,
// //     action : '',
// //     serverNumber : serverno
// //   }

// //   const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/dataDownload`,(data_eal),
// //   // {headers:
// //   //   { Authorization: `Bearer ${apiToken}`,"Content-Type": "application/json",},
// //   //       withCredentials: true,}
// //       );

// //   const res_eal = response.data.data.split('^$^');
// //   const responseCurl = res_eal[0];
// // const autoID = res_eal[1];
// // const pre = res_eal[2];
// // const pos = res_eal[3];
// // const dPath = res_eal[4];
// // const servernoVal = res_eal[5];
// // const ccode = res_eal[6];

// // console.log(res_eal);

// //   return;

//   console.log("URL:", url);

//   // Define directories
//   const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
//   const extractDir = path.join("C:", "pro", "itest", "activate");
//   const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
//   const signDir = path.join("C:", "pro", "itest", "activate", "sign");
//   const zipFilePath = path.join(tempDir, `${file}.zip`);

//   // Create the temp directory if it doesn't exist
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//   }
//   // let query = "";
//   try {
//     // Step 1: Download the file
//     const response = await axios.get(url, { responseType: "stream" });
//     const writer = fs.createWriteStream(zipFilePath);
//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });

//     console.log("File downloaded successfully");

//     // Step 2: Unzip the file
//     const zip = new AdmZip(zipFilePath);

//     if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
//       zip.extractAllTo(extractDir, true);
//       console.log(`File extracted successfully to ${extractDir}`);
//     } else {
//       if (status.endsWith("_photo")) {
//         let query = "";
//         const count_photo_download = utils.countDownloadByAction("photo");

//         try {
//           zip.extractAllTo(photoDir, true);
//           if (count_photo_download >= 1 && count_photo_download != "") {
//             query = `UPDATE qp_download SET download_status = 'D', download_time = ? WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'D'`;
//           } else if (count_photo_download === 0) {
//             query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'D', ?)`;
//           }

//           console.log(`Photo File extracted successfully to ${photoDir}`);
//         } catch (err) {
//           if (count_photo_download >= 1 && count_photo_download != "") {
//             query = `UPDATE qp_download SET download_status = 'E2', download_time = ? WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'E2'`;
//           } else if (count_photo_download === 0) {
//             query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'E2', ?)`;
//           }
//           console.error("Error during extraction:", err);
//         }
//         // Execute the query if it has been set
//         if (query && count_photo_download >= 1 && count_photo_download != "") {
//           utils.executeImageDownloadQueryUpdate(query, formattedTime, centreCode, serverNo);
//           const formattedquery = db.format(query, [formattedTime,centreCode, serverNo]);
//           // Insert update query into xml_feed
//           new Promise((resolve, reject) => {
//             insertIntoXmlFeed(formattedquery, (err) => {
//               if (err) {
//                 return reject(
//                   new Error("Error inserting update query into xml_feed")
//                 );
//               }
//               resolve();
//             });
//           });
//           // return res.json({"message":"Photo downloaded Successfully"})
//         }else if (query && count_photo_download === 0) {
//           utils.executeImageDownloadQueryInsert(query, centreCode, serverNo, formattedTime);
//           const formattedquery = db.format(query, [centreCode, serverNo, formattedTime]);
//         // Insert update query into xml_feed
//         new Promise((resolve, reject) => {
//           insertIntoXmlFeed(formattedquery, (err) => {
//             if (err) {
//               return reject(
//                 new Error("Error inserting update query into xml_feed")
//               );
//             }
//             resolve();
//           });
//         });
//         }
//       }

//       if (status.endsWith("_sign")) {
//         let query = "";
//         const count_sign_download = utils.countDownloadByAction("sign");
//         try {
//           zip.extractAllTo(signDir, true);
//           if (count_sign_download >= 1 && count_sign_download != "") {
//             query = `UPDATE qp_download set download_status ='D',download_time=? where centre_code=? and serverno= ? and download_sec='Sign' and download_status != 'D' `;
//           } else if (count_sign_download == 0) {
//             query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','D',?)`;
//           }
//           console.log(`Sign File extracted successfully to ${signDir}`);
//         } catch (err) {
//           if (count_sign_download >= 1 && count_sign_download != "") {
//             query = `UPDATE qp_download set download_status='E2',download_time=? where centre_code= ? and serverno= ? and download_sec='Sign' and download_status != 'E2' `;
//           } else if (count_sign_download == 0) {
//             query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','E2',?)`;
//           }
//           console.log(err);
//         }
//         // if (query) {
//         //   utils.executeImageDownloadQuery(query, centreCode, serverNo);
//         //   // return res.json({"message":"Sign downloaded Successfully"})
//         // }
//         // Execute the query if it has been set
//         if (query && count_sign_download >= 1 && count_sign_download != "") {
//           utils.executeImageDownloadQueryUpdate(query, formattedTime, centreCode, serverNo);

//           const formattedquery = db.format(query, [formattedTime,centreCode, serverNo]);
//           // Insert update query into xml_feed
//           new Promise((resolve, reject) => {
//             insertIntoXmlFeed(formattedquery, (err) => {
//               if (err) {
//                 return reject(
//                   new Error("Error inserting update query into xml_feed")
//                 );
//               }
//               resolve();
//             });
//           });
//           // return res.json({"message":"Photo downloaded Successfully"})
//         }else if (query && count_sign_download === 0) {
//           utils.executeImageDownloadQueryInsert(query, centreCode, serverNo, formattedTime);
//           const formattedquery = db.format(query, [centreCode, serverNo, formattedTime]);
//           // Insert update query into xml_feed
//           new Promise((resolve, reject) => {
//             insertIntoXmlFeed(formattedquery, (err) => {
//               if (err) {
//                 return reject(
//                   new Error("Error inserting update query into xml_feed")
//                 );
//               }
//               resolve();
//             });
//           });
//         }

//       }
//     }
//     // Optionally delete the zip file after extraction
//     fs.unlinkSync(zipFilePath);

//     res.send("File downloaded, extracted, and content modified successfully");
//   } catch (error) {
//     if (status.endsWith("_photo")) {
//       let query = "";
//       const count_photo_download = utils.countDownloadByAction("photo");
//       if (count_photo_download >= 1 && count_photo_download != "") {
//         query = `UPDATE qp_download set download_status='NF', download_time=? where centre_code = ? and serverno = ? and  download_sec='Photo' and download_status != 'NF' `;
//       } else if (count_photo_download == 0) {
//         query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'NF', ?)`;
//       }
//       // Execute the query if it has been set
//       if (query && count_photo_download >= 1 && count_photo_download != "") {
//         utils.executeImageDownloadQueryUpdate(query, formattedTime, centreCode, serverNo);
//         const formattedquery = db.format(query, [formattedTime, centreCode, serverNo]);
//         // Insert update query into xml_feed
//         new Promise((resolve, reject) => {
//           insertIntoXmlFeed(formattedquery, (err) => {
//             if (err) {
//               return reject(
//                 new Error("Error inserting update query into xml_feed")
//               );
//             }
//             resolve();
//           });
//         });
//         // return res.json({"message":"Photo downloaded Successfully"})
//       }else if (query && count_photo_download === 0) {
//         utils.executeImageDownloadQueryInsert(query, centreCode, serverNo, formattedTime);
//         const formattedquery = db.format(query, [centreCode, serverNo, formattedTime]);
//         // Insert update query into xml_feed
//         new Promise((resolve, reject) => {
//           insertIntoXmlFeed(formattedquery, (err) => {
//             if (err) {
//               return reject(
//                 new Error("Error inserting update query into xml_feed")
//               );
//             }
//             resolve();
//           });
//         });
//       }
//     }
//     if (status.endsWith("_sign")) {
//       const count_sign_download = utils.countDownloadByAction("sign");
//       let query = "";
//       if (count_sign_download >= 1 && count_sign_download != "") {
//         query = `UPDATE qp_download set download_status='NF', download_time=? where centre_code = ? and serverno = ? and  download_sec='Sign' and download_status != 'NF' `;
//       } else if (count_sign_download == 0) {
//         query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Sign', 'NF', ?)`;
//       }
//       // if (query) {
//       //   utils.executeImageDownloadQuery(query, centreCode, serverNo);
//       // }
//       if (query && count_sign_download >= 1 && count_sign_download != "") {
//         utils.executeImageDownloadQueryUpdate(query, formattedTime, centreCode, serverNo);
//         const formattedquery = db.format(query, [formattedTime, centreCode, serverNo]);
//         // Insert update query into xml_feed
//         new Promise((resolve, reject) => {
//           insertIntoXmlFeed(formattedquery, (err) => {
//             if (err) {
//               return reject(
//                 new Error("Error inserting update query into xml_feed")
//               );
//             }
//             resolve();
//           });
//         });
//         // return res.json({"message":"Photo downloaded Successfully"})
//       }else if (query && count_sign_download === 0) {
//         utils.executeImageDownloadQueryInsert(query, centreCode, serverNo, formattedTime);
//         const formattedquery = db.format(query, [centreCode, serverNo, formattedTime]);
//           // Insert update query into xml_feed
//           new Promise((resolve, reject) => {
//             insertIntoXmlFeed(formattedquery, (err) => {
//               if (err) {
//                 return reject(
//                   new Error("Error inserting update query into xml_feed")
//                 );
//               }
//               resolve();
//             });
//           });
//       }
//     }

//     console.error("Error during download or extraction:", error);
//     res.status(500).send("Error during the process");
//   }
// });
app.get("/check-status/", async (req, res) => {
  // const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = await utils.getSerialNumber();

  const getCenterAndServer = await queryAsync(
    "select count(1) as count, serverno as serverNo, centre_code as centerCode from qp_download order by id DESC"
  );
  const { count, serverNo, centerCode } = getCenterAndServer[0];
  const downloadArray = ["Base QP", "Centre QP", "Photo", "Sign"];
  const getDownloadCount = await queryAsync(
    "SELECT COUNT(DISTINCT download_sec) as count FROM qp_download WHERE download_sec IN (?) AND download_status = 'D'",
    [downloadArray]
  );
  console.log(getDownloadCount[0].count);

  if (count > 0 && downloadArray.length == getDownloadCount[0].count) {
    let activatedBatchArray = [];
    const checkActivation = await queryAsync(
      "SELECT id, download_sec FROM qp_download WHERE download_sec LIKE 'Activated-%' GROUP BY download_sec"
    );
    for (const check of checkActivation) {
      console.log(check.download_sec);
      const result = check.download_sec.replace("Activated-", "").trim();
      activatedBatchArray.push(result);
    }
    console.log(activatedBatchArray); // Output: ['Batch123']
    const data = {
      serialNumber: serialNumber,
      database: process.env.DB_NAME,
      centerCode: centerCode,
      serverNo: serverNo,
      data_downloaded: "Y",
      activated_batch: JSON.stringify(activatedBatchArray),
      b: "",
      pos: "",
      sc: "DJC",
    };
    try {
      const response = await axios.post(
        "http://demo70.sifyitest.com/livedata/auto_assign_server_no",
        {
          data: data,
        }
      );
      if (response.statusText === "OK") {
        return res.send("Check status done");
      }
    } catch (err) {
      console.error(err);
      return res.send("Check status failed");
    }
  }
});

app.get("/db-patch/", async (req, res) => {
  const { centre_code, serverno } = utils.centreAndServerNo();
  const dbVersion = await queryAsync(
    "SELECT db_version FROM taserver_version order by id asc"
  );
  // console.log(dbVersion[0].db_version);
  // const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = await utils.getSerialNumber();
  const data = {
    serialNumber: serialNumber,
    database: process.env.DB_NAME,
    centerCode: centre_code,
    serverNo: serverno,
    db_version: dbVersion[0].db_version,
    sc: "QPU",
  };
  try {
    // Make a GET request to the server
    const response = await axios.get(
      "https://demo70.sifyitest.com/livedata/patch_upd.php"
    );
    const result = response.data; // Parse JSON response
    if (result[0] != data.db_version) {
      console.log("this file need to be downloaded" + result[1]);

      const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
      const extractDir = path.join("C:", "pro", "itest", "activate");
      const fileName = result[1].split("/")[1];
      console.log(fileName);
      // Define the full path for saving the downloaded file
      const zipFilePath = path.join(tempDir, fileName); // Using result[1] as the filename

      // Create the temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      try {
        // Step 1: Download the file
        const url = `https://demo70.sifyitest.com/livedata/${result[1]}`;
        const response = await axios.get(url, { responseType: "stream" });

        // Step 2: Pipe the response to a write stream
        const writer = fs.createWriteStream(zipFilePath);
        response.data.pipe(writer);

        // Step 3: Wait for the file to be written to disk
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve); // Resolve once finished writing
          writer.on("error", reject); // Reject if an error occurs
        });

        console.log("File downloaded successfully to", zipFilePath);

        // Step 4: Unzip the file
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractDir, true);
        console.log(`File extracted successfully to ${extractDir}`);

        const patchFilePath = path.join(
          extractDir,
          `${fileName.split(".")[0]}.sql`
        );
        const mysqlPath = process.env.MYSQLPATH;

        // Escape special characters in the password if needed
        const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

        // Construct the command
        const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${patchFilePath}"`;
        // console.log(command);
        exec(command, { windowsHide: true, shell: false },(error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            // Only send the response if it's not already been sent
            if (!res.headersSent) {
              return res.status(500).send("Error importing dump file");
            }
          }
          console.log(stdout);
          if (stdout == "") {
            fs.unlinkSync(patchFilePath);
          }
          // If no error, send success response (only if it's not already sent)

          if (!res.headersSent) {
            res.send("Patch file imported successfully");
          }
        });

        // Delete the zip file after everything is done
        fs.unlinkSync(zipFilePath);
        // patchFilePath
      } catch (err) {
        console.error("Error:", err);
        if (!res.headersSent) {
          res.status(500).send("An error occurred during the process");
        }
      }

      console.log("Response from server:", result[0]);
      const sql = `UPDATE taserver_version SET db_version = ? `;

      const formattedsql = db.format(sql, [result[0]]);
      insertIntoXmlFeed(formattedsql, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      db.query(sql, [result[0]], (err, res) => {
        if (err) {
          console.error(err);
        }
        console.log("DB version updated");
      }); // Logs the JSON array ["7.0", "dbdump/hello.zip"]
      res.send(result);
    } else {
      res.send(false);
    }
    // Sends the server response back to the client
  } catch (error) {
    console.error("Request failed", error);
    res.status(500).send("Error sending request to server");
  }
});

app.get("/candidate-score-responses/:rollNum/:encryptKey", async (req, res) => {
  const { rollNum, encryptKey } = req.params;

  try {
    // Get distinct exams for the candidate
    const examCodeQuery = `SELECT DISTINCT e.exam_code, e.exam_name FROM iib_exam e, iib_candidate_scores s WHERE s.exam_code = e.exam_code AND online = 'Y' AND membership_no = ?`;
    const rowsExam = await queryAsync(examCodeQuery, [rollNum]);

    // Iterate through each exam
    for (const rowExam of rowsExam) {
      const { exam_code: examCode, exam_name: examName } = rowExam;

      // Get distinct subjects for the candidate's exam
      const subjectCodeQuery = `SELECT DISTINCT e.subject_code, e.subject_name FROM iib_exam_subjects e, iib_candidate_scores s WHERE e.subject_code = s.subject_code AND online = 'Y' AND e.exam_code = ? AND membership_no = ?`;
      const rowsSubject = await queryAsync(subjectCodeQuery, [
        examCode,
        rollNum,
      ]);

      for (const rowSubject of rowsSubject) {
        const { subject_code: subjectCode, subject_name: subjectName } =
          rowSubject;

        // Get the candidate's question paper number
        const sqlQuestions = `SELECT question_paper_no FROM iib_candidate_test WHERE exam_code = ? AND subject_code = ? AND test_status = 'C' AND membership_no = ?`;
        const rowsSelQues = await queryAsync(sqlQuestions, [
          examCode,
          subjectCode,
          rollNum,
        ]);

        for (const rowSelQues of rowsSelQues) {
          const questionPaperNo = rowSelQues.question_paper_no;
          // Get exam marks and other details
          const sqlMarks = `SELECT total_marks, pass_mark, display_response FROM iib_exam_subjects WHERE exam_code = ? AND subject_code = ? AND online = 'Y'`;
          const rowsSqlMarks = await queryAsync(sqlMarks, [
            examCode,
            subjectCode,
          ]);
          const displayResponse = rowsSqlMarks[0]["display_response"];

          // console.log('display_response',display_response);

          // Retrieve list of question IDs
          const sqlQnsIds = `SELECT question_id , display_order FROM iib_question_paper_details WHERE question_paper_no = ? ORDER BY display_order`;
          const rowsSqlQnsIds = await queryAsync(sqlQnsIds, [questionPaperNo]);
          const quesIdsArr = rowsSqlQnsIds.map((row) => row.question_id);
          // console.log('Question_id',quesIdsArr);
          //         // const quesIdsArrdis = rowsSqlQnsIds.map(row => row.display_order);
          // Step 1: Fetch all response data for `questionPaperNo` from `iib_response`
          const sqlQns = `SELECT question_id, CONVERT(AES_DECRYPT(answer, UNHEX(SHA2(?, 256))) USING 'utf8') AS answer, display_order FROM iib_response WHERE id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? AND answer != 'NULL' GROUP BY question_id ) ORDER BY display_order`;
          // const sqlQns = `SELECT question_id, answer, display_order FROM iib_response
          //  WHERE id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? AND answer != 'NULL' GROUP BY question_id ) ORDER BY display_order`;
          const rowsSqlQns = await queryAsync(sqlQns, [
            encryptKey,
            questionPaperNo,
          ]);
          console.log("Response data:", rowsSqlQns);

          // Step 2: Fetch correct answers for all questions in `quesIdsArr`
          const aQuestionsSql = `SELECT question_id, correct_answer FROM iib_sq_details WHERE question_id IN (${quesIdsArr.join(",")})
`;
          const rowsSqlQnsIdsVal = await queryAsync(aQuestionsSql);
          // console.log("Correct answers:", rowsSqlQnsIdsVal);

          // Step 3: Merge both datasets based on `question_id`, ensuring every question has a `correct_answer`
          const CandidateResponse = quesIdsArr.map((question_id) => {
            const response = rowsSqlQns.find(
              (item) => item.question_id == question_id
            );
            const correctAnswer = rowsSqlQnsIdsVal.find(
              (item) => item.question_id == question_id
            );

            return {
              question_id,
              answer: response ? response.answer : "-",
              display_order: response ? response.display_order : "-",
              correct_answer: correctAnswer
                ? correctAnswer.correct_answer
                : "-",
            };
          });

          // console.log("Merged Data with All Correct Answers:", CandidateResponse);
          const Questioncount = rowsSqlQnsIdsVal.length;
          const attendedQusCount = rowsSqlQns.length;
          console.log(Questioncount);
          return res.json({
            Questioncount,
            attendedQusCount,
            CandidateResponse,
            displayResponse,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/exam-closure-summary", async (req, res) => {
  try {
    const data = req.body;

    // Extract and validate necessary variables
    const {
      ExamName = "",
      ExamDate = "",
      CentreCode = "",
      ServerNo = "",
      AdminId = examserverip,
      SerialNumber = "",
      feedback,
      attachFile,
      ...formFields
    } = data;

    const sql_tadetails =
      "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";

    db.query(sql_tadetails, async (err, results) => {
      if (err) {
        console.error("Error fetching TA details:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length === 0) {
        console.error("No TA details found.");
        return res.status(500).json({ message: "TA details not found" });
      }

      const sTaLoginID = results[0].ta_login;
      const sTaPassword = results[0].ta_password;
      const reqChkSumStr = `${sTaLoginID}${sTaPassword}${process.env.DB_NAME}`;
      const validateCheckSum = crypto
        .createHash("sha256")
        .update(reqChkSumStr + process.env.CHECKSUMKEY)
        .digest("hex");

      const database = process.env.DB_NAME;
      const currentTimestamp = formattedTime; // Generate current timestamp
      const lbl = "Feedback";
      const isFileAttached = "0";
      const date_time = new Date().toISOString().replace(/[-T:.Z]/g, "");
      const data_config = `${database}_${CentreCode}_${ServerNo}_${date_time}.tmp`;
      const todaydate = formattedDate;
      const ip_addr = examserverip;
      const taFfb = feedback;
      const CurrentExamDate = formattedDate;

      console.log(taFfb);

      let fb_sync_status, msg;

      // SQL Insert Query
      const insertQuery = `INSERT INTO exam_day_end_report (exam_name, exam_date, centre_code, server_no, batch1_scheduled, batch2_scheduled, batch3_scheduled, batch1_attended, batch2_attended, batch3_attended, test_lab, test_admin, without_admit_card, without_id_proof, without_admit_card_id_proof, test_reporting_late, request_centre_change, test_malpractice, updated_ip, updated_on, updated_by, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        ExamName,
        ExamDate,
        CentreCode,
        ServerNo,
        formFields.candidateBatch1Scheduled,
        formFields.candidateBatch2Scheduled,
        formFields.candidateBatch3Scheduled,
        formFields.candidateBatch1Attended,
        formFields.candidateBatch2Attended,
        formFields.candidateBatch3Attended,
        formFields.labsUsed,
        formFields.testAdministrators,
        formFields.candidatesWithoutAdmitCard,
        formFields.candidatesWithoutIdentityProof,
        formFields.candidatesWithoutAdmitCardAndIdentityProof,
        formFields.candidatesReportingLate,
        formFields.candidatesRequestingCentreChange,
        formFields.candidatesIndulgingInMalpractice,
        AdminId,
        currentTimestamp,
        SerialNumber,
        "S",
      ];

      const formattedInsertQuery = db.format(insertQuery, values);
      const base64Query = Buffer.from(formattedInsertQuery).toString("base64");

      db.query(insertQuery, values, async (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res
            .status(500)
            .json({ message: "Error inserting data", error: err });
        }

        // FormData for API request
        const form = new FormData();
        form.append("name", database);
        form.append("user", sTaLoginID);
        form.append("pass", sTaPassword);
        form.append("closureExamDate", CurrentExamDate);
        form.append("feedbackText", taFfb);
        form.append("dayEndReport", base64Query);
        form.append("isFileAttached", isFileAttached);
        form.append("CHECKSUM", validateCheckSum);
        form.append("filename", data_config);

        try {
          const response = await axios.post(
            `${process.env.EXAM_DASHBOARD_URL}/closureFeedbackFeed`,
            form,
            {
              headers: {
                ...form.getHeaders(),
              },
            }
          );

          console.log(response.data);

          if (response.data.responseMessage === "File uploaded successfully.") {
            fb_sync_status = "U";
            msg = "Syncing success";
          } else {
            fb_sync_status = "UF";
            msg = `${response.data.responseMessage} Syncing failed`;
          }

          if (response.data.responseMessage === "File uploaded successfully.") {
            const checkQuery = `SELECT COUNT(*) AS count FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action=?`;
            db.query(checkQuery, [CentreCode, ServerNo, lbl], (err, result) => {
              if (err) {
                console.error("Error checking record:", err);
                return;
              }

              const countSel_ecs = result[0].count;

              if (countSel_ecs === 0) {
                const insertClosureQuery = `INSERT INTO exam_closure_summary (exam_date, centre_code,serverno, file_path, closure_action, feedback, closure_status, added_on, ip_address) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?)`;

                db.query(
                  insertClosureQuery,
                  [
                    todaydate,
                    CentreCode,
                    ServerNo,
                    lbl,
                    taFfb,
                    fb_sync_status,
                    formattedTime,
                    ip_addr,
                  ],
                  (err) => {
                    if (err) console.error("Error inserting record:", err);
                  }
                );
                // Insert formatted query into xml_feed
                insertIntoXmlFeed(
                  insertClosureQuery,
                  [
                    todaydate,
                    CentreCode,
                    ServerNo,
                    lbl,
                    taFfb,
                    fb_sync_status,
                    formattedTime,
                    ip_addr,
                  ],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Error inserting feed table:", err);
                        res
                          .status(500)
                          .json({ message: "Internal Server Error" });
                      });
                    }
                  }
                );
              } else {
                const updateClosureQuery = `UPDATE exam_closure_summary SET feedback=?, file_path='', closure_status=?, updated_on=?, ip_address=? WHERE centre_code=? AND serverno=? AND closure_action=?`;

                db.query(
                  updateClosureQuery,
                  [
                    taFfb,
                    fb_sync_status,
                    formattedTime,
                    ip_addr,
                    CentreCode,
                    ServerNo,
                    lbl,
                  ],
                  (err) => {
                    if (err) console.error("Error updating record:", err);
                  }
                );
                // Insert formatted query into xml_feed
                insertIntoXmlFeed(
                  updateClosureQuery,
                  [
                    taFfb,
                    fb_sync_status,
                    formattedTime,
                    ip_addr,
                    CentreCode,
                    ServerNo,
                    lbl,
                  ],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Error inserting feed table:", err);
                        res
                          .status(500)
                          .json({ message: "Internal Server Error" });
                      });
                    }
                  }
                );
              }
            });
          }
        } catch (apiError) {
          console.error("Error in API request:", apiError);
          return res
            .status(500)
            .json({ message: "API request failed", error: apiError });
        }

        // Insert formatted query into xml_feed
        insertIntoXmlFeed(formattedInsertQuery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting feed table:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });

        res.json({ message: "Data inserted successfully" });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected error", error });
  }
});

async function getCurrentExamDate() {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT exam_date FROM iib_exam_schedule LIMIT 1";

    db.query(sqlQuery, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(new Error("Error fetching exam date"));
      }

      if (results.length === 0) {
        return resolve(null); // No exam date found
      }

      resolve(results[0].exam_date);
    });
  });
}

app.get("/get-exam-date", (req, res) => {
  const sqlDate =
    "SELECT DISTINCT exam_date FROM iib_exam_schedule ORDER BY exam_date";
  db.query(sqlDate, (error, results) => {
    if (error) {
      return callback(error, null);
    }

    if (results.length === 1) {
      const eDateRaw = results[0].exam_date;
      const eDate =
        eDateRaw instanceof Date
          ? eDateRaw.toISOString().split("T")[0]
          : eDateRaw; // Ensure it's in YYYY-MM-DD format

      if (typeof eDate === "string" && eDate.includes("-")) {
        const [year, month, day] = eDate.split("-");
        const dispDate = `${day}-${month}-${year}`;
        res.status(200).json({ exam_date: eDate, display_date: dispDate });
      } else {
        res.status(400).json(new Error("Invalid date format"));
      }
    } else {
      const today = new Date();
      const exam_date = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      // callback(null, { exam_date });
      res.status(200).json({ exam_date: exam_date });
    }
  });
});

app.get("/get-center-server-details", async (req, res) => {
  const selAutoFeed = "SELECT center_code, serverno FROM autofeed";
  // console.log('TESTTTTTT');

  try {
    const rowsSelAutoFeed = await new Promise((resolve, reject) => {
      db.query(selAutoFeed, (err, results) => {
        if (err) {
          console.error("Error querying the database:", err);
          return reject(new Error("Internal Server Error"));
        }
        resolve(results);
      });
    });

    if (rowsSelAutoFeed.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found in autofeed table" });
    }

    // Prepare result
    const result = {
      center_code: rowsSelAutoFeed[0].center_code,
      serverno: rowsSelAutoFeed[0].serverno,
    };
    // console.log(result);
    res.json(result); // Send result as JSON response
  } catch (error) {
    console.error("Error fetching center and server details:", error);
    res.status(500).json({ message: error.message }); // Send error response
  }
});

app.get("/get-exam-details", async (req, res) => {
  const selExam = "select exam_code,exam_name from iib_exam";

  try {
    const rowsExam = await new Promise((resolve, reject) => {
      db.query(selExam, (err, results) => {
        if (err) {
          console.error("Error querying the database:", err);
          return reject(new Error("Internal Server Error"));
        }
        resolve(results);
      });
    });

    if (rowsExam.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found in iib_exam table" });
    }

    // Prepare result
    const result = {
      exam_code: rowsExam[0].exam_code,
      exam_name: rowsExam[0].exam_name,
    };
    // console.log(result);
    res.json(result); // Send result as JSON response
  } catch (error) {
    console.error("Error fetching exam details:", error);
    res.status(500).json({ message: error.message }); // Send error response
  }
});

const session = {
  ta_override: "N",
  mc: "EN", // Example medium code from session
};

// app.get("/medium-settings/:SubjectCode", (req, res) => {
//   // app.get("/medium-settings", (req, res) => {

//   // const { SubjectCode } = req.params;
//   const { SubjectCode } = req.params;
//   console.log(SubjectCode);
//   const mediumSettingsSql = `
//     SELECT variable_name, variable_value
//     FROM exam_settings
//     WHERE variable_name='display_medium' OR variable_name='display_medium_dropdown'
//   `;

//   const sublanguagesSql = `SELECT languages FROM iib_exam_subjects WHERE subject_code = ?`;

//   db.query(sublanguagesSql, [SubjectCode], (err, sublanguagesResult) => {
//     if (err) {
//       console.error("Database query failed:", err.message); // Improved error message
//       res.status(500).send("An error occurred while retrieving languages.");
//       return;
//     }

//     if (sublanguagesResult.length === 0) {
//       console.warn("No languages found for the provided subject code."); // Handle empty result set
//       res.status(404).send("No languages found for the specified subject code.");
//       return;
//     }

//     // Collect all languages into an array
//     const mediumlanguages = sublanguagesResult.map((row) => row.languages);

//     console.log("Retrieved languages:", mediumlanguages);

//     // Example: Send the response back to the client
//     // res.status(200).json({ languages: mediumlanguages });
//   });

//   const languagesSql = `
//     SELECT lang_code, lang_name
//     FROM iib_languages
//     WHERE is_active = 'Y'
//   `;

//   db.query(mediumSettingsSql, (err, mediumSettingsResult) => {
//     if (err) {
//       console.error("Database query failed:", err);
//       res.status(500).send("Database error");
//       return;
//     }

//     const mediumSettings = {
//       display_medium: "",
//       display_medium_dropdown: "",
//     };

//     mediumSettingsResult.forEach((row) => {
//       mediumSettings[row.variable_name] = row.variable_value;
//     });

//     // Fetch active languages
//     db.query(languagesSql, (err, languagesResult) => {
//       if (err) {
//         console.error("Database query failed:", err);
//         res.status(500).send("Database error");
//         return;
//       }

//       // Construct the arrLang and subjectLanguages dynamically
//       const arrLang = {};
//       const subjectLanguages = [];

//       languagesResult.forEach((row) => {
//         arrLang[row.lang_code] = row.lang_name;
//         subjectLanguages.push(row.lang_code);
//       });

//       const mediumCode = "EN"; // Example selected language code
// // console.log(subjectLanguages);
//       // Respond with all required data
//       res.json({
//         mediumSettings,
//         subjectLanguages,
//         mediumCode,
//         arrLang,
//         session,
//       });
//     });
//   });
// });

app.get("/medium-settings/:SubjectCode", (req, res) => {
  const { SubjectCode } = req.params;
  console.log("SubjectCode:", SubjectCode);

  const mediumSettingsSql = `
    SELECT variable_name, variable_value FROM exam_settings 
    WHERE variable_name='display_medium' OR variable_name='display_medium_dropdown'
  `;

  const sublanguagesSql = `SELECT languages FROM iib_exam_subjects WHERE subject_code = ?`;

  db.query(sublanguagesSql, [SubjectCode], (err, sublanguagesResult) => {
    if (err) {
      console.error("Database query failed:", err.message);
      res.status(500).send("An error occurred while retrieving languages.");
      return;
    }

    if (sublanguagesResult.length === 0) {
      console.warn("No languages found for the provided subject code.");
      res
        .status(404)
        .send("No languages found for the specified subject code.");
      return;
    }

    // Split the languages string into an array of codes
    const mediumlanguages = sublanguagesResult
      .map((row) => row.languages.split(","))
      .flat();
    console.log("Retrieved languages:", mediumlanguages);

    // Fetch medium settings
    db.query(mediumSettingsSql, (err, mediumSettingsResult) => {
      if (err) {
        console.error("Database query failed:", err);
        res.status(500).send("Database error");
        return;
      }

      const mediumSettings = {
        display_medium: "",
        display_medium_dropdown: "",
      };

      mediumSettingsResult.forEach((row) => {
        mediumSettings[row.variable_name] = row.variable_value;
      });

      // Fetch active languages
      const languagesSql = `
        SELECT lang_code, lang_name 
        FROM iib_languages 
        WHERE is_active = 'Y' AND lang_code IN (?)
      `;

      // Filter active languages based on mediumlanguages
      db.query(languagesSql, [mediumlanguages], (err, languagesResult) => {
        if (err) {
          console.error("Database query failed:", err);
          res.status(500).send("Database error");
          return;
        }

        // Construct the arrLang and subjectLanguages dynamically
        const arrLang = {};
        const subjectLanguages = [];

        languagesResult.forEach((row) => {
          arrLang[row.lang_code] = row.lang_name;
          subjectLanguages.push(row.lang_code);
        });

        const mediumCode = "EN"; // Example selected language code

        // Respond with all required data
        res.json({
          mediumSettings,
          subjectLanguages,
          mediumCode,
          arrLang,
          session,
        });
      });
    });
  });
});

// const getUpdatePassword = (password, arrValue) => {
//   const passwordArr = password.toString().split('');
//   let resultStr = '';
//   for (let i = 0; i < passwordArr.length; i++) {
//       resultStr += arrValue[passwordArr[i]];
//   }
//   return resultStr;
// };

const getNumeric = (alphabet) => {
  const alphabetArr = [];
  for (let i = 97; i <= 122; i++) {
    alphabetArr.push(String.fromCharCode(i));
  }

  // console.log(alphabet)
  // console.log(alphabetArr[0])
  for (let letter = 0; letter < alphabetArr.length; letter++) {
    if (alphabet === alphabetArr[letter]) {
      return letter;
    }
  }
  return null;
};

const getUpdatePassword = (password, arrValue) => {
  const passwordArr = password.toString().split("");
  let resultStr = "";
  for (let i = 0; i < passwordArr.length; i++) {
    resultStr += arrValue[passwordArr[i]];
  }

  return resultStr;
};

// API Endpoint for generating the password
app.post("/generate-password", async (req, res) => {
  const { centreCode, serverNumber, module } = req.body;

  if (
    typeof centreCode === "string" &&
    centreCode.trim() === "" &&
    typeof serverNumber === "string" &&
    serverNumber === "" &&
    typeof module === "string" &&
    module === ""
  ) {
    res.status(401).json({
      error: "Field cannot be an empty value.",
    });
  }

  // console.log("TESTTTTTTTTT");

  try {
    let moduleArr = [];

    if (module === "Truncate") {
      moduleArr = "sifytechaz".split("");
    } else if (module === "Time") {
      moduleArr = "kwcqpjbnmo".split("");
    } else if (module === "Biometric") {
      moduleArr = "abcdefghij".split("");
    } else if (module === "Utility") {
      moduleArr = "zxygavfebj".split("");
    }else if (module == "miscellaneous") {
      moduleArr = "zxygavfebj".split("");
    }

    const updatedCentreCodeVal = centreCode.slice(3, -1);
    const centreCodeLowerCase = centreCode.slice(-1).toLowerCase();
    const centerCodeNumeric = getNumeric(centreCodeLowerCase);
    const serverNumberNumeric = getNumeric(serverNumber);
    const dateObj = new Date();
    const day = dateObj.getDate();
    const currDay = day < 10 ? `0${day}` : day;
    const month = dateObj.getMonth() + 1;
    const currMonth = month < 10 ? `0${month}` : month;

    let calculatedPassword = 0;

    if (centerCodeNumeric !== null && serverNumberNumeric !== null) {
      calculatedPassword =
        parseInt(updatedCentreCodeVal) +
        parseInt(centerCodeNumeric) +
        parseInt(serverNumberNumeric) +
        parseInt(currDay) +
        parseInt(currMonth);
    } else {
      throw new Error("Function cannot generate password.");
    }

    const hours = dateObj.getHours();
    const currHours = hours < 10 ? `0${hours}` : hours.toString();
    const mins = dateObj.getMinutes();
    const currMins = mins < 10 ? `0${mins}` : mins.toString();

    const finalPassword = currMins + calculatedPassword + currHours;
    // console.log(finalPassword)

    const updatedPassword = getUpdatePassword(finalPassword, moduleArr);

    res.status(200).json({
      success: "Password generated successfully.",
      generatedPassword: updatedPassword,
    });
  } catch (error) {
    res.status(400).json({
      error: "Cannot generate password.",
      errorMessage: error.message,
    });
  }
});


function getUpdatedPwd(pwd, arValue) {
  return pwd
    .split("")
    .map((char) => (arValue[char] !== undefined ? arValue[char] : char))
    .join("");
}

function getNumericVal(alpha) {
  return alpha ? alpha.charCodeAt(0) - 97 : null; // 'a' -> 0, 'b' -> 1, ...
}

app.post("/validate-password", async (req, res) => {
  const { pwd, clFlag, moduleType } = req.body;

  if (!pwd || clFlag !== 0) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // Define arrayValue before the condition
  let arrayValue = {};

  if (moduleType === "Truncate") {
    arrayValue = { s: 0, i: 1, f: 2, y: 3, t: 4, e: 5, c: 6, h: 7, a: 8, z: 9 };
  } else if (moduleType === "Time") {
    arrayValue = { k: 0, w: 1, c: 2, q: 3, p: 4, j: 5, b: 6, n: 7, m: 8, o: 9 };
  } else if (moduleType === "Biometric") {
    arrayValue = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9 };
  } else if (moduleType === "Utility" || moduleType === "miscellaneous") {
    arrayValue = { z: 0, x: 1, y: 2, g: 3, a: 4, v: 5, f: 6, e: 7, b: 8, j: 9 };
  } else {
    return res.status(400).json({ error: "Invalid module type." });
  }

  db.query("SELECT center_code, serverno FROM autofeed", (err, rows) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ error: "Server error." });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "No data found." });
    }

    const { center_code: cVal, serverno: cserno } = rows[0];
    const updatedPwd = getUpdatedPwd(pwd, arrayValue);

    const min = updatedPwd.substring(0, 2);
    const hr = updatedPwd.slice(-2);
    const curDate = moment();

    const hrStr = String(hr).padStart(2, "0");
    const minStr = String(min).padStart(2, "0");

    const pwdDate = moment(`${curDate.format("YYYY-MM-DD")} ${hrStr}:${minStr}:00`, "YYYY-MM-DD HH:mm:ss");
    const dateDiff = curDate.diff(pwdDate, "minutes");

    console.log("dateDiff:", dateDiff);

    if (dateDiff < 15) {
      const finalPwd = updatedPwd.substring(2, updatedPwd.length - 2);
      const updatedCVal = cVal.substring(3, cVal.length - 1);
      const cAlp = cVal.slice(-1).toLowerCase();
      const alCVal = getNumericVal(cAlp);
      const alSNo = getNumericVal(cserno);

      const calculatedPwd =
        parseInt(updatedCVal) + alCVal + alSNo + parseInt(curDate.format("DD")) + parseInt(curDate.format("MM"));

      console.log("calculatedPwd:", calculatedPwd);
      console.log("finalPwd:", finalPwd);

      if (calculatedPwd === parseInt(finalPwd)) {
        return res.json({ success: true, clFlag: 1 });
      } else {
        return res.json({ success: false, clFlag: 2 });
      }
    } else {
      return res.json({ success: false, clFlag: 3 });
    }
  });
});


app.get("/get-batch-time", (req, res) => {
  const sql =
    "SELECT DISTINCT(slot_time) FROM iib_exam_slots ORDER BY slot_time";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const formattedResult = result.map((row) => ({
        slot_time: row.slot_time.toString(),
      }));
      console.log(formattedResult);
      res.json({ result: formattedResult });
    } else {
      res.json({ result: [] }); // Return empty array if no results
    }
  });
});

app.post("/skip-biometric-validation-all-insert", async (req, res) => {
  const {
    batchtime,
    blockmode,
    biostatus,
    serialNumber,
    admin_ipv4,
    candidateList,
  } = req.body;

  console.log(candidateList);

  // Choose SQL based on blockmode
  const selectSql =
    blockmode == 3
      ? "SELECT membership_no, exam_date FROM iib_candidate_iway WHERE exam_time = ?"
      : "SELECT membership_no, exam_date FROM iib_candidate_iway WHERE exam_time = ? AND membership_no IN (?)";

  const queryParams = blockmode == 3 ? [batchtime] : [batchtime, candidateList];

  const formattedupdateSql_val = db.format(selectSql, queryParams);
  // console.log(formattedupdateSql_val);

  db.query(selectSql, queryParams, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const currentDateTime = formattedTime; // Get the current date and time
      const formattedResult = [];
      let processCount = 0;

      result.forEach((row) => {
        const checkSql = `SELECT * FROM exam_skip_biometricvalidation WHERE membership_no = ? AND exam_date = ? AND exam_slot_time = ?`;

        db.query(
          checkSql,
          [row.membership_no, row.exam_date, batchtime],
          (checkErr, checkResult) => {
            if (checkErr) {
              console.error("Error checking existing record:", checkErr);
            } else if (checkResult.length > 0) {
              // Update existing record
              const updateSql = `UPDATE exam_skip_biometricvalidation SET skip_mode = ?, date_updated = ?, skip_status = ?, admin_serialno = ?, admin_ipv4 = ? WHERE membership_no = ? AND exam_date = ? AND exam_slot_time = ?`;
              const updateValues = [
                blockmode,
                currentDateTime,
                biostatus,
                serialNumber,
                admin_ipv4,
                row.membership_no,
                row.exam_date,
                batchtime,
              ];

              const formattedupdateSql = db.format(updateSql, updateValues);

              db.query(updateSql, updateValues, (updateErr) => {
                if (updateErr) {
                  console.error("Error updating record:", updateErr);
                } else {
                  // Insert the exact formatted query into xml_feed
                  insertIntoXmlFeed(formattedupdateSql, (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Error inserting feed table:", err);
                        res
                          .status(500)
                          .json({ message: "Internal Server Error" });
                      });
                    }
                  });

                  formattedResult.push({
                    action: "updated",
                    membership_no: row.membership_no,
                    exam_date: formattedDateMonthYear,
                    batchtime,
                  });
                }
                processCount++;
                if (processCount === result.length) {
                  res.status(200).json({
                    message: "Operation completed",
                    result: formattedResult,
                    success: "success",
                  });
                }
              });
            } else {
              // Insert new record
              const insertSql = `INSERT INTO exam_skip_biometricvalidation (exam_date, exam_slot_time, skip_mode, membership_no, dateaddedon, date_updated, skip_status, admin_serialno,admin_ipv4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
              const insertValues = [
                row.exam_date,
                batchtime,
                blockmode,
                row.membership_no,
                currentDateTime,
                currentDateTime,
                biostatus,
                serialNumber,
                admin_ipv4,
              ];

              const formattedinsertSql = db.format(insertSql, insertValues);
              db.query(insertSql, insertValues, (insertErr, insertResult) => {
                if (insertErr) {
                  console.error("Error inserting new record:", insertErr);
                } else {
                  // Insert the exact formatted query into xml_feed
                  insertIntoXmlFeed(formattedinsertSql, (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Error inserting feed table:", err);
                        res
                          .status(500)
                          .json({ message: "Internal Server Error" });
                      });
                    }
                  });

                  formattedResult.push({
                    action: "inserted",
                    insertId: insertResult.insertId,
                    membership_no: row.membership_no,
                    exam_date: formattedDateMonthYear,
                    batchtime,
                  });
                }
                processCount++;
                if (processCount === result.length) {
                  res.status(200).json({
                    message: "Operation completed",
                    result: formattedResult,
                    success: "success",
                  });
                }
              });
            }
          }
        );
      });
    } else {
      res.status(200).json({
        message: "No data found for the given batch time",
        result: [],
        success: "failure",
      });
    }
  });
});

app.get("/get-candidate-list", (req, res) => {
  const { batchtime } = req.query; // Use query params for GET request
  if (!batchtime) {
    return res.status(400).json({ error: "Batch time is required" });
  }

  // Correct the SQL query to dynamically insert the batchtime value
  const sql =
    "SELECT membership_no FROM iib_candidate_iway WHERE exam_time = ?";

  db.query(sql, [batchtime], (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const formattedResult = result.map((row) => ({
        membership_no: row.membership_no, // Assuming you want membership_no in the result
      }));

      // console.log(formattedResult);
      res.json({ result: formattedResult });
    } else {
      res.json({ result: [] }); // Return empty array if no results
    }
  });
});

app.get("/generate-bio-skip-password", (req, res) => {
  //console.log("TEST");
  // const client = process.env.CLIENT; // e.g., "hybrid_nibm"
  // const client_name = client.split("_")[1]; // This gets "nibm"
  // const examName = client_name;
  const examName = process.env.CLIENT.split("_")[1].toUpperCase();
  db.query(
    "SELECT DISTINCT(DATE_FORMAT(exam_date, '%d-%m-%Y')) AS examDate FROM iib_exam_schedule",
    (err, examResult) => {
      if (err) {
        console.error("Error fetching exam date:", err);
        return res.status(500).json({ error: "Error fetching exam date" });
      }

      const examDate = examResult.length > 0 ? examResult[0].examDate : null;
      if (!examDate) {
        return res.status(404).json({ error: "No exam date found" });
      }

      db.query(
        "SELECT DISTINCT slot_time AS batchTime FROM iib_exam_slots ORDER BY batchTime",
        (err, batchResult) => {
          if (err) {
            console.error("Error fetching batch times:", err);
            return res
              .status(500)
              .json({ error: "Error fetching batch times" });
          }

          const batchTimes = batchResult.map((row) => row.batchTime);
          if (!batchTimes || batchTimes.length === 0) {
            return res.status(404).json({ error: "No batch times found" });
          }

          const passwordTable = [];
          batchTimes.forEach((time) => {
            const pwd = examName + time + examDate;

            // Hash using SHA256 in Node.js
            const hashedPassword = crypto
              .createHash("sha256")
              .update(pwd)
              .digest("hex");

            const chunkSize = 8;
            const passwordArray = [];
            for (let i = 0; i < hashedPassword.length; i += chunkSize) {
              passwordArray.push(hashedPassword.slice(i, i + chunkSize));
            }

            passwordTable.push({
              examDate,
              examTime: time,
              passwords: passwordArray,
            });
          });

          console.log(passwordTable);
          res.status(200).json({
            success: "Bio skip password fetched successfully.",
            success_value: 1,
            examName,
            passwordData: passwordTable,
          });
        }
      );
    }
  );
});

// Route to validate a password
app.post("/validate-skip-password", (req, res) => {
  const { examTime, inputPassword } = req.body;

  if (!examTime || !inputPassword) {
    return res.status(400).json({
      error: "Missing required fields: examTime, inputPassword",
    });
  }

  const skippassword_val = req.cookies.skippassword;
  if (skippassword_val == inputPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid password." });
  }

  const examDate = formattedDateMonthYear;

  // const examName = "NIBM"; // Should match the one used in generation
  const examName = process.env.CLIENT.split("_")[1].toUpperCase();
  const pwd = examName + examTime + examDate;

  // Hash using SHA256 in Node.js
  const hashedPassword = crypto.createHash("sha256").update(pwd).digest("hex");

  // Split the hashed password into chunks of 8
  const chunkSize = 8;
  const passwordArray = [];
  for (let i = 0; i < hashedPassword.length; i += chunkSize) {
    passwordArray.push(hashedPassword.slice(i, i + chunkSize));
  }

  // Check if the inputPassword exists in the generated passwordArray
  const isValid = passwordArray.includes(inputPassword);

  if (isValid) {
    res.cookie("skippassword", inputPassword, {
      httpOnly: true,
      sameSite: "None",
      secure: true, // Ensure HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 hour - 60 * 60 * 1000 // 24 hour - 24 * 60 * 60 * 1000
    });
    return res
      .status(200)
      .json({ success: true, message: "Password is valid." });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid password." });
  }
});

// app.get('/batch-times', (req, res) => {
//   // Mocked batch time list
//   const batchTimes = ['10:00 AM', '03:00 PM'];
//   return res.json(batchTimes);
// });

app.get("/get-labname", (req, res) => {
  const sql =
    "SELECT DISTINCT(labname) FROM biometric_report_api ORDER BY LENGTH(labname), labname";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }

    // Calculate the lab count
    const labCount = result.length;

    // Map the results
    const formattedResult =
      labCount > 0
        ? result.map((row) => ({
            labname: row.labname, // Assuming labname is already a string
          }))
        : [];

    res.json({
      success: true,
      result: formattedResult,
      labCount: labCount, // Include lab count in the response
    });
  });
});

app.get("/all-labs-download", (req, res) => {
  const filePath = path.join(__dirname, "doc", "seatmanagement.csv"); // Update the file path

  // Set the headers for downloading the file
  res.download(filePath, "seatmanagement.csv", (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the file");
    }
  });
});

app.get("/specific-labs-download", (req, res) => {
  const filePath = path.join(__dirname, "doc", "seatmanagement_addlabname.csv"); // Update the file path

  // Set the headers for downloading the file
  res.download(filePath, "seatmanagement_addlabname.csv", (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the file");
    }
  });
});

app.post("/add-seats-allocation", (req, res) => {
  const { exam_centre_code, exam_lab_code, exam_seatno, candidate_ipaddress } =
    req.body;

  // Validate input
  if (
    !exam_centre_code ||
    !exam_seatno ||
    !candidate_ipaddress ||
    !exam_lab_code
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  const status = "1";
  console.log("formattedTime:", formattedTime);
  // SQL query
  const query = `INSERT INTO candidate_seat_management (exam_centre_code,exam_lab_code,exam_seatno,candidate_ipaddress,status,date_created,exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    exam_centre_code,
    exam_lab_code,
    exam_seatno,
    candidate_ipaddress,
    status,
    formattedTime,
    formattedTime,
  ];
  // console.log('Query:', query);
  // console.log('Values:', values);
  const queryInsert = db.format(query, values);
  // Execute query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting into candidate_seat_management:", err);
      return res
        .status(500)
        .json({ error: "Database error.", details: err.message });
    }

    // Insert the exact formatted query into xml_feed
    insertIntoXmlFeed(queryInsert, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting feed table:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });

    res.status(200).json({
      message: "Seat added successfully.",
      biometric_id: result.insertId,
    });
  });
});

app.post("/seat-management-upload-csv", (req, res) => {
  if (!req.files || !req.files.csvFile) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { labCode } = req.body;

  console.log(req.body);

  const csvFile = req.files.csvFile;
  const filePath = `./doc/uploads/${csvFile.name}`;
  // console.log(filePath);
  const status = "1";
  // console.log('formattedTime:', formattedTime);

  // Save the file to the server
  csvFile.mv(filePath, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return res.status(500).json({ error: "Error saving file." });
    }

    // Process the CSV file
    const records = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const centreCode = row.CentreCode || null; // Column 1
        const seatNo = row.SeatNo || null; // Column 2
        const candidateIpaddress = row.candidateIpaddress || null; // Column 3
        const LabName = labCode ? labCode : row.LabName;

        records.push([
          centreCode,
          LabName,
          seatNo,
          candidateIpaddress,
          status,
          formattedTime,
          formattedTime,
        ]);
      })
      .on("end", () => {
        // Insert into MySQL
        const query = `INSERT INTO candidate_seat_management (exam_centre_code,exam_lab_code,exam_seatno,candidate_ipaddress,status,date_created,exam_date) VALUES ?`;

        const queryInsert = db.format(query, [records]);

        db.query(query, [records], (err, result) => {
          if (err) {
            console.error("Error inserting into MySQL:", err);
            return res.status(500).json({ error: "Database error." });
          }
          // Insert the exact formatted query into xml_feed
          insertIntoXmlFeed(queryInsert, (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting feed table:", err);
                res.status(500).json({ message: "Internal Server Error" });
              });
            }
          });
          res.status(200).json({
            message: `${result.affectedRows} rows inserted successfully.`,
          });
        });

        // Remove the CSV file after processing
        fs.unlinkSync(filePath);
      })
      .on("error", (err) => {
        console.error("Error processing CSV:", err);
        res.status(500).json({ error: "Error processing CSV." });
      });
  });
});

app.get("/download-candidate-seats", (req, res) => {
  const query =
    "SELECT biometric_id,exam_centre_code,exam_lab_code,exam_seatno,candidate_ipaddress,status,DATE_FORMAT(exam_date, '%d-%m-%Y') AS exam_date FROM candidate_seat_management";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Database error.");
    }

    // Generate CSV content
    let csv =
      "id,center_code,lab_name,seatno,candidate_ipaddress,status,exam_date\n";
    results.forEach((row) => {
      csv += `${row.biometric_id},${row.exam_centre_code},${row.exam_lab_code || ""},${row.exam_seatno},${row.candidate_ipaddress},${row.status},${row.exam_date}\n`;
    });

    // Set response headers
    res.header("Content-Type", "text/csv");
    res.attachment("candidate_seat_management.csv");
    res.send(csv);
  });
});

app.get("/view-ip-list", (req, res) => {
  const query = `
      SELECT 
          biometric_id, 
          exam_centre_code, 
          exam_lab_code, 
          exam_seatno, 
          candidate_ipaddress 
      FROM 
          candidate_seat_management
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching IP list:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.status(200).json(results);
  });
});

app.get("/delete-seat/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM candidate_seat_management WHERE biometric_id = ?";

  const queryInsert = db.format(query, [id]);

  // console.log(query);
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }
    // Insert the exact formatted query into xml_feed
    insertIntoXmlFeed(queryInsert, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting feed table:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });
    return res
      .status(200)
      .json({ success: true, message: "Record deleted successfully." });
  });
});

app.put("/update-seat/:id", (req, res) => {
  const { id } = req.params;
  const { exam_lab_code, exam_seatno, candidate_ipaddress } = req.body;

  const query = `UPDATE candidate_seat_management SET exam_lab_code = ?, exam_seatno = ?, candidate_ipaddress = ? WHERE biometric_id = ?`;

  const queryInsert = db.format(query, [
    exam_lab_code,
    exam_seatno,
    candidate_ipaddress,
    id,
  ]);
  db.query(
    query,
    [exam_lab_code, exam_seatno, candidate_ipaddress, id],
    (err, result) => {
      if (err) {
        console.error("Error updating record:", err);
        return res.status(500).send("Database error.");
      }
      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(queryInsert, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting feed table:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      res.json({ success: true, message: "Record updated successfully." });
    }
  );
});

// GET endpoint to fetch a seat by ID
app.get("/get-seat/:id", (req, res) => {
  const seatId = req.params.id;

  const query = `
      SELECT 
          biometric_id, 
          exam_lab_code, 
          exam_seatno, 
          candidate_ipaddress 
      FROM 
          candidate_seat_management
      WHERE 
          biometric_id = ?
  `;

  db.query(query, [seatId], (err, results) => {
    if (err) {
      console.error("Error fetching seat by ID:", err);
      return res.status(500).json({ error: "Failed to fetch seat details" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Seat not found" });
    }
    res.json({ result: results[0] });
  });
});

const viewBioMetricData = (
  pattern = 0,
  status = 1,
  required = "",
  from = "",
  limit = "",
  removeCore = ""
) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT biometric_id, exam_centre_code, exam_lab_code, exam_seatno, candidate_ipaddress, status 
                 FROM candidate_seat_management`;

    if (removeCore === "") {
      sql += ` WHERE status = ${status}`;
    }
    if (pattern === 1 && removeCore === "") {
      sql += ` AND candidate_ipaddress = '${required}'`;
    } else if (pattern === 2) {
      sql += ` AND biometric_id = '${required}'`;
    } else if (pattern === 3) {
      sql += ` AND exam_lab_code = '${required}'`;
    } else if (pattern === 4) {
      sql += ` ${required}`;
    }

    if (from && limit) {
      sql += ` LIMIT ${from}, ${limit}`;
    }

    if (removeCore === 1) {
      sql += ` WHERE ${required}`;
    } else if (removeCore === 2) {
      sql += ` WHERE status = ${status} ORDER BY exam_lab_code, exam_seatno`;
    }

    if (removeCore === "") {
      sql += ` ORDER BY exam_lab_code, exam_seatno`;
    }

    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

app.get("/biometric-data", async (req, res) => {
  const { M, lab } = req.query;

  try {
    if (M == 3) {
      const activeData = await viewBioMetricData(0, 1, "", "", "", 2);
      const deactiveData = await viewBioMetricData(0, 2, "", "", "", 2);

      const activeOptions = activeData.filter(
        (row) => row.exam_lab_code === lab
      );
      const deactiveOptions = deactiveData.filter(
        (row) => row.exam_lab_code === lab
      );

      res.json({ activeOptions, deactiveOptions });
    }
  } catch (error) {
    console.error("Error fetching biometric data:", error);
    res.status(500).send("Server error");
  }
});

app.get("/examSettings", (req, res) => {
  const { variable } = req.query;
  console.log(variable);
  const query =
    "select variable_value from exam_settings where variable_name = ? ";

  db.query(query, [variable], (err, result) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .send(
          "Database query error : gettingVariableValue from exam_settings table -  failed"
        );
    }
    console.log(result[0]);
    return res.json({ value: result[0].variable_value });
  });
});

app.post("/updateExamSettings", (req, res) => {
  const { variable, value } = req.body;
  console.log(variable, value);
  const query =
    "update exam_settings set variable_value = ? where variable_name = ? ";
  db.query(query, [value, variable], (err, result) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .send(
          "Database query error : updatingVariableValue from exam_settings table -  failed"
        );
    }
    console.log(result[0]);
    if (result.affectedRows > 0) {
      if (value == "Y") {
        return res.json({ returnValue: "Enabled" });
      }
      if (value == "N") {
        return res.json({ returnValue: "Disabled" });
      }
    }
  });
});

app.get("/getCandidateCredentials", async (req, res) => {
  function getRandomValue(array) {
    if (!Array.isArray(array)) {
      return null; // Return null if it's not an array
    }
    const randomIndex = Math.floor(Math.random() * array.length); // Get a random index
    return array[randomIndex]; // Return the value at the random index
  }
  const qpActivatedTime = async () => {
    const qpActivatedTimeQuery =
      "Select SUBSTRING_INDEX(download_sec,'-',-1) as exTime from qp_download where download_sec like '%Activated%' order by id desc limit 1";
    return new Promise((resolve, reject) => {
      db.query(qpActivatedTimeQuery, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        return resolve(result[0].exTime);
      });
    });
  };
  const getCandidate = (examTime) => {
    const getCandidateQuery =
      "select distinct a.membership_no as membershipNo,b.raw_password from iib_candidate_iway a join iib_candidate b on a.membership_no = b.membership_no where b.password!='' and a.membership_no NOT IN( select distinct(membership_no) from iib_candidate_tracking UNION select distinct(membership_no) from iib_candidate_test) and exam_time= ? ";
    return new Promise((resolve, reject) => {
      db.query(getCandidateQuery, [examTime], (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        return resolve(result);
      });
    });
  };

  const examTime = await qpActivatedTime();
  if (examTime.length > 0) {
    const membershipNos = await getCandidate(examTime);
    if (membershipNos.length > 0) {
      const membershipNoArray = membershipNos.map((memNo) => memNo);
      // console.log(membershipNoArray);
      const { membershipNo, raw_password } = getRandomValue(membershipNoArray);
      const decodedPass = Buffer.from(raw_password, "base64").toString("utf-8");

      console.log(membershipNo, decodedPass);
      res.json({
        membershipNo,
        decodedPass,
        message: "ok",
      });
    } else {
      res.json({
        message: "No candidate found",
      });
    }
  }
});

app.get("/ontheflyqpgen/", async (req, res) => {
  const { membershipNo, examCode, subjectCode, medium, totalMarks } = req.query;
  let iCount = 1;
  let memTicketno;
  let arrayOfQuestions = [];
  let insertIntoQPDetailsquery = "";
  // console.log(membershipNo,subjectCode)
  try {
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      // return array;
    };
    const getMemTicketNo = async (memNo, subjectCode) => {
      const query =
        "SELECT a.address3 as memTicketNo, c.slot_no as slotNo FROM iib_candidate a JOIN iib_candidate_iway b  ON a.membership_no = b.membership_no JOIN iib_exam_slots c ON c.slot_time = b.exam_time where a.membership_no= ? and b.subject_code= ?";

      return new Promise((resolve, reject) => {
        db.query(query, [memNo, subjectCode], (err, result) => {
          if (err) {
            console.error("Database query failed:", err);
            return reject(
              res.status(500).send("Database query error : getMemTicketNo")
            );
          }

          return resolve({
            memTicketNo: result[0].memTicketNo,
            slotNo: result[0].slotNo,
          });
        });
      });
    };
    const gettingQPStructure = async (subjectCode) => {
      const qpStructureQry =
        "SELECT exam_code, subject_code, section_code, marks, sum(no_of_questions) as no_of_questions, case_id FROM iib_qp_weightage WHERE subject_code = ? group by 1,2,3,4";
      return new Promise((resolve, reject) => {
        db.query(qpStructureQry, [subjectCode], (err, res) => {
          // console.log("helo grom gettingQPStrucure")
          if (err) {
            console.error("Database query failed:", err);
            return reject(
              res.status(500).send("Database query error : qpStructureQry")
            );
          }
          return resolve({ qpStructureLength: res.length, qpStructures: res });
        });
      });
    };
    const getAnswerShuffling = async (subjectCode) => {
      const getAnswerShufflingquery =
        "select answer_shuffling from iib_exam_subjects where subject_code = ?";
      return new Promise((resolve, reject) => {
        db.query(getAnswerShufflingquery, [subjectCode], (err, result) => {
          if (err) {
            console.error("Database query failed:", err);
            return reject(
              res
                .status(500)
                .send("Database query error : getAnswerShufflingquery")
            );
          }
          return resolve(result[0].answer_shuffling);
        });
      });
    };
    const insertingInQPTable = async (
      questionPaperNo,
      examCode,
      subjectCode,
      totalMarks,
      isSample,
      medium
    ) => {
      console.log(questionPaperNo);
      let choosenMedium;
      if (medium == "EN") {
        choosenMedium = "E";
      } else {
        choosenMedium = "H";
      }
      try {
        const insertingInQPTableQry =
          "INSERT INTO iib_question_paper (question_paper_no,exam_code,subject_code,total_marks,sample,enabled,online,assigned,medium_code) VALUES (?,?,?,?,?,'Y','Y','N',?)";

        const formattedinsertingInQPTableQry = db.format(
          insertingInQPTableQry,
          [
            questionPaperNo,
            examCode,
            subjectCode,
            totalMarks,
            isSample,
            choosenMedium,
          ]
        );

        return new Promise((resolve, reject) => {
          db.query(
            insertingInQPTableQry,
            [
              questionPaperNo,
              examCode,
              subjectCode,
              totalMarks,
              isSample,
              choosenMedium,
            ],
            (err, res) => {
              if (err) {
                console.error("Database query failed:", err);
                return reject(
                  new Error(
                    "Database query error: Insert on iib_question_paper failed"
                  )
                );
              }
              // Insert update query into xml_feed
              insertIntoXmlFeed(formattedinsertingInQPTableQry, (err) => {
                if (err) {
                  console.error(
                    "Error inserting update query into xml_feed:",
                    err
                  );
                  return reject(
                    new Error("Error inserting update query into xml_feed")
                  );
                }
              });
              return resolve(res.affectedRows);
            }
          );
        });
      } catch (err) {
        console.log(err);
      }
    };
    const gettingQuesID = async (
      examCode,
      subjectCode,
      sectionCode,
      sectionMarks,
      questionCount
    ) => {
      // console.log(examCode,
      //   subjectCode,
      //   sectionCode,
      //   sectionMarks,
      //   questionCount)
      const gettingQuesIDQuery =
        "SELECT question_id, question_code FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND  marks= ? ORDER BY rand() LIMIT ?";
      return new Promise((resolve, reject) => {
        db.query(
          gettingQuesIDQuery,
          [examCode, subjectCode, sectionCode, sectionMarks, questionCount],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send("Database query error : gettingQuesIDQuery -  failed")
              );
            }
            // console.log(result)
            return resolve(result);
          }
        );
      });
    };
    const gettingCaseIdQuestions = async (
      examCode,
      subjectCode,
      sectionCode,
      sectionMarks
    ) => {
      const gettingCaseIdQuestionsQuery =
        "SELECT  case_id from iib_qp_weightage where exam_code=? AND subject_code=? AND section_code= ? AND marks=?";
      return new Promise((resolve, reject) => {
        db.query(
          gettingCaseIdQuestionsQuery,
          [examCode, subjectCode, sectionCode, sectionMarks],
          (err, res) => {
            if (err) {
              console.error("Database query failed:", err);
              res
                .status(500)
                .send("Database query error : gettingQuesIDQuery -  failed");
              return reject();
            }
            const getCaseCount = res.length;
            const result = queryAsync(
              "SELECT  case_id from iib_sc_details where exam_code=? AND subject_code= ? AND section_code= ? AND case_marks= ? ORDER BY rand() LIMIT ?",
              [examCode, subjectCode, sectionCode, sectionMarks, getCaseCount]
            );
            return resolve(result);
          }
        );
      });
    };
    const getQuestCaseSecCode = async (examCode, subjectCode, listCaseID) => {
      const getQuestCaseSecCodequery = ` SELECT question_id,case_id,section_code from iib_sq_details where exam_code= ? and subject_code=? and case_id IN (${listCaseID})`;
      return new Promise((resolve, reject) => {
        db.query(
          getQuestCaseSecCodequery,
          [examCode, subjectCode, listCaseID],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send(
                    "Database query error : getQuestCaseSecCodequery -  failed"
                  )
              );
            }
            return resolve(result);
          }
        );
      });
    };
    const getCaseDetails = async (examCode, subjectCode, listCaseID) => {
      const getCaseDetailsquery = `SELECT a.case_id as case_id,sum(a.marks) as total_marks ,count(1) as qpcount,a.section_code as section_code,b.sub_section_code as sub_section_code ,b.difficulty as difficulty from iib_sq_details a, iib_sc_details b where a.exam_code= ? and a.exam_code=b.exam_code and a.subject_code=? and a.subject_code=b.subject_code and a.case_id=b.case_id and a.case_id IN (${listCaseID}) group by a.case_id`;
      return new Promise((resolve, reject) => {
        db.query(
          getCaseDetailsquery,
          [examCode, subjectCode, listCaseID],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send("Database query error : getCaseDetailsquery -  failed")
              );
            }
            return resolve(result);
          }
        );
      });
    };
    const getQuesCaseIds = async (
      examCode,
      subjectCode,
      csectionCode,
      caseid
    ) => {
      // console.log(examCode,subjectCode,csectionCode,caseid)
      const getQuesCaseIdsquery =
        "SELECT question_id as questionID, case_id as caseID,marks as sectionMarks FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND case_id = ?";
      return new Promise((resolve, reject) => {
        db.query(
          getQuesCaseIdsquery,
          [examCode, subjectCode, csectionCode, caseid],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send("Database query error : getQuesCaseIdsquery -  failed")
              );
            }
            return resolve(result);
          }
        );
      });
    };
    const getOptions = async (
      examCode,
      subjectCode,
      sectionCode,
      questionID
    ) => {
      const getOptionsquery =
        "SELECT option_1, option_2, option_3, option_4, option_5 FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
      return new Promise((resolve, reject) => {
        db.query(
          getOptionsquery,
          [examCode, subjectCode, sectionCode, questionID],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send("Database query error : getQuesCaseIdsquery -  failed")
              );
            }
            // console.log(result[0])
            return resolve(result);
          }
        );
      });
    };
    const getShufflingQuestionType = async (
      examCode,
      subjectCode,
      sectionCode,
      questionID
    ) => {
      const getShufflingQuestionTypequery =
        "SELECT shuffling ,question_type FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
      return new Promise((resolve, reject) => {
        db.query(
          getShufflingQuestionTypequery,
          [examCode, subjectCode, Number(sectionCode), questionID],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send(
                    "Database query error : getShufflingQuestionTypequery -  failed"
                  )
              );
            }
            // console.log(result)
            return resolve(result);
          }
        );
      });
    };
    const insertIntoQPDetails = async (query) => {
      return new Promise((resolve, reject) => {
        db.query(query, [], (err, result) => {
          if (err) {
            console.error("Database query failed:", err);
            return reject(
              res
                .status(500)
                .send(
                  "Database query error : getShufflingQuestionTypequery -  failed"
                )
            );
          }
          return resolve(result.affectedRows);
        });
      });
    };
    const updateMemInQP = async (
      updateMemInQPquery,
      membershipNo,
      questionPaperNo
    ) => {
      // console.log(updateMemInQPquery,
      //   membershipNo,
      //   questionPaperNo)
      return new Promise((resolve, reject) => {
        db.query(
          updateMemInQPquery,
          [membershipNo, questionPaperNo],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send("Database query error : updateMemInQPquery -  failed")
              );
            }
            console.log(result);
            return resolve(result.affectedRows);
          }
        );
      });
    };
    const getDisplaySecNavAndTimeValue = async (subjectCode) => {
      const getDisplaySecNavAndTimeValuequery =
        "SELECT display_sec_nav, display_sec_timer FROM iib_exam_subjects WHERE subject_code = ?";
      return new Promise((resolve, reject) => {
        db.query(
          getDisplaySecNavAndTimeValuequery,
          [subjectCode],
          (err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(
                res
                  .status(500)
                  .send(
                    "Database query error : getDisplaySecNavAndTimeValuequery -  failed"
                  )
              );
            }
            return resolve(result[0]);
          }
        );
      });
    };

    const { memTicketNo, slotNo } = await getMemTicketNo(
      membershipNo,
      subjectCode
    );
    const { display_sec_nav, display_sec_timer } =
      await getDisplaySecNavAndTimeValue(subjectCode);

    // console.log(memTicketNo, slotNo);
    const memshipNoTicketNo = memTicketNo.split(":");
    memTicketno = slotNo + memshipNoTicketNo[1].trim();
    const questionPaperNo = memTicketno;
    console.log(questionPaperNo.length);
    // console.log(memshipNoTicketNo,questionPaperNo);
    const { qpStructureLength, qpStructures } =
      await gettingQPStructure(subjectCode);

    const answershuffling = await getAnswerShuffling(subjectCode);

    if (qpStructureLength == 0) {
      console.error("QP weightage structure is not there");
      return res.status(500).send("Database query error : qpStructureQry");
    } else {
      if (totalMarks == "") {
        totalMarks = 0;
      }

      const resultInsertingQPTable = await insertingInQPTable(
        questionPaperNo,
        examCode,
        subjectCode,
        totalMarks,
        "N",
        medium
      );
      // console.log(resultInsertingQPTable)
      if (resultInsertingQPTable != 0) {
        console.log("inserted into iib_question_paper");
      }

      let aAllQuestions = [];
      let aQuestions = [];
      let arrcasequestionID = [];
      let count = 0;

      let examCodeOfQPStructure,
        subjectCodeOfQPStructure,
        sectionCode,
        sectionMarks,
        questionID,
        questionCode,
        questionCount;
      for (const qpStructure of qpStructures) {
        examCodeOfQPStructure = qpStructure.exam_code;
        subjectCodeOfQPStructure = qpStructure.subject_code;
        sectionCode = qpStructure.section_code;
        sectionMarks = qpStructure.marks;
        questionCount = qpStructure.no_of_questions;
        sectionType = qpStructure.case_id;
        // console.log(examCodeOfQPStructure,subjectCodeOfQPStructure,sectionCode,sectionMarks,questionCount,typeof sectionType)
        if (sectionType == null || sectionType == "NULL") {
          const questionIdCodes = await gettingQuesID(
            examCodeOfQPStructure,
            subjectCodeOfQPStructure,
            sectionCode,
            sectionMarks,
            questionCount
          );
          // console.log(questionIdCodes);
          if (questionIdCodes.length > 0) {
            questionIdCodes.forEach((questionIdCode) => {
              questionID = questionIdCode.question_id;
              questionCode = questionIdCode.question_code;
              // console.log(questionID, questionCode)
              if (!aQuestions[questionID]) {
                aQuestions[questionID] = [[], [], [], []];
              }
              // console.log(aQuestions)  ;
              aQuestions[questionID][0].push(questionID);
              aQuestions[questionID][1].push(sectionCode);
              aQuestions[questionID][2].push(sectionMarks);
              aQuestions[questionID][3].push(0);
              // console.log("asdf",aQuestions);
              // aAllQuestions[count] = [];
              if (!aAllQuestions[count]) {
                aAllQuestions[count] = [[], [], []];
              }
              aAllQuestions[count][0].push(questionID);
              aAllQuestions[count][1].push(questionID);
              aAllQuestions[count][2].push(0);
              count++;
            });
          }
        } //section type 'G' if ends here
        // console.log("aquestions",aQuestions);
        // console.log("aAllquestions",aAllQuestions)
        if (sectionType != null || sectionType != "NULL") {
          const caseIdQuestions = await gettingCaseIdQuestions(
            examCodeOfQPStructure,
            subjectCodeOfQPStructure,
            sectionCode,
            sectionMarks
          );
          // console.log(caseIdQuestions);
          for (const caseIdQuestion of caseIdQuestions) {
            // arrcasequestionID[sectionCode]=[];
            if (!Array.isArray(arrcasequestionID[sectionCode])) {
              arrcasequestionID[sectionCode] = [];
            }
            arrcasequestionID[sectionCode].push(caseIdQuestion.case_id);
          }
          // console.log("arrcasequestionID",arrcasequestionID)
        } //section type 'C' if ends here
      }

      let listCaseIDArr = [];
      let arrcasecnt = arrcasequestionID.length;
      arrcasequestionID.forEach((arcaskey) => {
        // console.log(arcaskey);
        // Check if the current value is a non-empty array
        if (Array.isArray(arcaskey) && arcaskey.length > 0) {
          // Merge the current array into listCaseIDArr
          listCaseIDArr = listCaseIDArr.concat(arcaskey);
        }
      });

      let listCaseID;
      let arrcaseID;
      let arrCqid = [];
      let arrCase = [{}];
      let arrSecCase = [[], []];
      let allIDs = [];
      //  console.log(listCaseIDArr)
      if (listCaseIDArr.length > 0) {
        listCaseID = listCaseIDArr.join(",");
        arrcaseID = listCaseID.split(",");

        const questCaseSecCodeValues = await getQuestCaseSecCode(
          examCodeOfQPStructure,
          subjectCodeOfQPStructure,
          listCaseID
        );
        // console.log(questCaseSecCodeValues)

        for (const questCaseSecCodeValue of questCaseSecCodeValues) {
          const caseId = questCaseSecCodeValue.case_id;
          const sectionCode = questCaseSecCodeValue.section_code;
          const questionId = questCaseSecCodeValue.question_id;

          // Ensure arrCqid[caseId] is initialized as an array
          if (!Array.isArray(arrCqid[caseId])) {
            arrCqid[caseId] = [];
          }

          // Append or update the array with the question_id
          if (arrCqid[caseId].length > 0) {
            arrCqid[caseId].push(`${arrCqid[caseId].join(",")},${questionId}`);
          } else {
            arrCqid[caseId].push(questionId);
          }

          // Ensure arrSecCase[sectionCode] is initialized
          if (!arrSecCase[sectionCode]) {
            arrSecCase[sectionCode] = {};
          }

          // Ensure arrSecCase[sectionCode][caseId] is initialized as an array
          if (!Array.isArray(arrSecCase[sectionCode][caseId])) {
            arrSecCase[sectionCode][caseId] = [];
          }

          // Add the question_id to the section-case mapping
          arrSecCase[sectionCode][caseId].push(questionId);
        }

        // console.log("arrcqid" + arrCqid)
        const caseDetails = await getCaseDetails(
          examCodeOfQPStructure,
          subjectCodeOfQPStructure,
          listCaseID
        );
        // console.log(caseDetails);
        for (const caseDetail of caseDetails) {
          const caseId = caseDetail.case_id;
          // Ensure arrCase[caseId] is initialized as an object
          if (!arrCase[caseId]) {
            arrCase[caseId] = {
              marks: "",
              questionscount: "",
              sectioncode: "",
              subsectioncode: "",
              priority: "",
            };
          }

          // Populate the arrays within arrCase[caseId]
          arrCase[caseId].marks = caseDetail.total_marks;
          arrCase[caseId].questionscount = caseDetail.qpcount;
          arrCase[caseId].sectioncode = Number(caseDetail.section_code);
          arrCase[caseId].subsectioncode = caseDetail.sub_section_code;
          arrCase[caseId].priority = caseDetail.difficulty;
        }
        // console.log("arrCase" + JSON.stringify(arrCase))

        // console.log("arrCase" + arrCase)
        let caseid, csectionCode, csubSectionCode, cpriority;

        let caseCnt;
        // console.log(arrcaseID)
        for (let i = 0; i < arrcaseID.length; i++) {
          caseid = arrcaseID[i];
          csectionCode = arrCase[caseid].sectioncode;
          csubSectionCode = arrCase[caseid].subsectioncode;
          cpriority = arrCase[caseid].priority;

          const quesCaseIds = await getQuesCaseIds(
            examCodeOfQPStructure,
            subjectCodeOfQPStructure,
            csectionCode,
            caseid
          );
          // console.log(quesCaseIds)

          if (quesCaseIds.length > 0) {
            // Initialize allIDs if it is not already defined
            let allIDs = [];
            let first = 0,
              firstID = null;
            caseCnt = count;

            // Iterate over each quesCaseId in quesCaseIds
            quesCaseIds.forEach((quesCaseId) => {
              if (first == 0) {
                first = 1;
                firstID = quesCaseId.questionID; // Set the first questionID
              }

              // Initialize aQuestions[quesCaseId.questionID] if not already initialized
              if (!aQuestions[quesCaseId.questionID]) {
                aQuestions[quesCaseId.questionID] = [[], [], [], [], [], []];
              }
              // console.log(first,firstID)
              // console.log(quesCaseId);
              // Populate the arrays within aQuestions[quesCaseId.questionID]
              aQuestions[quesCaseId.questionID][0].push(quesCaseId.questionID);
              aQuestions[quesCaseId.questionID][1].push(csectionCode);
              aQuestions[quesCaseId.questionID][2].push(
                quesCaseId.sectionMarks
              );
              aQuestions[quesCaseId.questionID][3].push(quesCaseId.caseID);
              aQuestions[quesCaseId.questionID][4].push(csubSectionCode);
              aQuestions[quesCaseId.questionID][5].push(cpriority);
              // console.log(aQuestions)
              // Add the questionID to allIDs
              allIDs.push(quesCaseId.questionID);
              caseCnt++;
            });
            // console.log(aQuestions)
            allIDs.sort((a, b) => a - b);
            // console.log(allIDs);
            let strAllIDs = allIDs.join(",");
            if (!aAllQuestions[count]) {
              aAllQuestions[count] = [[], [], []];
            }
            // Store the results in aAllQuestions
            aAllQuestions[count][0].push(firstID);
            aAllQuestions[count][1].push(strAllIDs);
            aAllQuestions[count][2].push(quesCaseIds[0].caseID);
            // Increment the counter
            count++;
            first = 0;
          }
        }
        // console.log(aAllQuestions.length)
      }
      let nQuestions = aQuestions.length;
      let nQs = aAllQuestions.length;
      // let questionID;
      let strQuestionIDs, actualCnt, actualRandQuestions, caseIndex;
      // let sectionCode,
      //   sectionMarks,
      let caseID,
        strOptOrder,
        ansshuffle = 0;

      let aRandQuestions = [...Array(nQs).keys()]; // [0, 1, 2, ..., nQs-1]
      console.log(aRandQuestions);
      // Step 2: Shuffle the array (like shuffle)
      for (let i = aRandQuestions.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [aRandQuestions[i], aRandQuestions[j]] = [
          aRandQuestions[j],
          aRandQuestions[i],
        ];
      }
      // console.log("aRandques",aRandQuestions);
      let index;
      // let insertIntoQPDetailsquery = "";
      for (let qCount = 0; qCount < nQs; qCount++) {
        qCount + 1;
        if (Array.isArray(aRandQuestions)) {
          index = aRandQuestions[qCount];
        } else {
          index = aRandQuestions;
        }
        // console.log(index);
        let actualQuestions = [];
        // console.log(aAllQuestions);
        strQuestionIDs = aAllQuestions[index][1].toString();
        actualQuestions = strQuestionIDs.split(",");
        // console.log(actualQuestions);

        if (Array.isArray(actualQuestions)) {
          actualCnt = actualQuestions.length;
          // Randomization in JavaScript
          shuffleArray(actualQuestions); // Shuffle the array in place
          // Step 4: Select the first `actualCnt` elements (which would be the entire array)
          actualRandQuestions = actualQuestions.slice(0, actualCnt);
          // console.log(actualRandQuestions + "random")
        } else {
          actualCnt = 1;
        }
        for (let cntIDs = 0; cntIDs < actualCnt; cntIDs++) {
          if (Array.isArray(actualRandQuestions)) {
            caseIndex = actualRandQuestions[cntIDs];
            // console.log(caseIndex);
          } else {
            caseIndex = actualRandQuestions;
            // console.log(caseIndex)
          }
          if (Array.isArray(actualQuestions)) {
            questionID = actualQuestions[cntIDs];
            // console.log("questionID"+questionID)
          } else {
            questionID = actualQuestions;
            // console.log(questionID)
          }
          if (questionID != "") {
            sectionCode = aQuestions[questionID][1];
            sectionMarks = aQuestions[questionID][2];
            caseID = aQuestions[questionID][3];
            strOptOrder = "";

            const options = await getOptions(
              examCodeOfQPStructure,
              subjectCodeOfQPStructure,
              sectionCode,
              questionID
            );
            // console.log(options)
            let input = [];
            let rand_keys = [];

            // console.log(options);
            for (let optCnt = 1; optCnt <= 5; optCnt++) {
              let optionKey = `option_${optCnt}`; // Creates option_1, option_2, etc.
              // console.log(options[0][optionKey].length); // Accessing the property dynamically

              if (options[0][optionKey].length > 0) {
                input[optCnt] = optCnt;
              }
            }
            input = input.filter((item) => item !== undefined);
            // rand_keys = [...Array(input.length).keys()];
            // console.log(rand_keys)
            // return false;
            console.log(answershuffling + "answershuffling");
            if (answershuffling == "Y") {
              // shuffleArray(rand_keys);
              shuffleArray(input);
            }
            // console.log(rand_keys);
            // console.log( examCodeOfQPStructure,
            //   subjectCodeOfQPStructure,
            //   sectionCode,
            //   questionID)
            const shufflingQuestionTypes = await getShufflingQuestionType(
              examCodeOfQPStructure,
              subjectCodeOfQPStructure,
              sectionCode,
              questionID
            );
            for (const shufflingQuestionType of shufflingQuestionTypes) {
              if (
                shufflingQuestionType.question_type == "N" ||
                shufflingQuestionType.question_type == "R"
              ) {
                strOptOrder = "";
              } else {
                if (ansshuffle == "2") {
                  strOptOrder = "1,2,3,4,5";
                } else {
                  if (shufflingQuestionType.shuffling == "Y") {
                    // console.log("helo")
                    // strOptOrder = rand_keys.join(",");
                    strOptOrder = input.join(",");
                  } else {
                    strOptOrder = "1,2,3,4,5";
                  }
                }
                // console.log(strOptOrder)
              }
              if (display_sec_nav == "Y" || display_sec_timer == "Y") {
                arrayOfQuestions.push([
                  Number(questionPaperNo),
                  Number(subjectCodeOfQPStructure),
                  Number(sectionCode),
                  Number(questionID),
                  strOptOrder,
                  Number(iCount),
                  Number(caseID),
                ]);
              } else {
                if (insertIntoQPDetailsquery == "") {
                  // console.log("inside"+questionPaperNo)
                  insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},"${formattedTime}")`;
                } else {
                  insertIntoQPDetailsquery += `,(${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},"${formattedTime}")`;
                }
                iCount++;
              }
            }
          }
        }
      }
      // console.log(questionPaperNo);
      // console.log(insertIntoQPDetailsquery);
      if (display_sec_nav == "Y" || display_sec_timer == "Y") {
        //to sort the array based on the section code(for section navigation)
        arrayOfQuestions.sort((a, b) => a[2] - b[2]);
        // console.log(arrayOfQuestions);
        for (let i = 0; i < arrayOfQuestions.length; i++) {
          if (insertIntoQPDetailsquery == "") {
            insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${arrayOfQuestions[i][0]}, ${arrayOfQuestions[i][1]}, ${arrayOfQuestions[i][2]}, ${arrayOfQuestions[i][3]}, '${arrayOfQuestions[i][4]}',${i + 1}, ${arrayOfQuestions[i][6]},"${formattedTime}")`;
          } else {
            insertIntoQPDetailsquery += `,(${arrayOfQuestions[i][0]}, ${arrayOfQuestions[i][1]}, ${arrayOfQuestions[i][2]}, ${arrayOfQuestions[i][3]}, '${arrayOfQuestions[i][4]}', ${i + 1}, ${arrayOfQuestions[i][6]},"${formattedTime}")`;
          }
        }
      }
      const insertIntoQPDetail = await insertIntoQPDetails(
        insertIntoQPDetailsquery
      );
      // Insert update query into xml_feed
      await new Promise((resolve, reject) => {
        insertIntoXmlFeed(insertIntoQPDetail, (err) => {
          if (err) {
            return reject(
              new Error("Error inserting update query into xml_feed")
            );
          }
          resolve();
        });
      });
      if (insertIntoQPDetail <= 0) {
        return false;
      }
      insertIntoQPDetailsquery = "";

      const updateMemInQPquery =
        "UPDATE iib_question_paper SET complete='Y', assigned='Y', membership_no= ? WHERE question_paper_no= ?";

      const updateMemNoInQP = await updateMemInQP(
        updateMemInQPquery,
        membershipNo,
        questionPaperNo
      );

      const formattedupdateMemInQPquery = db.format(updateMemInQPquery, [
        membershipNo,
        questionPaperNo,
      ]);
      await new Promise((resolve, reject) => {
        insertIntoXmlFeed(formattedupdateMemInQPquery, (err) => {
          if (err) {
            return reject(
              new Error("Error inserting update query into xml_feed")
            );
          }
          resolve();
        });
      });
      if (updateMemNoInQP <= 0) {
        return false;
      }

      return res.json({ question_paper_no: questionPaperNo });
    }
  } catch (err) {
    console.error("Error while generating question paper", err);
    return res.status(500).send("Error while generating question paper");
  }
});

const csvUpload = multer({
  dest: "uploads/", // Temporary upload directory
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".csv") {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});
// app.post("/scannerUpload", csvUpload.single("userFile"), async (req, res) => {
//   const uploadedFile = req.file;

//   if (!uploadedFile) {
//     return res
//       .status(400)
//       .json({ message: "File not found or invalid format" });
//   }

//   const newFilePath = path.resolve("C:/pro/itest/activate/scan_input.csv");

//   try {
//     // Read file contents
//     const data = fs.readFileSync(uploadedFile.path, "utf8").split("\n");
//     const old_ip_array = data.map((line) => line.split(",")[0].trim());

//     // Validate each IP address
//     const invalidIP = old_ip_array.find(
//       (ip) =>
//         !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
//           ip
//         )
//     );

//     if (invalidIP) {
//       return res
//         .status(400)
//         .json({ message: `Invalid IP found in file: ${invalidIP}` });
//     }

//     // Move the uploaded file to the desired location with the correct filename
//     fs.renameSync(uploadedFile.path, newFilePath);

//     return res.json({ message: "File uploaded and processed successfully!" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error processing the file." });
//   } finally {
//     // Clean up the temporary file if it still exists
//     if (fs.existsSync(uploadedFile.path)) {
//       fs.unlinkSync(uploadedFile.path);
//     }
//   }
// });

app.post("/scannerUpload", (req, res) => {
  if (!req.files || !req.files.userFile) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  console.log(req.files.userFile);

  const csvFile = req.files.userFile;
  const filePath = path.resolve("C:/pro/itest/activate/scan_input.csv");

  try {
    // Save the uploaded file
    csvFile.mv(filePath);

    // Read file contents
    const data = fs.readFileSync(filePath, "utf8").split("\n");
    const old_ip_array = data.map((line) => line.split(",")[0].trim());

    // Validate each IP address
    const invalidIP = old_ip_array.find(
      (ip) =>
        !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
          ip
        )
    );

    if (invalidIP) {
      fs.unlinkSync(filePath); // Delete invalid file
      return res
        .status(400)
        .json({ message: `Invalid IP found in file: ${invalidIP}` });
    }

    return res.json({ message: "File uploaded and processed successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error processing the file." });
  }
});

app.get("/examSettings", (req, res) => {
  const { variable } = req.query;
  console.log(variable);
  const query =
    "select variable_value from exam_settings where variable_name = ? ";

  db.query(query, [variable], (err, result) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .send(
          "Database query error : gettingVariableValue from exam_settings table -  failed"
        );
    }
    console.log(result[0]);
    return res.json({ value: result[0].variable_value });
  });
});

app.post("/updateExamSettings", (req, res) => {
  const { variable, value } = req.body;
  console.log(variable, value);
  const query =
    "update exam_settings set variable_value = ? where variable_name = ? ";
  db.query(query, [value, variable], (err, result) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .send(
          "Database query error : updatingVariableValue from exam_settings table -  failed"
        );
    }
    console.log(result[0]);
    if (result.affectedRows > 0) {
      if (value == "Y") {
        return res.json({ returnValue: "Enabled" });
      }
      if (value == "N") {
        return res.json({ returnValue: "Disabled" });
      }
    }
  });
});

app.get("/getCandidateCredentials", async (req, res) => {
  function getRandomValue(array) {
    if (!Array.isArray(array)) {
      return null; // Return null if it's not an array
    }
    const randomIndex = Math.floor(Math.random() * array.length); // Get a random index
    return array[randomIndex]; // Return the value at the random index
  }
  const qpActivatedTime = async () => {
    const qpActivatedTimeQuery =
      "Select SUBSTRING_INDEX(download_sec,'-',-1) as exTime from qp_download where download_sec like '%Activated%' order by id desc limit 1";
    return new Promise((resolve, reject) => {
      db.query(qpActivatedTimeQuery, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        return resolve(result[0].exTime);
      });
    });
  };
  const getCandidate = (examTime) => {
    const getCandidateQuery =
      "select distinct a.membership_no as membershipNo,b.raw_password from iib_candidate_iway a join iib_candidate b on a.membership_no = b.membership_no where b.password!='' and a.membership_no NOT IN( select distinct(membership_no) from iib_candidate_tracking UNION select distinct(membership_no) from iib_candidate_test) and exam_time= ? ";
    return new Promise((resolve, reject) => {
      db.query(getCandidateQuery, [examTime], (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        return resolve(result);
      });
    });
  };

  const examTime = await qpActivatedTime();
  if (examTime.length > 0) {
    const membershipNos = await getCandidate(examTime);
    if (membershipNos.length > 0) {
      const membershipNoArray = membershipNos.map((memNo) => memNo);
      // console.log(membershipNoArray);
      const { membershipNo, raw_password } = getRandomValue(membershipNoArray);
      const decodedPass = Buffer.from(raw_password, "base64").toString("utf-8");

      console.log(membershipNo, decodedPass);
      res.json({
        membershipNo,
        decodedPass,
        message: "ok",
      });
    } else {
      res.json({
        message: "No candidate found",
      });
    }
  }
});
app.get("/block-candidate-ip", (req, res) => {
  let selectedips;

  try {
    selectedips = JSON.parse(req.query.selectedips); // Parse JSON string into an array
    // Extract only the `value` properties
    selectedips = selectedips.map((item) => item.value);
  } catch (error) {
    console.error("Error parsing selected IPs:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid IP selection format." });
  }

  const query = `
      UPDATE candidate_seat_management SET status = ? WHERE biometric_id IN (?)`;

  const updatestatus = "2";

  if (!Array.isArray(selectedips) || selectedips.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No IPs provided." });
  }

  const formattedquery = db.format(query, [updatestatus, selectedips]);

  db.query(query, [updatestatus, selectedips], (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    insertIntoXmlFeed(formattedquery, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting feed table:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });
    res.json({
      success: true,
      message: "Record updated successfully.",
      affectedRows: result.affectedRows,
    });
  });
});

app.get("/unblock-candidate-ip", (req, res) => {
  let selectedips;

  try {
    selectedips = JSON.parse(req.query.selectedips); // Parse JSON string into an array
    // Extract only the `value` properties
    selectedips = selectedips.map((item) => item.value);
  } catch (error) {
    console.error("Error parsing selected IPs:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid IP selection format." });
  }

  const query = `
      UPDATE candidate_seat_management SET status = ? WHERE biometric_id IN (?)`;

  const updatestatus = "1";

  if (!Array.isArray(selectedips) || selectedips.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No IPs provided." });
  }

  const formattedquery = db.format(query, [updatestatus, selectedips]);

  db.query(query, [updatestatus, selectedips], (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    insertIntoXmlFeed(formattedquery, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting feed table:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });

    res.json({
      success: true,
      message: "Record updated successfully.",
      affectedRows: result.affectedRows,
    });
  });
});

app.post("/submit-biometric-ips", (req, res) => {
  const serverIPs = req.body.server_ips ? req.body.server_ips.trim() : "";
  const splitIPs = serverIPs.split(";");

  let validIP = true;

  // Validate each IP
  splitIPs.forEach((ip) => {
    if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      validIP = false;
    }
  });

  if (validIP) {
    // Clear old IPs and insert new ones
    const queryTruncate = "TRUNCATE TABLE biometric_servers";
    db.query(queryTruncate, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error truncating table." });
      }

      const queryInsert = `INSERT INTO biometric_servers (server_ips, date_created)VALUES (?, ?)`;
      // const formattedTime = new Date().toISOString(); // Use current timestamp in ISO format
      const formattedqueryInsert = db.format(queryInsert, [
        serverIPs,
        formattedTime,
      ]);

      db.query(queryInsert, [serverIPs, formattedTime], (err) => {
        if (err) {
          return res.status(500).json({ message: "Error inserting IPs." });
        }
        new Promise((resolve, reject) => {
          insertIntoXmlFeed(formattedqueryInsert, (err) => {
            if (err) {
              return reject(
                new Error("Error inserting update query into xml_feed")
              );
            }
            resolve();
          });
        });
        res.json({ message: "IPs successfully saved.", server_ips: serverIPs });
      });
    });
  } else {
    res.status(400).json({ message: "Not a valid IP address!" });
  }
});

app.post("/manual-sync-api-import-csv", (req, res) => {
  if (!req.files || !req.files.csvFile) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const csvFile = req.files.csvFile;
  const filePath = `./doc/uploads/${csvFile.name}`;

  // Save the uploaded file to the specified location
  csvFile.mv(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to upload file.", details: err.message });
    }

    const validMimeTypes = [
      "text/x-comma-separated-values",
      "text/comma-separated-values",
      "application/octet-stream",
      "application/vnd.ms-excel",
      "application/x-csv",
      "text/x-csv",
      "text/csv",
      "application/csv",
      "application/excel",
      "application/vnd.msexcel",
      "text/plain",
    ];

    if (!validMimeTypes.includes(csvFile.mimetype)) {
      fs.unlinkSync(filePath); // Remove the uploaded file if invalid
      return res.status(400).json({ message: "Invalid file type." });
    }

    const memberNotExist = [];
    const batchwise = {};
    let affectedRows = 0;
    let i = 1;

    // Read and process the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (line) => {
        if (line) {
          const membershipNo = line["MEMBERSHIP NO"]?.trim();
          const seatNo = line["SEAT"]?.trim();
          const examDate = line["EXAMDATE"]?.trim();
          const batchTime = line["BATCHTIME"]?.trim();

          // Example log to verify extraction
          console.log("Extracted Values:", {
            membershipNo,
            seatNo,
            examDate,
            batchTime,
          });
          // const memberNo = membershipNo.split("_")[0];
          const memberNo = membershipNo;
          batchwise[batchTime] = i;

          // Check if membership exists
          const checkQuery = `SELECT id, labname FROM biometric_report_api WHERE membership_no = ? AND batch_time = ?`;
          db.query(checkQuery, [memberNo, batchTime], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
              const labname = results[0]["labname"];
              // console.log("labname",labname);
              const checkSeatQuery = `SELECT membership_no FROM biometric_report_api WHERE seat_no = ? AND labname = ? AND batch_time = ?`;
              db.query(
                checkSeatQuery,
                [seatNo, labname, batchTime],
                (err, seatResults) => {
                  if (err) throw err;

                  // console.log("Length",seatResults.length);

                  if (seatResults.length === 0) {
                    const updateQuery = `UPDATE biometric_report_api SET seat_no = ?, date_updated = ?WHERE membership_no = ? AND batch_time = ?`;

                    const formattedupdateQuery = db.format(updateQuery, [
                      seatNo,
                      formattedTime,
                      memberNo,
                      batchTime,
                    ]);

                    insertIntoXmlFeed(formattedupdateQuery, (err) => {
                      if (err) {
                        return db.rollback(() => {
                          console.error("Error inserting feed table:", err);
                          res
                            .status(500)
                            .json({ message: "Internal Server Error" });
                        });
                      }
                    });

                    db.query(
                      updateQuery,
                      [seatNo, formattedTime, memberNo, batchTime],
                      (err) => {
                        if (err) throw err;
                        affectedRows++;
                      }
                    );
                  } else {
                    memberNotExist.push(memberNo);
                  }
                }
              );
            } else {
              memberNotExist.push(memberNo);
            }
          });
          i++;
        }
      })
      .on("end", () => {
        // Batch-wise processing
        Object.keys(batchwise).forEach((batchTime) => {
          // console.log("TEST");
          const countQuery = `SELECT COUNT(DISTINCT membership_no) FROM biometric_report_api WHERE seat_no != '' AND batch_time = ?`;
          db.query(countQuery, [batchTime], (err, results) => {
            if (err) throw err;

            const numSeats = results[0]["COUNT(DISTINCT membership_no)"];

            const examName = process.env.CLIENT.split("_")[1].toUpperCase();
            // const examName = "NIBM";
            const examDate = formattedDate; // Replace with your logic
            const syncStatus = "P";

            console.log("Exam Values:", {
              examName,
              examDate,
              batchTime,
              numSeats,
            });

            const trackCheckQuery = `
                SELECT id FROM batchwise_tracking WHERE exam_name = ? AND exam_date = ? AND batch_time = ?
              `;

            db.query(
              trackCheckQuery,
              [examName, examDate, batchTime],
              (err, trackResults) => {
                if (err) throw err;

                console.log("trackCheckQuery", trackResults.length);

                if (trackResults.length > 0) {
                  const { id } = trackResults[0];
                  const updateTrackQuery = `UPDATE batchwise_tracking SET biometirc_user = ?, sync_biometirc_exam_status = ?, updated_on = ? WHERE id = ?`;
                  db.query(
                    updateTrackQuery,
                    [numSeats, syncStatus, formattedTime, id],
                    (err) => {
                      if (err) throw err;
                    }
                  );
                  const formattedupdateTrackQuery = db.format(
                    updateTrackQuery,
                    [numSeats, syncStatus, formattedTime, id]
                  );
                  // Insert update query into xml_feed
                  new Promise((resolve, reject) => {
                    insertIntoXmlFeed(formattedupdateTrackQuery, (err) => {
                      if (err) {
                        return reject(
                          new Error(
                            "Error inserting update query into xml_feed"
                          )
                        );
                      }
                      resolve();
                    });
                  });
                } else {
                  const insertTrackQuery = `
                    INSERT INTO batchwise_tracking (exam_name, exam_date, batch_time, biometirc_user, sync_biometirc_exam_status, added_on)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `;
                  db.query(
                    insertTrackQuery,
                    [
                      examName,
                      examDate,
                      batchTime,
                      numSeats,
                      syncStatus,
                      formattedTime,
                    ],
                    (err) => {
                      if (err) throw err;
                    }
                  );
                  const formattedupdateinsertTrackQuery = db.format(
                    insertTrackQuery,
                    [
                      examName,
                      examDate,
                      batchTime,
                      numSeats,
                      syncStatus,
                      formattedTime,
                    ]
                  );
                  // Insert update query into xml_feed
                  new Promise((resolve, reject) => {
                    insertIntoXmlFeed(
                      formattedupdateinsertTrackQuery,
                      (err) => {
                        if (err) {
                          return reject(
                            new Error(
                              "Error inserting update query into xml_feed"
                            )
                          );
                        }
                        resolve();
                      }
                    );
                  });
                }
              }
            );
          });
        });

        fs.unlinkSync(filePath); // Remove the uploaded file
        res.json({ message: "CSV processed successfully.", memberNotExist });
      })
      .on("error", (err) => {
        res.status(500).json({ message: "Error processing file.", error: err });
      });
  });
});

app.get("/biometric-data-template-download", (req, res) => {
  const filePath = path.join(__dirname, "doc", "BIOMETRIC_DATA.csv"); // Update the file path

  // Set the headers for downloading the file
  res.download(filePath, "BIOMETRIC_DATA.csv", (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the file");
    }
  });
});

app.get("/get-biometric-server-ips", (req, res) => {
  const sql = "SELECT server_ips FROM biometric_servers LIMIT 1";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      // Ensure that the server_ips is a string
      const formattedResult = result.map((row) => ({
        server_ips: row.server_ips.toString(),
      }));
      console.log(formattedResult);
      res.json({ result: formattedResult });
    } else {
      res.json({ result: [] }); // Return empty array if no results
    }
  });
});

// Utility function: Execute API Call
async function callAPI(params) {
  const { serverHost, URL, membership_no, EXAMTIME } = params;
  const apiUrl = `http://${serverHost}${URL}`;
  const data = membership_no
    ? { candId: encodeURIComponent(membership_no) }
    : { examTime: EXAMTIME };

  try {
    // Simulating a successful API response
    console.log("API response:", data);
    return {
      data: {
        membership_no: membership_no ? membership_no : "DRUN000011,DRUN000012",
        examTime: "11:00:00",
        examStatus: "A",
      },
    };
  } catch (error) {
    console.error("API call failed:", error.message);
    return 2; // Indicating the server is not reachable
  }
}

function getExamTimeByCandidate(mem_no) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT exam_time FROM iib_candidate_iway WHERE membership_no = ?";

    db.query(query, [mem_no], (err, results) => {
      if (err) {
        console.error("Error fetching exam time:", err.message);
        return reject(err);
      }

      if (results.length > 0) {
        resolve(results[0].exam_time); // Return the exam_time if found
      } else {
        resolve(""); // Return an empty string if no results found
      }
    });
  });
}

app.post("/dynamic-sync-biometric-api", async (req, res) => {
  const { examTime, mem_no: membershipNo, api_type: apiType } = req.body;

  const query = "SELECT server_ips FROM biometric_servers ORDER BY 1 ASC";
  db.query(query, async (err, results) => {
    if (err || results.length === 0) {
      console.error(
        "Error fetching server IPs or no servers found:",
        err?.message
      );
      return res.json({ response: "error", status: false });
    }

    const serverIps = results[0].server_ips;
    const serverList = serverIps.split(";");
    const status = [];

    for (const serverHost of serverList) {
      try {
        const getExamTime =
          examTime ||
          (await new Promise((resolve) => {
            getExamTimeByCandidate(membershipNo, resolve);
          }));

        let params = {
          serverHost,
          api_type: apiType,
          exam_time: getExamTime,
          exam_date: formattedDate, // YYYY-MM-DD
        };

        let resp;
        if (parseInt(apiType, 10) === 1 && membershipNo) {
          const batchValue = ""; // Handle batchValue logic as needed
          params = {
            ...params,
            URL: "/cvs/cvsservice.asmx/IsCandidateRegistered",
            membership_no: membershipNo + batchValue,
          };

          const data = await callAPI(params);
          if (data !== 2) {
            const executeResponse = await executeXMLData(
              data,
              params,
              serverHost
            );
            resp = executeResponse[0];
          } else {
            resp = { RES: `${serverHost}-Server Not Reachable` };
          }
        } else {
          const dateTime = formattedTime;
          params = {
            ...params,
            URL: "/cvs/cvsservice.asmx/GetUserID",
            EXAMTIME: getExamTime,
            membership_no: "",
          };

          const data = await callAPI(params);
          if (data !== 2) {
            const executeResponse = await executeXMLData(
              data,
              params,
              serverHost
            );
            resp = executeResponse[0];
          } else {
            resp = { RES: `${serverHost}-Server Not Reachable` };
          }
        }

        status.push(resp);
      } catch (error) {
        console.error("Error processing server:", serverHost, error);
        status.push({ RES: `${serverHost}-Error processing request` });
      }
    }

    const response = status.map((s) => s.RES).join(", ");
    res.json({ response, status: true });
  });
});

const appendFileAsync = promisify(fs.appendFile);
const chmodAsync = promisify(fs.chmod);

// Function to execute MySQL queries
const executeQuery = ({ query, params }) => {
  // console.log("Executing Query:", query);
  // console.log("With Parameters:", params);
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        reject(err);
      } else {
        const formattedquery = db.format(query, params);
        insertIntoXmlFeed(formattedquery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting feed table:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
        resolve(results);
      }
    });
  });
};

async function insertBiometricData(splitCandidate, params) {
  const queries = [];
  const memberNotExist = [];

  if (params.api_type == 1) {
    // const [membershipNoData, seatNumber, status] = splitCandidate.split(',');
    // const [memNo, batchType] = membershipNoData.split('_');
    const memNo = splitCandidate.join(","); // Change Dynamic Data
    const seatNumber = 2; // Change Dynamic Data

    console.log("Api type splitCandidate", splitCandidate);

    if (await isMemberExists(splitCandidate, params.exam_time)) {
      // if (await isMemberExists(memNo, params.exam_time)) {

      console.log("memberexit", isMemberExists);

      if (seatNumber !== "NA") {
        const queryUpdate = `UPDATE biometric_report_api SET seat_no = ?, date_updated = ? WHERE membership_no = ? AND batch_time = ?`;
        queries.push({
          query: queryUpdate,
          params: [2, new Date(), memNo, params.exam_time], // Change Dynamic Data
        });
      } else {
        memberNotExist.push(memNo);
      }
    } else {
      memberNotExist.push(memNo);
    }
  } else {
    // console.log("Before for loop",splitCandidate);
    const individualCandidates = splitCandidate[0].split(",");
    for (const candidateData of individualCandidates) {
      // console.log("After for loop",candidateData);
      if (candidateData) {
        const [membershipNoData, seatNumber] = candidateData.split(",");
        const [memNo, batchType] = membershipNoData.split("_");

        // console.log("After if",memNo);
        if (await isMemberExists(memNo, params.exam_time)) {
          const queryUpdate = `UPDATE biometric_report_api SET seat_no = ?, date_updated = ? WHERE membership_no = ? AND batch_time = ?`;
          queries.push({
            query: queryUpdate,
            params: [1, new Date(), memNo, params.exam_time], // Change Dynamic Data
          });
        } else {
          memberNotExist.push(memNo);
        }
      }
    }
  }
  console.log(queries);

  return { queries, memberNotExist };
}

const executeXMLData = async (xmlData, dataParams, host) => {
  let splitCandidate = [];
  const logDir = path.join(__dirname, "update_logs");
  const logFile = path.join(logDir, "biometric_api_response.txt");
  let responseLog = "";

  // Parse the input XML/JSON data
  let xmlParsedData;
  try {
    xmlParsedData = typeof xmlData === "string" ? JSON.parse(xmlData) : xmlData;
  } catch (error) {
    console.error("Error parsing XML/JSON data:", error.message);
    return { error: "Invalid input data format" };
  }

  // Extract candidate data based on `api_type`
  try {
    console.log("xmlParsedData", xmlParsedData.data);
    if (dataParams.api_type == 1) {
      // Add the `data` object as-is for API type 1
      splitCandidate = [xmlParsedData.data.membership_no];
    } else if (xmlParsedData.data?.membership_no) {
      // Handle multiple membership numbers for other API types
      splitCandidate = [xmlParsedData.data.membership_no]; // Adjust as per your actual logic
    } else {
      console.warn("No membership data found in input.");
      splitCandidate = [];
    }
  } catch (error) {
    console.error("Error processing splitCandidate:", error.message);
    return { error: "Failed to process candidate data" };
  }

  console.log("Processed splitCandidate:", splitCandidate);

  // Insert or update biometric data
  let getQuery;
  try {
    getQuery = await insertBiometricData(splitCandidate, dataParams);
  } catch (error) {
    console.error("Error in insertBiometricData:", error.message);
    return { error: "Failed to insert biometric data" };
  }

  // Log the XML data and operation results
  responseLog += `--------------------\n${new Date().toLocaleString()}\n--------------------\nXML RESPONSE\n--------------------\n`;
  responseLog += `${JSON.stringify(xmlParsedData, null, 2)}\n--------------------\n`;

  // Execute the queries if they exist
  if (Array.isArray(getQuery.queries) && getQuery.queries.length > 0) {
    for (const query of getQuery.queries) {
      try {
        await executeQuery(query);
        responseLog += `Updated Query\n--------------------\n${query.query}\n`;
      } catch (err) {
        console.error("Error executing query:", err.message);
        responseLog += `Failed Query\n--------------------\n${query.query}\nError: ${err.message}\n`;
      }
    }
  } else {
    console.warn("No queries to execute or invalid query structure.");
  }

  // Log details for members not found
  if (
    Array.isArray(getQuery.memberNotExist) &&
    getQuery.memberNotExist.length > 0
  ) {
    responseLog += `Member Not Exists - Seat Number Not Available / Users Not Available\n--------------------\n${JSON.stringify(getQuery.memberNotExist, null, 2)}\n`;
  }

  // Ensure log directory exists and write the log file
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    await chmodAsync(logDir, 0o777);
    await appendFileAsync(logFile, responseLog);
  } catch (err) {
    console.error("Error writing log file:", err.message);
  }

  // Return the response summary
  return [
    {
      RES: `${host} ~ Member Exists - ${getQuery.queries?.length || 0} ~ Member Not Exists - ${getQuery.memberNotExist?.length || 0}`,
    },
  ];
};

// Define the function to check if the member exists
const isMemberExists = (membershipNo, examTime) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT COUNT(*) AS count FROM biometric_report_api WHERE membership_no = ? AND batch_time = ?";

    db.query(query, [membershipNo, examTime], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Resolve with count (if greater than 0, the member exists)
        resolve(results[0].count > 0);
      }
    });
  });
};

app.get("/get-batch-time-value", (req, res) => {
  const sql =
    "SELECT DISTINCT(slot_time),slot_no FROM iib_exam_slots ORDER BY slot_time";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      const formattedResult = result.map((row) => ({
        slot_time: row.slot_time.toString(),
        slot_no: row.slot_no.toString(),
      }));
      // console.log(formattedResult);
      res.json({ result: formattedResult });
    } else {
      res.json({ result: [] }); // Return empty array if no results
    }
  });
});

app.post("/dynamic-update-batchwise-tracking", async (req, res) => {
  const { R, D, api_type, mem_no, exam_mode, examTime } = req.body;

  if (R == "1" && D) {
    const string = D.replace(/<[^>]*>/g, ""); // Strip tags
    const response = string.split("~");
    const memberExists = response[1] ? response[1].split("-") : [];

    if (memberExists[0]?.trim() == "Member Exists") {
      console.log("1", memberExists);
      if (memberExists[1] > 0) {
        let getExamTime;

        if (api_type === "1") {
          const membershipNo = mem_no;
          // const batchSegregation = examTime;
          // const batchValue = batchSegregation[0];
          const batchTime = examTime;
          getExamTime =
            examTime ||
            (await new Promise((resolve) => {
              getExamTimeByCandidate(membershipNo, resolve);
            }));
        } else {
          getExamTime = examTime;
        }

        const chkSeatsQuery = `SELECT COUNT(DISTINCT membership_no) AS totalcount 
                                     FROM biometric_report_api 
                                     WHERE seat_no != '' AND batch_time = ?`;

        db.query(chkSeatsQuery, [getExamTime], (err, chkSeatsResult) => {
          if (err) return res.status(500).send(err);

          const numSeatsResult = chkSeatsResult[0]?.totalcount || 0;
          // console.log("2",numSeatsResult);

          if (numSeatsResult > 0) {
            const memberUpdatedCount = numSeatsResult;
            const examName = process.env.CLIENT.split("_")[1].toUpperCase();
            // const examName = 'NIBM'; // Replace with actual logic
            const examDate = formattedDate; // Implement this function
            const batchTime = getExamTime;
            const biometricUser = memberUpdatedCount;
            const syncBiometricExamStatus = "P";

            const chkAlreadyAvailQuery = `SELECT id FROM batchwise_tracking WHERE exam_name = ? AND exam_date = ? AND batch_time = ?`;

            db.query(
              chkAlreadyAvailQuery,
              [examName, examDate, batchTime],
              (err, chkAlreadyAvailResult) => {
                if (err) return res.status(500).send(err);
                // console.log("chkAlreadyAvailResult",chkAlreadyAvailResult.length);

                if (chkAlreadyAvailResult.length > 0) {
                  const id = chkAlreadyAvailResult[0].id;
                  const updateQuery = `UPDATE batchwise_tracking SET biometirc_user = ?, sync_biometirc_exam_status = ?, updated_on = ? WHERE id = ?`;

                  const formattedupdateQuery = db.format(updateQuery, [
                    biometricUser,
                    syncBiometricExamStatus,
                    formattedTime,
                    id,
                  ]);
                  // Insert update query into xml_feed
                  new Promise((resolve, reject) => {
                    insertIntoXmlFeed(formattedupdateQuery, (err) => {
                      if (err) {
                        return reject(
                          new Error(
                            "Error inserting update query into xml_feed"
                          )
                        );
                      }
                      resolve();
                    });
                  });

                  db.query(
                    updateQuery,
                    [biometricUser, syncBiometricExamStatus, formattedTime, id],
                    (err) => {
                      console.log("updateQuery", {
                        biometricUser,
                        syncBiometricExamStatus,
                        formattedTime,
                        id,
                      });
                      if (err) return res.status(500).send(err);
                      return res.send("Success");
                    }
                  );
                } else {
                  const insertQuery = `INSERT INTO batchwise_tracking (exam_name, exam_date, batch_time, biometirc_user, sync_biometirc_exam_status, added_on)  VALUES (?, ?, ?, ?, ?, ?)`;

                  const formattedinsertQuery = db.format(insertQuery, [
                    examName,
                    examDate,
                    batchTime,
                    biometricUser,
                    syncBiometricExamStatus,
                    formattedTime,
                  ]);
                  // Insert update query into xml_feed
                  new Promise((resolve, reject) => {
                    insertIntoXmlFeed(formattedinsertQuery, (err) => {
                      if (err) {
                        return reject(
                          new Error(
                            "Error inserting update query into xml_feed"
                          )
                        );
                      }
                      resolve();
                    });
                  });

                  db.query(
                    insertQuery,
                    [
                      examName,
                      examDate,
                      batchTime,
                      biometricUser,
                      syncBiometricExamStatus,
                      formattedTime,
                    ],
                    (err) => {
                      if (err) return res.status(500).send(err);
                      return res.send("Success");
                    }
                  );
                }
              }
            );
          } else {
            return res.send(false);
          }
        });
      } else {
        return res.send("Member Data Not Available - Server Down");
      }
    } else {
      return res.send("Member Not Exists");
    }
  } else {
    return res.status(400).send("Invalid request");
  }
});

const imageDirectory = process.env.QPIMGPATH;
  // "C:\\pro\\itest\\activate\\photos\\questionpaper\\images";

  app.get("/get-image-count", (req, res) => {
    fs.readdir(imageDirectory, (err, files) => {
      if (err) {
        // console.error("Error reading directory:", err);
        // return res.status(500).json({ error: "Internal Server Error" });
        return res.json({ imageCount: 0 });
      }
   
      // Check if directory is empty
      if (!files || files.length === 0) {
        return res.json({ imageCount: 0 });
      }
   
      // Filter image files based on common extensions
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
      const imageFiles = files.filter(file =>
        imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
      );
   
      res.json({ imageCount: imageFiles.length || 0 });
    });
  });

app.post("/candidate-time-extend", async (req, res) => {
  const { batchtime, blockmode, serialNumber, candidateList, extentedtime } =
    req.body;

  let timeExtensionUpdate = extentedtime * 60;
  console.log("extentedtime:", extentedtime);
  console.log("timeExtensionUpdate (seconds):", timeExtensionUpdate);

  try {
    let finalCandidateList = Array.isArray(candidateList)
      ? candidateList
      : [candidateList];

    if (blockmode == 3) {
      const getMemberQuery = `SELECT membership_no FROM iib_candidate_iway WHERE zone_code = ?`;
      const members = await new Promise((resolve, reject) => {
        db.query(getMemberQuery, [batchtime], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      finalCandidateList = members.map((row) => row.membership_no);
      console.log("Membership Numbers:", finalCandidateList);
    }

    if (!finalCandidateList || finalCandidateList.length === 0) {
      return res
        .status(200)
        .json({ message: "No candidates found for processing." });
    }

    const getCandidateStatus = `SELECT membership_no, test_status FROM iib_candidate_test WHERE membership_no IN (?)`;

    const candidateResults = await new Promise((resolve, reject) => {
      db.query(getCandidateStatus, [finalCandidateList], (err, results) => {
        if (err) return reject(err);
        resolve(Array.isArray(results) ? results : []);
      });
    });

    if (candidateResults.length === 0) {
      return res
        .status(200)
        .json({ message: "Selected candidate not started the exam" });
    }

    // console.log("Candidate Results from DB:", candidateResults);

    const statusC = candidateResults
      .filter((row) => row.test_status === "C")
      .map((row) => row.membership_no);

    const statusOther = candidateResults
      .filter((row) => row.test_status !== "C")
      .map((row) => row.membership_no);

    const queries = [];

    if (statusC.length > 0) {
      const deleteQuery = `DELETE FROM iib_candidate_scores WHERE membership_no IN (?)`;
      queries.push(executeQueryWithFeed(deleteQuery, [statusC], "delete"));

      const updateQueryC = `UPDATE iib_candidate_test SET time_extended = time_extended + ?, test_status = 'IC' WHERE membership_no IN (?)`;
      queries.push(
        executeQueryWithFeed(
          updateQueryC,
          [timeExtensionUpdate, statusC],
          "update (C status)"
        )
      );
    }

    if (statusOther.length > 0) {
      const updateQueryOther = `UPDATE iib_candidate_test SET time_extended = time_extended + ? WHERE membership_no IN (?)`;
      queries.push(
        executeQueryWithFeed(
          updateQueryOther,
          [timeExtensionUpdate, statusOther],
          "update (Other status)"
        )
      );
    }

    const results = await Promise.all(queries);
    const totalAffected = results.reduce((acc, curr) => acc + curr, 0);

    res.status(200).json({
      message: "success",
      affectedRows: totalAffected,
    });
  } catch (error) {
    console.error("Error processing candidates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Reusable Query Execution with Feed Update
function executeQueryWithFeed(query, params, actionLabel) {
  return new Promise((resolve, reject) => {
    const formattedQuery = db.format(query, params);
    insertIntoXmlFeed(formattedQuery, (err) => {
      if (err) {
        console.error(`Error inserting ${actionLabel} feed table:`, err);
        return reject(err);
      }
      db.query(query, params, (err, result) => {
        if (err) {
          console.error(`Error executing ${actionLabel} query:`, err);
          return reject(err);
        }
        console.log(
          `${actionLabel} operation affected ${result.affectedRows} rows.`
        );
        resolve(result.affectedRows);
      });
    });
  });
}
app.get("/save-ip", async (req, res) => {
  const userIp = req.query.ip;
  if (!userIp) {
    return res.status(400).json({ error: "IP address is required" });
  }
  try {
    await utils.updateConfigFile(userIp);
    res.json({ message: "IP saved successfully", userIp });
  } catch (error) {
    res.status(500).json({ error: "Failed to write config file" });
  }
});

app.get("/config", (req, res) => {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    res.json(config);
  } else {
    res.status(404).json({ error: "Config file not found" });
  }
});

app.get("/get-api-url", (req, res) => {
  if (!fs.existsSync(CONFIG_PATH)) {
    return res.status(404).json({ error: "Config file not found" });
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  res.json({ API_URL: config.API_URL });
});

function encryptIt(text) {
  const key = crypto.createHash("sha256").update("actfile").digest("hex"); // sha256-hashed key
  const iv = crypto.createHash("sha256").update(key).digest().slice(0, 16); // IV created by hashing the key again

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}
const extractingZip = (password, zipPath, uploadDir) => {
  return new Promise((resolve, reject) => {
    const crtPassword = encryptIt(password);
    const extractCommand = `"C:\\Program Files\\7-Zip\\7z.exe" x -p"${crtPassword}" "${zipPath}" -o"${uploadDir}" -y`;

    exec(extractCommand, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error extracting ZIP: ${error.message}`);
        return reject({ error, message: "Wrong password" });
        // return res.status(401).json({message:"Wrong password"})
      }
      console.log("ZIP extracted successfully.");
      // console.log("stdout" + stdout);
      resolve(); // Resolves after extraction completes
    });
  });
};
const loadingActFile = async (escapedPassword, extractedDmp, time) => {
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${extractedDmp}"`;
  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true, shell: false }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return reject({ error, message: "Error loading Act file" });
      }
      // console.log(`stdout: ${stdout}`);
      console.log("Dump file imported successfully");
      return resolve({
        success: true,
        message: "Act file imported successfully",
        time,
      });
    });
  });
};
app.post("/manualQPUpload", async (req, res) => {
  const updatingPasswordAct = async (time) => {
    const query =
      "update iib_candidate set password=password_act where membership_no in (select membership_no from iib_candidate_iway where exam_time=?)";
    return new Promise((resolve, reject) => [
      db.query(query, [time], (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result);
        return resolve();
      }),
    ]);
  };
  const insertingQPDownload = async (centerCode, serverno, activationText) => {
    const query =
      "insert into qp_download (centre_code, serverno, download_sec, download_status, download_time) values (?,?,?,'D',?)";
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [centerCode, serverno, activationText, formattedTime],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          return resolve();
        }
      );
    });
  };
  try {
    if (!req.files || !req.files.actFile) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const zipFile = req.files.actFile;
    const password = req.body.password;
    console.log(password);
    // Ensure it's a ZIP file
    if (!zipFile.name.endsWith(".zip")) {
      return res.status(400).json({ error: "Only ZIP files are allowed." });
    }

    const uploadDir = path.join(__dirname, "./activate"); // Directory to save the zip
    const zipPath = path.join(uploadDir, zipFile.name); // Full zip file path
    const extractPath = path.join(
      uploadDir,
      path.basename(zipFile.name, ".zip")
    ); // Extract folder
    const fileName = zipFile.name.split(".")[0];
    const batchTime = fileName.split("-")[1];
    const time =
      batchTime.substring(0, 2) +
      ":" +
      batchTime.substring(2, 4) +
      ":" +
      batchTime.substring(4, 6);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Remove existing ZIP file if it already exists
    if (fs.existsSync(zipPath)) {
      console.log("ZIP file already exists. Removing...");
      fs.unlinkSync(zipPath);
    }

    // Move new ZIP file to `uploadDir`
    await zipFile.mv(zipPath);

    await extractingZip(password, zipPath, uploadDir);

    console.log("Extraction complete!");

    // Remove the ZIP file after extraction
    const extractedDmp = path.join(
      uploadDir,
      "photos",
      "questionpaper",
      "images",
      `${fileName}.txt`
    );

    const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

    fs.statSync(extractedDmp, (err, stats) => {
      if (err) {
        console.error(err);
      }
      if (stats.size == 0) {
        return res.status(401).json({ message: "Incorrect password" });
      }
    });

    const resultJson = await loadingActFile(
      escapedPassword,
      extractedDmp,
      time
    );

    const { centre_code, serverno } = await utils.centreAndServerNo();

    const activationText = "Activated-" + time;

    await updatingPasswordAct(time);

    await insertingQPDownload(centre_code, serverno, activationText);

    fs.unlinkSync(extractedDmp);
    return res.status(200).json(resultJson);
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ error: "Internal Server Error", error });
  }
});

const getActiveBatches = (callback) => {
  const activateBatch = [];
  db.query(
    "SELECT REPLACE(download_sec, 'Activated-', '') as active_batch FROM qp_download WHERE download_sec LIKE 'Activated-%' AND download_status = 'D'",
    (err, results) => {
      if (err) return callback(err);
      results.forEach((row) => activateBatch.push(row.active_batch));
      callback(null, activateBatch);
    }
  );
};

const getTrackedBatches = (database, getExamDate, callback) => {
  const trackBatch = [];
  db.query(
    "SELECT batch_time FROM batchwise_tracking WHERE exam_name = ? AND exam_date = ? AND sync_exam_status = 'C'",
    [database, getExamDate],
    (err, results) => {
      if (err) return callback(err);
      results.forEach((row) => trackBatch.push(row.batch_time));
      callback(null, trackBatch);
    }
  );
};

const processBatches = async (
  mac,
  database,
  getExamDate,
  center_code,
  serverno,
  qpDownPath
) => {
  getActiveBatches((err, activateBatch) => {
    if (err) return console.error(err);

    getTrackedBatches(database, getExamDate, (err, trackBatch) => {
      if (err) return console.error(err);

      const listSyncBatch = activateBatch.filter(
        (batch) => !trackBatch.includes(batch)
      );
      if (listSyncBatch.length === 0) return;

      listSyncBatch.forEach((activeBatch) => {
        db.query(
          "SELECT COUNT(DISTINCT a.membership_no) as count FROM iib_candidate_iway a, iib_candidate_test b WHERE a.membership_no = b.membership_no AND a.exam_code = b.exam_code AND a.subject_code = b.subject_code AND a.exam_date = ? AND a.exam_time = ?",
          [getExamDate, activeBatch],
          async (err, results) => {
            if (err) return console.error(err);

            const batchwiseCandidateCount = results[0].count;
            if (batchwiseCandidateCount > 0) {
              const data = {
                m: mac,
                name: database,
                c: center_code,
                s: serverno,
                b: activeBatch,
                sc: "EAK",
                attended: batchwiseCandidateCount,
                CHECKSUM: process.env.CHECKSUMKEY,
                // pass:"12345"
              };

              try {
                const response = await axios.post(qpDownPath, data);
                const exp = response.data.message.split("^$^");
                const status = exp[0];

                if (status == "S") {
                  db.query(
                    "SELECT COUNT(1) as count FROM batchwise_tracking WHERE exam_name = ? AND exam_date = ? AND batch_time = ?",
                    [database, getExamDate, activeBatch],
                    (err, results) => {
                      if (err) return console.error(err);

                      if (results[0].count > 0) {
                        db.query(
                          "UPDATE batchwise_tracking SET sync_exam_status = 'C' WHERE exam_name = ? AND exam_date = ? AND batch_time = ?",
                          [database, getExamDate, activeBatch]
                        );
                      } else {
                        db.query(
                          "INSERT INTO batchwise_tracking (exam_name, exam_date, batch_time, sync_exam_status, added_on, updated_on) VALUES (?, ?, ?, 'C', ?, ?)",
                          [
                            database,
                            getExamDate,
                            activeBatch,
                            formattedTime,
                            formattedTime,
                          ]
                        );
                      }
                    }
                  );
                }
              } catch (error) {
                console.error("Error in API request:", error.message);
              }
            }
          }
        );
      });
    });
  });
};

const syncBiometricExamStatus = async (
  database,
  getExamDate,
  mac,
  center_code,
  serverno,
  qpDownPath
) => {
  const query = `SELECT batch_time, biometirc_user, biometirc_skip_user, sync_biometirc_exam_status FROM batchwise_tracking WHERE exam_name = ? AND exam_date = ? AND sync_biometirc_exam_status != 'C'`;

  db.query(query, [database, getExamDate], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return;
    }

    if (results.length > 0) {
      for (const row of results) {
        const biometricUserCount =
          row.biometirc_user > 0 ? row.biometirc_user : 0;
        const biometricSkipUserCount =
          row.biometirc_skip_user > 0 ? row.biometirc_skip_user : 0;
        const biometricBatch = row.batch_time;

        const dataBiometric = {
          m: mac,
          name: database,
          c: center_code,
          s: serverno,
          b: biometricBatch,
          sc: "EBIOS",
          biometirc_user: biometricUserCount,
          biometirc_skip_user: biometricSkipUserCount,
          CHECKSUM: process.env.CHECKSUMKEY,
        };

        try {
          const response = await axios.post(qpDownPath, dataBiometric);
          const responseParts = response.data.message.split("^$^");
          const status = responseParts[0];

          if (status == "S") {
            const updateQuery = `UPDATE batchwise_tracking SET sync_biometirc_exam_status = 'C', updated_on = ? WHERE exam_name = ? AND exam_date = ? AND batch_time = ?`;

            db.query(
              updateQuery,
              [formattedTime, database, getExamDate, biometricBatch],
              (updateErr) => {
                if (updateErr) {
                  console.error("Error updating database:", updateErr);
                }
              }
            );
          }
        } catch (apiErr) {
          console.error("API request failed:", apiErr);
        }
      }
    }
  });
}; 

app.get("/dashboardFeedSend", async (req, res) => {
  try {
    // await processBatches();
    // const result = await axios.get("http://localhost:5000/serial-number/");
    const serialNumber = await utils.getSerialNumber();
    const mac = serialNumber;
    const getExamDate = await getCurrentExamDate();
    const { center_code, serverno } = await getCenterCodes(req);
    const database = process.env.DB_NAME;
    const qpDownPath = `${process.env.EXAM_DASHBOARD_URL}/biometricCountUpdateApi`;
    await processBatches(mac,database,getExamDate,center_code,serverno,qpDownPath);
    await syncBiometricExamStatus(mac,database,getExamDate,center_code,serverno,qpDownPath);
    res.status(200).json({ message: "Batch and biometric sync completed successfully." });
  } catch (error) {
    console.error("Error in dashboardFeedSend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post('/clearQP', async (req, res) => {
  const { password, serialNumber } = req.body;

  // console.log(password, serialNumber);
  try {
    const { center_code, serverno } = await getCenterCodes(req);
    
    const data_eal = {
      macId: serialNumber,
      database: process.env.DB_NAME,
      centreCode: center_code,
      pwdPos:"0",
      serverNumber: serverno,
      taActivatePassword: Buffer.from(password).toString('base64'),
      serviceCall: 'CL'
    };

    console.log(data_eal);
    // return
    
    const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/autoAssignServerNumber`, data_eal, {
      // headers: {
      //   Authorization: `Bearer ${apiToken}`,
      //   'Content-Type': 'application/json',
      // },
      // withCredentials: true,
    });
    
    const res_eal = response.data.data?.split('^$^') || [];
    const status_eal = res_eal[0];
    
    if (status_eal != 'S') {
      return res.status(400).json({ success: false, message: 'Invalid Password. Please enter first batch activation password.' });
    }
    
    let responseCurl_clearqp = response.data;
    
    if (typeof responseCurl_clearqp === 'object' && responseCurl_clearqp.ER === 1) {
      const curlInit = responseCurl_clearqp.CURLINIT;
      const process = 'Clear QP';
      responseCurl_clearqp = responseCurl_clearqp.RES;
      fs.appendFileSync('curl_log.txt', `Process: ${process}, Data: ${curlInit}\n`);
    }
    
    // Truncate tables
    // const tablesToTruncate = ['qp_download', 'batchwise_closure_summary', 'exam_closure_summary', 'xml_feed', 'feed_filenames'];
    // for (const table of tablesToTruncate) {
    //   await queryAsync(`TRUNCATE TABLE ${table}`);
    // }
    
    // // Clear directories
    // const directories = [process.env.CAN_SIGN_PATH, process.env.CAN_PHOTO_PATH, process.env.QPIMGPATH];
    // directories.forEach(dir => {
    //   if (fs.existsSync(dir)) {
    //     fs.readdirSync(dir).forEach(file => fs.unlinkSync(path.join(dir, file)));
    //   }
    // });
    
    // // Remove .txt files from feed directory
    // const feedPath = process.env.FEED_DIR;
    // if (fs.existsSync(feedPath)) {
    //   fs.readdirSync(feedPath)
    //     .filter(file => file.endsWith('.txt'))
    //     .forEach(file => fs.unlinkSync(path.join(feedPath, file)));
    // }
    
    return res.json({ success: true, message: 'Clear QP process completed' });
  } catch (error) {
    console.error('Error in clearQPActivation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/get-exam-closure-count', async (req, res) => {
  const { centre_code, serverno, closure_action } = req.body;

  const selectQuery = "SELECT COUNT(id) AS count FROM exam_closure_summary WHERE centre_code=? AND serverno=? AND closure_action=?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectQuery, [centre_code, serverno, closure_action], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, message: "Database error", error });
  }
});

app.post('/get-exam-closure-count-init', async (req, res) => {
  const { centre_code, serverno} = req.body;

  const selectQuery = "SELECT COUNT(id) AS count FROM exam_closure_summary WHERE centre_code=? AND serverno=?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectQuery, [centre_code, serverno], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, message: "Database error", error });
  }
});


// Get Windows Timezone
function getWindowsTimezone() {
  try {
    return execSync("tzutil /g", {
      windowsHide: true, // Prevents CMD from opening
      stdio: "pipe", // Ensures no console output
    }).toString().trim();
  } catch (error) {
    return "Unknown Timezone";
  }
}

// Get System Date and Time
function getSystemDateTime() {
  try {
    const date = execSync("date /t", {
      windowsHide: true,
      stdio: "pipe",
    }).toString().trim();

    const time = execSync("time /t", {
      windowsHide: true,
      stdio: "pipe",
    }).toString().trim();

    return `${date} ${time}`;
  } catch (error) {
    return "Date/Time not available";
  }
}

// Get Server Time
 async function getServerTime() {
  const timezone = getWindowsTimezone();
  const systemDateTime = getSystemDateTime();
  return `${timezone} ${systemDateTime}`;
}

// Get Application Time with Timezone
async function getApplicationTime() {
  const appTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${appTimezone} - ${moment().format("DD-MM-YYYY HH:mm:ss")}`;
}


async function getMySQLTime() {
  return new Promise((resolve, reject) => {
    const query = "SELECT @@global.time_zone AS mysql_tz, DATE_FORMAT(NOW(),'%d-%m-%Y %H:%i:%s') AS mysql_time";

    db.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        reject(error);
        return;
      }

      if (results.length === 0) {
        reject(new Error("No results found"));
        return;
      }

      const mysql_tz = results[0].mysql_tz;
      const mysql_time = results[0].mysql_time;
      const mysql_time_str = `${mysql_tz} - ${mysql_time}`;

      resolve(mysql_time_str);
    });
  });
}


async function processQPDownloadStatus(callback) {
  const sqlQuery1 = "SELECT centre_code, serverno, download_sec, download_status FROM qp_download ORDER BY id ASC";
  const sqlQuery2 = "SELECT build_name, build_version, updated_date FROM taserver_version ORDER BY id DESC LIMIT 1";

  db.query(sqlQuery1, (error1, results1) => {
    if (error1) {
      console.error("Error executing first query:", error1);
      callback(error1, null);
      return;
    }

    db.query(sqlQuery2, (error2, results2) => {
      if (error2) {
        console.error("Error executing second query:", error2);
        callback(error2, null);
        return;
      }

      const qpData = results1 || [];
      const buildDetails = results2?.[0] || { build_name: '', build_version: '', updated_date: '' };

      let baseqp = 'N', cenreqp = 'N', qpimg = 'N', qpphoto = 'N', qpsign = 'N', qp_down_staus = 'N';

      qpData.forEach(item => {
        if (item.download_sec == 'Base QP' && item.download_status == 'D') baseqp = 'Y';
        if (item.download_sec == 'Center QP' && item.download_status == 'D') cenreqp = 'Y';
        if (item.download_sec == 'Image' && item.download_status == 'D') qpimg = 'Y';
        if (item.download_sec == 'Photos' && item.download_status == 'D') qpphoto = 'Y';
        if (item.download_sec == 'Sign' && item.download_status == 'D') qpsign = 'Y';
      });

      if (baseqp == 'Y' && cenreqp == 'Y') {
        const alterServers = [2, 3, 4, 5, 6];
        qp_down_staus = alterServers.includes(parseInt(qpData[0]?.serverno)) ? 'Alternate' : 'Y';
      }

      // console.log("qp_down_staus" , qp_down_staus);

      const countFiles = (dirPath) => {
        try {
          return fs.readdirSync(dirPath).length - 2 || 'N';
        } catch (error) {
          return 'N';
        }
      };

      const result = {
        buildDetails,
        qp_down_staus_val: qp_down_staus,
        qp_img_down_val: baseqp == 'Y' && qpimg == 'Y' ? countFiles(process.env.QPIMGPATH) : 'N',
        qp_ph_down_val: baseqp == 'Y' && qpphoto == 'Y' ? countFiles(process.env.CAN_PHOTO_PATH) : 'N',
        qp_sig_down_val: baseqp == 'Y' && qpsign == 'Y' ? countFiles(process.env.CAN_SIGN_PATH) : 'N'
      };

      callback(null, result);
    });
  });
}


async function getExamSchedule(qp_down_staus, qp_down_array) {
  try {
    // Convert MySQL query to a promise-based function
    // const query = utils.promisify(db.query).bind(db);

    // Fetch distinct exam dates
    const dateResult = await queryAsync("SELECT DISTINCT exam_date FROM iib_exam_schedule ORDER BY exam_date");

    if (dateResult.length === 0) {
      console.log("No records found");
      return "";
    }

    const sch_date_ft = dateResult[0].exam_date;

    if (qp_down_staus !== "Y" && qp_down_staus !== "Alternate") {
      return "";
    }

    // Convert date format to DD-MM-YYYY
    const formattedDate = new Date(sch_date_ft).toISOString().split("T")[0].split("-").reverse().join("-");

    // Fetch exam slots
    const slotResults = await queryAsync("SELECT slot_time AS cnt FROM iib_exam_slots GROUP BY slot_time");
    const arrExamTime = slotResults.map(row => row.cnt);

    // Fetch candidate batches
    const batchResults = await queryAsync(
      `SELECT exam_date, exam_time, COUNT(1) AS cnt 
       FROM iib_candidate_iway 
       WHERE exam_date = ? 
       GROUP BY exam_date, exam_time`, 
      [sch_date_ft]
    );

    if (batchResults.length === 0) {
      console.log("No records found");
      return "";
    }

    let batchDetails = "";

    // console.log("Exam Date | Batch | Activated | Scheduled | Incomplete | Complete");

    // Fetch incomplete and complete counts for each batch
    for (const row of batchResults) {
      const { exam_date, exam_time, cnt: allotedCount } = row;

      const incompleteResults = await queryAsync(
        `SELECT COUNT(1) AS incompleteCount 
         FROM iib_candidate_iway a 
         JOIN iib_candidate_test b 
         ON a.membership_no = b.membership_no 
         WHERE b.test_status = 'IC' 
         AND current_session = 'Y' 
         AND a.exam_code = b.exam_code 
         AND a.subject_code = b.subject_code 
         AND a.exam_date = ? 
         AND a.exam_time = ? 
         GROUP BY b.membership_no, a.exam_date, a.exam_time`, 
        [sch_date_ft, exam_time]
      );

      const incompleteCount = incompleteResults.length > 0 ? incompleteResults[0].incompleteCount : 0;

      const completeResults = await queryAsync(
        `SELECT COUNT(1) AS completeCount 
         FROM iib_candidate_iway a 
         JOIN iib_candidate_scores b 
         ON a.membership_no = b.membership_no 
         WHERE a.exam_code = b.exam_code 
         AND a.subject_code = b.subject_code 
         AND a.exam_date = ? 
         AND a.exam_time = ? 
         GROUP BY b.membership_no, a.exam_date, a.exam_time`, 
        [sch_date_ft, exam_time]
      );

      const completeCount = completeResults.length > 0 ? completeResults[0].completeCount : 0;

      // Check activation status
      const active_str = `Activated-${exam_time}`;
      const activ_y_n = qp_down_array.some(item => item.download_sec === active_str) ? "Y" : "N";
      const active_batch_icon = activ_y_n === "Y" ? "Y" : "N";

      // console.log(`${exam_date} | ${exam_time} | ${active_batch_icon} | ${allotedCount} | ${incompleteCount} | ${completeCount}`);

      batchDetails += `${exam_time}|${activ_y_n}|${allotedCount}|${incompleteCount}|${completeCount}^`;
    }

    return batchDetails;
  } catch (error) {
    console.error("Error:", error);
    return "";
  }
}



async function getLatestFeedStatus(feedDirectory) {
  try {
    const fedFiles = fs.readdirSync(feedDirectory)
      .map(file => path.join(feedDirectory, file))
      .filter(file => fs.statSync(file).isFile());

    if (fedFiles.length === 0) return "N";

    // Get latest modified file
    const latestFile = fedFiles.reduce((latest, file) => 
      fs.statSync(file).mtime > fs.statSync(latest).mtime ? file : latest, fedFiles[0]
    );

    return Date.now() - fs.statSync(latestFile).mtime.getTime() > 600000 ? "N" : "Y";
  } catch (error) {
    console.error("Error checking feed status:", error);
    return "N";
  }
}


async function getFeedCounts(callback) {
  const sqlFeed = `
    SELECT COUNT(*) AS fedgencnt, 
           SUM(CASE WHEN status = 'Y' THEN 1 ELSE 0 END) AS fedsyncnt 
    FROM feed_filenames
  `;

  db.query(sqlFeed, (err, results) => {
    if (err) {
      console.error("Error fetching feed counts:", err);
      return callback(err, { fedgencnt: 0, fedsyncnt: 0 });
    }

    const { fedgencnt = 0, fedsyncnt = 0 } = results[0] || {};
    callback(null, { fedgencnt, fedsyncnt });
  });
}


async function getClosureSummary() {
  return new Promise((resolve, reject) => {
    const query = "SELECT closure_action FROM exam_closure_summary ORDER BY id DESC LIMIT 1";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return reject(err);
      }

      if (results.length === 0) {
        return resolve("Not Initiated");
      }

      const closure_action = results[0].closure_action;
      resolve(closure_action === "Post Exam QP" ? "Completed" : `Initiated/${closure_action}`);
    });
  });
}


async function checkDumpTaken(callback) {
  const query = "SELECT exam_date FROM iib_exam_schedule LIMIT 1";
  const { centre_code, serverno } = await utils.centreAndServerNo();
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return callback(err);
    }

    if (results.length === 0 || !results[0].exam_date) {
      return callback(null, { dumptaken_val: "N" });
    }

    // 🔹 Convert Date to YYYYMMDD format
    const e_date_new = moment(results[0].exam_date).format("YYYYMMDD");

    const database = process.env.DB_NAME;
    const FeedPath = process.env.FEED_DIR;

    // Construct dump file name
    const dump_name = `${database}_${centre_code}_${serverno}_${e_date_new}`;

    // Search for dump files
    const dump_search = fs.readdirSync(FeedPath).filter(file => file.startsWith(dump_name) && file.endsWith(".dmp"));

    callback(null, { dumptaken_val: dump_search.length > 0 ? "Y" : "N" });
  });
}

async function checkInternetConnection() {
  try {
    await dns.lookup("google.com");
    return "Y"; // Internet is available
  } catch (err) {
    return "N"; // No internet
  }
}

// Get RAM Details
async function getRamDetails() {
  const totalRAM = (os.totalmem() / (1024 * 1024)).toFixed(0); // MB
  return `${totalRAM} MB`;
}

// Get OS Details
async function getOSDetails() {
  return os.version();
}

// Get Disk Space Details (Windows)
async function getDiskSpace() {
  try {
    const stdout = execSync("wmic logicaldisk get Caption, FreeSpace, Size", {
      stdio: "pipe", // Prevents console output
      windowsHide: true, // Hides the CMD popup
    }).toString().trim();

    return stdout || "Disk space info not available";
  } catch (err) {
    return "Disk space info not available";
  }
}

function fetchQpDownload() {
  return new Promise((resolve, reject) => {
      const sqlQuery = "SELECT centre_code, serverno, download_sec, download_status FROM qp_download ORDER BY id ASC";

      db.query(sqlQuery, (err, results) => {
          if (err) {
              console.error("Error fetching qp_download:", err);
              return reject(err);
          }
          resolve(results); // Return fetched array
      });
  });
}


async function insertHealthCheck() {
  const { centre_code, serverno } = await utils.centreAndServerNo();
  const resultSN = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = resultSN.data.serialNumber;
  const mysql_time = await getMySQLTime();
  const result = await new Promise((resolve, reject) => {
    processQPDownloadStatus((err, result) => {
      if (err) { 
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  const { buildDetails,qp_down_staus_val,qp_img_down_val,qp_ph_down_val,qp_sig_down_val } = result;

  const resultFeed = await new Promise((resolve, reject) => {
  getFeedCounts((err, resultFeed) => {
    if (err) {
      reject(err);
    } else {
      resolve(resultFeed);
    } // { fedgencnt: X, fedsyncnt: Y }
  });
});

  const { fedgencnt, fedsyncnt } = resultFeed;

    const closr_summ = await getClosureSummary();

    const resultDumpTaken = await new Promise((resolve, reject) => {
      checkDumpTaken((err, resultDumpTaken) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultDumpTaken);
        }
      });
    });
      const { dumptaken_val } = resultDumpTaken;

    const qp_down_array = await fetchQpDownload();
    const bath_det_val = await getExamSchedule('Y',qp_down_array);
    const bath_det = bath_det_val;
    const feed_status_val = await getLatestFeedStatus(process.env.FEED_DIR);
    const rob_enable_val = "N"; // Example value
    const rob_cp_file_cnt = 0;
    const netconnection_val = await checkInternetConnection(); 
    const ram_det = await getRamDetails();
    const system_ip_det = examserverip;
    const disk_space_det = await getDiskSpace();
    const os_det = await getOSDetails();
    const server_time = await getServerTime();
    const appl_time = await getApplicationTime();

    const checkHealth = `SELECT id FROM xml_feed WHERE query LIKE '%INSERT INTO health_check%' LIMIT 1`;

    let QueryHealthCheck;
    let values;

    db.query(checkHealth, (err, result) => {
      if (err) {
        console.error("Error checking health check record:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (result.length == 0) {
        QueryHealthCheck = `INSERT INTO health_check SET centre_code = ?, server = ?, serial_no = ?, server_time = ?, appl_time = ?, mysql_time = ?, qp_download = ?, qp_image = ?, qp_photo = ?, qp_sign = ?, batch_det = ?, feed_status = ?, feed_sync_cnt = ?, feed_gen_cnt = ?, closure = ?, dump_taken = ?, robo_copy = ?, robo_copy_files_cnt = ?, net_connectivity = ?, ram_det = ?, processor_det = '', system_ip_det = ?, disk_space_det = ?, os_det = ?`;
        values = [
          centre_code, serverno, serialNumber, server_time, appl_time, mysql_time, 
          qp_down_staus_val, qp_img_down_val, qp_ph_down_val, qp_sig_down_val, 
          bath_det, feed_status_val, fedsyncnt, fedgencnt, closr_summ, 
          dumptaken_val, rob_enable_val, rob_cp_file_cnt, netconnection_val, 
          ram_det, system_ip_det ,disk_space_det , os_det
          ];
      }else{
        QueryHealthCheck = `UPDATE health_check SET centre_code = ?, server = ?, serial_no = ?, server_time = ?, appl_time = ?, mysql_time = ?, qp_download = ?, qp_image = ?, qp_photo = ?, qp_sign = ?, batch_det = ?, feed_status = ?, feed_sync_cnt = ?, feed_gen_cnt = ?, closure = ?, dump_taken = ?, robo_copy = ?, robo_copy_files_cnt = ?, net_connectivity = ?, ram_det = ?, processor_det = '', system_ip_det = ?, disk_space_det = ?, os_det = ? WHERE serial_no = ? AND server = ? AND centre_code = ?`;
        values = [
          centre_code, serverno, serialNumber, server_time, appl_time, mysql_time, 
          qp_down_staus_val, qp_img_down_val, qp_ph_down_val, qp_sig_down_val, 
          bath_det, feed_status_val, fedsyncnt, fedgencnt, closr_summ, 
          dumptaken_val, rob_enable_val, rob_cp_file_cnt, netconnection_val, 
          ram_det, system_ip_det ,disk_space_det , os_det, serialNumber, serverno, centre_code
          ];
      }

const formattedsqlInsert = db.format(QueryHealthCheck, values);

insertIntoXmlFeed(formattedsqlInsert, (err) => {
  if (err) {
  return db.rollback(() => {
    console.error("Error inserting feed table:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });
    }
  });

});

}

cron.schedule("*/10 * * * *", async () => {
  console.log("Checking if 'Sign' is downloaded...");

  try {
    const isSignDownloaded = await checkSignDownloaded();
    if (isSignDownloaded) {
      console.log("Running processAndSendFile...");
      await processXmlFeed();
      await processAndSendFile();
    } else {
      console.log("'Sign' is not downloaded yet. Skipping process.");
    }
  } catch (error) {
    console.error("Error checking 'Sign' download:", error);
  }
});

app.get("/check-internet", async (req, res) => {
  const status = await checkInternetConnection(); // Call the function correctly
  // console.log("Internet Status:", status);
  return res.json({ success: true, status });
});

app.post("/authorization-api", async (req, res) => {
  try {
    const { passwordModule } = req.body;
    const { centre_code, serverno } = await utils.centreAndServerNo();
    
    const resultSN = await axios.get("http://localhost:5000/serial-number/");
    const serialNumber = resultSN.data.serialNumber;

    const database = process.env.DB_NAME;
    const sql_tadetails = "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";

    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return res.status(500).json({ error: "TA details missing." });
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

    const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
    const reqChkSumVal = crypto.createHash("sha256").update(reqChkSumStr + process.env.CHECKSUMKEY).digest("hex");
    // const examName = ((process.env.CLIENT).split('_')[1]).toUpperCase();
    const data = {
      name: database,
      user: sTaLoginID,
      pass: sTaPassword,
      CHECKSUM: reqChkSumVal,
      centreCode: centre_code,
      serverNumber: serverno,
      serialNumber: serialNumber,
      passwordModule: passwordModule,
      examName : database
    };

    console.log(data);

    const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/authorizationApi`, data);

    if (response.data.success == "Requested for password successfully.") {
      return res.json({ success: true, message: "Request successful", status: "1" });
    } else {
      return res.status(400).json({ success: false, error: response.data, status: "0"  });
    }
  } catch (error) {
    console.error("Error processing request:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/check-approval-status", async (req, res) => {
  try {
    const { passwordModule } = req.body;
    const { centre_code, serverno } = await utils.centreAndServerNo();
    
    const resultSN = await axios.get("http://localhost:5000/serial-number/");
    const serialNumber = resultSN.data.serialNumber;

    const database = process.env.DB_NAME;
    const sql_tadetails = "SELECT ta_login, ta_password FROM iib_ta_details LIMIT 1";

    const taDetails = await new Promise((resolve, reject) => {
      db.query(sql_tadetails, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });

    if (!taDetails) {
      console.error("No TA details found.");
      return res.status(500).json({ error: "TA details missing." });
    }

    const { ta_login: sTaLoginID, ta_password: sTaPassword } = taDetails;

    const reqChkSumStr = `${sTaLoginID}${sTaPassword}${database}`;
    const reqChkSumVal = crypto.createHash("sha256").update(reqChkSumStr + process.env.CHECKSUMKEY).digest("hex");
    // const examName = ((process.env.CLIENT).split('_')[1]).toUpperCase();
    const data = {
      name: database,
      user: sTaLoginID,
      pass: sTaPassword,
      CHECKSUM: reqChkSumVal,
      centreCode: centre_code,
      serverNumber: serverno,
      serialNumber: serialNumber,
      passwordModule: passwordModule,
      examName : database
    };

    console.log(data);

    const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/checkApprovalStatusApi`, data);

    console.log("approvalStatus", response.data.approvalStatus.request_status);
    if (response.data.success == "Approval status sent successfully.") {
      if (response.data.approvalStatus.request_status == "approved") {
        return res.json({ success: true, message: "Request approved", status: "1" });
      } else if (response.data.approvalStatus.request_status == "rejected") {
        return res.json({ success: false, message: "Request rejected", status: "2", reason: response.data.approvalStatus.reason });
      } else {
        return res.json({ success: false, message: "Request pending", status: "3" });
      }
    } else {
      return res.status(400).json({ success: false, error: "Failed to check approval status", status: "0" });
    }
  } catch (error) {
    console.error("Error processing request:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// server.listen(port,'0.0.0.0',() => {
//   console.log(`Server is running on port ${port}`);
// });
app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});
