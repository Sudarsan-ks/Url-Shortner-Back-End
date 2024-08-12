const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, ready) => {
  if (error) {
    console.error("Email server not working", error);
  } else {
    console.log("Email server is ready to MAIL", ready);
  }
});

module.exports = transporter;
