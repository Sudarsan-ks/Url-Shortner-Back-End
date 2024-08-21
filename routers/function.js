
const Url = require("../models/urlModel");

const getDailyCount = async () => {
  try {
    const dailyCount = await Url.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    return dailyCount;
  } catch (err) {
    console.error("Error while calculating daily count", err);
    throw err;
  }
};

const getMonthlyCount = async () => {
  try {
    const monthlyCount = await Url.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    return monthlyCount;
  } catch (err) {
    console.error("Error while calculating monthly count", err);
    throw err;
  }
};

module.exports = { getDailyCount, getMonthlyCount };
