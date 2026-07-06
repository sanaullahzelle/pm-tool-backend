import { useEffect, useState } from "react";
import { useBoardMutations } from "../hooks/useBoardMutations";
import CommentSection from "./CommentSection";

const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function CardModal({ card, boardId, members, onClose }) {
  const { updateCard, deleteCard, assignCard } = useBoardMutations(boardId);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
  }, [card._id]);

  function saveTitle() {
    if (title.trim() && title !== card.title) {
      updateCard.mutate({ cardId: card._id, updates: { title: title.trim() } });
    }
  }

  function saveDescription() {
    if (description !== (card.description || "")) {
      updateCard.mutate({ cardId: card._id, updates: { description } });
    }
  }

  function setPriority(p) {
    updateCard.mutate({ cardId: card._id, updates: { priority: p } });
  }

  function toggleComplete() {
    updateCard.mutate({ cardId: card._id, updates: { completed: !card.completed } });
  }

  function toggleAssignee(userId) {
    assignCard.mutate({ cardId: card._id, userId });
  }

  function handleDelete() {
    deleteCard.mutate(card._id);
    onClose();
  }

  const assigneeIds = new Set((card.assignees || []).map((a) => a._id));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-panel border border-white/10 rounded-2xl w-full max-w-lg shadow-card max-h-[85vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-white/5 flex items-start justify-between gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
            className="bg-transparent font-display font-semibold text-base outline-none flex-1"
          />
          <button onClick={onClose} className="text-mist hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-mist uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              rows={3}
              placeholder="Add more detail…"
              className="w-full mt-1.5 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-mist uppercase tracking-wide">Priority</label>
            <div className="flex gap-2 mt-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-3 py-1 rounded-full border transition capitalize ${
                    card.priority === p ? "bg-accent border-accent" : "border-white/10 text-mist hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-mist uppercase tracking-wide">Assignees</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {members?.map((m) => (
                <button
                  key={m._id}
                  onClick={() => toggleAssignee(m._id)}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition ${
                    assigneeIds.has(m._id) ? "border-accent bg-accent/10" : "border-white/10 text-mist hover:text-white"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold"
                    style={{ background: m.avatarColor }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleComplete}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                card.completed ? "bg-green-500/20 text-green-400" : "bg-white/5 text-mist hover:text-white"
              }`}
            >
              {card.completed ? "✓ Completed" : "Mark as complete"}
            </button>
            <button onClick={handleDelete} className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">
              Delete card
            </button>
          </div>

          <hr className="border-white/5" />

          <CommentSection cardId={card._id} />
        </div>
      </div>
    </div>
  );
}
