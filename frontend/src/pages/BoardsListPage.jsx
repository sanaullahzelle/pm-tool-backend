import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useBoards } from "../hooks/useBoards";

export default function BoardsListPage() {
  const { data, isLoading, createBoard } = useBoards();
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await createBoard.mutateAsync({ title, description: "" });
    setTitle("");
    setShowForm(false);
    navigate(`/boards/${res.board._id}`);
  }

  return (
    <div className="min-h-screen bg-ink font-body flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Your boards</h1>
            <p className="text-mist text-sm mt-1">Pick a board to jump into the live workspace.</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-accent hover:bg-accent/90 transition text-sm font-medium rounded-lg px-4 py-2"
          >
            + New board
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="flex gap-2 mb-8">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Board title, e.g. Website Redesign"
              className="flex-1 bg-panel border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" className="bg-accent2 hover:bg-accent2/90 transition rounded-lg px-4 py-2 text-sm font-medium">
              Create
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-mist text-sm">Loading boards…</p>
        ) : data?.boards?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.boards.map((b) => (
              <button
                key={b._id}
                onClick={() => navigate(`/boards/${b._id}`)}
                className="text-left bg-panel hover:bg-panel/70 border border-white/5 rounded-xl p-4 transition shadow-card"
              >
                <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-accent to-accent2 mb-3" />
                <h3 className="font-display font-semibold">{b.title}</h3>
                <p className="text-mist text-xs mt-1 line-clamp-2">{b.description || "No description yet"}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-mist text-sm border border-dashed border-white/10 rounded-xl p-10 text-center">
            No boards yet — create your first one to start collaborating in real time.
          </div>
        )}
      </main>
    </div>
  );
}
