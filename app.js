const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const routeBlog = require('./routes/blog')

// Middleware - Body Parser
// ====================================
app.use(bodyParser.json());

// Middleware - Disk storage via Multer
// ====================================
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
}

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// Middleware - Public images folder
// ====================================
app.use('/images', express.static(path.join(__dirname, 'images')));

// Access Headers (Prevent CORS Errors)
// ====================================/
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

// Routes
// ====================================
app.use('/blog', routeBlog);

// General error handler
// ====================================
app.use((error, req, res, next) => {
  console.log('General error handler', error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
})

// Connect to DB and run server
// ====================================
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DATABASE}?retryWrites=true&w=majority`,
{ useUnifiedTopology: true, useNewUrlParser: true })
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));