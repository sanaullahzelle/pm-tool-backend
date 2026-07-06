const express = require("express");
const mongoose = require("mongoose");
const Card = require("../models/Card");
const List = require("../models/List");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/analytics/:boardId
// Returns everything the dashboard needs in one call:
//  - cardsPerList: for a bar chart of workload per column
//  - priorityBreakdown: for a pie chart
//  - completionOverTime: cards completed per day, last 14 days (line chart)
//  - assigneeWorkload: cards assigned per team member (bar chart)
router.get("/:boardId", async (req, res) => {
  const boardId = new mongoose.Types.ObjectId(req.params.boardId);

  const [cardsPerList, priorityBreakdown, assigneeWorkload, totalCards, completedCards] = await Promise.all([
    Card.aggregate([
      { $match: { board: boardId } },
      { $group: { _id: "$list", count: { $sum: 1 } } },
      { $lookup: { from: "lists", localField: "_id", foreignField: "_id", as: "list" } },
      { $unwind: "$list" },
      { $project: { _id: 0, listId: "$_id", listTitle: "$list.title", count: 1 } },
      { $sort: { "list.position": 1 } },
    ]),
    Card.aggregate([
      { $match: { board: boardId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { _id: 0, priority: "$_id", count: 1 } },
    ]),
    Card.aggregate([
      { $match: { board: boardId } },
      { $unwind: { path: "$assignees", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$assignees", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, userId: "$_id", name: "$user.name", color: "$user.avatarColor", count: 1 } },
    ]),
    Card.countDocuments({ board: boardId }),
    Card.countDocuments({ board: boardId, completed: true }),
  ]);

  // completions over the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const completionOverTime = await ActivityLog.aggregate([
    {
      $match: {
        board: boardId,
        action: "toggled_complete",
        createdAt: { $gte: fourteenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, date: "$_id", count: 1 } },
    { $sort: { date: 1 } },
  ]);

  res.json({
    cardsPerList,
    priorityBreakdown,
    assigneeWorkload,
    completionOverTime,
    summary: {
      totalCards,
      completedCards,
      completionRate: totalCards ? Math.round((completedCards / totalCards) * 100) : 0,
    },
  });
});

module.exports = router;
