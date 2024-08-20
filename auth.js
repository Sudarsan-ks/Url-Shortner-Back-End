const jwt = require("jsonwebtoken");
const User = require("./models/userModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(404).json({ message: "Access Denied" });
    }

    const checkMatching = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: checkMatching.id });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Token expired or Invaild" });
  }
};

module.exports = auth;
