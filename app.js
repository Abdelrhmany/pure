

// Import required modules
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const session = require("express-session");
const itemRoutes = require('./routes/items');

dotenv.config();
 
const app = express();
const port = 3000 || process.env.Port;
app.use(cors()); // تفعيل CORS لجميع الطلبات


// Define User model
const User = mongoose.model("User", new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
}));

// Initialize Passport and session handling
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth Strategy setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,  // Use your Google Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // Use your Google Client Secret
  callbackURL: "http://localhost:3000/auth/google/callback",  // Set correct callback URL
  scope: ['profile', 'email'],  // Request the profile and email information
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      const password = req.body.password;  // Get the password from the UI (must be sent from the form)
      const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password before saving

      // Create new user if they don't exist
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        password: hashedPassword,  // Store hashed password
      });

      await user.save();
    }

    return done(null, user);  // Pass the user to the next stage
  } catch (err) {
    return done(err, null);
  }
}));

// Middleware for checking authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// Body parsers for handling form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session handling for Passport
app.use(session({
  secret: 'your-session-secret',  // Make sure to use a secure session secret
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            background: #ffffff;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        a {
            display: inline-block;
            background-color: #4285F4;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        a:hover {
            background-color: #357ae8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <a href="/auth/google">Login withh Google</a>
    </div>
</body>
</html>
`);
});

// Google OAuth route to initiate authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/profile");
});

// Profile route to display user information
app.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) {
      throw new Error("User not found");
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  text-align: center;
                  background: #ffffff;
                  padding: 20px 30px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333;
                  margin-bottom: 20px;
              }
              a {
                  display: inline-block;
                  background-color: #f44336;
                  color: white;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  font-size: 16px;
                  font-weight: bold;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #d32f2f;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Hello, ${user.displayName} (${user.email})</h1>
              <a href="/logout">Logout</a>
          </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error fetching user details.");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.redirect("/");
  });
});

// Users route to view all registered users
app.get("/users", ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from database
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>All Users</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  text-align: center;
                  background: #ffffff;
                  padding: 20px 30px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  width: 100%;
                  overflow-y: auto;
              }
              h1 {
                  color: #333;
                  margin-bottom: 20px;
              }
              ul {
                  list-style: none;
                  padding: 0;
              }
              li {
                  padding: 10px 0;
                  border-bottom: 1px solid #ddd;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>All Registered Users</h1>
              <ul>
                  ${users.map(user => `<li>${user.displayName} (${user.email})</li>`).join('')}
              </ul>
              <a href="/profile">Back to Profile</a>
          </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Errobr fetching users.");
  }
});
app.use('/items', itemRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newyourdbname')
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => console.log(err));
