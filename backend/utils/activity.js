const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const { emitToBoard } = require("../sockets");

/**
 * Creates an activity log entry, persists it, and broadcasts it in
 * real time to everyone currently viewing the board.
 */
async function logActivity(io, boardId, actorId, action, meta, messageSuffix) {
  const actor = await User.findById(actorId);
  const message = `${actor ? actor.name : "Someone"} ${messageSuffix}`;

  const log = await ActivityLog.create({
    board: boardId,
    actor: actorId,
    action,
    meta,
    message,
  });

  const populated = await log.populate("actor", "name avatarColor");

  if (io) emitToBoard(io, boardId, "activity:created", populated);
  return populated;
}

module.exports = { logActivity };
