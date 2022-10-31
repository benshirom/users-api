const mongoose = require("mongoose");

let userVerificationSchema = new mongoose.Schema({
  fullName: String,
  uniqueString: String,
  createdAt: Date,
  expiresAt: Date,
 
})

exports.UserVerificationModel = mongoose.model("usersVerification", userVerificationSchema);
