export default function PresenceAvatars({ members }) {
  if (!members?.length) return null;

  // de-dupe by user id (same user could have multiple socket connections)
  const unique = Object.values(
    members.reduce((acc, m) => {
      acc[m.id] = m;
      return acc;
    }, {})
  );

  return (
    <div className="flex items-center -space-x-2">
      {unique.slice(0, 5).map((m) => (
        <div
          key={m.id}
          title={`${m.name} is viewing this board`}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-panel"
          style={{ background: m.avatarColor }}
        >
          {m.name?.charAt(0).toUpperCase()}
        </div>
      ))}
      {unique.length > 5 && (
        <div className="w-7 h-7 rounded-full bg-surface border-2 border-panel flex items-center justify-center text-[10px] text-mist">
          +{unique.length - 5}
        </div>
      )}
    </div>
  );
}
