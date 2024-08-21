const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/urlModel");
const auth = require("../auth");
const { getDailyCount, getMonthlyCount } = require("./function");

const router = express.Router();

router.post("/originalUrl", auth, async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(7);
  const createdBy = req.user._id;
  try {
    const url = new Url({ originalUrl, shortUrl, createdBy });
    await url.save();
    res.status(201).json({ message: "Url successfully created", shortUrl });
  } catch (err) {
    console.error(err);
    res
      .status(404)
      .json({ message: "Error While creating shortUrl", error: err.message });
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
    res.status(200).json({ originalUrl: url.originalUrl });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Error while redirecting", error: err.message });
  }
});


router.get("/daily", async (req, res) => {
  try {
    const dailyCount = await getDailyCount();
    res.status(201).json(dailyCount);
  } catch (err) {
    res.status(404).json({ message: "Error while fetching daily count",error: err.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const monthlyCount = await getMonthlyCount();
    res.status(201).json(monthlyCount);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Error while fetching monthly count", error: err.message });
  }
});

module.exports = router;
