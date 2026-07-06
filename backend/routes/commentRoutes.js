const express = require("express");
const Comment = require("../models/Comment");
const Card = require("../models/Card");
const auth = require("../middleware/auth");
const { emitToBoard } = require("../sockets");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// GET /api/comments/card/:cardId
router.get("/card/:cardId", async (req, res) => {
  const comments = await Comment.find({ card: req.params.cardId })
    .populate("author", "name avatarColor")
    .sort({ createdAt: 1 });
  res.json({ comments });
});

// POST /api/comments  { cardId, text }
router.post("/", async (req, res) => {
  const { cardId, text } = req.body;
  const card = await Card.findById(cardId);
  if (!card) return res.status(404).json({ message: "Card not found" });

  const comment = await Comment.create({ card: cardId, author: req.userId, text });
  const populated = await comment.populate("author", "name avatarColor");

  const io = req.app.get("io");
  emitToBoard(io, card.board.toString(), "comment:created", populated);
  await logActivity(io, card.board, req.userId, "commented", { cardId }, `commented on "${card.title}"`);

  res.status(201).json({ comment: populated });
});

module.exports = router;
