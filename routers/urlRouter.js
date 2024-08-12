const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/urlModel");
const auth = require("../auth")

const router = express.Router();

router.post("/originalUrl",auth, async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(7);
  const createdBy = req.user._id
  try {
    const url = new Url({ originalUrl, shortUrl,createdBy });
    await url.save();
    res.status(201).json({ message: "Url successfully created" });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Error While creating shortUrl" });
  }
});

router.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ message: "Url not found" });
    }
    url.clicks += 1;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Error While creating shortUrl" });
  }
});

module.exports = router;
