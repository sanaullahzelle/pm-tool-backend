import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { useSocket } from "../context/SocketContext";

export function useComments(cardId) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const queryKey = ["comments", cardId];

  const query = useQuery({
    queryKey,
    queryFn: () => api.fetchComments(cardId),
    enabled: !!cardId,
  });

  useEffect(() => {
    if (!socket || !cardId) return;
    const onComment = (comment) => {
      if (comment.card !== cardId) return;
      queryClient.setQueryData(queryKey, (old) => (old ? { comments: [...old.comments, comment] } : old));
    };
    socket.on("comment:created", onComment);
    return () => socket.off("comment:created", onComment);
  }, [socket, cardId, queryClient]);

  const addComment = useMutation({
    mutationFn: (text) => api.postComment({ cardId, text }),
    // no manual cache update needed on success — the socket "comment:created"
    // event (broadcast to the whole board, including the sender) handles it,
    // which is exactly what keeps every open tab consistent.
  });

  return { ...query, addComment };
}
