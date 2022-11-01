const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validation/userValidation");
const { createToken } = require("../helpers/userHelper");
const { UserVerificationModel } = require("../models/userVerificationModel");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { config } = require("../config/secret.js");
const { result } = require("lodash");


let transporter = nodemailer.createTransport({

  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: config.authEmail,
    pass: config.authPass
  }
})

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
    console.log(config.authEmail);
    console.log(config.authPass);
  } else {
    console.log("ready for messages");
    console.log("success");

  }

})

const sendVerificationEmail = ({ _id, _email }, res) => {
  const currentUrl = "http://localhost:3000/"
  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: config.authEmail,
    to: _email,
    subject: "Verify Your Email",
    html: `<p>Verify Your Email </p><p> click <a href=${currentUrl + "users/verify" + _id + "/" + uniqueString}> here</a> </p>`
  };
  const salRounds = 10;
  bcrypt
    .hash(uniqueString, salRounds)
    .then((hasheduniqueString) => {
      const UserVerification = new UserVerificationModel({
        userId: _id,
        uniqueString: hasheduniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      UserVerification
        .save()
        .then(() => { 
          transporter
          .sendMail(mailOptions)
          .then(() => { 
            res.json({
              status: "pending",
              message: "verification email sent",
            });
          })
          .catch((error) => {
            console.log(error)
            res.json({
              status: "failed",
              message: "verification email failed",
            });
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            status: "failed",
            message: "an error  cant save",
          });
        })

    })
      .catch(() => {
        res.json({
          status: "failed",
          message: "an error occurre",
        });
      })
};

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
      await sendVerificationEmail(result, res);
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
