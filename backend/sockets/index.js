/**
 * Socket.io real-time layer.
 *
 * Room strategy: every connected client joins a room named `board:<boardId>`
 * when it opens a board. All mutations (card moved, card created, comment
 * added, activity logged) are broadcast to that room only, so users looking
 * at a different board never receive irrelevant traffic.
 *
 * Presence: we keep an in-memory map of boardId -> Set of {socketId, user}
 * so we can tell everyone in a board who else is currently viewing it
 * (shown as little avatars in the UI, similar to Figma/Jira "who's online").
 */

const presenceByBoard = new Map(); // boardId -> Map(socketId -> user)

function getPresenceList(boardId) {
  const map = presenceByBoard.get(boardId);
  if (!map) return [];
  return Array.from(map.values());
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    // --- Join / leave a board room ---------------------------------
    socket.on("board:join", ({ boardId, user }) => {
      socket.join(`board:${boardId}`);
      socket.data.boardId = boardId;
      socket.data.user = user;

      if (!presenceByBoard.has(boardId)) presenceByBoard.set(boardId, new Map());
      presenceByBoard.get(boardId).set(socket.id, user);

      io.to(`board:${boardId}`).emit("board:presence", getPresenceList(boardId));
    });

    socket.on("board:leave", ({ boardId }) => {
      socket.leave(`board:${boardId}`);
      presenceByBoard.get(boardId)?.delete(socket.id);
      io.to(`board:${boardId}`).emit("board:presence", getPresenceList(boardId));
    });

    // --- Card / list mutations (broadcast-only relay) ---------------
    // The REST API is the source of truth (writes to MongoDB). After a
    // successful write, the route handler emits one of these events to
    // the board room. We also allow direct client->client relay for
    // low-latency UI feedback (e.g. drag-in-progress ghost position)
    // that does NOT need to be persisted.

    socket.on("card:dragging", ({ boardId, cardId, sourceListId, hoverListId, user }) => {
      // Ephemeral, not persisted — just lets other clients see a "being moved" indicator
      socket.to(`board:${boardId}`).emit("card:dragging", { cardId, sourceListId, hoverListId, user });
    });

    socket.on("typing:start", ({ boardId, cardId, user }) => {
      socket.to(`board:${boardId}`).emit("typing:start", { cardId, user });
    });

    socket.on("typing:stop", ({ boardId, cardId, user }) => {
      socket.to(`board:${boardId}`).emit("typing:stop", { cardId, user });
    });

    socket.on("disconnect", () => {
      const boardId = socket.data.boardId;
      if (boardId && presenceByBoard.has(boardId)) {
        presenceByBoard.get(boardId).delete(socket.id);
        io.to(`board:${boardId}`).emit("board:presence", getPresenceList(boardId));
      }
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

/**
 * Helper used by REST route handlers to broadcast a persisted change
 * to everyone viewing that board.
 *
 * @param {import('socket.io').Server} io
 * @param {string} boardId
 * @param {string} event  e.g. "card:created", "card:moved", "card:updated",
 *                         "card:deleted", "list:created", "list:moved",
 *                         "comment:created", "activity:created"
 * @param {object} payload
 */
function emitToBoard(io, boardId, event, payload) {
  io.to(`board:${boardId}`).emit(event, payload);
}

module.exports = { registerSocketHandlers, emitToBoard };
