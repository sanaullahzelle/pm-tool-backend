const express = require("express");
const Card = require("../models/Card");
const List = require("../models/List");
const auth = require("../middleware/auth");
const { emitToBoard } = require("../sockets");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// POST /api/cards  { boardId, listId, title }
router.post("/", async (req, res) => {
  const { boardId, listId, title } = req.body;
  const count = await Card.countDocuments({ list: listId });

  const card = await Card.create({
    title,
    board: boardId,
    list: listId,
    position: count,
  });

  await List.findByIdAndUpdate(listId, { $push: { cardOrder: card._id } });

  const io = req.app.get("io");
  emitToBoard(io, boardId, "card:created", card);
  await logActivity(io, boardId, req.userId, "created_card", { cardId: card._id }, `created the card "${title}"`);

  res.status(201).json({ card });
});

// GET /api/cards/:id  (full detail incl. comments happens in commentRoutes)
router.get("/:id", async (req, res) => {
  const card = await Card.findById(req.params.id).populate("assignees", "name email avatarColor");
  if (!card) return res.status(404).json({ message: "Card not found" });
  res.json({ card });
});

// PATCH /api/cards/:id  - update fields (title, description, priority, dueDate, completed, labels)
router.patch("/:id", async (req, res) => {
  const allowed = ["title", "description", "priority", "dueDate", "completed", "labels"];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const card = await Card.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(
    "assignees",
    "name email avatarColor"
  );
  if (!card) return res.status(404).json({ message: "Card not found" });

  const io = req.app.get("io");
  emitToBoard(io, card.board.toString(), "card:updated", card);

  if ("completed" in updates) {
    await logActivity(
      io,
      card.board,
      req.userId,
      "toggled_complete",
      { cardId: card._id },
      `marked "${card.title}" as ${card.completed ? "complete" : "incomplete"}`
    );
  }

  res.json({ card });
});

// POST /api/cards/:id/assign  { userId }
router.post("/:id/assign", async (req, res) => {
  const { userId } = req.body;
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ message: "Card not found" });

  const already = card.assignees.some((a) => a.toString() === userId);
  if (already) {
    card.assignees = card.assignees.filter((a) => a.toString() !== userId);
  } else {
    card.assignees.push(userId);
  }
  await card.save();
  const populated = await card.populate("assignees", "name email avatarColor");

  const io = req.app.get("io");
  emitToBoard(io, card.board.toString(), "card:updated", populated);
  await logActivity(
    io,
    card.board,
    req.userId,
    "assigned_card",
    { cardId: card._id, userId },
    `updated assignees on "${card.title}"`
  );

  res.json({ card: populated });
});

/**
 * PATCH /api/cards/:id/move
 * The core drag-and-drop endpoint. Moves a card to a (possibly new)
 * list at a specific index, and re-numbers `position` for every card
 * in both the source and destination list so ordering stays consistent.
 *
 * body: { sourceListId, destListId, destIndex }
 */
router.patch("/:id/move", async (req, res) => {
  const { sourceListId, destListId, destIndex } = req.body;
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ message: "Card not found" });

  const sourceList = await List.findById(sourceListId);
  const destList = await List.findById(destListId);
  if (!sourceList || !destList) return res.status(404).json({ message: "List not found" });

  // remove from source order
  sourceList.cardOrder = sourceList.cardOrder.filter((id) => id.toString() !== card._id.toString());

  // insert into dest order at destIndex
  const destOrder = sourceListId === destListId ? sourceList.cardOrder : destList.cardOrder;
  destOrder.splice(destIndex, 0, card._id);

  card.list = destListId;
  await card.save();
  await sourceList.save();
  if (sourceListId !== destListId) await destList.save();

  // re-number positions so `position` field always matches cardOrder index
  const listsToRenumber = sourceListId === destListId ? [sourceList] : [sourceList, destList];
  for (const list of listsToRenumber) {
    await Promise.all(list.cardOrder.map((cid, idx) => Card.findByIdAndUpdate(cid, { position: idx })));
  }

  const io = req.app.get("io");
  emitToBoard(io, card.board.toString(), "card:moved", {
    cardId: card._id,
    sourceListId,
    destListId,
    destIndex,
  });

  if (sourceListId !== destListId) {
    await logActivity(
      io,
      card.board,
      req.userId,
      "moved_card",
      { cardId: card._id, from: sourceListId, to: destListId },
      `moved "${card.title}" from "${sourceList.title}" to "${destList.title}"`
    );
  }

  res.json({ ok: true });
});

// DELETE /api/cards/:id
router.delete("/:id", async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ message: "Card not found" });

  await List.findByIdAndUpdate(card.list, { $pull: { cardOrder: card._id } });
  await Card.deleteOne({ _id: card._id });

  const io = req.app.get("io");
  emitToBoard(io, card.board.toString(), "card:deleted", { cardId: card._id, listId: card.list });
  await logActivity(io, card.board, req.userId, "deleted_card", { cardId: card._id }, `deleted the card "${card.title}"`);

  res.json({ ok: true });
});

module.exports = router;
