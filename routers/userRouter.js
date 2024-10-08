const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../email");
const User = require("../models/userModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 8);
    const existUser = await User.findOne({ email: email });
    if (existUser) {
      return res.status(404).json({ message: "This user already exist" });
    }
    const confirmationToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    const newUser = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      confirmationToken,
    });
    await newUser.save();

    const activateUrl = `${process.env.CLIENT_URL_NETLIFY}/activate/${confirmationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Acctivation",
      html: `<p>Click <a href="${activateUrl}">here</a> to Activate you account </p>`,
    });
    res.status(201).json({ message: "Registered successfully", newUser });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error while Registering", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(404).json({ message: "Account not activated" });
    }
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(404).json({ message: "Invalid Credential" });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "Login Successfully", user, token });
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetLink = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    user.confirmationToken = resetLink;
    await user.save();
    const link = `${process.env.CLIENT_URL_NETLIFY}/resetPassword/${resetLink}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>click<a href="${link}">here</a> to reset the password</p>`,
    });
    res.status(200).json({ message: "We have send an email to reset" });
  } catch (err) {
    res.status(404).json({
      message: "Error while sending the forgot mail",
      error: err.message,
    });
  }
});

router.post("/resetPassword/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const matching = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(matching.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    user.confirmationToken = undefined;
    await user.save();
    res.status(200).json({ message: "Password reseted successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.status(404).json({
      message: "Error while sending the forgot mail",
      error: err.messager,
    });
  }
});

router.get("/activate/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const checkMatching = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ email: checkMatching.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = true;
    user.confirmationToken = undefined;
    await user.save();
    res.status(201).json({ message: "Account Activated Successfully" });
  } catch (err) {
    res.status(404).json({
      message: "Activation link as Invalid or Expire",
      error: err.message,
    });
  }
});

module.exports = router;
