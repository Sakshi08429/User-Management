const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));



app.use('/', require('./routes/authRoute'));
app.use('/users', require('./routes/userRoute'));
app.use('/roles', require('./routes/roleRoute'));
app.use('/dashboard', require('./routes/dashboardRoute'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
