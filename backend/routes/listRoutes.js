const express = require("express");
const List = require("../models/List");
const Board = require("../models/Board");
const Card = require("../models/Card");
const auth = require("../middleware/auth");
const { emitToBoard } = require("../sockets");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// POST /api/lists  { boardId, title }
router.post("/", async (req, res) => {
  const { boardId, title } = req.body;
  const count = await List.countDocuments({ board: boardId });
  const list = await List.create({ title, board: boardId, position: count, cardOrder: [] });

  await Board.findByIdAndUpdate(boardId, { $push: { listOrder: list._id } });

  const io = req.app.get("io");
  emitToBoard(io, boardId, "list:created", list);
  await logActivity(io, boardId, req.userId, "created_list", { listId: list._id }, `created the list "${title}"`);

  res.status(201).json({ list });
});

// PATCH /api/lists/:id  { title }
router.patch("/:id", async (req, res) => {
  const list = await List.findByIdAndUpdate(req.params.id, { title: req.body.title }, { new: true });
  const io = req.app.get("io");
  emitToBoard(io, list.board.toString(), "list:updated", list);
  res.json({ list });
});

// PATCH /api/lists/reorder  { boardId, listOrder: [id,id,...] }
router.patch("/reorder/all", async (req, res) => {
  const { boardId, listOrder } = req.body;
  await Board.findByIdAndUpdate(boardId, { listOrder });
  await Promise.all(listOrder.map((id, idx) => List.findByIdAndUpdate(id, { position: idx })));

  const io = req.app.get("io");
  emitToBoard(io, boardId, "list:reordered", { listOrder });
  res.json({ ok: true });
});

// DELETE /api/lists/:id
router.delete("/:id", async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) return res.status(404).json({ message: "List not found" });

  await Card.deleteMany({ list: list._id });
  await List.deleteOne({ _id: list._id });
  await Board.findByIdAndUpdate(list.board, { $pull: { listOrder: list._id } });

  const io = req.app.get("io");
  emitToBoard(io, list.board.toString(), "list:deleted", { listId: list._id });
  await logActivity(io, list.board, req.userId, "deleted_list", { listId: list._id }, `deleted the list "${list.title}"`);

  res.json({ ok: true });
});

module.exports = router;
