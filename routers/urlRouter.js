const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/urlModel");
const auth = require("../auth");

const router = express.Router();

router.post("/originalUrl", auth, async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(11);
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
    res
      .status(404)
      .json({ message: "Error while redirecting", error: err.message });
  }
});

router.get("/get/shortUrl", async (req, res) => {
  try {
    const urls = await Url.find();
    res.status(200).json(urls);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error while getting the urls", error: err.message });
  }
});

router.get("/daily", async (req, res) => {
  try {
    const dailyCount = await Url.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    res
      .status(404)
      .json({
        message: "Error while fetching daily count",
        error: err.message,
      });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const monthlyCount = await Url.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    res
      .status(404)
      .json({
        message: "Error while fetching monthly count",
        error: err.message,
      });
  }
});

module.exports = router;
