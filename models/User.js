const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
   googleId: {
       type: String,
       required: true
   },
   displayName: {
       type: String,
       required: true
   },
   firstName: {
       type: String,
       required: true
   },
   lastName: {
       type: String,
       required: true
   },
   image: {
       type: String,
   },
   likes: {
       type: Array,
       default: []
   },
   favorites: {
       type: Array,
       default: []
   },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;