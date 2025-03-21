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
const archiver = require("archiver");
const { decode } = require("html-entities");
require("dotenv").config(); // For environment variables
const cookieParser = require("cookie-parser");
const moment = require("moment-timezone");
const crypto = require("crypto");
const csvParser = require("csv-parser");
const fileUpload = require("express-fileupload");
const utils = require ("./utils");
const app = express();
const { execSync } = require("child_process");


app.use(fileUpload());
app.use(cookieParser());

const jwt = require("jsonwebtoken");

const port = 5000;
// const mysqlPath = '"C:/mysql5/bin/mysql.exe"';
const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";
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
const feedDir = "C:\\pro\\itest\\feed";

// Create directory if it doesn't exist
if (!fs.existsSync(feedDir)) {
  fs.mkdirSync(feedDir, { recursive: true });
}

// Create a Memcached connection
const memcached = new Memcached("localhost:11211"); // Update with your Memcached server details

// Multer configuration
const storage = multer.diskStorage({

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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

// const db_server = mysql.createConnection({
//   host: '223.30.222.70',
//   user: 'root',
//   password: '',
//   database: 'itest_api',
// });

// app.post('/checkUser', (req, res) => {
//   const { username, password, serialnumber } = req.body;

//   if (!username || !password || !serialnumber) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   const query = `
//     SELECT * FROM users
//     WHERE username = ? AND password = ? AND serialnumber = ?
//   `;

//   db_server.query(query, [username, password, serialnumber], (err, results) => {
//     if (err) {
//       console.error('Query error:', err);
//       return res.status(500).json({ message: 'Database error.' });
//     }

//     if (results.length > 0) {
//       res.status(200).json({ message: 'User found.', user: results[0] });
//     } else {
//       res.status(404).json({ message: 'User not found.' });
//     }
//   });
// });

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
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.json());

// Mock user data (in a real application, this should come from a database)
const users = [
  { username: "admin", password: "password123", serialnumber: "6CD338GLL1" },
  // { username: "110086D", password: "admin", serialnumber: "5CD2519B22" },
];

// Set a value in Memcached
memcached.set("my_key", "Hello, Memcached!", 10000, (err) => {
  // 10000 seconds TTL
  if (err) {
    console.error("Error setting value in Memcached:", err);
    return;
  }
  console.log("Value set in Memcached");
});

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

app.get("/api/feed-sync", (req, res) => {
  const countQuery = `SELECT COUNT(*) AS count FROM feed_filenames WHERE status = 'Y'`;

  db.query(countQuery, (err, result) => {
    if (err) {
      console.error("Error fetching count:", err);
      return res.status(500).json({ error: "Database query error" });
    }

    const count = result[0].count;
    res.json({ statusYCount: count });
  });
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
app.use(express.json()); // Middleware to parse JSON request body

app.post("/clientlogin", (req, res) => {
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
          expiresIn: "1h",
        });

        // Set the client token as a secure HTTP-only cookie
        res.cookie("clientToken", clientToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true, // Ensure HTTPS in production
          maxAge: 24 * 60 * 60 * 1000, // 1 hour - 60 * 60 * 1000 // 24 hour - 24 * 60 * 60 * 1000
        });

        console.log("Cookie set with token:", clientToken);

        // Log current server time
        // const currenttime = new Date();
        // const formattedTime = currenttime.toISOString().slice(0, 19).replace("T", " ");
        // const formattedTime = moment()
        //   .tz("Asia/Kolkata")
        //   .format("YYYY-MM-DD HH:mm:ss");

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
          const sqlInsert = `
            INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) 
            VALUES (?, ?, ?, ?, ?)
          `;
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
              insertIntoXmlFeed(formattedsqlInsert, (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Error inserting into xml_feed:", err);
                    res.status(500).json({ message: "Internal Server Error" });
                  });
                }
              });

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

// app.post("/Qpactivation", (req, res) => {
//   const {serialNumber, batch , batchval } = req.body;
//   // console.log("batch",batch);
//   // Generate an API token for external system
//   // const apiToken = jwt.sign({ service: 'authService' }, JWT_SECRET, { expiresIn: '16h' });

//   // Call the external API
//   axios.post(
//     "http://localhost:5001/Qpactivationcheck",
//     { serialNumber, batch },
//     {
//       headers: {
//         // Authorization: `Bearer ${apiToken}`,
//         "Content-Type": "application/json",
//       },
//       // withCredentials: true,
//     }
//   )
//     .then((response) => {
//       console.log("External system response:", response.data);

//       const actPwd = response.data.user.actPwd;

//       // Split the actPwd string by '||'
//       const actPwdParts = actPwd.split('||');
//       // console.log("actPwd parts:", actPwdParts[batchval-1]);
//       const actPasswordDB=actPwdParts[batchval-1];
//       return response.status(200).json({
//         response_status: '1',
//         message: 'Actvation Password',
//         actPasswordDB: actPasswordDB,
//       });
//       // Check if the external system validates the user response.data?.response_status === '1'

//     })
//     .catch((error) => {
//       // Handle external API errors
//       console.error("External API call error:", error.response?.data || error.message);
//       res.status(500).json({ message: "Failed to validate user with external system." });
//     });
// });

app.post("/Qpactivation", (req, res) => {
  const { serialNumber, batch, batchval } = req.body;

  // const apiToken = jwt.sign({ service: 'authService' }, JWT_SECRET, { expiresIn: '16h' });
  const apiToken = req.cookies.clientToken;
  // const apiToken = req.cookies?.clientToken;
  if (!apiToken) {
    console.log("Client Token:", apiToken);
  }

  console.log("Client Token:", apiToken);
  console.log(apiToken);
  // Call the external API
  axios
    .post(
      "http://localhost:5002/Qpactivationcheck",
      { serialNumber, batch },
      {
        headers: {
          // Uncomment if authentication is required
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log("External system response:", response.data);

      const actPwd = response.data.user?.actPwd;

      if (actPwd) {
        // Split the actPwd string by '||'
        const actPwdParts = actPwd.split("||");

        if (batchval > 0 && batchval <= actPwdParts.length) {
          const actPasswordDB = actPwdParts[batchval - 1];
          return res.status(200).json({
            response_status: "1",
            message: "Activation Password",
            actPasswordDB: actPasswordDB,
          });
        } else {
          return res.status(400).json({
            response_status: "0",
            message: "Invalid batch value provided.",
          });
        }
      } else {
        return res.status(400).json({
          response_status: "0",
          message: "Activation password not found.",
        });
      }
    })
    .catch((error) => {
      // Handle external API errors
      console.error(
        "External API call error:",
        error.response?.data || error.message
      );
      res.status(500).json({
        message: "Failed to validate user with external system.",
      });
    });
});

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
app.get("/qp-status", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM qp_download";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ count: result[0].count });
  });
});

app.get("/download-zip/:status/:batch", async (req, res) => {
  const status = req.params.status;
  const batch = req.params.batch;
  console.log("Gop:", batch);

  // const sql = "SELECT DISTINCT(slot_time) FROM iib_exam_slots ORDER BY slot_time";
  // db.query(sql, (err, result) => {
  //   if (err) {
  //     console.error("Error querying qp_download:", err);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  //   res.json({ count: result[0].count });
  // });

  // let file = status === 'Base' ? process.env.CLIENT : status;
  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "b4681-100000"
          : "78192-150000"
        : status;

  const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;

  console.log("URL:", url);

  // Define directories
  const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
  const extractDir = path.join("C:", "pro", "itest", "activate");
  const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
  const signDir = path.join("C:", "pro", "itest", "activate", "sign");
  const zipFilePath = path.join(tempDir, `${file}.zip`);

  // Create the temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Step 1: Download the file
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("File downloaded successfully");

    // Step 2: Unzip the file
    const zip = new AdmZip(zipFilePath);
    if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
      zip.extractAllTo(extractDir, true);
      console.log(`File extracted successfully to ${extractDir}`);
    } else {
      if (status.endsWith("_photo")) {
        zip.extractAllTo(photoDir, true);
        console.log(`Photo File extracted successfully to ${photoDir}`);
      }
      if (status.endsWith("_sign")) {
        zip.extractAllTo(signDir, true);
        console.log(`Sign File extracted successfully to ${signDir}`);
      }
    }

    // Step 3: Modify content of .sql files if qpStatus is not 'Base'
    if (status !== "Base") {
      fs.readdirSync(extractDir).forEach((file) => {
        const filePath = path.join(extractDir, file);

        if (
          fs.lstatSync(filePath).isFile() &&
          path.extname(filePath) === ".sql"
        ) {
          // Read the file contents
          let fileContent = fs.readFileSync(filePath, "utf8");

          // Replace '_temp' with an empty string
          fileContent = fileContent.replace(/_temp/g, "");

          // Write the modified content back to the file
          fs.writeFileSync(filePath, fileContent, "utf8");
          console.log(`File content modified: ${filePath}`);
        }
      });
    }

    // Optionally delete the zip file after extraction
    fs.unlinkSync(zipFilePath);

    res.send("File downloaded, extracted, and content modified successfully");
  } catch (error) {
    console.error("Error during download or extraction:", error);
    res.status(500).send("Error during the process");
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

// Define a GET route for starting PM2
app.get("/start-pm2", (req, res) => {
  // Start pm2 restart in the background
  const pm2 = spawn("pm2", ["restart", "itest"], {
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
  const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";


  // Escape special characters in the password if needed
  const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // Construct the command
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error importing dump file");
    }
    // console.log(`stdout: ${stdout}`);
    res.send("Dump file imported successfully");
  });
});

// Activate
app.post("/activate/:status/:batch", (req, res) => {
  const status = req.params.status;
  const batch = req.params.batch;
  // console.log('staus',status);
  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "b4681-100000"
          : "78192-150000"
        : status;
  console.log("File:", file);
  // Define the dumpFilePath based on the status
  let dumpFilePath;
  if (status === "Act") {
    dumpFilePath = path.join(
      "C:",
      "pro",
      "itest",
      "activate",
      "photos",
      "questionpaper",
      "images",
      `${file}.txt`
    );
    //Newly added code
    dumpFilePath = dumpFilePath.replace(/\\/g, "/");
    //Newly added code
  } else {
    dumpFilePath = path.join("C:", "pro", "itest", "activate", `${file}.sql`);
  }

  // const mysqlPath = "C:/mysql5/bin/mysql.exe";
    const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";

  

  // Log paths for debugging
  console.log("MySQL Path:", mysqlPath);
  // console.log('Dump File Path:', dumpFilePath);

  // Check if files exist
  if (!fs.existsSync(mysqlPath)) {
    // console.log('---1---');
    return res.status(500).send("MySQL executable not found.");
  }
  if (!fs.existsSync(dumpFilePath)) {
    // console.log('---2---');
    return res.status(500).send("SQL dump file not found.");
  }

  // Escape special characters in the password if needed
  const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // Construct the MySQL command
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
  console.log("Executing command:", command);

  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error importing dump file");
    }
    console.log(`stdout: ${stdout}`);

    res.send("Dump file imported successfully");
  });
});

app.post("/insert-base", (req, res) => {
  const { centre_code, serverno, download_sec } = req.body;

  // Get the current time of the server
  // const currenttime = new Date();
  // const formattedTime = currenttime
  //   .toISOString()
  //   .slice(0, 19)
  //   .replace("T", " ");

  // Validate input data
  if (!centre_code || !serverno || !download_sec) {
    return res.status(400).send("All fields are required.");
  }

  // Check if the record already exists
  const checkSql =
    "SELECT COUNT(*) AS count FROM qp_download WHERE centre_code = ? AND serverno = ? AND download_sec = ?";
  const checkValues = [centre_code, serverno, download_sec];

  db.query(checkSql, checkValues, (err, result) => {
    if (err) {
      console.error("MySQL select error:", err);
      return res.status(500).send("Error checking data in the database.");
    }

    // If record already exists, skip insertion
    if (result[0].count > 0) {
      return res.status(409).send("Record already exists.");
    }

    // Insert data into the qp_download table
    const sql =
      "INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)";
    const values = [centre_code, serverno, download_sec, "D", formattedTime];

    const autoID=1;
    const sql_autofeed ="INSERT INTO autofeed (center_code,serverno, autoid) VALUES (?, ?, ?)";
    const values_autofeed = [centre_code, serverno, autoID];

    const formattedsql = db.format(sql, values);
    const formattedsql_autofeed = db.format(sql_autofeed, values_autofeed);
    
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("MySQL insert error:", err);
        return res.status(500).send("Error inserting data into the database.");
      }

      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(formattedsql, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting into xml_feed:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });

      res.status(200).send("Data inserted successfully.");
    });
  });
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
  const queries = ["DROP DATABASE itest", "CREATE DATABASE itest"];

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
          res.send("All queries executed and committed successfully");

          const dumpFilePath = "C:/pro/itest/activate/db.dmp";
          // const mysqlPath = "C:/mysql5/bin/mysql.exe";
          const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";


          // Escape special characters in the password if needed
          const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

          // Construct the command
          const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;
          
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              console.error(`stderr: ${stderr}`);
              return res.status(500).send("Error importing dump file");
            }
            // console.log(`stdout: ${stdout}`);
            res.send("Dump file imported successfully");
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
app.get("/exam-data/:centrecode", (req, res) => {
  // SQL query to join the tables
  const centrecode = req.params.centrecode;
  //  console.log(centrecode);
  const query = `SELECT  DATE_FORMAT(slot.exam_date, '%Y-%m-%d') AS exam_date,slot.zone_code,COUNT(distinct(slot.membership_no)) AS totalScheduled, COUNT(CASE WHEN test.test_status = "C" THEN 1 END) AS totalComplete,COUNT(CASE WHEN test.test_status = "IC" THEN 1 END) AS totalIncomplete FROM  iib_candidate_iway slot LEFT JOIN  iib_candidate_test test ON slot.membership_no = test.membership_no and slot.centre_code = ? group by slot.exam_time`;
  db.query(query, [centrecode], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
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
        "INSERT INTO iib_response (question_paper_no, question_id, answer, display_order, tag, host_ip, updatedtime, clienttime) VALUES (?, ?, AES_ENCRYPT(?,?), ?, ?, ?, ?, ?)";
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
          "INSERT INTO descriptive_answer (response_id, question_id, question_paper_no, desc_ans) VALUES (?, ?, ?, AES_ENCRYPT(?,?))";
        await new Promise((resolve, reject) => {
          db.query(
            insertDqQuery,
            [lastInsertedId, questionId, qpno, answer,encryptKey],
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
      }

      // Insert the exact formatted query into xml_feed
      await new Promise((resolve, reject) => {
        insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
          if (err) {
            return reject(new Error("Error inserting into xml_feed"));
          }
          resolve();
        });
      });

      // Format and execute the update query
      const updateTestSql =
        "UPDATE iib_candidate_test SET last_updated_time = ?, time_taken = ?, time_left = ?, clienttime = ? WHERE host_ip = ? AND question_paper_no = ?";
      const formattedUpdateTestSql = db.format(updateTestSql, [
        updatedtime,
        time_taken,
        clienttime,
        clienttime,
        hostip,
        qpno,
      ]);

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
            console.error("Error inserting into xml_feed:", err);
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
                console.error("Error inserting into xml_feed:", err);
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
              console.error("Error inserting into xml_feed:", err);
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
            console.error("Error inserting into xml_feed:", err);
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
              console.error("Error inserting into xml_feed:", err);
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

// Route to get questions
// app.get("/questions/:questionPaperNo/:encryptKey/:lang", (req, res) => {
//   const questionPaperNo = req.params.questionPaperNo;
//   const encryptKey = req.params.encryptKey;
//   const lang = req.params.lang;
//   // const lang = "TN";
//   if (!questionPaperNo) {
//     return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
//   }
//   // const lang = sessionStorage.getItem('candidate-medium');

//   // console.log(lang);
//   // console.log(lang);
// // Determine which table and condition to use based on language
// let sql;
// if (lang == "EN") {
//   sql = `
//     SELECT
//       a.*,
//       b.question_id AS question_id,
//       AES_DECRYPT(b.question_text, ?) AS question_text,
//       AES_DECRYPT(b.option_1, ?) AS option_1,
//       AES_DECRYPT(b.option_2, ?) AS option_2,
//       AES_DECRYPT(b.option_3, ?) AS option_3,
//       AES_DECRYPT(b.option_4, ?) AS option_4,
//       b.correct_answer,
//       b.marks,
//       b.negative_marks,
//       c.*
//     FROM iib_question_paper_details AS a
//     JOIN iib_sq_details AS b
//       ON a.subject_code = b.subject_code
//     JOIN iib_subject_sections AS c
//       ON b.section_code = c.section_code AND a.question_id = b.question_id
//     WHERE a.question_paper_no = ?
//     GROUP BY b.question_id
//     ORDER BY display_order
//   `;
// } else {
//   sql = `
//     SELECT
//       a.*,
//       b.question_id AS question_id,
//       AES_DECRYPT(d.question_text, ?) AS question_text,
//       AES_DECRYPT(d.option_1, ?) AS option_1,
//       AES_DECRYPT(d.option_2, ?) AS option_2,
//       AES_DECRYPT(d.option_3, ?) AS option_3,
//       AES_DECRYPT(d.option_4, ?) AS option_4,
//       b.correct_answer,
//       b.marks,
//       b.negative_marks,
//       c.*
//     FROM iib_question_paper_details AS a
//     JOIN iib_sq_details AS b
//       ON a.subject_code = b.subject_code
//     JOIN iib_subject_sections AS c
//       ON b.section_code = c.section_code AND a.question_id = b.question_id
//     JOIN iib_sq_unicode_details AS d
//       ON d.question_id = b.question_id
//     WHERE a.question_paper_no = ? AND lang_code = ?
//     GROUP BY b.question_id
//     ORDER BY display_order
//   `;
// }

// // Now you have your sql query depending on the value of `lang`

// const queryParams = [
//   encryptKey, // For AES_DECRYPT (question_text)
//   encryptKey, // For AES_DECRYPT (option_1)
//   encryptKey, // For AES_DECRYPT (option_2)
//   encryptKey, // For AES_DECRYPT (option_3)
//   encryptKey, // For AES_DECRYPT (option_4)
//   questionPaperNo, // For a.question_paper_no
// ];
// if (lang !== "EN") {
//   queryParams.push(lang);
// }

//   db.query(sql,queryParams,(err, result) => {
//       if (err) {
//         console.error("MySQL error:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       } else {
//         const resultdata = result.map((question, index) => ({
//           id: question.question_id,
//           // id: index + 1,
//           text: decode(question.question_text),
//           subject_code: question.subject_code,
//           section_name: question.section_name,
//           answer_order: question.answer_order,
//           options: [
//             { id: "a", text: decode(question.option_1) },
//             { id: "b", text: decode(question.option_2) },
//             { id: "c", text: decode(question.option_3) },
//             { id: "d", text: decode(question.option_4) },
//           ],
//           correct_ans: Number(question.correct_answer),
//           // correct_ans: 2,

//           mark: question.marks,
//           negative_mark: question.negative_marks,
//         }));
//         //   console.log(resultdata);
//         res.json(resultdata);
//       }
//     }
//   );
// });

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
      AES_DECRYPT(b.question_text, ?) AS question_text, 
      AES_DECRYPT(b.option_1, ?) AS option_1, 
      AES_DECRYPT(b.option_2, ?) AS option_2, 
      AES_DECRYPT(b.option_3, ?) AS option_3, 
      AES_DECRYPT(b.option_4, ?) AS option_4, 
      AES_DECRYPT(b.option_5, ?) AS option_5, 
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
      ON b.section_code = c.section_code AND a.question_id = b.question_id
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
      AES_DECRYPT(d.question_text, ?) AS question_text, 
      AES_DECRYPT(d.option_1, ?) AS option_1, 
      AES_DECRYPT(d.option_2, ?) AS option_2, 
      AES_DECRYPT(d.option_3, ?) AS option_3, 
      AES_DECRYPT(d.option_4, ?) AS option_4, 
      AES_DECRYPT(d.option_5, ?) AS option_5, 
      b.correct_answer, 
      b.marks, 
      b.negative_marks,
      b.case_id, 
      b.section_code,
      c.*
    FROM iib_question_paper_details AS a
    JOIN iib_sq_details AS b 
      ON a.subject_code = b.subject_code 
    JOIN iib_subject_sections AS c 
      ON b.section_code = c.section_code AND a.question_id = b.question_id
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
            "select AES_DECRYPT(case_text,?) as case_text from iib_sc_details where case_id = ? and subject_code = ? and section_code = ?";
        } else {
          getCaseText =
            "select AES_DECRYPT(case_text,?) as case_text from iib_sc_unicode_details where case_id = ? and subject_code = ? and section_code = ? and lang_code = ?";
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
          case_id: question.case_id,
          section_code: question.section_code,
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

// Example route to return initial answers
app.get("/initialAnswers/:questionPaperNo/:encryptKey", async (req, res) => {
  const questionPaperNo = req.params.questionPaperNo;
  const encryptKey = req.params.encryptKey
  if (!questionPaperNo) {
    return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
  }
  const getCorrectAns = async (answer, quesId, qpno) => {
    // console.log(answer + typeof answer);

    if (answer == "DQ") {
      const query =
        "select AES_DECRYPT(desc_ans,?) from descriptive_answer where question_id = ? and question_paper_no = ? and response_id = (select max(response_id) from descriptive_answer where question_id = ? and question_paper_no = ?)";

      return new Promise((resolve, reject) => {
        db.query(query, [encryptKey, quesId, qpno, quesId, qpno], (err, res) => {
          if (err) {
            console.error("MySQL query error:", err);

            return reject(
              res.status(500).json({ message: "Internal Server Error" })
            );
          }

          console.log(res[0].desc_ans);

          return resolve(res[0].desc_ans);
        });
      });
    }

    if (answer != "DQ") {
      if (answer != "NULL") {
        return answer;
      } else {
        // console.log(answer + "frok else condition");

        return answer;
      }
    }
  };

  const sql = `SELECT display_order, AES_DECRYPT(answer,?), tag, question_id, question_paper_no FROM iib_response AS r1 WHERE r1.answer IS NOT NULL  AND r1.question_paper_no = ? AND  r1.id = ( SELECT MAX(r2.id) FROM iib_response AS r2 WHERE r2.question_id = r1.question_id  AND r2.question_paper_no = ?)`;

  db.query(sql, [encryptKey, questionPaperNo, questionPaperNo], async (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Format the results into the desired object
    const formattedAnswers = await results.reduce(async (accPromise, curr) => {
      const acc = await accPromise; // Wait for the accumulator to resolve

      acc[curr.display_order] = {
        answer: await getCorrectAns(
          curr.answer,

          curr.question_id,

          curr.question_paper_no
        ),

        tag: curr.tag,
      };

      return acc;
    }, Promise.resolve({}));

    // console.log("formattedAnswers"+formattedAnswers);
    // console.log(formattedAnswers);
    res.json(formattedAnswers);
  });
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

  const getSectionDuration = (subjectCode) => {
    const query = "SELECT section_code,section_duration FROM iib_subject_sections WHERE subject_code = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [subjectCode], (err, result) => {
        if (err) {
          reject("error with getSectionDuration query");
        }
        const sectionDurationObj = {};
        result.forEach((element) => {
          sectionDurationObj[element.section_code]=element.section_duration;
        });
        return resolve(sectionDurationObj);
      });
    });
  };
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
      const display_sec_timer= result[0] ? result[0].display_sec_timer : null;
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
      });
    }
  });
});

// API endpoint to get clienttime from iib_response table
app.get("/api/get-clienttime/:question_paper_no", (req, res) => {
  // const { question_paper_no } = req.query;
  const question_paper_no = req.params.question_paper_no;

  const query = `SELECT MIN(clienttime) as clienttime FROM iib_response WHERE question_paper_no = ?`;

  db.query(query, [question_paper_no], (err, result) => {
    if (err) {
      console.error("Error fetching clienttime:", err);
      res.status(500).send("Server error");
      return;
    }
    console.log("qpno", result);

    if (result.length > 0) {
      res.json({ clienttime: result[0].clienttime });
    } else {
      res.json({ clienttime: null }); // No entry found, return null
    }
  });
});

