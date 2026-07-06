import { Draggable } from "@hello-pangea/dnd";

const PRIORITY_STYLES = {
  low: "bg-white/5 text-mist",
  medium: "bg-accent/15 text-accent",
  high: "bg-accent2/15 text-accent2",
  urgent: "bg-red-500/15 text-red-400",
};

export default function CardItem({ card, index, onOpen }) {
  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(card)}
          className={`card-enter bg-surface rounded-lg p-3 mb-2 cursor-pointer border border-white/5 hover:border-white/15 transition ${
            snapshot.isDragging ? "shadow-card rotate-1 ring-1 ring-accent/40" : ""
          } ${card.completed ? "opacity-50" : ""}`}
        >
          <p className={`text-sm font-medium leading-snug ${card.completed ? "line-through" : ""}`}>{card.title}</p>

          <div className="flex items-center justify-between mt-2.5">
            <span className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${PRIORITY_STYLES[card.priority]}`}>
              {card.priority}
            </span>

            {card.assignees?.length > 0 && (
              <div className="flex -space-x-1.5">
                {card.assignees.slice(0, 3).map((a) => (
                  <div
                    key={a._id}
                    title={a.name}
                    className="w-5 h-5 rounded-full border border-surface flex items-center justify-center text-[9px] font-semibold"
                    style={{ background: a.avatarColor }}
                  >
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
