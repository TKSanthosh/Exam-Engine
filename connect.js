const mysql = require("mysql");
require("dotenv").config(); // Load environment variables

// Create a connection pool (recommended for production)
const db = mysql.createPool({
  connectionLimit: 10, // Maximum number of connections
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true, // Allow multiple queries in one statement
});

// Handle MySQL connection errors
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.code);
    setTimeout(handleReconnect, 5000); // Retry connection after 5 seconds
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release(); // Release connection back to pool
  }
});

// Function to handle MySQL connection loss and reconnect
const handleReconnect = () => {
  console.log("🔄 Reconnecting to MySQL...");
  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Reconnection Failed:", err);
      setTimeout(handleReconnect, 5000); // Retry after 5 sec
    } else {
      console.log("✅ Reconnected to MySQL!");
      connection.release();
    }
  });
};

// Event Listener for MySQL Errors
db.on("error", (err) => {
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.warn("⚠️ Database connection lost. Attempting to reconnect...");
    handleReconnect();
  } else {
    throw err;
  }
});

module.exports = db;