//Get RoughSheet Data
app.post("/api/get-rough-sheet", (req, res) => {
  const { membership_no, subject_code, question_paper_no, exam_date } =
    req.body;
  // console.log('member--',membership_no, subject_code, question_paper_no, exam_date);
  // Query the database to find the rough sheet data
  const query = `SELECT message FROM member_rough_sheet 
                   WHERE membership_no = ? 
                   AND subject_code = ? 
                   AND question_paper_no = ? 
                   AND exam_date = ?`;

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
        query = `
                UPDATE member_rough_sheet
                SET message = ?, updated_at = ?
                WHERE membership_no = ? AND question_paper_no = ? AND subject_code = ? AND exam_date = ?
            `;
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
        //console.log("sdad");
        query = `
                INSERT INTO member_rough_sheet (membership_no, question_paper_no, subject_code, exam_date, message, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
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
              console.error("Error inserting into xml_feed:", err);
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
  const { username, password } = req.body;
  const center_code = username.replace("iwfr_", "").toUpperCase();
  // Replace the following query with your actual query to check credentials
  const checkExamsql =
    "select * from exam_closure_summary where centre_code= ?";
  //   console.log(sql);
  db.query(checkExamsql, [center_code], (err, resultExam) => {
    if (resultExam.length == 0) {
      const sql =
        "SELECT * FROM iib_ta_details WHERE ta_login = ? AND ta_password = password(?)";
      //   console.log(sql);
      db.query(sql, [username, password], (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
        } else {
          if (results.length > 0) {
            res.json({ success: true, message: "Login successful" });
          } else {
            res.status(401).json({
              success: false,
              message: "Invalid username or password",
            });
          }
        }
      });
    } else {
      res.status(402).json({ success: false, message: "Exam completed!" });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password, centre_code } = req.body;

  // First query to check the credentials in iib_candidate
  const sqlCheckCredentials =
    "SELECT * FROM iib_candidate as a JOIN iib_candidate_iway as b ON a.membership_no = b.membership_no WHERE a.membership_no = ? AND a.raw_password = ? AND b.centre_code = ?";

  db.query(
    sqlCheckCredentials,
    [username, password, centre_code],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }

      if (results.length > 0) {
        // Credentials are correct, now check the iib_candidate_iway table
        const sqlCheckExamDate =
          "SELECT exam_date FROM iib_candidate_iway WHERE membership_no = ?";

        db.query(sqlCheckExamDate, [username], (err, results) => {
          if (err) {
            console.error("Database query error:", err);
            return res
              .status(500)
              .json({ success: false, message: "Internal Server Error" });
          }

          if (results.length > 0) {
            const examDate = new Date(results[0].exam_date);
            const currentDate = new Date();

            // Compare the exam date with the current date
            if (
              examDate.getFullYear() === currentDate.getFullYear() &&
              examDate.getMonth() === currentDate.getMonth() &&
              examDate.getDate() === currentDate.getDate()
            ) {
              // Dates match, login successful
              res.json({ success: true, message: "Login successful" });
            } else {
              // Exam date does not match the current date
              res.status(402).json({
                success: false,
                message: "Exam date does not match today's date",
              });
            }
          } else {
            // No matching membership_no found in iib_candidate_iway
            res.status(401).json({
              success: false,
              message: "Membership number not found in iib_candidate_iway",
            });
          }
        });
      } else {
        // Invalid username or password
        res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    }
  );
});

app.post("/update-exam-date", (req, res) => {
  const { membershipNo, examDate } = req.body;

  // SQL query to update exam_date in iib_candidate_iway, iib_exam_schedule, and iib_ta_iway
  const updateQuery = `
        UPDATE iib_candidate_iway, iib_exam_schedule, iib_ta_iway
        SET iib_candidate_iway.exam_date = ?,
            iib_exam_schedule.exam_date = ?,
            iib_ta_iway.exam_date = ?        
    `;

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
    insertIntoXmlFeed(formattedupdateQuery, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting into xml_feed:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });
    res.json({ message: "Exam date updated successfully." });
  });
});

app.get("/check-batch-closure/:batchId", async (req, res) => {
  const { batchId } = req.params;

  const query = `
        SELECT COUNT(*) as count 
        FROM batchwise_closure_summary 
        WHERE closure_batch_time = ?`;

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
    console.log("query", query);
    console.log("resss", results);
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

// app.get(
//   "/handleBatchClosure/:batchId/:hostIp/:serialNumber/:centreCode",
//   async (req, res) => {
//     const { batchId, hostIp, serialNumber, centreCode } = req.params;
//     console.log("batchId:", batchId);
//     console.log("hostIp:", hostIp);
//     console.log("serialNumber:", serialNumber);
//     console.log("centreCode:", centreCode);

//     const incompleteCandidatesQuery = `
//         SELECT
//             a.question_paper_no AS questionPaperNo,
//             a.membership_no AS membershipNo,
//             a.exam_code AS examCode,
//             a.subject_code AS subjectCode,
//             c.pass_mark AS passMark,
//             c.roundoff_score AS roundoff_score,
//             c.grace_mark AS graceMark,
//             c.subject_duration AS timeTaken
//         FROM iib_candidate_test AS a
//         JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
//         JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
//         WHERE a.test_status = 'IC' AND b.zone_code = ?
//         GROUP BY a.test_id`;

//     try {
//       // Fetch incomplete candidates
//       const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
//         batchId,
//       ]);

//       // const formattedTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
//       // const formattedDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

//       if (incompleteCandidates.length > 0) {
//         let remainingCandidates = incompleteCandidates.length;

//         for (const candidate of incompleteCandidates) {
//           const {
//             questionPaperNo,
//             membershipNo,
//             examCode,
//             subjectCode,
//             passMark,
//             roundoff_score,
//             graceMark,
//             timeTaken,
//           } = candidate;

//           console.log("Sending generated score for candidate:", membershipNo);

//           try {
//             // Generate score for the candidate
//             const score = await new Promise((resolve, reject) => {
//               generateScoreForCandidate(
//                 questionPaperNo,
//                 membershipNo,
//                 examCode,
//                 subjectCode,
//                 passMark,
//                 roundoff_score,
//                 graceMark,
//                 timeTaken,
//                 "Y",
//                 (err, score) => {
//                   if (err) return reject(err);
//                   resolve(score);
//                 }
//               );
//             });

//             console.log(
//               `Generated score for candidate ${membershipNo}: ${score}`
//             );

//             // Update candidate status
//             const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
//             await queryAsync(updateCandidateQuery, [membershipNo]);
//             const formattedupdateCandidateQuery = db.format(updateCandidateQuery, [membershipNo]);

//               // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedupdateCandidateQuery, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//             remainingCandidates--;

//             // If all candidates processed, merge and zip files
//             if (remainingCandidates === 0) {
//               console.log("Merging files...");
//               const zipFileName = await mergeAndZipFiles(
//                 centreCode,
//                 serialNumber
//               );
//               console.log("Zip file name:", zipFileName);
//               // Insert summary into database
//               const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                             (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                             VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//               await queryAsync(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,
//               ]);

//               const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,

//               ]);

//                // Insert the exact formatted query into xml_feed
//            insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting into xml_feed:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });

//               // Upload zip file
//               const zipFilePath = path.join(
//                 "C:\\pro\\itest\\feed",
//                 zipFileName
//               );
//               if (fs.existsSync(zipFilePath)) {
//                 const form = new FormData();
//                 form.append("feedFile", fs.createReadStream(zipFilePath));

//                 const { default: fetch } = await import("node-fetch");
//                 const response = await fetch(
//                   "https://demo70.sifyitest.com/livedata/upload.php",
//                   {
//                     method: "POST",
//                     body: form,
//                     headers: form.getHeaders(),
//                   }
//                 );

//                 if (!response.ok) {
//                   const responseBody = await response.text();
//                   throw new Error(
//                     `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//                   );
//                 }

//                 console.log(`File ${zipFileName} sent successfully.`);

//                 // Update summary status to 'U'
//                 const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//                 await queryAsync(updateSummaryQuery, [zipFileName]);
//                 const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//                  // Insert the exact formatted query into xml_feed
//                 insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       console.error("Error inserting into xml_feed:", err);
//                       res.status(500).json({ message: "Internal Server Error" });
//                     });
//                   }
//                 });

//                 res.status(200).json({
//                   message:
//                     "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//                   incompleteCandidatesCount: incompleteCandidates.length,
//                   zipFileName,
//                 });
//               } else {
//                 console.log(`File ${zipFileName} does not exist.`);
//                 res.status(500).json({ error: "Merged file does not exist" });
//               }
//             }
//           } catch (error) {
//             console.error(
//               "Error generating score or updating candidate:",
//               error
//             );
//             // Continue processing other candidates even if one fails
//           }
//         }
//       } else {
//         // Handle case when no incomplete candidates are found
//         console.log("No incomplete candidates found, merging files...");
//         const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

//         const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                 (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                 VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//         await queryAsync(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);
//         const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);

//         // Insert the exact formatted query into xml_feed
//         insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
//           if (err) {
//             return db.rollback(() => {
//               console.error("Error inserting into xml_feed:", err);
//               res.status(500).json({ message: "Internal Server Error" });
//             });
//           }
//         });

//         const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
//         if (fs.existsSync(zipFilePath)) {
//           const form = new FormData();
//           form.append("feedFile", fs.createReadStream(zipFilePath));

//           const { default: fetch } = await import("node-fetch");
//           const response = await fetch(
//             "https://demo70.sifyitest.com/livedata/upload.php",
//             {
//               method: "POST",
//               body: form,
//               headers: form.getHeaders(),
//             }
//           );

//           if (!response.ok) {
//             const responseBody = await response.text();
//             throw new Error(
//               `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//             );
//           }

//           console.log(`File ${zipFileName} sent successfully.`);

//           const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//           await queryAsync(updateSummaryQuery, [zipFileName]);
//           const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//            // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//           res.status(200).json({
//             message:
//               "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//             incompleteCandidatesCount: 0,
//             zipFileName,
//           });
//         } else {
//           console.log(`File ${zipFileName} does not exist.`);
//           res.status(500).json({ error: "Merged file does not exist" });
//         }
//       }
//     } catch (err) {
//       console.error("Error retrieving incomplete candidates:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );
app.get(
  "/handleBatchClosure/:batchId/:hostIp/:serialNumber/:centreCode",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode } = req.params;
    console.log("batchId:", batchId);
    console.log("hostIp:", hostIp);
    console.log("serialNumber:", serialNumber);
    console.log("centreCode:", centreCode);

    // const incompleteCandidatesQuery = `
    //     SELECT
    //         a.question_paper_no AS questionPaperNo,
    //         a.membership_no AS membershipNo,
    //         a.exam_code AS examCode,
    //         a.subject_code AS subjectCode,
    //         c.pass_mark AS passMark,
    //         c.roundoff_score AS roundoff_score,
    //         c.grace_mark AS graceMark,
    //         c.subject_duration AS timeTaken
    //     FROM iib_candidate_test AS a
    //     JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
    //     JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
    //     WHERE a.test_status = 'IC' AND b.zone_code = ?
    //     GROUP BY a.test_id`;

    try {
      // Fetch incomplete candidates
      // const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
      //   batchId,
      // ]);

      // if (incompleteCandidates.length > 0) {
      //   // let remainingCandidates = incompleteCandidates.length;

      //   for (const candidate of incompleteCandidates) {
      //     const {
      //       questionPaperNo,
      //       membershipNo,
      //       examCode,
      //       subjectCode,
      //       passMark,
      //       roundoff_score,
      //       graceMark,
      //       timeTaken,
      //     } = candidate;

      //     console.log("Sending generated score for candidate:", membershipNo);

      //     try {
      //       // Generate score for the candidate
      //       const score = await new Promise((resolve, reject) => {
      //         generateScoreForCandidate(
      //           questionPaperNo,
      //           membershipNo,
      //           examCode,
      //           subjectCode,
      //           passMark,
      //           roundoff_score,
      //           graceMark,
      //           timeTaken,
      //           "Y",
      //           (err, score) => {
      //             if (err) return reject(err);
      //             resolve(score);
      //           }
      //         );
      //       });

      //       console.log(
      //         `Generated score for candidate ${membershipNo}: ${score}`
      //       );

      //       // Update candidate status
      //       const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
      //       await queryAsync(updateCandidateQuery, [membershipNo]);

      //       remainingCandidates--;

      //       // If all candidates processed, merge and zip files
      //       if (remainingCandidates === 0) {
      //         console.log("Merging files...");
      //         const zipFileName = await mergeAndZipFiles(
      //           centreCode,
      //           serialNumber
      //         );
      //         console.log("Zip file name:", zipFileName);

      //         // Insert summary into database
      //         const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
      //                       (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
      //                       VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , NOW(), NOW(), ?)`;
      //         await queryAsync(insertSummaryQuery, [
      //           centreCode,
      //           batchId,
      //           zipFileName,
      //           serialNumber,
      //           hostIp,
      //         ]);

      //         // Upload zip file
      //         const zipFilePath = path.join(
      //           "C:\\pro\\itest\\feed",
      //           zipFileName
      //         );
      //         if (fs.existsSync(zipFilePath)) {
      //           const form = new FormData();
      //           form.append("feedFile", fs.createReadStream(zipFilePath));

      //           const { default: fetch } = await import("node-fetch");
      //           const response = await fetch(
      //             "https://demo70.sifyitest.com/livedata/upload.php",
      //             {
      //               method: "POST",
      //               body: form,
      //               headers: form.getHeaders(),
      //             }
      //           );

      //           if (!response.ok) {
      //             const responseBody = await response.text();
      //             throw new Error(
      //               `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
      //             );
      //           }

      //           console.log(`File ${zipFileName} sent successfully.`);

      //           // Update summary status to 'U'
      //           const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
      //           await queryAsync(updateSummaryQuery, [zipFileName]);

      //           res.status(200).json({
      //             message:
      //               "Batch closure processed successfully with files merged, zipped, sent, and status updated",
      //             incompleteCandidatesCount: incompleteCandidates.length,
      //             zipFileName,
      //           });
      //         } else {
      //           console.log(`File ${zipFileName} does not exist.`);
      //           res.status(500).json({ error: "Merged file does not exist" });
      //         }
      //       }
      //     } catch (error) {
      //       console.error(
      //         "Error generating score or updating candidate:",
      //         error
      //       );
      //       // Continue processing other candidates even if one fails
      //     }
      //   }
      // }
      // else {
      // Handle case when no incomplete candidates are found
      // console.log("No incomplete candidates found, merging files...");
      const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

      const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
      await queryAsync(insertSummaryQuery, [
        centreCode,
        batchId,
        zipFileName,
        serialNumber,
        formattedDate,
        formattedDate,
        hostIp,
      ]);
      const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
        formattedDate,
        centreCode,
        batchId,
        zipFileName,
        serialNumber,
        formattedTime,
        formattedTime,
        hostIp,
      ]);
      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting into xml_feed:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });

      const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
      if (fs.existsSync(zipFilePath)) {
        const form = new FormData();
        form.append("feedFile", fs.createReadStream(zipFilePath));

        const { default: fetch } = await import("node-fetch");
        const response = await fetch(
          "https://demo70.sifyitest.com/livedata/upload.php",
          {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          }
        );

        if (!response.ok) {
          const responseBody = await response.text();
          throw new Error(
            `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
          );
        }

        console.log(`File ${zipFileName} sent successfully.`);

        const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
        await queryAsync(updateSummaryQuery, [zipFileName]);
        const formattedupdateSummaryQuery = db.format(
          updateSummaryQuery,

          [zipFileName]
        );

        // Insert the exact formatted query into xml_feed

        insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting into xml_feed:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
        res.status(200).json({
          message:
            "Batch closure processed successfully with files merged, zipped, sent, and status updated",
          incompleteCandidatesCount: 0,
          zipFileName,
        });
      } else {
        console.log(`File ${zipFileName} does not exist.`);
        res.status(500).json({ error: "Merged file does not exist" });
      }
      // }
    } catch (err) {
      console.error("Error retrieving incomplete candidates:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get(
  "/handleDayClosure/:batchId/:hostIp/:serialNumber/:centreCode",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode } = req.params;
    console.log("batchId:", batchId);
    console.log("hostIp:", hostIp);
    console.log("serialNumber:", serialNumber);
    console.log("centreCode:", centreCode);

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
        SELECT 
            a.question_paper_no AS questionPaperNo, 
            a.membership_no AS membershipNo, 
            a.exam_code AS examCode, 
            a.subject_code AS subjectCode, 
            c.pass_mark AS passMark, 
            c.roundoff_score AS roundoff_score, 
            c.grace_mark AS graceMark,
            c.subject_duration AS timeTaken
        FROM iib_candidate_test AS a
        JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
        JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
        WHERE a.test_status = 'IC' and a.test_id in (?)
        GROUP BY a.test_id`;

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
                  console.error("Error inserting into xml_feed:", err);

                  res.status(500).json({ message: "Internal Server Error" });
                });
              }
            });
            remainingCandidates--;

            // If all candidates processed, merge and zip files
            if (remainingCandidates === 0) {
              console.log("Merging files...");
              const zipFileName = await mergeAndZipFiles(
                centreCode,
                serialNumber
              );
              console.log("Zip file name:", zipFileName);

              // Insert summary into database
              const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                            (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                            VALUES (?, ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
              await queryAsync(insertSummaryQuery, [
                formattedDate,
                centreCode,
                batchId,
                zipFileName,
                serialNumber,
                formattedDate,
                formattedDate,
                hostIp,
              ]);
              const formattedInsertResponseSql = db.format(insertSummaryQuery, [
                formattedDate,

                centreCode,

                batchId,

                zipFileName,

                serialNumber,

                formattedTime,

                formattedTime,

                hostIp,
              ]);
              // Insert the exact formatted query into xml_feed

              insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Error inserting into xml_feed:", err);
                    res.status(500).json({ message: "Internal Server Error" });
                  });
                }
              });
              // Upload zip file
              const zipFilePath = path.join(
                "C:\\pro\\itest\\feed",
                zipFileName
              );
              if (fs.existsSync(zipFilePath)) {
                const form = new FormData();
                form.append("feedFile", fs.createReadStream(zipFilePath));

                const { default: fetch } = await import("node-fetch");
                const response = await fetch(
                  "https://demo70.sifyitest.com/livedata/upload.php",
                  {
                    method: "POST",
                    body: form,
                    headers: form.getHeaders(),
                  }
                );

                if (!response.ok) {
                  const responseBody = await response.text();
                  throw new Error(
                    `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
                  );
                }

                console.log(`File ${zipFileName} sent successfully.`);

                // Update summary status to 'U'
                const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
                await queryAsync(updateSummaryQuery, [zipFileName]);
                const formattedupdateSummaryQuery = db.format(
                  updateSummaryQuery,

                  [zipFileName]
                );

                // Insert the exact formatted query into xml_feed

                insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("Error inserting into xml_feed:", err);

                      res

                        .status(500)

                        .json({ message: "Internal Server Error" });
                    });
                  }
                });
                // res.status(200).json({
                //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
                //     incompleteCandidatesCount: incompleteCandidates.length,
                //     zipFileName
                // });

                // Insert into `exam_closure_summary`
                const insertExamSummaryQuery = `INSERT INTO exam_closure_summary 
                            (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) 
                            VALUES (?, ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
                await queryAsync(insertExamSummaryQuery, [
                  formattedDate,
                  centreCode,
                  formattedTime,
                  hostIp,
                ]);
                const formattedinsertExamSummaryQuery = db.format(
                  insertExamSummaryQuery,

                  [formattedDate, centreCode, formattedTime, hostIp]
                );

                // Insert the exact formatted query into xml_feed

                insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("Error inserting into xml_feed:", err);

                      res

                        .status(500)

                        .json({ message: "Internal Server Error" });
                    });
                  }
                });
                // Zip all files starting with "feedbatch_"
                const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
                  .toISOString()
                  .replace(/[:-]/g, "")
                  .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
                const closureZipFilePath = path.join(
                  "C:\\pro\\itest\\feed",
                  zipClosureFileName
                );

                const feedFiles = fs
                  .readdirSync("C:\\pro\\itest\\feed")
                  .filter(
                    (file) =>
                      file.startsWith("feedbatch_") && file.endsWith(".zip")
                  );
                await zipFiles(feedFiles, closureZipFilePath);

                if (fs.existsSync(closureZipFilePath)) {
                  const form = new FormData();
                  form.append(
                    "feedFile",
                    fs.createReadStream(closureZipFilePath)
                  );

                  const { default: fetch } = await import("node-fetch");
                  const response = await fetch(
                    "https://demo70.sifyitest.com/livedata/upload.php",
                    {
                      method: "POST",
                      body: form,
                      headers: form.getHeaders(),
                    }
                  );

                  if (!response.ok) {
                    const responseBody = await response.text();
                    throw new Error(
                      `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
                    );
                  }

                  console.log(`File ${zipClosureFileName} sent successfully.`);

                  // Update `exam_closure_summary` to 'U'
                  const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
                  await queryAsync(updateExamSummaryQuery, [
                    zipClosureFileName,
                    centreCode,
                  ]);
                  const formattedupdateExamSummaryQuery = db.format(
                    updateExamSummaryQuery,

                    [zipClosureFileName, centreCode]
                  );

                  // Insert the exact formatted query into xml_feed

                  insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Error inserting into xml_feed:", err);

                        res

                          .status(500)

                          .json({ message: "Internal Server Error" });
                      });
                    }
                  });

                  const exportDump = exportTablesAsDump(
                    centreCode,
                    serialNumber
                  );

                  if (exportDump) {
                    res.status(200).json({
                      message:
                        "Batch closure processed successfully with files merged, zipped, sent, and status updated",
                      incompleteCandidatesCount: 0,
                      zipFileName: zipClosureFileName,
                    });
                  } else {
                    console.log(`Dump not generated.`);
                    res.status(500).json({ error: "Dump not generated" });
                  }
                } else {
                  console.log(`File ${zipClosureFileName} does not exist.`);
                  res
                    .status(500)
                    .json({ error: "Merged closure file does not exist" });
                }
              } else {
                console.log(`File ${zipFileName} does not exist.`);
                res.status(500).json({ error: "Merged file does not exist" });
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
        console.log("No incomplete candidates found, merging files...");
        const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

        const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                VALUES (?, ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
        await queryAsync(insertSummaryQuery, [
          formattedDate,
          centreCode,
          batchId,
          zipFileName,
          serialNumber,
          formattedTime,
          formattedTime,
          hostIp,
        ]);

        const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
          formattedDate,

          centreCode,

          batchId,

          zipFileName,

          serialNumber,

          formattedTime,

          formattedTime,

          hostIp,
        ]);

        // Insert the exact formatted query into xml_feed

        insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting into xml_feed:", err);

              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
        const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
        if (fs.existsSync(zipFilePath)) {
          const form = new FormData();
          form.append("feedFile", fs.createReadStream(zipFilePath));

          const { default: fetch } = await import("node-fetch");
          const response = await fetch(
            "https://demo70.sifyitest.com/livedata/upload.php",
            {
              method: "POST",
              body: form,
              headers: form.getHeaders(),
            }
          );

          if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(
              `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
            );
          }

          console.log(`File ${zipFileName} sent successfully.`);

          const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
          await queryAsync(updateSummaryQuery, [zipFileName]);
          const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [
            zipFileName,
          ]);

          // Insert the exact formatted query into xml_feed

          insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting into xml_feed:", err);

                res.status(500).json({ message: "Internal Server Error" });
              });
            }
          });
          // res.status(200).json({
          //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
          //     incompleteCandidatesCount: 0,
          //     zipFileName
          // });

          const insertExamSummaryQuery = `INSERT INTO exam_closure_summary 
                            (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) 
                            VALUES (?, ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
          await queryAsync(insertExamSummaryQuery, [
            formattedDate,
            centreCode,
            formattedTime,
            hostIp,
          ]);
          const formattedinsertExamSummaryQuery = db.format(
            insertExamSummaryQuery,

            [formattedDate, centreCode, formattedTime, hostIp]
          );

          // Insert the exact formatted query into xml_feed

          insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting into xml_feed:", err);

                res.status(500).json({ message: "Internal Server Error" });
              });
            }
          });
          //LAS // Zip all files starting with "feedbatch_"
          const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
            .toISOString()
            .replace(/[:-]/g, "")
            .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
          const closureZipFilePath = path.join(
            "C:\\pro\\itest\\feed",
            zipClosureFileName
          );

          const feedFiles = fs
            .readdirSync("C:\\pro\\itest\\feed")
            .filter(
              (file) => file.startsWith("feedbatch_") && file.endsWith(".zip")
            );

          console.log("final feed", feedFiles);
          await zipFiles(feedFiles, closureZipFilePath);

          if (fs.existsSync(closureZipFilePath)) {
            const form = new FormData();
            form.append("feedFile", fs.createReadStream(closureZipFilePath));

            const { default: fetch } = await import("node-fetch");
            const response = await fetch(
              "https://demo70.sifyitest.com/livedata/upload.php",
              {
                method: "POST",
                body: form,
                headers: form.getHeaders(),
              }
            );

            if (!response.ok) {
              const responseBody = await response.text();
              throw new Error(
                `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
              );
            }

            console.log(`File ${zipClosureFileName} sent successfully.`);

            // Update `exam_closure_summary` to 'U'
            const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
            await queryAsync(updateExamSummaryQuery, [
              zipClosureFileName,
              centreCode,
            ]);
            const formattedupdateExamSummaryQuery = db.format(
              updateExamSummaryQuery,

              [zipClosureFileName, centreCode]
            );

            // Insert the exact formatted query into xml_feed

            insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error inserting into xml_feed:", err);

                  res.status(500).json({ message: "Internal Server Error" });
                });
              }
            });

            const exportDump = exportTablesAsDump(centreCode, serialNumber);
            console.log("exportDump status", exportDump);
            if (exportDump) {
              res.status(200).json({
                message:
                  "Batch closure processed successfully with files merged, zipped, sent, and status updated",
                incompleteCandidatesCount: 0,
                zipFileName: zipClosureFileName,
              });
            } else {
              console.log(`Dump not generated.`);
              res.status(500).json({ error: "Dump not generated" });
            }
          } else {
            console.log(`File ${zipClosureFileName} does not exist.`);
            res
              .status(500)
              .json({ error: "Merged closure file does not exist" });
          }
        } else {
          console.log(`File ${zipFileName} does not exist.`);
          res.status(500).json({ error: "Merged file does not exist" });
        }
      }
    } catch (err) {
      console.error("Error retrieving incomplete candidates:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// app.get(
//   "/handleDayClosure/:batchId/:hostIp/:serialNumber/:centreCode",
//   async (req, res) => {
//     const { batchId, hostIp, serialNumber, centreCode } = req.params;
//     console.log("batchId:", batchId);
//     console.log("hostIp:", hostIp);
//     console.log("serialNumber:", serialNumber);
//     console.log("centreCode:", centreCode);

//     const incompleteCandidatesQuery = `
//         SELECT
//             a.question_paper_no AS questionPaperNo,
//             a.membership_no AS membershipNo,
//             a.exam_code AS examCode,
//             a.subject_code AS subjectCode,
//             c.pass_mark AS passMark,
//             c.roundoff_score AS roundoff_score,
//             c.grace_mark AS graceMark,
//             c.subject_duration AS timeTaken
//         FROM iib_candidate_test AS a
//         JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
//         JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
//         WHERE a.test_status = 'IC' AND b.zone_code = ?
//         GROUP BY a.test_id`;

//     try {
//       // Fetch incomplete candidates
//       const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
//         batchId,
//       ]);

//       if (incompleteCandidates.length > 0) {
//         let remainingCandidates = incompleteCandidates.length;

//         for (const candidate of incompleteCandidates) {
//           const {
//             questionPaperNo,
//             membershipNo,
//             examCode,
//             subjectCode,
//             passMark,
//             roundoff_score,
//             graceMark,
//             timeTaken,
//           } = candidate;

//           console.log("Sending generated score for candidate:", membershipNo);

//           try {
//             // Generate score for the candidate
//             const score = await new Promise((resolve, reject) => {
//               generateScoreForCandidate(
//                 questionPaperNo,
//                 membershipNo,
//                 examCode,
//                 subjectCode,
//                 passMark,
//                 roundoff_score,
//                 graceMark,
//                 timeTaken,
//                 "Y",
//                 (err, score) => {
//                   if (err) return reject(err);
//                   resolve(score);
//                 }
//               );
//             });

//             console.log(
//               `Generated score for candidate ${membershipNo}: ${score}`
//             );

//             // Update candidate status
//             const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
//             await queryAsync(updateCandidateQuery, [membershipNo]);
//             const formattedupdateCandidateQuery = db.format(updateCandidateQuery, [membershipNo]);

//             // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateCandidateQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//             remainingCandidates--;

//             // If all candidates processed, merge and zip files
//             if (remainingCandidates === 0) {
//               console.log("Merging files...");
//               const zipFileName = await mergeAndZipFiles(
//                 centreCode,
//                 serialNumber
//               );
//               console.log("Zip file name:", zipFileName);

//               // Insert summary into database
//               const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                             (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                             VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//               await queryAsync(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,
//               ]);
//               const formattedInsertResponseSql = db.format(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,
//               ]);

//                // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//               // Upload zip file
//               const zipFilePath = path.join(
//                 "C:\\pro\\itest\\feed",
//                 zipFileName
//               );
//               if (fs.existsSync(zipFilePath)) {
//                 const form = new FormData();
//                 form.append("feedFile", fs.createReadStream(zipFilePath));

//                 const { default: fetch } = await import("node-fetch");
//                 const response = await fetch(
//                   "https://demo70.sifyitest.com/livedata/upload.php",
//                   {
//                     method: "POST",
//                     body: form,
//                     headers: form.getHeaders(),
//                   }
//                 );

//                 if (!response.ok) {
//                   const responseBody = await response.text();
//                   throw new Error(
//                     `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//                   );
//                 }

//                 console.log(`File ${zipFileName} sent successfully.`);

//                 // Update summary status to 'U'
//                 const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//                 await queryAsync(updateSummaryQuery, [zipFileName]);
//                 const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//                  // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//                 // res.status(200).json({
//                 //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
//                 //     incompleteCandidatesCount: incompleteCandidates.length,
//                 //     zipFileName
//                 // });

//                 // Insert into `exam_closure_summary`
//                 const insertExamSummaryQuery = `INSERT INTO exam_closure_summary
//                             (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address)
//                             VALUES ('?', ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
//                 await queryAsync(insertExamSummaryQuery, [formattedDate,centreCode, formattedTime,hostIp]);
//                 const formattedinsertExamSummaryQuery = db.format(insertExamSummaryQuery, [formattedDate,centreCode, formattedTime,hostIp]);
//                 // Insert the exact formatted query into xml_feed
//                 insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       console.error("Error inserting into xml_feed:", err);
//                       res.status(500).json({ message: "Internal Server Error" });
//                     });
//                   }
//                 });

//                 // Zip all files starting with "feedbatch_"
//                 const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
//                   .toISOString()
//                   .replace(/[:-]/g, "")
//                   .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
//                 const closureZipFilePath = path.join(
//                   "C:\\pro\\itest\\feed",
//                   zipClosureFileName
//                 );

//                 const feedFiles = fs
//                   .readdirSync("C:\\pro\\itest\\feed")
//                   .filter(
//                     (file) =>
//                       file.startsWith("feedbatch_") && file.endsWith(".zip")
//                   );
//                 await zipFiles(feedFiles, closureZipFilePath);

//                 if (fs.existsSync(closureZipFilePath)) {
//                   const form = new FormData();
//                   form.append(
//                     "feedFile",
//                     fs.createReadStream(closureZipFilePath)
//                   );

//                   const { default: fetch } = await import("node-fetch");
//                   const response = await fetch(
//                     "https://demo70.sifyitest.com/livedata/upload.php",
//                     {
//                       method: "POST",
//                       body: form,
//                       headers: form.getHeaders(),
//                     }
//                   );

//                   if (!response.ok) {
//                     const responseBody = await response.text();
//                     throw new Error(
//                       `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
//                     );
//                   }

//                   console.log(`File ${zipClosureFileName} sent successfully.`);

//                   // Update `exam_closure_summary` to 'U'
//                   const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
//                   await queryAsync(updateExamSummaryQuery, [
//                     zipClosureFileName,
//                     centreCode,
//                   ]);
//                   const formattedupdateExamSummaryQuery = db.format(updateExamSummaryQuery, [
//                     zipClosureFileName,
//                     centreCode,
//                   ]);

//                    // Insert the exact formatted query into xml_feed
//                   insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
//                     if (err) {
//                       return db.rollback(() => {
//                         console.error("Error inserting into xml_feed:", err);
//                         res.status(500).json({ message: "Internal Server Error" });
//                       });
//                     }
//                   });

//                   const exportDump = exportTablesAsDump(
//                     centreCode,
//                     serialNumber
//                   );

//                   if (exportDump) {
//                     res.status(200).json({
//                       message:
//                         "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//                       incompleteCandidatesCount: 0,
//                       zipFileName: zipClosureFileName,
//                     });
//                   } else {
//                     console.log(`Dump not generated.`);
//                     res.status(500).json({ error: "Dump not generated" });
//                   }
//                 } else {
//                   console.log(`File ${zipClosureFileName} does not exist.`);
//                   res
//                     .status(500)
//                     .json({ error: "Merged closure file does not exist" });
//                 }
//               } else {
//                 console.log(`File ${zipFileName} does not exist.`);
//                 res.status(500).json({ error: "Merged file does not exist" });
//               }
//             }
//           } catch (error) {
//             console.error(
//               "Error generating score or updating candidate:",
//               error
//             );
//             // Continue processing other candidates even if one fails
//           }
//         }
//       } else {
//         // Handle case when no incomplete candidates are found
//         console.log("No incomplete candidates found, merging files...");
//         const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

//         const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                 (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                 VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//         await queryAsync(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);

//         const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);

//         // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//         const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
//         if (fs.existsSync(zipFilePath)) {
//           const form = new FormData();
//           form.append("feedFile", fs.createReadStream(zipFilePath));

//           const { default: fetch } = await import("node-fetch");
//           const response = await fetch(
//             "https://demo70.sifyitest.com/livedata/upload.php",
//             {
//               method: "POST",
//               body: form,
//               headers: form.getHeaders(),
//             }
//           );

//           if (!response.ok) {
//             const responseBody = await response.text();
//             throw new Error(
//               `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//             );
//           }

//           console.log(`File ${zipFileName} sent successfully.`);

//           const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//           await queryAsync(updateSummaryQuery, [zipFileName]);
//           const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//            // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//           // res.status(200).json({
//           //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
//           //     incompleteCandidatesCount: 0,
//           //     zipFileName
//           // });

//           const insertExamSummaryQuery = `INSERT INTO exam_closure_summary
//                             (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address)
//                             VALUES ('?', ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
//           await queryAsync(insertExamSummaryQuery, [formattedDate,centreCode,formattedTime, hostIp]);
//           const formattedinsertExamSummaryQuery = db.format(insertExamSummaryQuery, [formattedDate,centreCode,formattedTime, hostIp]);

//            // Insert the exact formatted query into xml_feed
//            insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting into xml_feed:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });
//           //LAS // Zip all files starting with "feedbatch_"
//           const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
//             .toISOString()
//             .replace(/[:-]/g, "")
//             .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
//           const closureZipFilePath = path.join(
//             "C:\\pro\\itest\\feed",
//             zipClosureFileName
//           );

//           const feedFiles = fs
//             .readdirSync("C:\\pro\\itest\\feed")
//             .filter(
//               (file) => file.startsWith("feedbatch_") && file.endsWith(".zip")
//             );

//           console.log("final feed", feedFiles);
//           await zipFiles(feedFiles, closureZipFilePath);

//           if (fs.existsSync(closureZipFilePath)) {
//             const form = new FormData();
//             form.append("feedFile", fs.createReadStream(closureZipFilePath));

//             const { default: fetch } = await import("node-fetch");
//             const response = await fetch(
//               "https://demo70.sifyitest.com/livedata/upload.php",
//               {
//                 method: "POST",
//                 body: form,
//                 headers: form.getHeaders(),
//               }
//             );

//             if (!response.ok) {
//               const responseBody = await response.text();
//               throw new Error(
//                 `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
//               );
//             }

//             console.log(`File ${zipClosureFileName} sent successfully.`);

//             // Update `exam_closure_summary` to 'U'
//             const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
//             await queryAsync(updateExamSummaryQuery, [
//               zipClosureFileName,
//               centreCode,
//             ]);
//             const formattedupdateExamSummaryQuery = db.format(updateExamSummaryQuery, [
//               zipClosureFileName,
//               centreCode,
//             ]);

//              // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//             const exportDump = exportTablesAsDump(centreCode, serialNumber);
//             console.log("exportDump status", exportDump);
//             if (exportDump) {
//               res.status(200).json({
//                 message:
//                   "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//                 incompleteCandidatesCount: 0,
//                 zipFileName: zipClosureFileName,
//               });
//             } else {
//               console.log(`Dump not generated.`);
//               res.status(500).json({ error: "Dump not generated" });
//             }
//           } else {
//             console.log(`File ${zipClosureFileName} does not exist.`);
//             res
//               .status(500)
//               .json({ error: "Merged closure file does not exist" });
//           }
//         } else {
//           console.log(`File ${zipFileName} does not exist.`);
//           res.status(500).json({ error: "Merged file does not exist" });
//         }
//       }
//     } catch (err) {
//       console.error("Error retrieving incomplete candidates:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

// app.get(
//   "/handleDayClosure/:batchId/:hostIp/:serialNumber/:centreCode",
//   async (req, res) => {
//     const { batchId, hostIp, serialNumber, centreCode } = req.params;
//     console.log("batchId:", batchId);
//     console.log("hostIp:", hostIp);
//     console.log("serialNumber:", serialNumber);
//     console.log("centreCode:", centreCode);

//     const incompleteCandidatesQuery = `
//         SELECT
//             a.question_paper_no AS questionPaperNo,
//             a.membership_no AS membershipNo,
//             a.exam_code AS examCode,
//             a.subject_code AS subjectCode,
//             c.pass_mark AS passMark,
//             c.roundoff_score AS roundoff_score,
//             c.grace_mark AS graceMark,
//             c.subject_duration AS timeTaken
//         FROM iib_candidate_test AS a
//         JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
//         JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
//         WHERE a.test_status = 'IC' AND b.zone_code = ?
//         GROUP BY a.test_id`;

//     try {
//       // Fetch incomplete candidates
//       const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
//         batchId,
//       ]);

//       if (incompleteCandidates.length > 0) {
//         let remainingCandidates = incompleteCandidates.length;

//         for (const candidate of incompleteCandidates) {
//           const {
//             questionPaperNo,
//             membershipNo,
//             examCode,
//             subjectCode,
//             passMark,
//             roundoff_score,
//             graceMark,
//             timeTaken,
//           } = candidate;

//           console.log("Sending generated score for candidate:", membershipNo);

//           try {
//             // Generate score for the candidate
//             const score = await new Promise((resolve, reject) => {
//               generateScoreForCandidate(
//                 questionPaperNo,
//                 membershipNo,
//                 examCode,
//                 subjectCode,
//                 passMark,
//                 roundoff_score,
//                 graceMark,
//                 timeTaken,
//                 "Y",
//                 (err, score) => {
//                   if (err) return reject(err);
//                   resolve(score);
//                 }
//               );
//             });

//             console.log(
//               `Generated score for candidate ${membershipNo}: ${score}`
//             );

//             // Update candidate status
//             const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
//             await queryAsync(updateCandidateQuery, [membershipNo]);
//             const formattedupdateCandidateQuery = db.format(updateCandidateQuery, [membershipNo]);

//             // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateCandidateQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//             remainingCandidates--;

//             // If all candidates processed, merge and zip files
//             if (remainingCandidates === 0) {
//               console.log("Merging files...");
//               const zipFileName = await mergeAndZipFiles(
//                 centreCode,
//                 serialNumber
//               );
//               console.log("Zip file name:", zipFileName);

//               // Insert summary into database
//               const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                             (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                             VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//               await queryAsync(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,
//               ]);
//               const formattedInsertResponseSql = db.format(insertSummaryQuery, [
//                 formattedDate,
//                 centreCode,
//                 batchId,
//                 zipFileName,
//                 serialNumber,
//                 formattedTime,
//                 formattedTime,
//                 hostIp,
//               ]);

//                // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//               // Upload zip file
//               const zipFilePath = path.join(
//                 "C:\\pro\\itest\\feed",
//                 zipFileName
//               );
//               if (fs.existsSync(zipFilePath)) {
//                 const form = new FormData();
//                 form.append("feedFile", fs.createReadStream(zipFilePath));

//                 const { default: fetch } = await import("node-fetch");
//                 const response = await fetch(
//                   "https://demo70.sifyitest.com/livedata/upload.php",
//                   {
//                     method: "POST",
//                     body: form,
//                     headers: form.getHeaders(),
//                   }
//                 );

//                 if (!response.ok) {
//                   const responseBody = await response.text();
//                   throw new Error(
//                     `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//                   );
//                 }

//                 console.log(`File ${zipFileName} sent successfully.`);

//                 // Update summary status to 'U'
//                 const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//                 await queryAsync(updateSummaryQuery, [zipFileName]);
//                 const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//                  // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//                 // res.status(200).json({
//                 //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
//                 //     incompleteCandidatesCount: incompleteCandidates.length,
//                 //     zipFileName
//                 // });

//                 // Insert into `exam_closure_summary`
//                 const insertExamSummaryQuery = `INSERT INTO exam_closure_summary
//                             (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address)
//                             VALUES ('?', ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
//                 await queryAsync(insertExamSummaryQuery, [formattedDate,centreCode, formattedTime,hostIp]);
//                 const formattedinsertExamSummaryQuery = db.format(insertExamSummaryQuery, [formattedDate,centreCode, formattedTime,hostIp]);
//                 // Insert the exact formatted query into xml_feed
//                 insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       console.error("Error inserting into xml_feed:", err);
//                       res.status(500).json({ message: "Internal Server Error" });
//                     });
//                   }
//                 });

//                 // Zip all files starting with "feedbatch_"
//                 const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
//                   .toISOString()
//                   .replace(/[:-]/g, "")
//                   .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
//                 const closureZipFilePath = path.join(
//                   "C:\\pro\\itest\\feed",
//                   zipClosureFileName
//                 );

//                 const feedFiles = fs
//                   .readdirSync("C:\\pro\\itest\\feed")
//                   .filter(
//                     (file) =>
//                       file.startsWith("feedbatch_") && file.endsWith(".zip")
//                   );
//                 await zipFiles(feedFiles, closureZipFilePath);

//                 if (fs.existsSync(closureZipFilePath)) {
//                   const form = new FormData();
//                   form.append(
//                     "feedFile",
//                     fs.createReadStream(closureZipFilePath)
//                   );

//                   const { default: fetch } = await import("node-fetch");
//                   const response = await fetch(
//                     "https://demo70.sifyitest.com/livedata/upload.php",
//                     {
//                       method: "POST",
//                       body: form,
//                       headers: form.getHeaders(),
//                     }
//                   );

//                   if (!response.ok) {
//                     const responseBody = await response.text();
//                     throw new Error(
//                       `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
//                     );
//                   }

//                   console.log(`File ${zipClosureFileName} sent successfully.`);

//                   // Update `exam_closure_summary` to 'U'
//                   const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
//                   await queryAsync(updateExamSummaryQuery, [
//                     zipClosureFileName,
//                     centreCode,
//                   ]);
//                   const formattedupdateExamSummaryQuery = db.format(updateExamSummaryQuery, [
//                     zipClosureFileName,
//                     centreCode,
//                   ]);

//                    // Insert the exact formatted query into xml_feed
//                   insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
//                     if (err) {
//                       return db.rollback(() => {
//                         console.error("Error inserting into xml_feed:", err);
//                         res.status(500).json({ message: "Internal Server Error" });
//                       });
//                     }
//                   });

//                   const exportDump = exportTablesAsDump(
//                     centreCode,
//                     serialNumber
//                   );

//                   if (exportDump) {
//                     res.status(200).json({
//                       message:
//                         "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//                       incompleteCandidatesCount: 0,
//                       zipFileName: zipClosureFileName,
//                     });
//                   } else {
//                     console.log(`Dump not generated.`);
//                     res.status(500).json({ error: "Dump not generated" });
//                   }
//                 } else {
//                   console.log(`File ${zipClosureFileName} does not exist.`);
//                   res
//                     .status(500)
//                     .json({ error: "Merged closure file does not exist" });
//                 }
//               } else {
//                 console.log(`File ${zipFileName} does not exist.`);
//                 res.status(500).json({ error: "Merged file does not exist" });
//               }
//             }
//           } catch (error) {
//             console.error(
//               "Error generating score or updating candidate:",
//               error
//             );
//             // Continue processing other candidates even if one fails
//           }
//         }
//       } else {
//         // Handle case when no incomplete candidates are found
//         console.log("No incomplete candidates found, merging files...");
//         const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

//         const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
//                 (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
//                 VALUES ('?', ?, 'a', ?, ?, 'I', ? , ?, ?, ?)`;
//         await queryAsync(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);

//         const formattedinsertSummaryQuery = db.format(insertSummaryQuery, [
//           formattedDate,
//           centreCode,
//           batchId,
//           zipFileName,
//           serialNumber,
//           formattedTime,
//           formattedTime,
//           hostIp,
//         ]);

//         // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(formattedinsertSummaryQuery, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });

//         const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
//         if (fs.existsSync(zipFilePath)) {
//           const form = new FormData();
//           form.append("feedFile", fs.createReadStream(zipFilePath));

//           const { default: fetch } = await import("node-fetch");
//           const response = await fetch(
//             "https://demo70.sifyitest.com/livedata/upload.php",
//             {
//               method: "POST",
//               body: form,
//               headers: form.getHeaders(),
//             }
//           );

//           if (!response.ok) {
//             const responseBody = await response.text();
//             throw new Error(
//               `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
//             );
//           }

//           console.log(`File ${zipFileName} sent successfully.`);

//           const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
//           await queryAsync(updateSummaryQuery, [zipFileName]);
//           const formattedupdateSummaryQuery = db.format(updateSummaryQuery, [zipFileName]);

//            // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateSummaryQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//           // res.status(200).json({
//           //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
//           //     incompleteCandidatesCount: 0,
//           //     zipFileName
//           // });

//           const insertExamSummaryQuery = `INSERT INTO exam_closure_summary
//                             (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address)
//                             VALUES ('?', ?, 'a', 'Sync Process Data', 'I', ?, ?)`;
//           await queryAsync(insertExamSummaryQuery, [formattedDate,centreCode,formattedTime, hostIp]);
//           const formattedinsertExamSummaryQuery = db.format(insertExamSummaryQuery, [formattedDate,centreCode,formattedTime, hostIp]);

//            // Insert the exact formatted query into xml_feed
//            insertIntoXmlFeed(formattedinsertExamSummaryQuery, (err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error inserting into xml_feed:", err);
//                 res.status(500).json({ message: "Internal Server Error" });
//               });
//             }
//           });
//           //LAS // Zip all files starting with "feedbatch_"
//           const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
//             .toISOString()
//             .replace(/[:-]/g, "")
//             .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
//           const closureZipFilePath = path.join(
//             "C:\\pro\\itest\\feed",
//             zipClosureFileName
//           );

//           const feedFiles = fs
//             .readdirSync("C:\\pro\\itest\\feed")
//             .filter(
//               (file) => file.startsWith("feedbatch_") && file.endsWith(".zip")
//             );

//           console.log("final feed", feedFiles);
//           await zipFiles(feedFiles, closureZipFilePath);

//           if (fs.existsSync(closureZipFilePath)) {
//             const form = new FormData();
//             form.append("feedFile", fs.createReadStream(closureZipFilePath));

//             const { default: fetch } = await import("node-fetch");
//             const response = await fetch(
//               "https://demo70.sifyitest.com/livedata/upload.php",
//               {
//                 method: "POST",
//                 body: form,
//                 headers: form.getHeaders(),
//               }
//             );

//             if (!response.ok) {
//               const responseBody = await response.text();
//               throw new Error(
//                 `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
//               );
//             }

//             console.log(`File ${zipClosureFileName} sent successfully.`);

//             // Update `exam_closure_summary` to 'U'
//             const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
//             await queryAsync(updateExamSummaryQuery, [
//               zipClosureFileName,
//               centreCode,
//             ]);
//             const formattedupdateExamSummaryQuery = db.format(updateExamSummaryQuery, [
//               zipClosureFileName,
//               centreCode,
//             ]);

//              // Insert the exact formatted query into xml_feed
//             insertIntoXmlFeed(formattedupdateExamSummaryQuery, (err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Error inserting into xml_feed:", err);
//                   res.status(500).json({ message: "Internal Server Error" });
//                 });
//               }
//             });

//             const exportDump = exportTablesAsDump(centreCode, serialNumber);
//             console.log("exportDump status", exportDump);
//             if (exportDump) {
//               res.status(200).json({
//                 message:
//                   "Batch closure processed successfully with files merged, zipped, sent, and status updated",
//                 incompleteCandidatesCount: 0,
//                 zipFileName: zipClosureFileName,
//               });
//             } else {
//               console.log(`Dump not generated.`);
//               res.status(500).json({ error: "Dump not generated" });
//             }
//           } else {
//             console.log(`File ${zipClosureFileName} does not exist.`);
//             res
//               .status(500)
//               .json({ error: "Merged closure file does not exist" });
//           }
//         } else {
//           console.log(`File ${zipFileName} does not exist.`);
//           res.status(500).json({ error: "Merged file does not exist" });
//         }
//       }
//     } catch (err) {
//       console.error("Error retrieving incomplete candidates:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

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

  const getRangePosScore = (questionPaperNo, encryKey) => {
    const rangePosScoreQuery = `SELECT SUM(A.marks) AS posscore

        FROM iib_sq_details A

        LEFT JOIN iib_response B ON A.question_id = B.question_id

        WHERE B.question_paper_no = ?

          AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)

          AND AES_DECRYPT(B.answer,?) between AES_DECRYPT(A.option_1,?) and AES_DECRYPT(A.option_2,?)

          AND A.question_type = 'R'

          AND B.answer != ''

    `;

    return new Promise((resolve, reject) => {
      db.query(
        rangePosScoreQuery,

        [questionPaperNo, questionPaperNo, encryKey, encryKey, encryKey, encryKey],

        (err, result) => {
          if (err) {
            console.error("Error calculating range positive score:", err);

            return reject(callback(err));
          }

          return resolve(
            result[0].posscore == null || result[0].posscore === "NULL"
              ? 0
              : result[0].posscore
          );
        }
      );
    });
  };

  const getRangeNegScore = (questionPaperNo, encryKey) => {
    const rangeNegScoreQuery = ` SELECT SUM(A.negative_marks) AS negscore

            FROM iib_sq_details A
            LEFT JOIN iib_response B ON A.question_id = B.question_id
            WHERE B.question_paper_no = ?
              AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
             AND AES_DECRYPT(B.answer,?) not between AES_DECRYPT(A.option_1,?) and AES_DECRYPT(A.option_2,?)
             AND A.question_type = 'R'
              AND B.answer != ''

      `;

    return new Promise((resolve, reject) => {
      db.query(
        rangeNegScoreQuery,

        [questionPaperNo, questionPaperNo, encryKey,encryKey, encryKey, encryKey],

        (err, result) => {
          if (err) {
            console.error("Error calculating range negative score:", err);

            return reject(callback(err));
          }

          return resolve(
            result[0].negscore == null || result[0].negscore === "NULL"
              ? 0
              : result[0].negscore
          );
        }
      );
    });
  };

  const getNumericPosScore = (questionPaperNo, encryKey) => {
    const numericPosScoreQuery = `SELECT SUM(A.marks) AS posscore

            FROM iib_sq_details A

            LEFT JOIN iib_response B ON A.question_id = B.question_id

            WHERE B.question_paper_no = ?

              AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)

              AND AES_DECRYPT(A.option_1,?) = AES_DECRYPT(B.answer,?)  

              AND A.question_type = 'N'

              AND B.answer != ''

        `;

    return new Promise((resolve, reject) => {
      db.query(
        numericPosScoreQuery,

        [questionPaperNo, questionPaperNo, encryKey, encryKey],

        (err, result) => {
          if (err) {
            console.error("Error calculating range positive score:", err);

            return reject(callback(err));
          }

          return resolve(
            result[0].posscore == null || result[0].posscore === "NULL"
              ? 0
              : result[0].posscore
          );
        }
      );
    });
  };

  const getNumericNegScore = (questionPaperNo, encryKey) => {
    const numericNegScoreQuery = `SELECT SUM(A.negative_marks) AS negscore

              FROM iib_sq_details A

              LEFT JOIN iib_response B ON A.question_id = B.question_id

              WHERE B.question_paper_no = ?

                AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)

                AND AES_DECRYPT(A.option_1,?) != AES_DECRYPT(B.answer,?)

                AND A.question_type = 'N'

                AND B.answer != ''

          `;

    return new Promise((resolve, reject) => {
      db.query(
        numericNegScoreQuery,

        [questionPaperNo, questionPaperNo, encryKey, encryKey],

        (err, result) => {
          if (err) {
            console.error("Error calculating range positive score:", err);

            return reject(callback(err));
          }

          return resolve(
            result[0].negscore == null || result[0].negscore === "NULL"
              ? 0
              : result[0].negscore
          );
        }
      );
    });
  };

  const rangePosScore = await getRangePosScore(questionPaperNo, encryKey);

  const rangeNegScore = await getRangeNegScore(questionPaperNo, encryKey);

  const numericPosScore = await getNumericPosScore(questionPaperNo, encryKey);

  const numericNegScore = await getNumericNegScore(questionPaperNo, encryKey);

  console.log(rangePosScore, rangeNegScore, numericPosScore, numericNegScore);

  const rangeNumericPosScore = rangePosScore + numericPosScore;

  const rangeNumericNegScore = rangeNegScore + numericNegScore;
  const posScoreQuery = `
        SELECT SUM(A.marks) AS posscore
        FROM iib_sq_details A
        LEFT JOIN iib_response B ON A.question_id = B.question_id
        WHERE B.question_paper_no = ?
          AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
          AND A.correct_answer = AES_DECRYPT(B.answer,?)
          AND A.question_type NOT IN ('R','N')
          AND B.answer != ''
    `;

  db.query(
    posScoreQuery,
    [questionPaperNo, questionPaperNo, encryKey],
    (err, rowsPosScore) => {
      if (err) {
        console.error("Error calculating positive score:", err);
        return callback(err);
      }

      const posscore = (rowsPosScore[0]?.posscore || 0) + rangeNumericPosScore;
      // const posscore = (rowsPosScore[0]?.posscore || 0) ;
      console.log("Positive score:", posscore);
      const negScoreQuery = `
            SELECT SUM(A.negative_marks) AS negscore
            FROM iib_sq_details A
            LEFT JOIN iib_response B ON A.question_id = B.question_id
            WHERE B.question_paper_no = ?
              AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
              AND A.correct_answer != AES_DECRYPT(B.answer,?)
              AND A.question_type NOT IN ('R','N')
              AND B.answer != ''
        `;

      db.query(
        negScoreQuery,
        [questionPaperNo, questionPaperNo, encryKey],
        (err, rowsNegScore) => {
          if (err) {
            console.error("Error calculating negative score:", err);
            return callback(err);
          }

          const negscore =
            (rowsNegScore[0]?.negscore || 0) + rangeNumericNegScore;
          // const negscore = (rowsNegScore[0]?.negscore || 0) ;          console.log("Negative score:", negscore);

          let score = posscore - negscore;
          if (score < 0) score = 0;
          if (roundoff_score === "Y") score = Math.round(score);

          console.log(`Final score for candidate ${membershipNo}: ${score}`);

          const examResult = score + graceMark >= passMark ? "P" : "F";

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
                  ? `INSERT INTO iib_candidate_scores (membership_no, exam_code, subject_code, score, exam_date, time_taken, result, auto_submit)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                  : `UPDATE iib_candidate_scores
                     SET score = ?, exam_date = ?, time_taken = ?, result = ?, auto_submit = ?
                     WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

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
                    console.error("Error inserting into xml_feed:", err);
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
      );
    }
  );
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

  // Query to check if an entry with the same membership_no and question_paper_no already exists
  const checkQuery = `
        SELECT COUNT(*) AS count
        FROM iib_candidate_test
        WHERE membership_no = ? AND question_paper_no = ?
    `;

  db.query(checkQuery, [membership_no, question_paper_no], (err, results) => {
    if (err) {
      console.error("Error during SQL query execution:", {
        error: err.message,
        query: checkQuery,
        parameters: [membership_no, question_paper_no],
      });
      return res
        .status(500)
        .json({ error: "An error occurred while checking for existing data." });
    }

    const count = results[0].count;

    if (count > 0) {
      // Entry already exists
      res.json({ message: "Data already inserted successfully", results });
    } else {
      // Proceed to insert the data if no existing entry is found
      const insertQuery = `
                INSERT INTO iib_candidate_test (
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
                    serverno
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const formattedInsertQuery = db.format(insertQuery, [
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
      ]);

      db.query(formattedInsertQuery, (err, results) => {
        if (err) {
          console.error("Error during SQL query execution:", {
            error: err.message,
            query: formattedInsertQuery,
          });
          return res
            .status(500)
            .json({ error: "An error occurred while inserting data." });
        }

        // After a successful insertion, log the query into xml_feed
        insertIntoXmlFeed(formattedInsertQuery, (err) => {
          if (err) {
            console.error("Error inserting into xml_feed:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while logging the query." });
          }

          res.json({
            message: "Data inserted successfully and query logged",
            results,
          });
        });
      });
    }
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


app.get("/api/iib_exam_subjects",(req,res)=>{
  
  const subjectCode = req.query.subjectCode;
  // console.log(subjectCode)
  const query = `SELECT * FROM iib_exam_subjects where subject_code = ?`;
  return new Promise((resolve,reject)=>{
    db.query(query,[subjectCode],(err,results)=>{
if(err){
  return reject(err);
}
return resolve(res.json(results));
    })
  })
  
})
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
      console.error("Error inserting into xml_feed:", err);
      return callback(err);
    }
    callback(null, result);
  });
}

// Function to convert the query to base64 and write it to a file
function processXmlFeed() {
  // Query to get all records with status 'N'
  const selectQuery = `SELECT id, query FROM xml_feed WHERE status = 'N'`;

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
      const fileName = `feed_${nextFileNumber}.txt`;

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

        // Insert the exact formatted query into xml_feed
        insertIntoXmlFeed(formattedinsertQuery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting into xml_feed:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
      });

      // Update the status to 'Y' for all processed records
      const updateQuery = `UPDATE xml_feed SET status = 'Y' WHERE status = 'N'`;
      db.query(updateQuery, (err) => {
        if (err) {
          console.error("Error updating xml_feed status:", err);
        }
        // Insert the exact formatted query into xml_feed
        insertIntoXmlFeed(updateQuery, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting into xml_feed:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });
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

async function processAndSendFile() {
  try {
    // Query to get all filenames with status 'N'
    const selectQuery = `SELECT id, filename FROM feed_filenames WHERE status = 'N'`;

    db.query(selectQuery, async (err, rows) => {
      if (err) {
        console.error("Error fetching feed_filenames data:", err);
        return;
      }

      if (rows.length > 0) {
        // Import fetch dynamically
        const { default: fetch } = await import("node-fetch");

        for (const fileRecord of rows) {
          const fileName = fileRecord.filename;
          const filePath = path.join(feedDir, fileName);

          if (fs.existsSync(filePath)) {
            const form = new FormData();
            form.append("feedFile", fs.createReadStream(filePath));
            console.log("filename", filePath);

            try {
              const response = await fetch(
                "https://demo70.sifyitest.com/livedata/upload.php",
                {
                  method: "POST",
                  body: form,
                  headers: form.getHeaders(),
                }
              );

              if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(
                  `Failed to send file ${fileName}. Status: ${response.status}, Response: ${responseBody}`
                );
              }

              console.log(`File ${fileName} sent successfully.`);

              // Update the status to 'Y' for the processed record
              const updateQuery = `UPDATE feed_filenames SET status = 'Y' WHERE id = ?`;
              const formattedupdateQuery = db.format(updateQuery, [
                fileRecord.id,
              ]);
              db.query(updateQuery, [fileRecord.id], (err) => {
                if (err) {
                  console.error("Error updating feed_filenames status:", err);
                }

                // Insert the exact formatted query into xml_feed
                insertIntoXmlFeed(formattedupdateQuery, (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("Error inserting into xml_feed:", err);
                      res
                        .status(500)
                        .json({ message: "Internal Server Error" });
                    });
                  }
                });
              });
            } catch (error) {
              console.error("Error sending file:", error);
            }
          } else {
            console.log(`File ${fileName} does not exist.`);
          }
        }
      } else {
        console.log("No records found with status N.");
      }
    });
  } catch (error) {
    console.error("Error processing and sending files:", error);
  }
}

// Schedule the task to run every 5 minutes
cron.schedule("*/1 * * * *", () => {
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

    const form = new FormData();
    form.append("feedFile", fs.createReadStream(dumpFilePath));

    const { default: fetch } = await import("node-fetch");
    const response = await fetch(
      "https://demo70.sifyitest.com/livedata/upload.php",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

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

// Schedule the task to run every 5 minutes
cron.schedule("*/1 * * * *", () => {
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

    const sql = `
        SELECT exam_time, count(1) as cnt 
        FROM iib_candidate_iway 
        WHERE exam_date = ?
        GROUP BY exam_date, exam_time
      `;

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
        const sqlIncomplete = `
            SELECT count(1) as incompleteCount 
            FROM iib_candidate_iway a
            JOIN iib_candidate_test b ON a.membership_no = b.membership_no 
            WHERE b.test_status='IC' 
            AND current_session='Y' 
            AND a.exam_code = b.exam_code 
            AND a.subject_code = b.subject_code 
            AND a.exam_date = ? 
            AND a.exam_time = ?
          `;

        db.query(
          sqlIncomplete,
          [examDate, exam_time],
          (error, resIncomplete) => {
            const incompleteCount = resIncomplete.length
              ? resIncomplete[0].incompleteCount
              : 0;

            // Query for complete count
            const sqlAttended = `
              SELECT count(1) as completeCount 
              FROM iib_candidate_iway a
              JOIN iib_candidate_scores b ON a.membership_no = b.membership_no 
              WHERE a.exam_code = b.exam_code 
              AND a.subject_code = b.subject_code 
              AND a.exam_date = ? 
              AND a.exam_time = ?
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
      const q = `
        SELECT membership_no, SUM(time_extended) AS time_extended 
        FROM iib_candidate_test 
        WHERE exam_code = ? AND subject_code = ? 
        GROUP BY membership_no`;

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
        return res.status(500).json({ error: "Internal Server Error" });
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

      // Process each membership number
      for (const membershipNo of memno) {
        const membershipNoValue = membershipNo[0].membership_no;

        // Fetch test data for each membership number
        const timeResults = await new Promise((resolve, reject) => {
          db.query(
            `SELECT start_time, last_updated_time, 
                    TIME_TO_SEC(DATE_FORMAT(last_updated_time, '%T')) - TIME_TO_SEC(DATE_FORMAT(start_time, '%T')) AS duration,
                    test_status, question_paper_no, total_time 
             FROM iib_candidate_test 
             WHERE membership_no = ? AND exam_code = ? AND subject_code = ? 
             ORDER BY last_updated_time ASC`,
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
        console.log("Query Results:", timeResults);
        const responselength = 0;
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
            console.log("Count", totalResponseCount);
            candidateData.total_response_count = totalResponseCount;
            candidateData.Time.push({
              start_time,
              last_updated_time,
              client_time: total_time,
              // total_response_count: totalResponseCount,
            });

            dur += duration;

            // Fetch responses for the question paper
            const responseResults = await new Promise((resolve, reject) => {
              db.query(
                `SELECT id, updatedtime, clienttime 
                 FROM iib_response 
                 WHERE question_paper_no = ? 
                 ORDER BY id`,
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
                    ? arrayResponse[loop - 1].response_client_time - clienttime
                    : candidateData.Time[0].client_time - clienttime,
              });
            }
            // Fetch time logs (previously in PHP)
            const timeLogResults = await db.query(
              `SELECT id, servertime, clienttime 
     FROM timelog 
     WHERE questionpaperno = ? 
       AND membership_no = ? 
     ORDER BY id`,
              [question_paper_no, memno]
            );

            // Initialize the array to store time logs

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

      console.log("Final Processed Data:", mainArray);
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
      res.status(404).json({ message: "No data found" });
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
        const stats = fs.statSync(filePath); // Get the file stats
        const file_name_time = stats.mtime.toISOString(); // Get the modification time

        return { file_name: file, file_name_time, mtime: stats.mtime }; // Include `mtime` for sorting
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time in descending order

    res.json({
      feed_count: files.length,
      feed_list: feed_list.map(({ file_name, file_name_time }) => ({
        file_name,
        file_name_time,
      })), // Return the file name and time without the `mtime`
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
          const sqlUpdate = `
                      UPDATE iib_feedback SET 
                      login_process='${loginProcess}', system_work='${systemWork}', tech_prob='${techProblem}', q_rating='${questionRating}', adeq_time='${adequateTime}', navigate_issue='${screenNavigationIssue}', rating='${examMethodologyRating}', feedback_text='${txtfeedback}', diplay_questions='${display_questions}', problem_questions='${problem_questions}', question_asked_twice='${question_asked_twice}', answer_not_relevant='${answer_not_relevant}', question_not_display='${question_not_display}', answer_not_display='${answer_not_display}', display_image_issue='${display_image_issue}', Display_issue_notdisprop='${Display_issue_notdisprop}', Junk_Char_observed='${Junk_Char_observed}' 
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

    const sql1 = `
    SELECT membership_no, SUM(time_extended) AS time_extended 
    FROM iib_candidate_test 
    WHERE exam_code = ? AND subject_code = ? 
    GROUP BY membership_no
    `;
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
                    const sqlTimeQuery = `
                    SELECT TRIM(start_time) AS start_time, TRIM(last_updated_time) AS last_updated_time,
                      TIME_TO_SEC(DATE_FORMAT(TRIM(last_updated_time), '%T')) - TIME_TO_SEC(DATE_FORMAT(TRIM(start_time), '%T')) AS duration, 
                      TRIM(test_status) AS test_status, question_paper_no 
                    FROM iib_candidate_test 
                    WHERE membership_no = ? AND exam_code = ? AND subject_code = ? 
                    ORDER BY last_updated_time ASC
                  `;

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




app.get("/candidate-report/:rollNum", async (req, res) => {
  const { rollNum } = req.params;
  // console.log(rollNum);
  let iwayAddress = "";
  let strMedium = "";
  let dispExamDate = "";
  let iwayCentreCode = "";
  let encryKey = "";
  let iwayExamTime;
  const examCodeQuery = `SELECT DISTINCT e.exam_code, e.exam_name FROM iib_exam e, iib_candidate_scores s WHERE s.exam_code=e.exam_code AND online='Y' AND membership_no= ? `;
  db.query(examCodeQuery, [rollNum], (err, rowsExam) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    rowsExam.forEach((rowExam) => {
      const examCode = rowExam.exam_code;
      const examName = rowExam.exam_name;
      const subjectCodeQuery =
        "SELECT DISTINCT e.subject_code, e.subject_name, e.qp_encry_key FROM iib_exam_subjects e, iib_candidate_scores s WHERE e.subject_code=s.subject_code AND online='Y' AND e.exam_code=? AND membership_no=? ";

      db.query(subjectCodeQuery, [examCode, rollNum], (err, rowsSubject) => {
        if (err) {
          console.error("Error querying the database:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }

        rowsSubject.forEach((rowSubject) => {
          const subjectCode = rowSubject.subject_code;
          const subjectName = rowSubject.subject_name;
          const encryptKey = rowSubject.qp_encry_key;
          // console.log(encryptKey+"encryptKey")
          return new Promise((resolve, reject) => {
            const sqlQuestions =
              "SELECT question_paper_no FROM iib_candidate_test WHERE exam_code=? AND subject_code=? AND test_status='C' AND membership_no=?";
            db.query(
              sqlQuestions,
              [examCode, subjectCode, rollNum],
              (err, rowsSelQues) => {
                if (err) {
                  console.error("Error querying the database:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  reject(err);
                } else {
                  rowsSelQues.forEach((rowSelQues) => {
                    const questionPaperNo = rowSelQues.question_paper_no;
                    const sqlMember =
                      "SELECT name, address1, address2, address3, address4, address5, address6, pin_code FROM iib_candidate WHERE membership_no=?";

                    db.query(sqlMember, [rollNum], (err, rowsSqlMember) => {
                      if (err) {
                        console.error("Error querying the database:", err);
                        res
                          .status(500)
                          .json({ error: "Internal Server Error" });
                        return;
                      }
                      rowsSqlMember.forEach((rowSqlMember) => {
                        const memberName = rowSqlMember.name;
                        const c_addr1 = rowSqlMember.address1;
                        const c_addr2 = rowSqlMember.address2;
                        const c_addr3 = rowSqlMember.address3;
                        const c_addr4 = rowSqlMember.address4;
                        const c_addr5 = rowSqlMember.address5;
                        const c_addr6 = rowSqlMember.address6;
                        const c_pin = rowSqlMember.pin_code;

                        let memberAddress = "";
                        if (c_addr1 != "") memberAddress += c_addr1;
                        if (memberAddress != "") memberAddress += " ";
                        if (c_addr2 != "") memberAddress += c_addr2;
                        if (memberAddress != "" && c_addr2 != "")
                          memberAddress += " ";
                        if (c_addr3 != "") memberAddress += c_addr3;
                        if (memberAddress != "" && c_addr3 != "")
                          memberAddress += " ";
                        if (c_addr4 != "") memberAddress += c_addr4;
                        if (memberAddress != "" && c_addr4 != "")
                          memberAddress += " ";
                        if (c_addr5 != "") memberAddress += c_addr5;
                        if (memberAddress != "" && c_addr5 != "")
                          memberAddress += " ";
                        if (c_addr6 != "") memberAddress += c_addr6;
                        if (memberAddress != "" && c_addr6 != "")
                          memberAddress += " ";
                        if (c_pin != "") memberAddress += c_pin;

                        // console.log(memberAddress);
                        const sqlIway =
                          " SELECT centre_code, exam_date, exam_time FROM iib_candidate_iway WHERE  exam_code= ? AND subject_code= ? AND membership_no= ? ";
                        db.query(
                          sqlIway,
                          [examCode, subjectCode, rollNum],
                          (err, rowsSqlIway) => {
                            if (err) {
                              console.error(
                                "Error querying the database:",
                                err
                              );
                              res
                                .status(500)
                                .json({ error: "Internal Server Error" });
                              return;
                            }
                            if (rowsSqlIway.length > 0) {
                              rowsSqlIway.forEach((rowSqlIway) => {
                                const iwayExamDate = rowSqlIway.exam_date;
                                iwayCentreCode = rowSqlIway.centre_code;
                                iwayExamTime = rowSqlIway.exam_time;
                                let aDate;
                                if (iwayExamDate != "") {
                                  aDate = utils
                                    .formatExamDate(iwayExamDate)
                                    .split("-");
                                }
                                dispExamDate =
                                  aDate[2] + "/" + aDate[1] + "/" + aDate[0];

                                const sqlIwayAddress =
                                  "SELECT iway_address1, iway_address2, iway_city, iway_state, iway_pin_code FROM iib_iway_details WHERE centre_code= ?";

                                db.query(
                                  sqlIwayAddress,
                                  [iwayCentreCode],
                                  (err, rowsSqlIwayAddress) => {
                                    if (err) {
                                      console.error(
                                        "Error querying the database:",
                                        err
                                      );
                                      res.status(500).json({
                                        error: "Internal Server Error",
                                      });
                                      return;
                                    }

                                    rowsSqlIwayAddress[0].iway_address1 != ""
                                      ? (iwayAddress +=
                                          rowsSqlIwayAddress[0].iway_address1)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_address2 != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_address2)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_city != ""
                                      ? (iwayAddress +=
                                          " " + rowsSqlIwayAddress[0].iway_city)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_pin_code != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_pin_code)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_state != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_state)
                                      : (iwayAddress += "");

                                    // console.log(iwayAddress);
                                  }
                                );
                              });
                            }
                            //medium
                            const sqlMedium =
                              "SELECT e.medium_code as medium_code, institution_name  FROM iib_exam_candidate e, iib_candidate c WHERE c.membership_no= ? AND c.membership_no=e.membership_no AND exam_code= ? AND subject_code= ?";
                            db.query(
                              sqlMedium,
                              [rollNum, examCode, subjectCode],
                              (err, rowsSqlMedium) => {
                                if (err) {
                                  console.error(
                                    "Error querying the database:",
                                    err
                                  );
                                  res
                                    .status(500)
                                    .json({ error: "Internal Server Error" });
                                  return;
                                }

                                if (
                                  rowsSqlMedium[0].medium_code == "E" ||
                                  rowsSqlMedium[0].medium_code == "EN" ||
                                  rowsSqlMedium[0].medium_code == "ENGLISH"
                                ) {
                                  strMedium = "ENGLISH";
                                } else if (
                                  rowsSqlMedium[0].medium_code == "H" ||
                                  rowsSqlMedium[0].medium_code == "HINDI"
                                ) {
                                  strMedium = "HINDI";
                                }
                                const institutionName =
                                  rowsSqlMedium[0].institution_name;
                                // console.log(strMedium);
                                const sqlMarks =
                                  "SELECT total_marks, pass_mark FROM iib_exam_subjects WHERE exam_code = ? AND subject_code= ? AND online='Y' ";

                                db.query(
                                  sqlMarks,
                                  [examCode, subjectCode],
                                  (err, rowsSqlMarks) => {
                                    if (err) {
                                      console.error(
                                        "Error querying the database:",
                                        err
                                      );
                                      res.status(500).json({
                                        error: "Internal Server Error",
                                      });
                                      return;
                                    }
                                    rowsSqlMarks.forEach((rowSqlMarks) => {
                                      const totalMarks =
                                        rowSqlMarks.total_marks;
                                      const passMark = rowSqlMarks.pass_mark;

                                      const sqlScores =
                                        "SELECT score FROM iib_candidate_scores WHERE membership_no= ? AND subject_code= ? ";
                                      db.query(
                                        sqlScores,
                                        [rollNum, subjectCode],
                                        (err, rowsSqlScores) => {
                                          if (err) {
                                            console.error(
                                              "Error querying the database:",
                                              err
                                            );
                                            res.status(500).json({
                                              error: "Internal Server Error",
                                            });
                                            return;
                                          }
                                          const scores = rowsSqlScores[0].score;
                                          const sqlQnsIds =
                                            "SELECT question_id FROM iib_question_paper_details WHERE question_paper_no= ?  ORDER BY display_order";

                                          db.query(
                                            sqlQnsIds,
                                            [questionPaperNo],
                                            (err, rowsSqlQnsIds) => {
                                              if (err) {
                                                console.error(
                                                  "Error querying the database:",
                                                  err
                                                );
                                                res.status(500).json({
                                                  error:
                                                    "Internal Server Error",
                                                });
                                                return;
                                              }
                                              let quesIdsArr = [];
                                              const qnsSum =
                                                rowsSqlQnsIds.length;
                                              rowsSqlQnsIds.forEach(
                                                (rowSqlQnsIds) => {
                                                  quesIdsArr.push(
                                                    rowSqlQnsIds.question_id
                                                  );
                                                }
                                              );
                                              const sqlQns =
                                                "select question_id, AES_DECRYPT(answer,?) from iib_response where id in ( select max(id) from iib_response where question_paper_no = ? group by question_id) ORDER BY display_order";

                                              db.query(
                                                sqlQns,
                                                [encryptKey, questionPaperNo],
                                                (err, rowsSqlQns) => {
                                                  let unAttQns = 0;
                                                  let attQns = 0;
                                                  let aQuestions = {};
                                                  let ansQuestionId = [];
                                                  let ansQuesAnswer = {};
                                                  rowsSqlQns.forEach(
                                                    (rowSqlQns) => {
                                                      ansQuestionId.push(
                                                        rowSqlQns.question_id
                                                      );
                                                      ansQuesAnswer[
                                                        rowSqlQns.question_id
                                                      ] = rowSqlQns.answer;
                                                    }
                                                  );
                                                  // console.log(ansQuesAnswer);
                                                  let arrDiffQID =
                                                    quesIdsArr.filter(
                                                      (item) =>
                                                        !ansQuestionId.includes(
                                                          item
                                                        )
                                                    );

                                                  arrDiffQID.forEach(
                                                    (qUnAnsVal) => {
                                                      if (qUnAnsVal !== "") {
                                                        ansQuesAnswer[
                                                          qUnAnsVal
                                                        ] = "";
                                                      }
                                                    }
                                                  );
                                                  // Second loop - categorizing questions as attempted or unattempted
                                                  quesIdsArr.forEach(
                                                    (ansKey) => {
                                                      if (
                                                        ansQuesAnswer[
                                                          ansKey
                                                        ] === ""
                                                      ) {
                                                        unAttQns += 1; // Increment unattempted questions count
                                                        aQuestions[ansKey] =
                                                          ansQuesAnswer[ansKey]; // Store unattempted question
                                                      } else {
                                                        attQns += 1; // Increment attempted questions count
                                                        aQuestions[ansKey] =
                                                          ansQuesAnswer[ansKey]; // Store attempted question
                                                      }
                                                    }
                                                  );
                                                  // console.log(aQuestions);

                                                  let tableName = "";
                                                  if (strMedium === "HINDI") {
                                                    tableName = `iib_section_questions_hindi`;
                                                  } else if (
                                                    strMedium === "ENGLISH"
                                                  ) {
                                                    tableName = `iib_sq_details`;
                                                  }
                                                  let questionTextArray = [];
                                                  let correctAnswerArray = [];
                                                  let marksArray = [];
                                                  let markedAnswerArray = [];
                                                  let cAns = [];
                                                  let mAns = [];
                                                  let encryKey = "";
                                                  const getEncryKey = (
                                                    exam_code,
                                                    subject_code
                                                  ) => {
                                                    return new Promise(
                                                      (resolve, reject) => {
                                                        const encryKeySql = `select qp_encry_key from iib_exam_subjects where exam_code = ? and subject_code = ?`;
                                                        db.query(
                                                          encryKeySql,
                                                          [
                                                            exam_code,
                                                            subject_code,
                                                          ],
                                                          (
                                                            err,
                                                            rowEncryKeySql
                                                          ) => {
                                                            if (err) {
                                                              console.error(
                                                                "Error querying the database:",
                                                                err
                                                              );
                                                              return reject(
                                                                "Internal Server Error"
                                                              );
                                                            }
                                                            return resolve(
                                                              rowEncryKeySql[0]
                                                                .qp_encry_key
                                                            );
                                                          }
                                                        );
                                                      }
                                                    );
                                                  };
                                                  // const gettingEncryptKey = async () => {

                                                  // }
                                                  // gettingEncryptKey().catch((error) => {console.error("Error getting encryption key:",error);});
                                                  // Function to get question data
                                                  const getQuestionData = (
                                                    questionID,
                                                    markedAnswer,
                                                    encryKey
                                                  ) => {
                                                    return new Promise(
                                                      (resolve, reject) => {
                                                        const aQuestionsSql = `SELECT AES_DECRYPT(question_text, ?) as question_text, correct_answer, marks 
                                                      FROM ${tableName} 
                                                      WHERE question_id = ?`;
                                                        db.query(
                                                          aQuestionsSql,
                                                          [
                                                            encryKey,
                                                            questionID,
                                                          ],
                                                          (
                                                            err,
                                                            rowsaQuestions
                                                          ) => {
                                                            if (err) {
                                                              console.error(
                                                                "Error querying the database:",
                                                                err
                                                              );
                                                              return reject(
                                                                "Internal Server Error"
                                                              );
                                                            }
                                                            // Populate arrays with question data
                                                            questionTextArray.push(
                                                              decode(
                                                                rowsaQuestions[0]
                                                                  .question_text
                                                                  ? rowsaQuestions[0].question_text.toString(
                                                                      "utf8"
                                                                    )
                                                                  : null
                                                              )
                                                            );
                                                            correctAnswerArray.push(
                                                              decode(
                                                                rowsaQuestions[0].correct_answer.toString(
                                                                  "utf8"
                                                                )
                                                              )
                                                            );
                                                            marksArray.push(
                                                              rowsaQuestions[0]
                                                                .marks
                                                            );
                                                            markedAnswerArray.push(
                                                              markedAnswer
                                                            );
                                                            const correctAnswer =
                                                              rowsaQuestions[0]
                                                                .correct_answer;

                                                            // console.log(correctAnswer);
                                                            // Handle correct answer
                                                            if (
                                                              correctAnswer !==
                                                              ""
                                                            ) {
                                                              const sqlCorrectAnswer = `SELECT AES_DECRYPT(option_${correctAnswer},?) as correctAns FROM ${tableName} WHERE question_id= ?`;
                                                              db.query(
                                                                sqlCorrectAnswer,
                                                                [
                                                                  encryKey,
                                                                  questionID,
                                                                ],
                                                                (
                                                                  err,
                                                                  rowsCorrectAnswer
                                                                ) => {
                                                                  // console.log(sqlCorrectAnswer);
                                                                  if (err)
                                                                    return reject(
                                                                      err
                                                                    );
                                                                  // console.log(decode(rowsCorrectAnswer[0].correctAns ? rowsCorrectAnswer[0].correctAns.toString('utf-8'): null ))
                                                                  cAns.push(
                                                                    decode(
                                                                      rowsCorrectAnswer[0]
                                                                        .correctAns
                                                                        ? rowsCorrectAnswer[0].correctAns.toString(
                                                                            "utf-8"
                                                                          )
                                                                        : null
                                                                    )
                                                                  );
                                                                  resolve(); // Resolve when the correct answer query is done
                                                                }
                                                              );
                                                            } else {
                                                              cAns.push("");
                                                              resolve(); // Resolve immediately if there's no correct answer
                                                            }

                                                            // Handle marked answer
                                                            if (markedAnswer !=="" &&markedAnswer !=="NULL") {
                                                              const sqlMarkedAnswer = `SELECT AES_DECRYPT(option_${markedAnswer},?) as markedAns FROM ${tableName} WHERE question_id= ?`;
                                                              db.query(
                                                                sqlMarkedAnswer,
                                                                [
                                                                  encryKey,
                                                                  questionID,
                                                                ],
                                                                (
                                                                  err,
                                                                  rowsMarkedAnswer
                                                                ) => {
                                                                  if (err)
                                                                    return reject(
                                                                      err
                                                                    );

                                                                  // console.log(decode(rowsMarkedAnswer[0].markedAns ? rowsMarkedAnswer[0].markedAns.toString('utf8') : null));
                                                                  mAns.push(
                                                                    decode(
                                                                      rowsMarkedAnswer[0]
                                                                        .markedAns
                                                                        ? rowsMarkedAnswer[0].markedAns.toString(
                                                                            "utf8"
                                                                          )
                                                                        : null
                                                                    )
                                                                  );
                                                                  resolve(); // Resolve when the marked answer query is done
                                                                }
                                                              );
                                                            } else {
                                                              mAns.push("");
                                                              resolve(); // Resolve immediately if there's no marked answer
                                                            }
                                                          }
                                                        );
                                                      }
                                                    );
                                                  };

                                                  // Async function to gather data from aQuestions
                                                  const gatherQuestionsData =
                                                    async () => {
                                                      encryKey =
                                                        await getEncryKey(
                                                          examCode,
                                                          subjectCode
                                                        );
                                                      for (const [questionID,markedAnswer] of Object.entries(
                                                        aQuestions)) {
                                                          await getQuestionData(
                                                          questionID,
                                                          markedAnswer,
                                                          encryKey
                                                        );
                                                      }
                                                      // All data is collected; you can access your arrays here
                                                      const aQuestionsLength =
                                                        aQuestions.length;
                                                      return res.json({
                                                        questionTextArray,correctAnswerArray,markedAnswerArray,marksArray,cAns,mAns,memberName,memberAddress,iwayExamTime,strMedium,iwayAddress,examCode,examName,subjectCode,
                                                        subjectName,
                                                        institutionName,
                                                        totalMarks,
                                                        passMark,
                                                        iwayCentreCode,
                                                        dispExamDate,
                                                        scores,
                                                        qnsSum,
                                                        quesIdsArr,
                                                        ansQuestionId,
                                                        ansQuesAnswer,
                                                        arrDiffQID,
                                                        unAttQns,
                                                        attQns,
                                                        aQuestionsLength,
                                                      });
                                                    };

                                                  // Call the function to gather data
                                                  gatherQuestionsData().catch(
                                                    (error) => {
                                                      console.error(
                                                        "Error gathering question data:",
                                                        error
                                                      );
                                                    }
                                                  );

                                                  // console.log(
                                                  //   questionTextArray
                                                  // );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    });
                                  }
                                );
                              }
                            );
                          }
                        );
                      });
                    });
                  });
                  resolve();
                }
              }
            );
          });
        });
      });
    });
  });
});



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
  // console.log(req.params);
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
app.get("/download-file/:status", async (req, res) => {
  const status = req.params.status;
  const { centreCode, serverNo } = utils.centreAndServerNo();
  // const batch = req.params.batch;
  // console.log("Gop:", status);

  // let file = status === 'Base' ? process.env.CLIENT : status;
  // const file =
  //   status === "Base"
  //     ? process.env.CLIENT
  //     : status === "Act"
  //       ? batch == "11:00:00"
  //         ? "bac7a-110000"
  //         : "78192-150000"
  //       : status;
  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "b4681-100000"
          : "3b62f-150000"
        : status;
  const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;

  console.log("URL:", url);

  // Define directories
  const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
  const extractDir = path.join("C:", "pro", "itest", "activate");
  const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
  const signDir = path.join("C:", "pro", "itest", "activate", "sign");
  const zipFilePath = path.join(tempDir, `${file}.zip`);

  // Create the temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  // let query = "";
  try {
    // Step 1: Download the file
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("File downloaded successfully");

    // Step 2: Unzip the file
    const zip = new AdmZip(zipFilePath);

    if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
      zip.extractAllTo(extractDir, true);
      console.log(`File extracted successfully to ${extractDir}`);
    } else {
      if (status.endsWith("_photo")) {
        let query = "";
        const count_photo_download = utils.countDownloadByAction("photo");

        try {
          zip.extractAllTo(photoDir, true);
          if (count_photo_download >= 1 && count_photo_download != "") {
            query = `UPDATE qp_download SET download_status = 'D', download_time = NOW() WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'D'`;
          } else if (count_photo_download === 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'D', NOW())`;
          }

          console.log(`Photo File extracted successfully to ${photoDir}`);
        } catch (err) {
          if (count_photo_download >= 1 && count_photo_download != "") {
            query = `UPDATE qp_download SET download_status = 'E2', download_time = NOW() WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'E2'`;
          } else if (count_photo_download === 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'E2', NOW())`;
          }
          console.error("Error during extraction:", err);
        }
        // Execute the query if it has been set
        if (query) {
          utils.executeImageDownloadQuery(query, centreCode, serverNo);
          // return res.json({"message":"Photo downloaded Successfully"})
        }
      }

      if (status.endsWith("_sign")) {
        let query = "";
        const count_sign_download = utils.countDownloadByAction("sign");
        try {
          zip.extractAllTo(signDir, true);
          if (count_sign_download >= 1 && count_sign_download != "") {
            query = `UPDATE qp_download set download_status ='D',download_time=now() where centre_code=? and serverno= ? and download_sec='Sign' and download_status != 'D' `;
          } else if (count_sign_download == 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','D',NOW())`;
          }
          console.log(`Sign File extracted successfully to ${signDir}`);
        } catch (err) {
          if (count_sign_download >= 1 && count_sign_download != "") {
            query = `UPDATE qp_download set download_status='E2',download_time=now() where centre_code= ? and serverno= ? and download_sec='Sign' and download_status != 'E2' `;
          } else if (count_sign_download == 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','E2',NOW())`;
          }
          console.log(err);
        }
        if (query) {
          utils.executeImageDownloadQuery(query, centreCode, serverNo);
          // return res.json({"message":"Sign downloaded Successfully"})
        }
      }
    }
    // Optionally delete the zip file after extraction
    fs.unlinkSync(zipFilePath);

    res.send("File downloaded, extracted, and content modified successfully");
  } catch (error) {
    if (status.endsWith("_photo")) {
      let query = "";
      const count_photo_download = utils.countDownloadByAction("photo");
      if (count_photo_download >= 1 && count_photo_download != "") {
        query = `UPDATE qp_download set download_status='NF', download_time=now() where centre_code = ? and serverno = ? and  download_sec='Photo' and download_status != 'NF' `;
      } else if (count_photo_download == 0) {
        query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'NF', NOW())`;
      }
      if (query) {
        utils.executeImageDownloadQuery(query, centreCode, serverNo);
      }
    }
    if (status.endsWith("_sign")) {
      const count_sign_download = utils.countDownloadByAction("sign");
      let query = "";
      if (count_sign_download >= 1 && count_sign_download != "") {
        query = `UPDATE qp_download set download_status='NF', download_time=now() where centre_code = ? and serverno = ? and  download_sec='Sign' and download_status != 'NF' `;
      } else if (count_sign_download == 0) {
        query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Sign', 'NF', NOW())`;
      }
      if (query) {
        utils.executeImageDownloadQuery(query, centreCode, serverNo);
      }
    }

    console.error("Error during download or extraction:", error);
    res.status(500).send("Error during the process");
  }
});
app.get("/check-status/", async (req, res) => {
  const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = result.data.serialNumber;

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

// const { execSync } = require("child_process");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

app.get("/db-patch/", async (req, res) => {
  const { centre_code, serverno } = utils.centreAndServerNo();
  const dbVersion = await queryAsync(
    "SELECT db_version FROM taserver_version order by id asc"
  );
  // console.log(dbVersion[0].db_version);
  const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = result.data.serialNumber;
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
        // const mysqlPath = "C:/mysql5/bin/mysql.exe";
        const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";


        // Escape special characters in the password if needed
        const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

        // Construct the command
        const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${patchFilePath}"`;
        // console.log(command);
        exec(command, (error, stdout, stderr) => {
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
            db.query(sql, [result[0]], (err, res) => {
              if(err){
                console.error(err);
              }
              console.log("DB version updated");
            });// Logs the JSON array ["7.0", "dbdump/hello.zip"]
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
  const { rollNum, encryptKey} = req.params;

  try {
    // Get distinct exams for the candidate
    const examCodeQuery = `
    SELECT DISTINCT e.exam_code, e.exam_name 
    FROM iib_exam e, iib_candidate_scores s 
    WHERE s.exam_code = e.exam_code AND online = 'Y' AND membership_no = ?`;
    const rowsExam = await queryAsync(examCodeQuery, [rollNum]);

    // Iterate through each exam
    for (const rowExam of rowsExam) {
      const { exam_code: examCode, exam_name: examName } = rowExam;

      // Get distinct subjects for the candidate's exam
      const subjectCodeQuery = `
        SELECT DISTINCT e.subject_code, e.subject_name 
        FROM iib_exam_subjects e, iib_candidate_scores s 
        WHERE e.subject_code = s.subject_code 
          AND online = 'Y' 
          AND e.exam_code = ? 
          AND membership_no = ?`;
      const rowsSubject = await queryAsync(subjectCodeQuery, [
        examCode,
        rollNum,
      ]);

      for (const rowSubject of rowsSubject) {
        const { subject_code: subjectCode, subject_name: subjectName } =
          rowSubject;

        // Get the candidate's question paper number
        const sqlQuestions = `
          SELECT question_paper_no 
          FROM iib_candidate_test 
          WHERE exam_code = ? 
            AND subject_code = ? 
            AND test_status = 'C' 
            AND membership_no = ?`;
        const rowsSelQues = await queryAsync(sqlQuestions, [
          examCode,
          subjectCode,
          rollNum,
        ]);

        for (const rowSelQues of rowsSelQues) {
          const questionPaperNo = rowSelQues.question_paper_no;
          // Get exam marks and other details
          const sqlMarks = `
            SELECT total_marks, pass_mark, display_response 
            FROM iib_exam_subjects 
            WHERE exam_code = ? 
              AND subject_code = ? 
              AND online = 'Y'`;
          const rowsSqlMarks = await queryAsync(sqlMarks, [
            examCode,
            subjectCode,
          ]);
          const displayResponse = rowsSqlMarks[0]["display_response"];

          // console.log('display_response',display_response);

          // Retrieve list of question IDs
          const sqlQnsIds = `
          SELECT question_id , display_order
          FROM iib_question_paper_details 
          WHERE question_paper_no = ? 
          ORDER BY display_order`;
          const rowsSqlQnsIds = await queryAsync(sqlQnsIds, [questionPaperNo]);
          const quesIdsArr = rowsSqlQnsIds.map((row) => row.question_id);
          // console.log('Question_id',quesIdsArr);
          //         // const quesIdsArrdis = rowsSqlQnsIds.map(row => row.display_order);
          // Step 1: Fetch all response data for `questionPaperNo` from `iib_response`
          const sqlQns = `
  SELECT question_id, AES_DECRYPT(answer,?), display_order 
  FROM iib_response 
  WHERE id IN (
    SELECT MAX(id) 
    FROM iib_response 
    WHERE question_paper_no = ? AND answer != 'NULL'
    GROUP BY question_id
  ) 
  ORDER BY display_order
`;
          const rowsSqlQns = await queryAsync(sqlQns, [encryptKey, questionPaperNo]);
          // console.log("Response data:", rowsSqlQns);

          // Step 2: Fetch correct answers for all questions in `quesIdsArr`
          const aQuestionsSql = `
  SELECT question_id, correct_answer 
  FROM iib_sq_details 
  WHERE question_id IN (${quesIdsArr.join(",")})
`;
          const rowsSqlQnsIdsVal = await queryAsync(aQuestionsSql);
          // console.log("Correct answers:", rowsSqlQnsIdsVal);

          // Step 3: Merge both datasets based on `question_id`, ensuring every question has a `correct_answer`
          const CandidateResponse = quesIdsArr.map((question_id) => {
            const response = rowsSqlQns.find(
              (item) => item.question_id === question_id
            );
            const correctAnswer = rowsSqlQnsIdsVal.find(
              (item) => item.question_id === question_id
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
          res.json({
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

// app.post('/exam-closure-summary', (req, res) => {
//   const data = req.body;
//   const ServerNo = CentreCode = ExamDate= ExamName = AdminId = '' ;
//   const { feedback, attachFile, ...formFields } = data; // Destructure the required fields
//   const currentTimestamp = new Date();

//   // Define your SQL Insert Query
//   const insertQuery = `INSERT INTO exam_day_end_report (exam_name, exam_date, centre_code, server_no, batch1_scheduled, batch2_scheduled, batch3_scheduled, batch1_attended, batch2_attended, batch3_attended, test_lab, test_admin, without_admit_card, without_id_proof, without_admit_card_id_proof, test_reporting_late, request_centre_change, test_malpractice, updated_ip, updated_on, updated_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   // Prepare values from the form data
//   const values = [
//     ExamName, ExamDate, CentreCode, ServerNo,
//     data.candidateBatch1Scheduled, data.candidateBatch2Scheduled, data.candidateBatch3Scheduled,
//     data.candidateBatch1Attended, data.candidateBatch2Attended, data.candidateBatch3Attended,
//     data.labsUsed, data.testAdministrators,
//     data.candidatesWithoutAdmitCard, data.candidatesWithoutIdentityProof, data.candidatesWithoutAdmitCardAndIdentityProof,
//     data.candidatesReportingLate, data.candidatesRequestingCentreChange, data.candidatesIndulgingInMalpractice, AdminId,
//     currentTimestamp,'', 'S'
//   ];
// console.log('TEST');
//   // Execute query
//   db.query(insertQuery, values, (err, result) => {
//     if (err) {
//       console.error('Error inserting data:', err);
//       return res.status(500).send('Server Error');
//     }
//     res.send('Data inserted successfully');
//   });
// });

app.post("/exam-closure-summary", (req, res) => {
  const data = req.body;

  // Extract and validate necessary variables
  const {
    ExamName = "",
    ExamDate = "",
    CentreCode = "",
    ServerNo = "",
    AdminId = "172.17.109.2",
    SerialNumber = "",
    feedback,
    attachFile,
    ...formFields
  } = data;

  const currentTimestamp = new Date(); // Generate current timestamp

  // console.log(ExamDate);

  // Define your SQL Insert Query
  const insertQuery = `INSERT INTO exam_day_end_report (exam_name, exam_date, centre_code, server_no, batch1_scheduled, batch2_scheduled, batch3_scheduled, batch1_attended, batch2_attended, batch3_attended, test_lab, test_admin, without_admit_card, without_id_proof, without_admit_card_id_proof, test_reporting_late, request_centre_change, test_malpractice, updated_ip, updated_on, updated_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Prepare values from the form data
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

  // Log for debugging
  console.log("Inserting data:", values);
  const formattedinsertQuery = db.format(insertQuery, values);
  // Execute query
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res
        .status(500)
        .json({ message: "Error inserting data", error: err });
    }
    // Insert the exact formatted query into xml_feed
    insertIntoXmlFeed(formattedinsertQuery, (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error inserting into xml_feed:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }
    });
    res.json({ message: "Data inserted successfully" });
  });
});

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
  // console.log('TEST');

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
  // console.log(module);

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
      res.json({ result: formattedResult });
    } else {
      res.json({ result: [] }); // Return empty array if no results
    }
  });
});

// app.post("/skip-biometric-validation-all-insert", async (req, res) => {
//   const { batchtime, blockmode, biostatus, serialNumber, admin_ipv4 } = req.body;

//   const selectSql = "SELECT membership_no,exam_date FROM iib_candidate_iway WHERE exam_time = ?";

//   db.query(selectSql, [batchtime], (err, result) => {
//     if (err) {
//       console.error("Error querying iib_candidate_iway:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (result.length > 0) {
//       const currentDateTime = formattedTime;

//       const insertSql = `
//         INSERT INTO exam_skip_biometricvalidation
//         (exam_date, exam_slot_time, skip_mode, membership_no, dateaddedon, date_updated, skip_status, admin_serialno, admin_ipv4)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       // Iterate through the results and insert each membership_no into the new table
//       const formattedResult = [];
//       let insertCount = 0;

//       result.forEach((row, index) => {
//         const values = [
//           row.exam_date,
//           batchtime, // Using batchtime as the exam_slot_time
//           blockmode,
//           row.membership_no,
//           currentDateTime,
//           currentDateTime,
//           biostatus, // Assuming biostatus is skip_status
//           serialNumber,
//           admin_ipv4
//         ];

//         db.query(insertSql, values, (insertErr, insertResult) => {
//           if (insertErr) {
//             console.error("Error inserting into exam_skip_biometricvalidation:", insertErr);
//           } else {
//             formattedResult.push({
//               insertId: insertResult.insertId,
//               membership_no: row.membership_no,
//               exam_date: formattedDateMonthYear,
//               batchtime: batchtime,
//             });
//           }

//           insertCount++;

//           // When all inserts are done, send the response
//           if (insertCount === result.length) {
//             console.log(formattedResult);
//             res.status(200).json({ message: "Data inserted successfully", result: formattedResult ,success: "success" });
//           }
//         });
//       });
//     } else {
//       res.json({ result: [] }); // Return empty array if no results
//     }
//   });
// });

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
  console.log(formattedupdateSql_val);

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
        const checkSql = `
          SELECT * FROM exam_skip_biometricvalidation 
          WHERE membership_no = ? AND exam_date = ? AND exam_slot_time = ?
        `;

        db.query(
          checkSql,
          [row.membership_no, row.exam_date, batchtime],
          (checkErr, checkResult) => {
            if (checkErr) {
              console.error("Error checking existing record:", checkErr);
            } else if (checkResult.length > 0) {
              // Update existing record
              const updateSql = `
              UPDATE exam_skip_biometricvalidation 
              SET skip_mode = ?, date_updated = ?, skip_status = ?, admin_serialno = ?, admin_ipv4 = ?
              WHERE membership_no = ? AND exam_date = ? AND exam_slot_time = ?
            `;
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
                        console.error("Error inserting into xml_feed:", err);
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
              const insertSql = `
              INSERT INTO exam_skip_biometricvalidation 
              (exam_date, exam_slot_time, skip_mode, membership_no, dateaddedon, date_updated, skip_status, admin_serialno, admin_ipv4) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
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
                        console.error("Error inserting into xml_feed:", err);
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

// For php8
// app.get("/generate-bio-skip-password", (req, res) => {
//   console.log("TEST");

//   // Step 1: Hardcoded examName
//   const examName = "NIBM";

//   // Step 2: Fetch Exam Date
//   db.query(
//     "SELECT DISTINCT(DATE_FORMAT(exam_date, '%d-%m-%Y')) AS examDate FROM iib_exam_schedule",
//     (err, examResult) => {
//       if (err) {
//         console.error("Error fetching exam date:", err);
//         return res.status(500).json({ error: "Error fetching exam date" });
//       }

//       const examDate = examResult.length > 0 ? examResult[0].examDate : null;
//       if (!examDate) {
//         return res.status(404).json({ error: "No exam date found" });
//       }

//       console.log("Exam Date:", examDate);

//       // Step 3: Fetch Batch Times
//       db.query(
//         "SELECT DISTINCT slot_time AS batchTime FROM iib_exam_slots ORDER BY batchTime",
//         (err, batchResult) => {
//           if (err) {
//             console.error("Error fetching batch times:", err);
//             return res.status(500).json({ error: "Error fetching batch times" });
//           }

//           const batchTimes = batchResult.map((row) => row.batchTime);
//           if (!batchTimes || batchTimes.length === 0) {
//             return res.status(404).json({ error: "No batch times found" });
//           }

//           console.log("Batch Times:", batchTimes);

//           // Step 4: Generate passwords for each batch time
//           const passwordTable = [];
//           let remaining = batchTimes.length;

//           batchTimes.forEach((time) => {
//             const pwd = examName + time + examDate;

//             db.query(
//               "SELECT SHA2(?, 256) AS password",
//               [pwd],
//               (err, passwordResult) => {
//                 if (err) {
//                   console.error(`Error generating password for time ${time}:`, err);
//                   return res.status(500).json({ error: "Error generating password" });
//                 }

//                 const hashedPassword =
//                   passwordResult.length > 0 ? passwordResult[0].password : null;

//                 if (!hashedPassword) {
//                   return res
//                     .status(500)
//                     .json({ error: `Failed to generate password for time: ${time}` });
//                 }

//                 const chunkSize = 8;
//                 const passwordArray = [];
//                 for (let i = 0; i < hashedPassword.length; i += chunkSize) {
//                   passwordArray.push(hashedPassword.slice(i, i + chunkSize));
//                 }

//                 passwordTable.push({
//                   examDate,
//                   examTime: time,
//                   passwords: passwordArray,
//                 });

//                 remaining -= 1;
//                 if (remaining === 0) {
//                   res.status(200).json({
//                     success: "Bio skip password fetched successfully.",
//                     examName,
//                     passwordData: passwordTable,
//                   });
//                 }
//               }
//             );
//           });
//         }
//       );
//     }
//   );
// });

app.get("/generate-bio-skip-password", (req, res) => {
  //console.log("TEST");

  const examName = "NIBM";
  // const examName = ((process.env.DB_NAME).split('_')[1]).toUpperCase();
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

  const examName = "NIBM"; // Should match the one used in generation
  // const examName = ((process.env.DB_NAME).split('_')[1]).toUpperCase();
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

app.post('/add-seats-allocation', (req, res) => {
  const {
      exam_centre_code,
      exam_lab_code,
      exam_seatno,
      candidate_ipaddress,
  } = req.body;

  // Validate input
  if (!exam_centre_code || !exam_seatno || !candidate_ipaddress || !exam_lab_code ) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  const status = "1";
  console.log('formattedTime:', formattedTime);
  // SQL query
  const query = `
      INSERT INTO candidate_seat_management (exam_centre_code,exam_lab_code,exam_seatno,candidate_ipaddress,status,date_created,exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
      exam_centre_code,
      exam_lab_code,
      exam_seatno,
      candidate_ipaddress,
      status,
      formattedTime, // Use current timestamp for date_created
      formattedTime // Provided from the request body
  ];

  console.log('Query:', query);
  console.log('Values:', values);

  const queryInsert = db.format(query, values);
  // Execute query
  db.query(query, values, (err, result) => {
      if (err) {
          console.error('Error inserting into candidate_seat_management:', err);
          return res.status(500).json({ error: 'Database error.', details: err.message });
      }

      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(queryInsert, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting into xml_feed:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      
      res.status(200).json({
          message: 'Seat added successfully.',
          biometric_id: result.insertId
      });
  });
});

app.post("/seat-management-upload-csv", (req, res) => {
  if (!req.files || !req.files.csvFile) {
      return res.status(400).json({ error: "No file uploaded." });
  }

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
            const LabName = row.LabName || null; // Optional column (null if missing)


              records.push([
                  centreCode,
                  LabName,
                  seatNo,
                  candidateIpaddress,
                  status,
                  formattedTime,
                  formattedTime
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
                        console.error("Error inserting into xml_feed:", err);
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
  const query = "SELECT biometric_id,exam_centre_code,exam_lab_code,exam_seatno,candidate_ipaddress,status,DATE_FORMAT(exam_date, '%d-%m-%Y') AS exam_date FROM candidate_seat_management";
  
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching data:", err);
          return res.status(500).send("Database error.");
      }

      // Generate CSV content
      let csv = "id,center_code,lab_name,seatno,candidate_ipaddress,status,exam_date\n";
      results.forEach(row => {
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

app.get('/delete-seat/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM candidate_seat_management WHERE biometric_id = ?';

  const queryInsert = db.format(query, [id]);
  
  // console.log(query);
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Error deleting record:', err);
          return res.status(500).json({ success: false, message: 'Database error.' });
      }
      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(queryInsert, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting into xml_feed:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });
      return res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  });
});

app.put("/update-seat/:id", (req, res) => {
  const { id } = req.params;
  const { exam_lab_code, exam_seatno, candidate_ipaddress } = req.body;

  const query = `UPDATE candidate_seat_management SET exam_lab_code = ?, exam_seatno = ?, candidate_ipaddress = ? WHERE biometric_id = ?`;

  const queryInsert = db.format(query, [exam_lab_code, exam_seatno, candidate_ipaddress, id]);
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
                console.error("Error inserting into xml_feed:", err);
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

const viewBioMetricData = (pattern = 0, status = 1, required = '', from = '', limit = '', removeCore = '') => {
  return new Promise((resolve, reject) => {
      let sql = `SELECT biometric_id, exam_centre_code, exam_lab_code, exam_seatno, candidate_ipaddress, status 
                 FROM candidate_seat_management`;

      if (removeCore === '') {
          sql += ` WHERE status = ${status}`;
      }
      if (pattern === 1 && removeCore === '') {
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

      if (removeCore === '') {
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

app.get('/biometric-data', async (req, res) => {
  const { M, lab } = req.query;

  try {
      if (M == 3) {
          const activeData = await viewBioMetricData(0, 1, '', '', '', 2);
          const deactiveData = await viewBioMetricData(0, 2, '', '', '', 2);

          const activeOptions = activeData.filter(row => row.exam_lab_code === lab);
          const deactiveOptions = deactiveData.filter(row => row.exam_lab_code === lab);

          res.json({ activeOptions, deactiveOptions });
      }
  } catch (error) {
      console.error('Error fetching biometric data:', error);
      res.status(500).send('Server error');
  }
});

// app.get("/block-candidate-ip", (req, res) => {
//   let selectedips;

//   try {
//       selectedips = JSON.parse(req.query.selectedips); // Parse JSON string into an array
//       // Extract only the `value` properties
//       selectedips = selectedips.map(item => item.value);
//   } catch (error) {
//       console.error("Error parsing selected IPs:", error);
//       return res.status(400).json({ success: false, message: "Invalid IP selection format." });
//   }

//   const query = `UPDATE candidate_seat_management SET status = ? WHERE biometric_id IN (?)`;

//   const updatestatus = "2";

//   if (!Array.isArray(selectedips) || selectedips.length === 0) {
//       return res.status(400).json({ success: false, message: "No IPs provided." });
//   }

//   const queryInsert = db.format(query, [updatestatus, selectedips]);

//   db.query(query, [updatestatus, selectedips], (err, result) => {
//       if (err) {
//           console.error("Error updating record:", err);
//           return res.status(500).json({ success: false, message: "Database error." });
//       }

//       // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(queryInsert, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });
//       res.json({ success: true, message: "Record updated successfully.", affectedRows: result.affectedRows });
//   });
// });

// app.get("/unblock-candidate-ip", (req, res) => {
//   let selectedips;

//   try {
//       selectedips = JSON.parse(req.query.selectedips); // Parse JSON string into an array
//       // Extract only the `value` properties
//       selectedips = selectedips.map(item => item.value);
//   } catch (error) {
//       console.error("Error parsing selected IPs:", error);
//       return res.status(400).json({ success: false, message: "Invalid IP selection format." });
//   }
  
//   const query = `UPDATE candidate_seat_management SET status = ? WHERE biometric_id IN (?)`;

//   const updatestatus = "1";

//   if (!Array.isArray(selectedips) || selectedips.length === 0) {
//       return res.status(400).json({ success: false, message: "No IPs provided." });
//   }
//   const queryInsert = db.format(query, [updatestatus, selectedips]);

//   db.query(query, [updatestatus, selectedips], (err, result) => {
//       if (err) {
//           console.error("Error updating record:", err);
//           return res.status(500).json({ success: false, message: "Database error." });
//       }
//       // Insert the exact formatted query into xml_feed
//       insertIntoXmlFeed(queryInsert, (err) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error inserting into xml_feed:", err);
//             res.status(500).json({ message: "Internal Server Error" });
//           });
//         }
//       });
//       res.json({ success: true, message: "Record updated successfully.", affectedRows: result.affectedRows });
//   });
// }); 
 
// GET endpoint to fetch a seat by ID
// app.get("/get-seat/:id", (req, res) => {
//   const seatId = req.params.id;
 
//   const query = `
//       SELECT
//           biometric_id,
//           exam_lab_code,
//           exam_seatno,
//           candidate_ipaddress
//       FROM
//           candidate_seat_management
//       WHERE
//           biometric_id = ?
//   `;
 
//   db.query(query, [seatId], (err, results) => {
//       if (err) {
//           console.error("Error fetching seat by ID:", err);
//           return res.status(500).json({ error: "Failed to fetch seat details" });
//       }
//       if (results.length === 0) {
//           return res.status(404).json({ error: "Seat not found" });
//       }
//       res.json({ result: results[0] });
//   });
// });
 
// const viewBioMetricData = (pattern = 0, status = 1, required = '', from = '', limit = '', removeCore = '') => {
//   return new Promise((resolve, reject) => {
//       let sql = `SELECT biometric_id, exam_centre_code, exam_lab_code, exam_seatno, candidate_ipaddress, status
//                  FROM candidate_seat_management`;
 
//       if (removeCore === '') {
//           sql += ` WHERE status = ${status}`;
//       }
//       if (pattern === 1 && removeCore === '') {
//           sql += ` AND candidate_ipaddress = '${required}'`;
//       } else if (pattern === 2) {
//           sql += ` AND biometric_id = '${required}'`;
//       } else if (pattern === 3) {
//           sql += ` AND exam_lab_code = '${required}'`;
//       } else if (pattern === 4) {
//           sql += ` ${required}`;
//       }
 
//       if (from && limit) {
//           sql += ` LIMIT ${from}, ${limit}`;
//       }
 
//       if (removeCore === 1) {
//           sql += ` WHERE ${required}`;
//       } else if (removeCore === 2) {
//           sql += ` WHERE status = ${status} ORDER BY exam_lab_code, exam_seatno`;
//       }
 
//       if (removeCore === '') {
//           sql += ` ORDER BY exam_lab_code, exam_seatno`;
//       }
 
//       db.query(sql, (err, results) => {
//           if (err) {
//               return reject(err);
//           }
//           resolve(results);
//       });
//   });
// };
 
// app.get('/biometric-data', async (req, res) => {
//   const { M, lab } = req.query;
 
//   try {
//       if (M == 3) {
//           const activeData = await viewBioMetricData(0, 1, '', '', '', 2);
//           const deactiveData = await viewBioMetricData(0, 2, '', '', '', 2);
 
//           const activeOptions = activeData.filter(row => row.exam_lab_code === lab);
//           const deactiveOptions = deactiveData.filter(row => row.exam_lab_code === lab);
 
//           res.json({ activeOptions, deactiveOptions });
//       }
//   } catch (error) {
//       console.error('Error fetching biometric data:', error);
//       res.status(500).send('Server error');
//   }
// });
 
 
// const csvUpload = multer({
//   dest: "uploads/", // Temporary upload directory
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (ext !== ".csv") {
//       return cb(new Error("Only CSV files are allowed"));
//     }
//     cb(null, true);
//   },
// });
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

// app.get("/ontheflyqpgen/", async (req, res) => {
//   const { membershipNo, examCode, subjectCode, medium, totalMarks } = req.query;
//   let iCount = 1;
//   let memTicketno;
//   // console.log(membershipNo,subjectCode)
//   try {
//     const getMemTicketNo = async (memNo, subjectCode) => {
//       const query =
//         "SELECT a.address3 as memTicketNo, c.slot_no as slotNo FROM iib_candidate a JOIN iib_candidate_iway b  ON a.membership_no = b.membership_no JOIN iib_exam_slots c ON c.slot_time = b.exam_time where a.membership_no= ? and b.subject_code= ?";

//       return new Promise((resolve, reject) => {
//         db.query(query, [memNo, subjectCode], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res.status(500).send("Database query error : getMemTicketNo")
//             );
//           }

//           return resolve({
//             memTicketNo: result[0].memTicketNo,
//             slotNo: result[0].slotNo,
//           });
//         });
//       });
//     };
//     const gettingQPStructure = async (subjectCode) => {
//       const qpStructureQry =
//         "SELECT exam_code, subject_code, section_code, marks, sum(no_of_questions) as no_of_questions, case_id FROM iib_qp_weightage WHERE subject_code = ? group by 1,2,3,4";
//       return new Promise((resolve, reject) => {
//         db.query(qpStructureQry, [subjectCode], (err, res) => {
//           // console.log("helo grom gettingQPStrucure")
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res.status(500).send("Database query error : qpStructureQry")
//             );
//           }
//           return resolve({ qpStructureLength: res.length, qpStructures: res });
//         });
//       });
//     };
//     const getAnswerShuffling = async (subjectCode) => {
//       const getAnswerShufflingquery =
//         "select answer_shuffling from iib_exam_subjects where subject_code = ?";
//       return new Promise((resolve, reject) => {
//         db.query(getAnswerShufflingquery, [subjectCode], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res
//                 .status(500)
//                 .send("Database query error : getAnswerShufflingquery")
//             );
//           }
//           return resolve(result[0].answer_shuffling);
//         });
//       });
//     };
//     const insertingInQPTable = async (
//       questionPaperNo,
//       examCode,
//       subjectCode,
//       totalMarks,
//       isSample,
//       medium
//     ) => {
//       console.log(questionPaperNo);
//       let choosenMedium;
//       if (medium == "EN") {
//         choosenMedium = "E";
//       } else {
//         choosenMedium = "H";
//       }
//       try {
//         const insertingInQPTableQry =
//           "INSERT INTO iib_question_paper (question_paper_no,exam_code,subject_code,total_marks,sample,enabled,online,assigned,medium_code) VALUES (?,?,?,?,?,'Y','Y','N',?)";
//         return new Promise((resolve, reject) => {
//           db.query(
//             insertingInQPTableQry,
//             [
//               questionPaperNo,
//               examCode,
//               subjectCode,
//               totalMarks,
//               isSample,
//               choosenMedium,
//             ],
//             (err, res) => {
//               if (err) {
//                 console.error("Database query failed:", err);
//                 return reject(
//                   new Error(
//                     "Database query error: Insert on iib_question_paper failed"
//                   )
//                 );
//               }
//               return resolve(res.affectedRows);
//             }
//           );
//         });
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     const gettingQuesID = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       sectionMarks,
//       questionCount
//     ) => {
//       // console.log(examCode,
//       //   subjectCode,
//       //   sectionCode,
//       //   sectionMarks,
//       //   questionCount)
//       const gettingQuesIDQuery =
//         "SELECT question_id, question_code FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND  marks= ? ORDER BY rand() LIMIT ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           gettingQuesIDQuery,
//           [examCode, subjectCode, sectionCode, sectionMarks, questionCount],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : gettingQuesIDQuery -  failed")
//               );
//             }
//             // console.log(result)
//             return resolve(result);
//           }
//         );
//       });
//     };

//     const gettingCaseIdQuestions = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       sectionMarks
//     ) => {
//       const gettingCaseIdQuestionsQuery =
//         "SELECT  case_id from iib_qp_weightage where exam_code=? AND subject_code=? AND section_code= ? AND marks=?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           gettingCaseIdQuestionsQuery,
//           [examCode, subjectCode, sectionCode, sectionMarks],
//           (err, res) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               res
//                 .status(500)
//                 .send("Database query error : gettingQuesIDQuery -  failed");
//               return reject();
//             }
//             const getCaseCount = res.length;
//             const result = queryAsync(
//               "SELECT  case_id from iib_sc_details where exam_code=? AND subject_code= ? AND section_code= ? AND case_marks= ? ORDER BY rand() LIMIT ?",
//               [examCode, subjectCode, sectionCode, sectionMarks, getCaseCount]
//             );
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getQuestCaseSecCode = async (examCode, subjectCode, listCaseID) => {
//       const getQuestCaseSecCodequery = ` SELECT question_id,case_id,section_code from iib_sq_details where exam_code= ? and subject_code=? and case_id IN (${listCaseID})`;
//       return new Promise((resolve, reject) => {
//         db.query(
//           getQuestCaseSecCodequery,
//           [examCode, subjectCode, listCaseID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send(
//                     "Database query error : getQuestCaseSecCodequery -  failed"
//                   )
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getCaseDetails = async (examCode, subjectCode, listCaseID) => {
//       const getCaseDetailsquery = `SELECT a.case_id as case_id,sum(a.marks) as total_marks ,count(1) as qpcount,a.section_code as section_code,b.sub_section_code as sub_section_code ,b.difficulty as difficulty from iib_sq_details a, iib_sc_details b where a.exam_code= ? and a.exam_code=b.exam_code and a.subject_code=? and a.subject_code=b.subject_code and a.case_id=b.case_id and a.case_id IN (${listCaseID}) group by a.case_id`;
//       return new Promise((resolve, reject) => {
//         db.query(
//           getCaseDetailsquery,
//           [examCode, subjectCode, listCaseID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getCaseDetailsquery -  failed")
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getQuesCaseIds = async (
//       examCode,
//       subjectCode,
//       csectionCode,
//       caseid
//     ) => {
//       // console.log(examCode,subjectCode,csectionCode,caseid)
//       const getQuesCaseIdsquery =
//         "SELECT question_id as questionID, case_id as caseID,marks as sectionMarks FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND case_id = ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getQuesCaseIdsquery,
//           [examCode, subjectCode, csectionCode, caseid],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getQuesCaseIdsquery -  failed")
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getOptions = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       questionID
//     ) => {
//       const getOptionsquery =
//         "SELECT option_1, option_2, option_3, option_4, option_5 FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getOptionsquery,
//           [examCode, subjectCode, sectionCode, questionID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getQuesCaseIdsquery -  failed")
//               );
//             }
//             // console.log(result[0])
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getShufflingQuestionType = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       questionID
//     ) => {
//       const getShufflingQuestionTypequery =
//         "SELECT shuffling ,question_type FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getShufflingQuestionTypequery,
//           [examCode, subjectCode, sectionCode, questionID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send(
//                     "Database query error : getShufflingQuestionTypequery -  failed"
//                   )
//               );
//             }
//             // console.log(result)
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const insertIntoQPDetails = async (query) => {
//       return new Promise((resolve, reject) => {
//         db.query(query, [], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res
//                 .status(500)
//                 .send(
//                   "Database query error : getShufflingQuestionTypequery -  failed"
//                 )
//             );
//           }
//           return resolve(result.affectedRows);
//         });
//       });
//     };
//     const updateMemInQP = async (
//       updateMemInQPquery,
//       membershipNo,
//       questionPaperNo
//     ) => {
//       // console.log(updateMemInQPquery,
//       //   membershipNo,
//       //   questionPaperNo)
//       return new Promise((resolve, reject) => {
//         db.query(
//           updateMemInQPquery,
//           [membershipNo, questionPaperNo],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : updateMemInQPquery -  failed")
//               );
//             }
//             console.log(result);
//             return resolve(result.affectedRows);
//           }
//         );
//       });
//     };
//     const shuffleArray = (array) => {
//       for (let i = array.length - 1; i > 0; i--) {
//         let j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]]; // Swap elements
//       }
//       // return array;
//     };
//     const { memTicketNo, slotNo } = await getMemTicketNo(
//       membershipNo,
//       subjectCode
//     );
//     // console.log(memTicketNo, slotNo);
//     const memshipNoTicketNo = memTicketNo.split(":");
//     memTicketno = slotNo + memshipNoTicketNo[1].trim();
//     const questionPaperNo = memTicketno;
//     console.log(questionPaperNo.length);
//     // console.log(memshipNoTicketNo,questionPaperNo);
//     const { qpStructureLength, qpStructures } =
//       await gettingQPStructure(subjectCode);

//     const answershuffling = await getAnswerShuffling(subjectCode);

//     if (qpStructureLength == 0) {
//       console.error("QP weightage structure is not there");
//       return res.status(500).send("Database query error : qpStructureQry");
//     } else {
//       if (totalMarks == "") {
//         totalMarks = 0;
//       }

//       const resultInsertingQPTable = await insertingInQPTable(
//         questionPaperNo,
//         examCode,
//         subjectCode,
//         totalMarks,
//         "N",
//         medium
//       );
//       // console.log(resultInsertingQPTable)
//       if (resultInsertingQPTable != 0) {
//         console.log("inserted into iib_question_paper");
//       }

//       let aAllQuestions = [];
//       let aQuestions = [];
//       let arrcasequestionID = [];
//       let count = 0;

//       let examCodeOfQPStructure,
//         subjectCodeOfQPStructure,
//         sectionCode,
//         sectionMarks,
//         questionID,
//         questionCode,
//         questionCount;
//       for (const qpStructure of qpStructures) {
//         examCodeOfQPStructure = qpStructure.exam_code;
//         subjectCodeOfQPStructure = qpStructure.subject_code;
//         sectionCode = qpStructure.section_code;
//         sectionMarks = qpStructure.marks;
//         questionCount = qpStructure.no_of_questions;
//         sectionType = qpStructure.case_id;
//         // console.log(examCodeOfQPStructure,subjectCodeOfQPStructure,sectionCode,sectionMarks,questionCount,typeof sectionType)
//         if (sectionType == null || sectionType == "NULL") {
//           const questionIdCodes = await gettingQuesID(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             sectionMarks,
//             questionCount
//           );
//           // console.log(questionIdCodes);
//           if (questionIdCodes.length > 0) {
//             questionIdCodes.forEach((questionIdCode) => {
//               questionID = questionIdCode.question_id;
//               questionCode = questionIdCode.question_code;
//               // console.log(questionID, questionCode)
//               if (!aQuestions[questionID]) {
//                 aQuestions[questionID] = [[], [], [], []];
//               }
//               // console.log(aQuestions)  ;
//               aQuestions[questionID][0].push(questionID);
//               aQuestions[questionID][1].push(sectionCode);
//               aQuestions[questionID][2].push(sectionMarks);
//               aQuestions[questionID][3].push(0);
//               // console.log("asdf",aQuestions);
//               // aAllQuestions[count] = [];
//               if (!aAllQuestions[count]) {
//                 aAllQuestions[count] = [[], [], []];
//               }
//               aAllQuestions[count][0].push(questionID);
//               aAllQuestions[count][1].push(questionID);
//               aAllQuestions[count][2].push(0);
//               count++;
//             });
//           }
//         } //section type 'G' if ends here
//         // console.log("aquestions",aQuestions);
//         // console.log("aAllquestions",aAllQuestions)
//         if (sectionType != null || sectionType != "NULL") {
//           const caseIdQuestions = await gettingCaseIdQuestions(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             sectionMarks
//           );
//           // console.log(caseIdQuestions);
//           for (const caseIdQuestion of caseIdQuestions) {
//             // arrcasequestionID[sectionCode]=[];
//             if (!Array.isArray(arrcasequestionID[sectionCode])) {
//               arrcasequestionID[sectionCode] = [];
//             }
//             arrcasequestionID[sectionCode].push(caseIdQuestion.case_id);
//           }
//           // console.log("arrcasequestionID",arrcasequestionID)
//         } //section type 'C' if ends here
//       }

//       let listCaseIDArr = [];
//       let arrcasecnt = arrcasequestionID.length;
//       arrcasequestionID.forEach((arcaskey) => {
//         // console.log(arcaskey);
//         // Check if the current value is a non-empty array
//         if (Array.isArray(arcaskey) && arcaskey.length > 0) {
//           // Merge the current array into listCaseIDArr
//           listCaseIDArr = listCaseIDArr.concat(arcaskey);
//         }
//       });

//       let listCaseID;
//       let arrcaseID;
//       let arrCqid = [];
//       let arrCase = [{}];
//       let arrSecCase = [[], []];
//       let allIDs = [];
//       //  console.log(listCaseIDArr)
//       if (listCaseIDArr.length > 0) {
//         listCaseID = listCaseIDArr.join(",");
//         arrcaseID = listCaseID.split(",");

//         const questCaseSecCodeValues = await getQuestCaseSecCode(
//           examCodeOfQPStructure,
//           subjectCodeOfQPStructure,
//           listCaseID
//         );
//         // console.log(questCaseSecCodeValues)

//         for (const questCaseSecCodeValue of questCaseSecCodeValues) {
//           const caseId = questCaseSecCodeValue.case_id;
//           const sectionCode = questCaseSecCodeValue.section_code;
//           const questionId = questCaseSecCodeValue.question_id;

//           // Ensure arrCqid[caseId] is initialized as an array
//           if (!Array.isArray(arrCqid[caseId])) {
//             arrCqid[caseId] = [];
//           }

//           // Append or update the array with the question_id
//           if (arrCqid[caseId].length > 0) {
//             arrCqid[caseId].push(`${arrCqid[caseId].join(",")},${questionId}`);
//           } else {
//             arrCqid[caseId].push(questionId);
//           }

//           // Ensure arrSecCase[sectionCode] is initialized
//           if (!arrSecCase[sectionCode]) {
//             arrSecCase[sectionCode] = {};
//           }

//           // Ensure arrSecCase[sectionCode][caseId] is initialized as an array
//           if (!Array.isArray(arrSecCase[sectionCode][caseId])) {
//             arrSecCase[sectionCode][caseId] = [];
//           }

//           // Add the question_id to the section-case mapping
//           arrSecCase[sectionCode][caseId].push(questionId);
//         }

//         // console.log("arrcqid" + arrCqid)
//         const caseDetails = await getCaseDetails(
//           examCodeOfQPStructure,
//           subjectCodeOfQPStructure,
//           listCaseID
//         );
//         // console.log(caseDetails);
//         for (const caseDetail of caseDetails) {
//           const caseId = caseDetail.case_id;
//           // Ensure arrCase[caseId] is initialized as an object
//           if (!arrCase[caseId]) {
//             arrCase[caseId] = {
//               marks: "",
//               questionscount: "",
//               sectioncode: "",
//               subsectioncode: "",
//               priority: "",
//             };
//           }

//           // Populate the arrays within arrCase[caseId]
//           arrCase[caseId].marks = caseDetail.total_marks;
//           arrCase[caseId].questionscount = caseDetail.qpcount;
//           arrCase[caseId].sectioncode = Number(caseDetail.section_code);
//           arrCase[caseId].subsectioncode = caseDetail.sub_section_code;
//           arrCase[caseId].priority = caseDetail.difficulty;
//         }
//         // console.log("arrCase" + JSON.stringify(arrCase))

//         // console.log("arrCase" + arrCase)
//         let caseid, csectionCode, csubSectionCode, cpriority;

//         let caseCnt;
//         // console.log(arrcaseID)
//         for (let i = 0; i < arrcaseID.length; i++) {
//           caseid = arrcaseID[i];
//           csectionCode = arrCase[caseid].sectioncode;
//           csubSectionCode = arrCase[caseid].subsectioncode;
//           cpriority = arrCase[caseid].priority;

//           const quesCaseIds = await getQuesCaseIds(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             csectionCode,
//             caseid
//           );
//           // console.log(quesCaseIds)

//           if (quesCaseIds.length > 0) {
//             // Initialize allIDs if it is not already defined
//             let allIDs = [];
//             let first = 0,
//               firstID = null;
//             caseCnt = count;

//             // Iterate over each quesCaseId in quesCaseIds
//             quesCaseIds.forEach((quesCaseId) => {
//               if (first == 0) {
//                 first = 1;
//                 firstID = quesCaseId.questionID; // Set the first questionID
//               }

//               // Initialize aQuestions[quesCaseId.questionID] if not already initialized
//               if (!aQuestions[quesCaseId.questionID]) {
//                 aQuestions[quesCaseId.questionID] = [[], [], [], [], [], []];
//               }
//               // console.log(first,firstID)
//               // console.log(quesCaseId);
//               // Populate the arrays within aQuestions[quesCaseId.questionID]
//               aQuestions[quesCaseId.questionID][0].push(quesCaseId.questionID);
//               aQuestions[quesCaseId.questionID][1].push(csectionCode);
//               aQuestions[quesCaseId.questionID][2].push(
//                 quesCaseId.sectionMarks
//               );
//               aQuestions[quesCaseId.questionID][3].push(quesCaseId.caseID);
//               aQuestions[quesCaseId.questionID][4].push(csubSectionCode);
//               aQuestions[quesCaseId.questionID][5].push(cpriority);
//               // console.log(aQuestions)
//               // Add the questionID to allIDs
//               allIDs.push(quesCaseId.questionID);
//               caseCnt++;
//             });
//             // console.log(aQuestions)
//             allIDs.sort((a, b) => a - b);
//             // console.log(allIDs);
//             let strAllIDs = allIDs.join(",");
//             if (!aAllQuestions[count]) {
//               aAllQuestions[count] = [[], [], []];
//             }
//             // Store the results in aAllQuestions
//             aAllQuestions[count][0].push(firstID);
//             aAllQuestions[count][1].push(strAllIDs);
//             aAllQuestions[count][2].push(quesCaseIds[0].caseID);
//             // Increment the counter
//             count++;
//             first = 0;
//           }
//         }
//         // console.log(aAllQuestions.length)

//         let nQuestions = aQuestions.length;
//         let nQs = aAllQuestions.length;
//         let questionID;
//         let strQuestionIDs, actualCnt, actualRandQuestions, caseIndex;
//         let sectionCode,
//           sectionMarks,
//           caseID,
//           strOptOrder,
//           ansshuffle = 0;

//         let aRandQuestions = [...Array(nQs).keys()]; // [0, 1, 2, ..., nQs-1]
//         console.log(aRandQuestions);
//         // Step 2: Shuffle the array (like shuffle)
//         for (let i = aRandQuestions.length - 1; i > 0; i--) {
//           let j = Math.floor(Math.random() * (i + 1));
//           [aRandQuestions[i], aRandQuestions[j]] = [
//             aRandQuestions[j],
//             aRandQuestions[i],
//           ];
//         }
//         // console.log("aRandques",aRandQuestions);
//         let index;
//         let insertIntoQPDetailsquery = "";
//         for (let qCount = 0; qCount < nQs; qCount++) {
//           qCount + 1;
//           if (Array.isArray(aRandQuestions)) {
//             index = aRandQuestions[qCount];
//           } else {
//             index = aRandQuestions;
//           }
//           // console.log(index);
//           let actualQuestions = [];
//           // console.log(aAllQuestions);
//           strQuestionIDs = aAllQuestions[index][1].toString();
//           actualQuestions = strQuestionIDs.split(",");
//           // console.log(actualQuestions);

//           if (Array.isArray(actualQuestions)) {
//             actualCnt = actualQuestions.length;
//             // Randomization in JavaScript
//             shuffleArray(actualQuestions); // Shuffle the array in place
//             // Step 4: Select the first `actualCnt` elements (which would be the entire array)
//             actualRandQuestions = actualQuestions.slice(0, actualCnt);
//             // console.log(actualRandQuestions + "random")
//           } else {
//             actualCnt = 1;
//           }
//           for (let cntIDs = 0; cntIDs < actualCnt; cntIDs++) {
//             if (Array.isArray(actualRandQuestions)) {
//               caseIndex = actualRandQuestions[cntIDs];
//               // console.log(caseIndex);
//             } else {
//               caseIndex = actualRandQuestions;
//               // console.log(caseIndex)
//             }
//             if (Array.isArray(actualQuestions)) {
//               questionID = actualQuestions[cntIDs];
//               // console.log("questionID"+questionID)
//             } else {
//               questionID = actualQuestions;
//               // console.log(questionID)
//             }
//             if (questionID != "") {
//               sectionCode = aQuestions[questionID][1];
//               sectionMarks = aQuestions[questionID][2];
//               caseID = aQuestions[questionID][3];
//               strOptOrder = "";

//               const options = await getOptions(
//                 examCodeOfQPStructure,
//                 subjectCodeOfQPStructure,
//                 sectionCode,
//                 questionID
//               );
//               // console.log(options)
//               let input = [];
//               let rand_keys = [];

//               // console.log(options);
//               for (let optCnt = 1; optCnt <= 5; optCnt++) {
//                 let optionKey = `option_${optCnt}`; // Creates option_1, option_2, etc.
//                 // console.log(options[0][optionKey].length); // Accessing the property dynamically

//                 if (options[0][optionKey].length > 0) {
//                   input[optCnt] = optCnt;
//                 }
//               }
//               // console.log(input);
//               input = input.filter((item) => item !== undefined);
//               // rand_keys = [...Array(input.length).keys()];

//               // console.log(rand_keys)
//               // return false;
//               if (answershuffling == "Y") {
//                 // shuffleArray(rand_keys);
//                 shuffleArray(input);
//               }
//               // console.log(rand_keys);
//               // console.log( examCodeOfQPStructure,
//               //   subjectCodeOfQPStructure,
//               //   sectionCode,
//               //   questionID)
//               const shufflingQuestionTypes = await getShufflingQuestionType(
//                 examCodeOfQPStructure,
//                 subjectCodeOfQPStructure,
//                 sectionCode,
//                 questionID
//               );
//               // console.log(shufflingQuestionTypes)
//               for (const shufflingQuestionType of shufflingQuestionTypes) {
//                 if (
//                   shufflingQuestionType.question_type == "N" ||
//                   shufflingQuestionType.question_type == "R"
//                 ) {
//                   strOptOrder = "";
//                 } else {
//                   if (ansshuffle == "2") {
//                     strOptOrder = "1,2,3,4,5";
//                   } else {
//                     if (shufflingQuestionType.shuffling == "Y") {
//                       // console.log("helo")
//                       // strOptOrder = rand_keys.join(",");
//                       strOptOrder = input.join(",");
//                     } else {
//                       strOptOrder = "1,2,3,4,5";
//                     }
//                   }
//                   // console.log(strOptOrder)
//                 }
//                 if (insertIntoQPDetailsquery == "") {
//                   // console.log("inside"+questionPaperNo)
//                   insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
//                 } else {
//                   insertIntoQPDetailsquery += `,(${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
//                 }
//                 iCount++;
//               }
//             }
//           }
//         }
//         // console.log(questionPaperNo);
//         // console.log(insertIntoQPDetailsquery);
//         const insertIntoQPDetail = await insertIntoQPDetails(
//           insertIntoQPDetailsquery
//         );
//         if (insertIntoQPDetail <= 0) {
//           return false;
//         }
//         insertIntoQPDetailsquery = "";

//         const updateMemInQPquery =
//           "UPDATE iib_question_paper SET complete='Y', assigned='Y', membership_no= ? WHERE question_paper_no= ?";

//         const updateMemNoInQP = await updateMemInQP(
//           updateMemInQPquery,
//           membershipNo,
//           questionPaperNo
//         );
//         if (updateMemNoInQP <= 0) {
//           return false;
//         }
//       }
//       return res.json({ question_paper_no: questionPaperNo });
//     }
//   } catch (err) {
//     console.error("Error while generating question paper");
//     return res.status(500).send("Error while generating question paper");
//   }
// });




// app.get("/ontheflyqpgen/", async (req, res) => {
//   const { membershipNo, examCode, subjectCode, medium, totalMarks } = req.query;
//   let iCount = 1;
//   let memTicketno;
//   let insertIntoQPDetailsquery = "";

//   // console.log(membershipNo,subjectCode)
//   try {
//     const getMemTicketNo = async (memNo, subjectCode) => {
//       const query =
//         "SELECT a.address3 as memTicketNo, c.slot_no as slotNo FROM iib_candidate a JOIN iib_candidate_iway b  ON a.membership_no = b.membership_no JOIN iib_exam_slots c ON c.slot_time = b.exam_time where a.membership_no= ? and b.subject_code= ?";

//       return new Promise((resolve, reject) => {
//         db.query(query, [memNo, subjectCode], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res.status(500).send("Database query error : getMemTicketNo")
//             );
//           }

//           return resolve({
//             memTicketNo: result[0].memTicketNo,
//             slotNo: result[0].slotNo,
//           });
//         });
//       });
//     };
//     const gettingQPStructure = async (subjectCode) => {
//       const qpStructureQry =
//         "SELECT exam_code, subject_code, section_code, marks, sum(no_of_questions) as no_of_questions, case_id FROM iib_qp_weightage WHERE subject_code = ? group by 1,2,3,4";
//       return new Promise((resolve, reject) => {
//         db.query(qpStructureQry, [subjectCode], (err, res) => {
//           // console.log("helo grom gettingQPStrucure")
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res.status(500).send("Database query error : qpStructureQry")
//             );
//           }
//           return resolve({ qpStructureLength: res.length, qpStructures: res });
//         });
//       });
//     };
//     const getAnswerShuffling = async (subjectCode) => {
//       const getAnswerShufflingquery =
//         "select answer_shuffling from iib_exam_subjects where subject_code = ?";
//       return new Promise((resolve, reject) => {
//         db.query(getAnswerShufflingquery, [subjectCode], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res
//                 .status(500)
//                 .send("Database query error : getAnswerShufflingquery")
//             );
//           }
//           return resolve(result[0].answer_shuffling);
//         });
//       });
//     };
//     const insertingInQPTable = async (
//       questionPaperNo,
//       examCode,
//       subjectCode,
//       totalMarks,
//       isSample,
//       medium
//     ) => {
//       console.log(questionPaperNo);
//       let choosenMedium;
//       if (medium == "EN") {
//         choosenMedium = "E";
//       } else {
//         choosenMedium = "H";
//       }
//       try {
//         const insertingInQPTableQry =
//           "INSERT INTO iib_question_paper (question_paper_no,exam_code,subject_code,total_marks,sample,enabled,online,assigned,medium_code) VALUES (?,?,?,?,?,'Y','Y','N',?)";
//         return new Promise((resolve, reject) => {
//           db.query(
//             insertingInQPTableQry,
//             [
//               questionPaperNo,
//               examCode,
//               subjectCode,
//               totalMarks,
//               isSample,
//               choosenMedium,
//             ],
//             (err, res) => {
//               if (err) {
//                 console.error("Database query failed:", err);
//                 return reject(
//                   new Error(
//                     "Database query error: Insert on iib_question_paper failed"
//                   )
//                 );
//               }
//               return resolve(res.affectedRows);
//             }
//           );
//         });
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     const gettingQuesID = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       sectionMarks,
//       questionCount
//     ) => {
//       // console.log(examCode,
//       //   subjectCode,
//       //   sectionCode,
//       //   sectionMarks,
//       //   questionCount)
//       const gettingQuesIDQuery =
//         "SELECT question_id, question_code FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND  marks= ? ORDER BY rand() LIMIT ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           gettingQuesIDQuery,
//           [examCode, subjectCode, sectionCode, sectionMarks, questionCount],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : gettingQuesIDQuery -  failed")
//               );
//             }
//             // console.log(result)
//             return resolve(result);
//           }
//         );
//       });
//     };

//     const gettingCaseIdQuestions = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       sectionMarks
//     ) => {
//       const gettingCaseIdQuestionsQuery =
//         "SELECT  case_id from iib_qp_weightage where exam_code=? AND subject_code=? AND section_code= ? AND marks=?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           gettingCaseIdQuestionsQuery,
//           [examCode, subjectCode, sectionCode, sectionMarks],
//           (err, res) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               res
//                 .status(500)
//                 .send("Database query error : gettingQuesIDQuery -  failed");
//               return reject();
//             }
//             const getCaseCount = res.length;
//             const result = queryAsync(
//               "SELECT  case_id from iib_sc_details where exam_code=? AND subject_code= ? AND section_code= ? AND case_marks= ? ORDER BY rand() LIMIT ?",
//               [examCode, subjectCode, sectionCode, sectionMarks, getCaseCount]
//             );
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getQuestCaseSecCode = async (examCode, subjectCode, listCaseID) => {
//       const getQuestCaseSecCodequery = ` SELECT question_id,case_id,section_code from iib_sq_details where exam_code= ? and subject_code=? and case_id IN (${listCaseID})`;
//       return new Promise((resolve, reject) => {
//         db.query(
//           getQuestCaseSecCodequery,
//           [examCode, subjectCode, listCaseID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send(
//                     "Database query error : getQuestCaseSecCodequery -  failed"
//                   )
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getCaseDetails = async (examCode, subjectCode, listCaseID) => {
//       const getCaseDetailsquery = `SELECT a.case_id as case_id,sum(a.marks) as total_marks ,count(1) as qpcount,a.section_code as section_code,b.sub_section_code as sub_section_code ,b.difficulty as difficulty from iib_sq_details a, iib_sc_details b where a.exam_code= ? and a.exam_code=b.exam_code and a.subject_code=? and a.subject_code=b.subject_code and a.case_id=b.case_id and a.case_id IN (${listCaseID}) group by a.case_id`;
//       return new Promise((resolve, reject) => {
//         db.query(
//           getCaseDetailsquery,
//           [examCode, subjectCode, listCaseID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getCaseDetailsquery -  failed")
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getQuesCaseIds = async (
//       examCode,
//       subjectCode,
//       csectionCode,
//       caseid
//     ) => {
//       // console.log(examCode,subjectCode,csectionCode,caseid)
//       const getQuesCaseIdsquery =
//         "SELECT question_id as questionID, case_id as caseID,marks as sectionMarks FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND case_id = ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getQuesCaseIdsquery,
//           [examCode, subjectCode, csectionCode, caseid],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getQuesCaseIdsquery -  failed")
//               );
//             }
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getOptions = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       questionID
//     ) => {
//       const getOptionsquery =
//         "SELECT option_1, option_2, option_3, option_4, option_5 FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getOptionsquery,
//           [examCode, subjectCode, sectionCode, questionID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : getQuesCaseIdsquery -  failed")
//               );
//             }
//             // console.log(result[0])
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const getShufflingQuestionType = async (
//       examCode,
//       subjectCode,
//       sectionCode,
//       questionID
//     ) => {
//       const getShufflingQuestionTypequery =
//         "SELECT shuffling ,question_type FROM iib_sq_details WHERE exam_code= ? AND subject_code= ? AND section_code= ? AND question_id= ?";
//       return new Promise((resolve, reject) => {
//         db.query(
//           getShufflingQuestionTypequery,
//           [examCode, subjectCode, sectionCode, questionID],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send(
//                     "Database query error : getShufflingQuestionTypequery -  failed"
//                   )
//               );
//             }
//             // console.log(result)
//             return resolve(result);
//           }
//         );
//       });
//     };
//     const insertIntoQPDetails = async (query) => {
//       return new Promise((resolve, reject) => {
//         db.query(query, [], (err, result) => {
//           if (err) {
//             console.error("Database query failed:", err);
//             return reject(
//               res
//                 .status(500)
//                 .send(
//                   "Database query error : getShufflingQuestionTypequery -  failed"
//                 )
//             );
//           }
//           return resolve(result.affectedRows);
//         });
//       });
//     };
//     const updateMemInQP = async (
//       updateMemInQPquery,
//       membershipNo,
//       questionPaperNo
//     ) => {
//       // console.log(updateMemInQPquery,
//       //   membershipNo,
//       //   questionPaperNo)
//       return new Promise((resolve, reject) => {
//         db.query(
//           updateMemInQPquery,
//           [membershipNo, questionPaperNo],
//           (err, result) => {
//             if (err) {
//               console.error("Database query failed:", err);
//               return reject(
//                 res
//                   .status(500)
//                   .send("Database query error : updateMemInQPquery -  failed")
//               );
//             }
//             console.log(result);
//             return resolve(result.affectedRows);
//           }
//         );
//       });
//     };
//     const shuffleArray = (array) => {
//       for (let i = array.length - 1; i > 0; i--) {
//         let j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]]; // Swap elements
//       }
//       // return array;
//     };
//     const { memTicketNo, slotNo } = await getMemTicketNo(
//       membershipNo,
//       subjectCode
//     );
//     // console.log(memTicketNo, slotNo);
//     const memshipNoTicketNo = memTicketNo.split(":");
//     memTicketno = slotNo + memshipNoTicketNo[1].trim();
//     const questionPaperNo = memTicketno;
//     console.log(questionPaperNo.length);
//     // console.log(memshipNoTicketNo,questionPaperNo);
//     const { qpStructureLength, qpStructures } =
//       await gettingQPStructure(subjectCode);

//     const answershuffling = await getAnswerShuffling(subjectCode);

//     if (qpStructureLength == 0) {
//       console.error("QP weightage structure is not there");
//       return res.status(500).send("Database query error : qpStructureQry");
//     } else {
//       if (totalMarks == "") {
//         totalMarks = 0;
//       }

//       const resultInsertingQPTable = await insertingInQPTable(
//         questionPaperNo,
//         examCode,
//         subjectCode,
//         totalMarks,
//         "N",
//         medium
//       );
//       // console.log(resultInsertingQPTable)
//       if (resultInsertingQPTable != 0) {
//         console.log("inserted into iib_question_paper");
//       }

//       let aAllQuestions = [];
//       let aQuestions = [];
//       let arrcasequestionID = [];
//       let count = 0;

//       let examCodeOfQPStructure,
//         subjectCodeOfQPStructure,
//         sectionCode,
//         sectionMarks,
//         questionID,
//         questionCode,
//         questionCount;
//       for (const qpStructure of qpStructures) {
//         examCodeOfQPStructure = qpStructure.exam_code;
//         subjectCodeOfQPStructure = qpStructure.subject_code;
//         sectionCode = qpStructure.section_code;
//         sectionMarks = qpStructure.marks;
//         questionCount = qpStructure.no_of_questions;
//         sectionType = qpStructure.case_id;
//         // console.log(examCodeOfQPStructure,subjectCodeOfQPStructure,sectionCode,sectionMarks,questionCount,typeof sectionType)
//         if (sectionType == null || sectionType == "NULL") {
//           const questionIdCodes = await gettingQuesID(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             sectionMarks,
//             questionCount
//           );
//           // console.log(questionIdCodes);
//           if (questionIdCodes.length > 0) {
//             questionIdCodes.forEach((questionIdCode) => {
//               questionID = questionIdCode.question_id;
//               questionCode = questionIdCode.question_code;
//               // console.log(questionID, questionCode)
//               if (!aQuestions[questionID]) {
//                 aQuestions[questionID] = [[], [], [], []];
//               }
//               // console.log(aQuestions)  ;
//               aQuestions[questionID][0].push(questionID);
//               aQuestions[questionID][1].push(sectionCode);
//               aQuestions[questionID][2].push(sectionMarks);
//               aQuestions[questionID][3].push(0);
//               // console.log("asdf",aQuestions);
//               // aAllQuestions[count] = [];
//               if (!aAllQuestions[count]) {
//                 aAllQuestions[count] = [[], [], []];
//               }
//               aAllQuestions[count][0].push(questionID);
//               aAllQuestions[count][1].push(questionID);
//               aAllQuestions[count][2].push(0);
//               count++;
//             });
//           }
//         } //section type 'G' if ends here
//         // console.log("aquestions",aQuestions);
//         // console.log("aAllquestions",aAllQuestions)
//         if (sectionType != null || sectionType != "NULL") {
//           const caseIdQuestions = await gettingCaseIdQuestions(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             sectionMarks
//           );
//           // console.log(caseIdQuestions);
//           for (const caseIdQuestion of caseIdQuestions) {
//             // arrcasequestionID[sectionCode]=[];
//             if (!Array.isArray(arrcasequestionID[sectionCode])) {
//               arrcasequestionID[sectionCode] = [];
//             }
//             arrcasequestionID[sectionCode].push(caseIdQuestion.case_id);
//           }
//           // console.log("arrcasequestionID",arrcasequestionID)
//         } //section type 'C' if ends here
//       }

//       let listCaseIDArr = [];
//       let arrcasecnt = arrcasequestionID.length;
//       arrcasequestionID.forEach((arcaskey) => {
//         // console.log(arcaskey);
//         // Check if the current value is a non-empty array
//         if (Array.isArray(arcaskey) && arcaskey.length > 0) {
//           // Merge the current array into listCaseIDArr
//           listCaseIDArr = listCaseIDArr.concat(arcaskey);
//         }
//       });

//       let listCaseID;
//       let arrcaseID;
//       let arrCqid = [];
//       let arrCase = [{}];
//       let arrSecCase = [[], []];
//       let allIDs = [];
//       //  console.log(listCaseIDArr)
//       if (listCaseIDArr.length > 0) {
//         listCaseID = listCaseIDArr.join(",");
//         arrcaseID = listCaseID.split(",");

//         const questCaseSecCodeValues = await getQuestCaseSecCode(
//           examCodeOfQPStructure,
//           subjectCodeOfQPStructure,
//           listCaseID
//         );
//         // console.log(questCaseSecCodeValues)

//         for (const questCaseSecCodeValue of questCaseSecCodeValues) {
//           const caseId = questCaseSecCodeValue.case_id;
//           const sectionCode = questCaseSecCodeValue.section_code;
//           const questionId = questCaseSecCodeValue.question_id;

//           // Ensure arrCqid[caseId] is initialized as an array
//           if (!Array.isArray(arrCqid[caseId])) {
//             arrCqid[caseId] = [];
//           }

//           // Append or update the array with the question_id
//           if (arrCqid[caseId].length > 0) {
//             arrCqid[caseId].push(`${arrCqid[caseId].join(",")},${questionId}`);
//           } else {
//             arrCqid[caseId].push(questionId);
//           }

//           // Ensure arrSecCase[sectionCode] is initialized
//           if (!arrSecCase[sectionCode]) {
//             arrSecCase[sectionCode] = {};
//           }

//           // Ensure arrSecCase[sectionCode][caseId] is initialized as an array
//           if (!Array.isArray(arrSecCase[sectionCode][caseId])) {
//             arrSecCase[sectionCode][caseId] = [];
//           }

//           // Add the question_id to the section-case mapping
//           arrSecCase[sectionCode][caseId].push(questionId);
//         }

//         // console.log("arrcqid" + arrCqid)
//         const caseDetails = await getCaseDetails(
//           examCodeOfQPStructure,
//           subjectCodeOfQPStructure,
//           listCaseID
//         );
//         // console.log(caseDetails);
//         for (const caseDetail of caseDetails) {
//           const caseId = caseDetail.case_id;
//           // Ensure arrCase[caseId] is initialized as an object
//           if (!arrCase[caseId]) {
//             arrCase[caseId] = {
//               marks: "",
//               questionscount: "",
//               sectioncode: "",
//               subsectioncode: "",
//               priority: "",
//             };
//           }

//           // Populate the arrays within arrCase[caseId]
//           arrCase[caseId].marks = caseDetail.total_marks;
//           arrCase[caseId].questionscount = caseDetail.qpcount;
//           arrCase[caseId].sectioncode = Number(caseDetail.section_code);
//           arrCase[caseId].subsectioncode = caseDetail.sub_section_code;
//           arrCase[caseId].priority = caseDetail.difficulty;
//         }
//         // console.log("arrCase" + JSON.stringify(arrCase))

//         // console.log("arrCase" + arrCase)
//         let caseid, csectionCode, csubSectionCode, cpriority;

//         let caseCnt;
//         // console.log(arrcaseID)
//         for (let i = 0; i < arrcaseID.length; i++) {
//           caseid = arrcaseID[i];
//           csectionCode = arrCase[caseid].sectioncode;
//           csubSectionCode = arrCase[caseid].subsectioncode;
//           cpriority = arrCase[caseid].priority;

//           const quesCaseIds = await getQuesCaseIds(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             csectionCode,
//             caseid
//           );
//           // console.log(quesCaseIds)

//           if (quesCaseIds.length > 0) {
//             // Initialize allIDs if it is not already defined
//             let allIDs = [];
//             let first = 0,
//               firstID = null;
//             caseCnt = count;

//             // Iterate over each quesCaseId in quesCaseIds
//             quesCaseIds.forEach((quesCaseId) => {
//               if (first == 0) {
//                 first = 1;
//                 firstID = quesCaseId.questionID; // Set the first questionID
//               }

//               // Initialize aQuestions[quesCaseId.questionID] if not already initialized
//               if (!aQuestions[quesCaseId.questionID]) {
//                 aQuestions[quesCaseId.questionID] = [[], [], [], [], [], []];
//               }
//               // console.log(first,firstID)
//               // console.log(quesCaseId);
//               // Populate the arrays within aQuestions[quesCaseId.questionID]
//               aQuestions[quesCaseId.questionID][0].push(quesCaseId.questionID);
//               aQuestions[quesCaseId.questionID][1].push(csectionCode);
//               aQuestions[quesCaseId.questionID][2].push(quesCaseId.sectionMarks);
//               aQuestions[quesCaseId.questionID][3].push(quesCaseId.caseID);
//               aQuestions[quesCaseId.questionID][4].push(csubSectionCode);
//               aQuestions[quesCaseId.questionID][5].push(cpriority);
//               // console.log(aQuestions)
//               // Add the questionID to allIDs
//               allIDs.push(quesCaseId.questionID);
//               caseCnt++;
//             });
//             // console.log(aQuestions)
//             allIDs.sort((a, b) => a - b);
//             // console.log(allIDs);
//             let strAllIDs = allIDs.join(",");
//             if (!aAllQuestions[count]) {
//               aAllQuestions[count] = [[], [], []];
//             }
//             // Store the results in aAllQuestions
//             aAllQuestions[count][0].push(firstID);
//             aAllQuestions[count][1].push(strAllIDs);
//             aAllQuestions[count][2].push(quesCaseIds[0].caseID);
//             // Increment the counter
//             count++;
//             first = 0;
//           }
//         }
//         // console.log(aAllQuestions.length)

//         let nQuestions = aQuestions.length;
//         let nQs = aAllQuestions.length;
//         let questionID;
//         let strQuestionIDs, actualCnt, actualRandQuestions, caseIndex;
//         let arrayOfQuestions = [];
//         let sectionCode,
//           sectionMarks,
//           caseID,
//           strOptOrder,
//           ansshuffle = 0;

//         let aRandQuestions = [...Array(nQs).keys()]; // [0, 1, 2, ..., nQs-1]
//         // console.log(aRandQuestions)
//         // Step 2: Shuffle the array (like shuffle)
//         for (let i = aRandQuestions.length - 1; i > 0; i--) {
//           let j = Math.floor(Math.random() * (i + 1));
//           [aRandQuestions[i], aRandQuestions[j]] = [
//             aRandQuestions[j],
//             aRandQuestions[i],
//           ];
//         }
//         // console.log("aRandques",aRandQuestions);
//         let index;
//         for (let qCount = 0; qCount < nQs; qCount++) {
//           qCount + 1;
//           if (Array.isArray(aRandQuestions)) {
//             index = aRandQuestions[qCount];
//           } else {
//             index = aRandQuestions;
//           }
//           // console.log(index);
//           let actualQuestions = [];
//           // console.log(aAllQuestions);
//           strQuestionIDs = aAllQuestions[index][1].toString();
//           actualQuestions = strQuestionIDs.split(",");
//           // console.log("actual",actualQuestions,actualQuestions.length);

//           if (Array.isArray(actualQuestions)) {
//             actualCnt = actualQuestions.length;
//             // Randomization in JavaScript
//             shuffleArray(actualQuestions); // Shuffle the array in place

//             // Step 4: Select the first `actualCnt` elements (which would be the entire array)
//             actualRandQuestions = actualQuestions.slice(0, actualCnt);
//             // console.log(actualRandQuestions + "random")
//           } else {
//             actualCnt = 1;
//           }
//                       // console.log(actualRandQuestions + "random")

//           for (let cntIDs = 0; cntIDs < actualCnt; cntIDs++) {
//             if (Array.isArray(actualRandQuestions)) {
//               caseIndex = actualRandQuestions[cntIDs];
//               // console.log("cntIDs",cntIDs);
//               // console.log("actualRandQuestions",actualRandQuestions[cntIDs]);
//               // console.log("caseIndex",caseIndex);
//             } else {
//               caseIndex = actualRandQuestions;
//               // console.log(caseIndex)
//             }
//             if (Array.isArray(actualQuestions)) {
//               questionID = actualQuestions[cntIDs];
//               // console.log("questionID"+questionID)
//             } else {
//               questionID = actualQuestions;
//               // console.log(questionID)
//             }
//             sectionCode = aQuestions[questionID][1];
//           sectionMarks = aQuestions[questionID][2];
//           caseID = aQuestions[questionID][3];
//             arrayOfQuestions.push([Number(sectionCode), Number(sectionMarks), Number(caseID), Number(questionID)]);
//           }
//         }
//         arrayOfQuestions.sort((a, b) => a[0] - b[0]);
//         // console.log(arrayOfQuestions);
//         for (const arrayOfQuestion of arrayOfQuestions) {
//           // console.log(arrayOfQuestion)
//           questionID = arrayOfQuestion[3];
//           // console.log(questionID)
//         if (questionID != "") {
//           sectionCode = arrayOfQuestion[1];
//           sectionMarks = arrayOfQuestion[2];
//           caseID = arrayOfQuestion[3];
//           strOptOrder = "";
//           const options = await getOptions(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             questionID
//           );
//           // console.log(options)
//           let input = [];
//           let rand_keys = [];

//           // console.log(options);
//           for (let optCnt = 1; optCnt <= 5; optCnt++) {
//             let optionKey = `option_${optCnt}`; // Creates option_1, option_2, etc.
//             // console.log(options[0][optionKey].length); // Accessing the property dynamically

//             if (options[0][optionKey].length > 0) {
//               input[optCnt] = optCnt;
//             }
//           }
//           // console.log(input);
//           input = input.filter(item => item !== undefined);
//           // rand_keys = [...Array(input.length).keys()];

//           // console.log(rand_keys)
//           // return false;
//           if (answershuffling == "Y") {
//             // shuffleArray(rand_keys);
//             shuffleArray(input);
//           }
//           // console.log(rand_keys);
//           // console.log( examCodeOfQPStructure,
//           //   subjectCodeOfQPStructure,
//           //   sectionCode,
//           //   questionID)
//           const shufflingQuestionTypes = await getShufflingQuestionType(
//             examCodeOfQPStructure,
//             subjectCodeOfQPStructure,
//             sectionCode,
//             questionID
//           );
//           // console.log(shufflingQuestionTypes)
//           for (const shufflingQuestionType of shufflingQuestionTypes) {
//             if (
//               shufflingQuestionType.question_type == "N" ||
//               shufflingQuestionType.question_type == "R"
//             ) {
//               strOptOrder = "";
//             } else {
//               if (ansshuffle == "2") {
//                 strOptOrder = "1,2,3,4,5";
//               } else {
//                 if (shufflingQuestionType.shuffling == "Y") {
//                   // console.log("helo")
//                   // strOptOrder = rand_keys.join(",");
//                   strOptOrder = input.join(",");

//                 } else {
//                   strOptOrder = "1,2,3,4,5";
//                 }
//               }
//               // console.log(strOptOrder)
//             }
//             if (insertIntoQPDetailsquery == "") {
//               // console.log("inside"+questionPaperNo)
//               insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
//               // console.log(insertIntoQPDetailsquery);
//             } else {
//               insertIntoQPDetailsquery += `,(${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
//               // console.log(insertIntoQPDetailsquery);
//             }
//             iCount++;
//           }
//           // console.log("helo")

//         }
//         console.log(insertIntoQPDetailsquery)

      
//         // console.log(questionPaperNo);
//         let insertIntoQPDetail = await insertIntoQPDetails(
//           insertIntoQPDetailsquery
//         );
//         if (insertIntoQPDetail <= 0) {
//           return false;
//         }
//         insertIntoQPDetailsquery = "";

//         const updateMemInQPquery =
//           "UPDATE iib_question_paper SET complete='Y', assigned='Y', membership_no= ? WHERE question_paper_no= ?";

//         const updateMemNoInQP = await updateMemInQP(
//           updateMemInQPquery,
//           membershipNo,
//           questionPaperNo
//         );
//         if (updateMemNoInQP <= 0) {
//           return false;
//         }
//       }
//       return res.json({ question_paper_no: questionPaperNo });
//     }
//   }
//   } catch (err) {
//     console.error("Error while generating question paper");
//     return res.status(500).send("Error while generating question paper");
//   }
// });

 
app.get("/ontheflyqpgen/", async (req, res) => {
  const { membershipNo, examCode, subjectCode, medium, totalMarks } = req.query;
  // console.log(membershipNo, examCode, subjectCode, medium, totalMarks);
  let iCount = 1;
  let memTicketno;
          let arrayOfQuestions = [];
          let insertIntoQPDetailsquery = "";

  // console.log(membershipNo,subjectCode)
  try {
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
              return resolve(res.affectedRows);
            }
          );
        });
      } catch (err) {
        console.log(err);
      }
    };
    const gettingQuesID = async (examCode,subjectCode,sectionCode,sectionMarks,questionCount) => {
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
          [examCode, subjectCode, sectionCode, questionID],
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
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      // return array;
    };
    const getDisplaySecNavAndTimeValue = async (subjectCode) => {
      const getDisplaySecNavAndTimeValuequery =
        "SELECT display_sec_nav, display_sec_timer FROM iib_exam_subjects WHERE subject_code = ?";
      return new Promise((resolve, reject) => {
        db.query(getDisplaySecNavAndTimeValuequery,[subjectCode],(err, result) => {
            if (err) {
              console.error("Database query failed:", err);
              return reject(res.status(500).send("Database query error : getDisplaySecNavAndTimeValuequery -  failed"));
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
    const {display_sec_nav, display_sec_timer} = await getDisplaySecNavAndTimeValue(subjectCode);
    
    // console.log(display_sec_nav,display_sec_timer)
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

        let nQuestions = aQuestions.length;
        let nQs = aAllQuestions.length;
        let questionID;
        let strQuestionIDs, actualCnt, actualRandQuestions, caseIndex;
        let sectionCode,
          sectionMarks,
          caseID,
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

                if (options[0][optionKey].length > 0) {
                  input[optCnt] = optCnt;
                }
              }
              // console.log(input);
              input = input.filter((item) => item !== undefined);
              // rand_keys = [...Array(input.length).keys()];

              if (answershuffling == "Y") {
                // shuffleArray(rand_keys);
                shuffleArray(input);
              }
           
              const shufflingQuestionTypes = await getShufflingQuestionType(
                examCodeOfQPStructure,
                subjectCodeOfQPStructure,
                sectionCode,
                questionID
              );
              // console.log(shufflingQuestionTypes)
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
                if(display_sec_nav == "Y" || display_sec_timer == "Y"){ 
                arrayOfQuestions.push([Number(questionPaperNo), Number(subjectCodeOfQPStructure), Number(sectionCode), Number(questionID), (strOptOrder), Number(iCount), Number(caseID)]);
                }
                else{
                      if (insertIntoQPDetailsquery == "") {
                 console.log("inside"+questionPaperNo)
                  insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
                } else {
                  insertIntoQPDetailsquery += `,(${questionPaperNo}, ${subjectCodeOfQPStructure}, ${sectionCode}, ${questionID}, '${strOptOrder}', ${iCount}, ${caseID},now())`;
                }
                iCount++;
                }
               
              }
            }
          }
        }
        // console.log(questionPaperNo);
        if(display_sec_nav == "Y" || display_sec_timer == "Y"){ 
          // console.log(arrayOfQuestions);
        //to sort the array based on the section code(for section navigation)
        arrayOfQuestions.sort((a, b) => a[2] - b[2]);
        // console.log(arrayOfQuestions);
        for (let i = 0; i < arrayOfQuestions.length; i++) {
          if (insertIntoQPDetailsquery == "") {
            insertIntoQPDetailsquery = `INSERT INTO iib_question_paper_details (question_paper_no, subject_code, section_code, question_id, answer_order, display_order,case_id,updated_time) VALUES (${arrayOfQuestions[i][0]}, ${arrayOfQuestions[i][1]}, ${arrayOfQuestions[i][2]}, ${arrayOfQuestions[i][3]}, '${arrayOfQuestions[i][4]}',${i+1}, ${arrayOfQuestions[i][6]},${formattedTime})`;    
          } else {
            insertIntoQPDetailsquery += `,(${arrayOfQuestions[i][0]}, ${arrayOfQuestions[i][1]}, ${arrayOfQuestions[i][2]}, ${arrayOfQuestions[i][3]}, '${arrayOfQuestions[i][4]}', ${i+1}, ${arrayOfQuestions[i][6]},${formattedTime})`;
          }
        }
      }
        // console.log(insertIntoQPDetailsquery);
        const insertIntoQPDetail = await insertIntoQPDetails(
          insertIntoQPDetailsquery
        );
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
        if (updateMemNoInQP <= 0) {
          return false;
        }
      }
      return res.json({ question_paper_no: questionPaperNo });
    }
  } catch (err) {
    console.error("Error while generating question paper");
    return res.status(500).send("Error while generating question paper");
  }
});

// Endpoint: /scannerUpload



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
app.post("/scannerUpload", async (req, res) => {
  const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }).single("userFile");

  upload(req, res, async (err) => {
    if (err) {
      console.error("Error during file upload:", err.message);
      return res.status(400).json({ message: "File upload failed." });
    }

    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: "File not found or invalid format." });
    }

    const newFilePath = path.resolve("C:/pro/itest/activate/scan_input.csv");

    try {
      const data = fs.readFileSync(uploadedFile.path, "utf8").split("\n");
      const old_ip_array = data.map((line) => line.split(",")[0].trim());

      const invalidIP = old_ip_array.find(
        (ip) =>
          !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            ip
          )
      );

      if (invalidIP) {
        return res
          .status(400)
          .json({ message: `Invalid IP found in file: ${invalidIP}` });
      }

      fs.renameSync(uploadedFile.path, newFilePath);

      return res.json({ message: "File uploaded and processed successfully!" });
    } catch (error) {
      console.error("Error processing file:", error.message);
      return res.status(500).json({ message: "Error processing the file." });
    } finally {
      if (fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
    }
  });
});


const uploads_mul = multer({
  dest: "uploads/", // Temporary upload directory
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".csv") {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});
 
app.post("/manual-sync-api-import-csv", uploads_mul.single("file"), (req, res) => {
  const uploadedFile = req.file;
  console.log("File received:",uploadedFile);
  if (!uploadedFile) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({ message: "CSV processed successfully." });
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
      selectedips = selectedips.map(item => item.value);
  } catch (error) {
      console.error("Error parsing selected IPs:", error);
      return res.status(400).json({ success: false, message: "Invalid IP selection format." });
  }
 
  const query = `
      UPDATE candidate_seat_management
      SET status = ?
      WHERE biometric_id IN (?)`;
 
  const updatestatus = "2";
 
  if (!Array.isArray(selectedips) || selectedips.length === 0) {
      return res.status(400).json({ success: false, message: "No IPs provided." });
  }
 
  db.query(query, [updatestatus, selectedips], (err, result) => {
      if (err) {
          console.error("Error updating record:", err);
          return res.status(500).json({ success: false, message: "Database error." });
      }
      res.json({ success: true, message: "Record updated successfully.", affectedRows: result.affectedRows });
  });
});
 
app.get("/unblock-candidate-ip", (req, res) => {
  let selectedips;
 
  try {
      selectedips = JSON.parse(req.query.selectedips); // Parse JSON string into an array
      // Extract only the `value` properties
      selectedips = selectedips.map(item => item.value);
  } catch (error) {
      console.error("Error parsing selected IPs:", error);
      return res.status(400).json({ success: false, message: "Invalid IP selection format." });
  }
 
  const query = `
      UPDATE candidate_seat_management
      SET status = ?
      WHERE biometric_id IN (?)`;
 
  const updatestatus = "1";
 
  if (!Array.isArray(selectedips) || selectedips.length === 0) {
      return res.status(400).json({ success: false, message: "No IPs provided." });
  }
 
  db.query(query, [updatestatus, selectedips], (err, result) => {
      if (err) {
          console.error("Error updating record:", err);
          return res.status(500).json({ success: false, message: "Database error." });
      }
      res.json({ success: true, message: "Record updated successfully.", affectedRows: result.affectedRows });
  });
});
 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
