const express = require('express');
const app = express();
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

// Set up the mail server
// The code sets up a nodemailer transporter for sending emails using Gmail SMTP server.
//It uses the credentials specified in the .env file for authentication.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "paras0994.be21@chitkara.edu.in",
    pass: "Sahilparas#567"
  }
});

// Generate a random OTP
function generateOTP() {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// Send an OTP to the user's email
async function sendOTP(email) {
  const otp = generateOTP();
  const mailOptions = {
    from:"paras0994.be21@chitkara.edu.in",
    to: email,
    subject: 'OTP for login/signup',
    text: `Your OTP is ${otp}` 
  };
  await transporter.sendMail(mailOptions);
  return otp;
}

// Verify the OTP
function verifyOTP(userOTP, enteredOTP) {
  return userOTP === enteredOTP;
}

//app.use(...): Registers middleware for processing incoming requests.
// express.urlencoded({ extended: true }): Parses incoming request bodies with URL-encoded payloads.
// The extended: true option allows parsing of nested objects in the request body.
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'mujhenahimaloom@1234567', resave: true, saveUninitialized: true }));

app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, otp } = req.body;

  // Check if the username and OTP were provided
  if (!username || !otp) {
    return res.status(400).send('Please provide a username and OTP.');
  }

  // Retrieve the previously stored OTP from the session
  const userOTP = req.session.userOTP;

  // Check if the provided OTP is valid
  if (verifyOTP(userOTP, otp)) {
    // If the OTP is valid, log the user in
    req.session.userId = username;
    res.redirect('/home');
  } else {
    res.status(401).send('Invalid OTP.');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if all fields were provided
  if (!username || !email || !password) {
    return res.status(400).send('Please provide a username, email, and password.');
  }

  // Generate a new OTP and send it to the user's email
  const userOTP = await sendOTP(email);

  // Store the generated OTP in the session
  req.session.userOTP = userOTP;
  req.session.save();

  // Render a page where the user can enter the received OTP
  res.render('verifyOTP', { username, email });
});

app.post('/verify', (req, res) => {
  const { username, email, otp } = req.body;
  const userOTP = req.session.userOTP; // Retrieve the OTP from the session

  // Check if the provided OTP is valid
  if (verifyOTP(userOTP, otp)) {
    // If the OTP is valid, log the user in
    req.session.userId = username;
    res.redirect('/home');
  } else {
    res.status(401).send('Invalid OTP.');
  }
});

app.get('/home', (req, res) => {
  if (req.session.userId) {
    res.render('home', { username: req.session.userId });
  } else {
    res.redirect('/login');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000.');
});