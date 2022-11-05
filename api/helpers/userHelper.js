const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

exports.createToken = (_id, role) => {
  let token = jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: "60mins" });
  return token;
}


exports.mailOptions = (_currentUrl, _id,_uniqueString) => {
  const mailOption = {
    from: config.authEmail,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify Your Email </p><p> click <a href=${_currentUrl+"/users/verify/"+_id+"/"+_uniqueString}> here</a> </p>`
  };
  return mailOption;
}
