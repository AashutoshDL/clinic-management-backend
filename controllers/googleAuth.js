// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/authModel"); // Replace with your User model
// require("dotenv").config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback", // Update for production
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if the user exists
//         let user = await User.findOne({ googleId: profile.id });
//         if (!user) {
//           // Create a new user
//           user = new User({
//             username: profile.displayName,
//             email: profile.emails[0].value,
//             googleId: profile.id,
//           });
//           await user.save();
//         }
//         done(null, user);
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

// // Serialize user into the session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from the session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });
