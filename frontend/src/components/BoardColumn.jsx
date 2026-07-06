import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";

export default function BoardColumn({ list, cards, onOpenCard, onAddCard, onRenameList, onDeleteList }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);

  function submitAdd(e) {
    e.preventDefault();
    if (!title.trim()) return setAdding(false);
    onAddCard(list._id, title.trim());
    setTitle("");
  }

  function submitRename() {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== list.title) onRenameList(list._id, titleDraft.trim());
  }

  return (
    <div className="w-72 flex-shrink-0 bg-panel/60 rounded-xl p-2.5 flex flex-col max-h-full">
      <div className="flex items-center justify-between px-1.5 py-1 mb-1 group">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === "Enter" && submitRename()}
            className="bg-surface text-sm font-semibold rounded px-1 py-0.5 outline-none border border-accent w-full mr-2"
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold font-display cursor-text flex items-center gap-2"
          >
            {list.title}
            <span className="text-mist text-xs font-normal">{cards.length}</span>
          </h3>
        )}
        <button
          onClick={() => onDeleteList(list._id)}
          className="text-mist hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs"
          title="Delete list"
        >
          ✕
        </button>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-0.5 py-1 rounded-lg transition min-h-[8px] ${
              snapshot.isDraggingOver ? "bg-accent/5" : ""
            }`}
          >
            {cards.map((card, idx) => (
              <CardItem key={card._id} card={card} index={idx} onOpen={onOpenCard} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {adding ? (
        <form onSubmit={submitAdd} className="mt-1 px-0.5">
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitAdd(e);
              }
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Card title…"
            rows={2}
            className="w-full bg-surface border border-accent rounded-lg px-2 py-1.5 text-sm outline-none resize-none"
          />
          <div className="flex gap-2 mt-1.5">
            <button type="submit" className="bg-accent text-xs rounded-md px-3 py-1.5 font-medium">
              Add card
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-mist text-xs px-2">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-mist hover:text-white hover:bg-white/5 transition text-sm text-left px-2 py-1.5 rounded-lg mt-0.5"
        >
          + Add a card
        </button>
      )}
    </div>
  );
}
