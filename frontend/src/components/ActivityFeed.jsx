import { formatDistanceToNow } from "date-fns";
import { useActivityFeed } from "../hooks/useActivityFeed";

export default function ActivityFeed({ boardId }) {
  const { data, isLoading } = useActivityFeed(boardId);

  return (
    <div className="w-72 flex-shrink-0 border-l border-white/5 bg-panel/40 flex flex-col">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="font-display text-sm font-semibold flex items-center gap-2">
          <span className="pulse-dot" />
          Live activity
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading && <p className="text-mist text-xs">Loading…</p>}
        {data?.logs?.map((log) => (
          <div key={log._id} className="text-xs card-enter">
            <div className="flex items-start gap-2">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-semibold mt-0.5"
                style={{ background: log.actor?.avatarColor }}
              >
                {log.actor?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-mist leading-snug">{log.message}</p>
                <p className="text-mist/50 text-[10px] mt-0.5">{formatDistanceToNow(new Date(log.createdAt))} ago</p>
              </div>
            </div>
          </div>
        ))}
        {data && data.logs.length === 0 && <p className="text-mist text-xs">No activity yet.</p>}
      </div>
    </div>
  );
}
