const axios = require("axios");
const express = require("express");
const mysql = require("mysql");
require("dotenv").config(); // For environment variables
const cookieParser = require('cookie-parser');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.json());



app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());
const port = 5002;
// const mysqlPath = '"C:/mysql5/bin/mysql.exe"';

const db_server = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'itest_api',
});

db_server.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected.');
});


const jwt = require('jsonwebtoken');
// // Middleware to validate JWT

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid.' });
  }

  const JWT_SECRET = process.env.JWT_SECRET; // Ensure JWT_SECRET is loaded from environment variables

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Internal server error.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    req.user = user; // Attach decoded user info to the request
    next();
  });
}


app.post('/checkUser', authenticateToken, (req, res) => {
  const { username, password, serialnumber } = req.body;

  if (!username || !password || !serialnumber) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
    SELECT * FROM centre_mac_activation
    WHERE exam_engine_admin = ? AND exam_engine_pwd = ? AND mac_id = ?
  `;

  db_server.query(query, [username, password, serialnumber], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (results.length > 0) {
      return res.status(200).json({
        response_status: '1',
        message: 'User found.',
        user: results[0],
      });
    } else {
      res.status(404).json({
        response_status: '2',
        message: 'User not found.',
      });
    }
  });
});

app.post('/Qpactivationcheck', authenticateToken, (req, res) => {
  // app.post('/Qpactivationcheck', (req, res) => {
  const {serialNumber, batch } = req.body;
  console.log(serialNumber);
  // if (!username || !password || !serialnumber) {
  //   return res.status(400).json({ message: 'All fields are required.' });
  // }

  const query = `SELECT * FROM centre_mac_activation WHERE mac_id = ? `;

  db_server.query(query, [serialNumber,batch], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (results.length > 0) {
      return res.status(200).json({
        response_status: '1',
        message: 'User found.',
        user: results[0],
      });
    } else {
      res.status(404).json({
        response_status: '2',
        message: 'User not found.',
      });
    }
  });
});

// app.post('/protectedRoute', authenticateToken, (req, res) => {
//   res.status(200).json({ message: 'This is a protected route!', user: req.user });
// });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
