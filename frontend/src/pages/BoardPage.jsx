import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import Navbar from "../components/Navbar";
import BoardColumn from "../components/BoardColumn";
import CardModal from "../components/CardModal";
import ActivityFeed from "../components/ActivityFeed";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import PresenceAvatars from "../components/PresenceAvatars";
import { useBoardData } from "../hooks/useBoardData";
import { useBoardMutations } from "../hooks/useBoardMutations";
import { usePresence } from "../hooks/usePresence";

export default function BoardPage() {
  const { boardId } = useParams();
  const { data, isLoading } = useBoardData(boardId);
  const mutations = useBoardMutations(boardId);
  const presence = usePresence(boardId);

  const [activeCard, setActiveCard] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const cardsByList = useMemo(() => {
    const map = {};
    if (!data) return map;
    for (const list of data.lists) map[list._id] = [];
    for (const card of data.cards) {
      if (!map[card.list]) map[card.list] = [];
      map[card.list].push(card);
    }
    // keep stable order by position
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [data]);

  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    mutations.moveCard.mutate({
      cardId: draggableId,
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      destIndex: destination.index,
    });
  }

  function handleAddList(e) {
    e.preventDefault();
    if (!newListTitle.trim()) return setAddingList(false);
    mutations.createList.mutate(newListTitle.trim());
    setNewListTitle("");
    setAddingList(false);
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-mist text-sm">Loading board…</div>
      </div>
    );
  }

  const sortedLists = [...data.lists].sort((a, b) => a.position - b.position);

  return (
    <div className="h-screen bg-ink flex flex-col font-body">
      <Navbar />

      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-lg">{data.board.title}</h1>
          {data.board.description && <p className="text-mist text-xs mt-0.5">{data.board.description}</p>}
        </div>
        <div className="flex items-center gap-4">
          <PresenceAvatars members={presence} />
          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-white/5 hover:bg-white/10 transition text-xs font-medium rounded-lg px-3 py-1.5"
          >
            📊 Analytics
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-5 py-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full">
            {sortedLists.map((list) => (
              <BoardColumn
                key={list._id}
                list={list}
                cards={cardsByList[list._id] || []}
                onOpenCard={setActiveCard}
                onAddCard={(listId, title) => mutations.createCard.mutate({ listId, title })}
                onRenameList={(id, title) => mutations.updateList?.mutate?.({ id, title })}
                onDeleteList={(id) => mutations.deleteList.mutate(id)}
              />
            ))}

            <div className="w-64 flex-shrink-0">
              {addingList ? (
                <form onSubmit={handleAddList} className="bg-panel/60 rounded-xl p-2.5">
                  <input
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onBlur={() => !newListTitle && setAddingList(false)}
                    placeholder="List name…"
                    className="w-full bg-surface border border-accent rounded-lg px-2 py-1.5 text-sm outline-none"
                  />
                  <button type="submit" className="mt-2 bg-accent text-xs rounded-md px-3 py-1.5 font-medium">
                    Add list
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="w-full text-mist hover:text-white hover:bg-white/5 transition text-sm text-left px-3 py-2.5 rounded-xl border border-dashed border-white/10"
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      <ActivityFeedDock boardId={boardId} />

      {activeCard && (
        <CardModal
          card={data.cards.find((c) => c._id === activeCard._id) || activeCard}
          boardId={boardId}
          members={data.board.members}
          onClose={() => setActiveCard(null)}
        />
      )}

      {showAnalytics && <AnalyticsDashboard boardId={boardId} onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}

/**
 * The activity feed is rendered as a slide-over docked panel rather than
 * always taking up horizontal space, so boards with many lists still have
 * room to breathe. Toggle it from the small tab on the right edge.
 */
function ActivityFeedDock({ boardId }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="fixed top-14 right-0 bottom-0 flex">
      <button
        onClick={() => setOpen((o) => !o)}
        className="self-start mt-3 -translate-x-full bg-panel border border-white/10 border-r-0 rounded-l-lg px-1.5 py-3 text-mist hover:text-white text-xs"
        title="Toggle activity feed"
      >
        {open ? "›" : "‹"}
      </button>
      {open && <ActivityFeed boardId={boardId} />}
    </div>
  );
}
