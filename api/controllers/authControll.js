const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validation/userValidation");
const { createToken } = require("../helpers/userHelper");
const { UserVerificationModel } = require("../userVerificationModel");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { config } = require("../config/secret")


let transporter = nodemailer.createTransport({
  service:"gmail",
  auth :{
    user:config.authEmail,
    pass:config.authPass
  }
})

transporter.verify((error,success) => { 
  if(error){
    console.log(error);
  }else{
    console.log("ready for messages");
    console.log("success");

  }
  
})

exports.authCtrl = {
  signUp: async (req, res) => {
    let validBody = validUser(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      let user = new UserModel(req.body);
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      user.password = "***";
      res.status(201).json(user);
    }
    catch (err) {
      if (err.code == 11000) {
        return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })
      }
      console.log(err);
      res.status(500).json({ msg: "err", err })
    }
  }
  ,
  login: async (req, res) => {
    let validBody = validLogin(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      let user = await UserModel.findOne({ email: req.body.email })
      if (!user) {
        return res.status(401).json({ msg: "Password or email is worng ,code:1" })
      }
      let authPassword = await bcrypt.compare(req.body.password, user.password);
      if (!authPassword) {
        return res.status(401).json({ msg: "Password or email is worng ,code:2" });
      }
      let token = createToken(user._id, user.role);
      res.json({ token });
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  }
}
