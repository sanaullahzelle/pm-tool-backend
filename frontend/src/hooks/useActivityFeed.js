import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { useSocket } from "../context/SocketContext";

export function useActivityFeed(boardId) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const queryKey = ["activity", boardId];

  const query = useQuery({
    queryKey,
    queryFn: () => api.fetchActivity(boardId),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (!socket || !boardId) return;
    const onActivity = (log) =>
      queryClient.setQueryData(queryKey, (old) => (old ? { logs: [log, ...old.logs] } : old));
    socket.on("activity:created", onActivity);
    return () => socket.off("activity:created", onActivity);
  }, [socket, boardId, queryClient]);

  return query;
}
