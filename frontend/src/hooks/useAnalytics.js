import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { useSocket } from "../context/SocketContext";

export function useAnalytics(boardId) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const queryKey = ["analytics", boardId];

  const query = useQuery({
    queryKey,
    queryFn: () => api.fetchAnalytics(boardId),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (!socket || !boardId) return;
    // Any board mutation invalidates the analytics snapshot so the charts
    // stay live without the user refreshing the page.
    const invalidate = () => queryClient.invalidateQueries({ queryKey });
    const events = ["card:created", "card:updated", "card:deleted", "card:moved", "list:created", "list:deleted"];
    events.forEach((e) => socket.on(e, invalidate));
    return () => events.forEach((e) => socket.off(e, invalidate));
  }, [socket, boardId, queryClient]);

  return query;
}
