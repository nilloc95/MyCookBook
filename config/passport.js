const GoogleStrategy = require("passport-google-oauth20")
const mongoose = require("mongoose")
const User = require('../models/User')

// SRC: http://www.passportjs.org/packages/passport-google-oauth20/
// Connects to my Google Auth account with credentials in my config file
// Creates a new user based on my User model in mongo and the items google returns to us
// Tries to find a user with the google ID. If it does, they get logged in and their session stored
// If it doesn't find someone with that id, a new user will be created
// Uses a serializer/deserializer to store and retrieve the user's id as a cookie

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }

        try {
            let user = await User.findOne({ googleId: profile.id})

            if(user) {
                done(null, user)
            } else {
                user = await User.create(newUser)
                done(null, user)
            }

        } catch(err) {
            console.error(err)
        }

    }))
    passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))});
}