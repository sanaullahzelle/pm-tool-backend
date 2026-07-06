const express = require("express");
const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");
const { emitToBoard } = require("../sockets");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// GET /api/boards - all boards the user owns or is a member of
router.get("/", async (req, res) => {
  const boards = await Board.find({
    $or: [{ owner: req.userId }, { members: req.userId }],
  }).sort({ updatedAt: -1 });
  res.json({ boards });
});

// POST /api/boards
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  const board = await Board.create({
    title,
    description,
    owner: req.userId,
    members: [req.userId],
  });

  // seed default lists like a fresh Trello board
  const defaultTitles = ["Backlog", "In Progress", "Review", "Done"];
  const lists = await List.insertMany(
    defaultTitles.map((t, i) => ({ title: t, board: board._id, position: i, cardOrder: [] }))
  );
  board.listOrder = lists.map((l) => l._id);
  await board.save();

  res.status(201).json({ board, lists });
});

// GET /api/boards/:id - full board with lists + cards populated
router.get("/:id", async (req, res) => {
  const board = await Board.findById(req.params.id).populate("members", "name email avatarColor");
  if (!board) return res.status(404).json({ message: "Board not found" });

  const lists = await List.find({ board: board._id }).sort({ position: 1 });
  const cards = await Card.find({ board: board._id })
    .populate("assignees", "name email avatarColor")
    .sort({ position: 1 });

  res.json({ board, lists, cards });
});

// GET /api/boards/:id/activity
router.get("/:id/activity", async (req, res) => {
  const logs = await ActivityLog.find({ board: req.params.id })
    .populate("actor", "name avatarColor")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ logs });
});

// POST /api/boards/:id/members - invite a member
router.post("/:id/members", async (req, res) => {
  const { userId } = req.body;
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: "Board not found" });

  if (!board.members.includes(userId)) {
    board.members.push(userId);
    await board.save();
  }

  const io = req.app.get("io");
  await logActivity(io, board._id, req.userId, "added_member", { userId }, `added a new member to the board`);

  res.json({ board });
});

module.exports = router;
