const mongoose = require("mongoose");

const urlSchema = mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

const Url = mongoose.model("url", urlSchema);
module.exports = Url;
