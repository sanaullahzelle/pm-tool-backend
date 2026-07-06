import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useComments } from "../hooks/useComments";

export default function CommentSection({ cardId }) {
  const { data, isLoading, addComment } = useComments(cardId);
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate(text.trim());
    setText("");
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-mist uppercase tracking-wide mb-2">Comments</h4>

      <div className="space-y-3 max-h-52 overflow-y-auto mb-3 pr-1">
        {isLoading && <p className="text-mist text-xs">Loading…</p>}
        {data?.comments?.map((c) => (
          <div key={c._id} className="flex gap-2">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold"
              style={{ background: c.author?.avatarColor }}
            >
              {c.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="bg-surface rounded-lg px-3 py-1.5 text-sm flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{c.author?.name}</span>
                <span className="text-mist text-[10px]">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
              </div>
              <p className="text-sm mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
        {data && data.comments.length === 0 && (
          <p className="text-mist text-xs">No comments yet. Start the discussion.</p>
        )}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="bg-accent text-sm px-3 rounded-lg font-medium">
          Send
        </button>
      </form>
    </div>
  );
}
