import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export function usePresence(boardId) {
  const { socket } = useSocket();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!socket || !boardId) return;
    const onPresence = (list) => setMembers(list);
    socket.on("board:presence", onPresence);
    return () => socket.off("board:presence", onPresence);
  }, [socket, boardId]);

  return members;
}
