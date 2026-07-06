import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

/**
 * Loads a board (lists + cards) via React Query, then subscribes to
 * Socket.io events for that board and patches the React Query cache
 * directly whenever a teammate's action arrives — no refetch needed.
 *
 * This is the pattern that makes the UI feel "live": REST is used for
 * the initial load and for issuing mutations; Socket.io is used purely
 * to keep every other open tab in sync with what just happened.
 */
export function useBoardData(boardId) {
  const queryClient = useQueryClient();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const queryKey = ["board", boardId];

  const query = useQuery({
    queryKey,
    queryFn: () => api.fetchBoard(boardId),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (!socket || !boardId || !user) return;

    socket.emit("board:join", { boardId, user: { id: user.id, name: user.name, avatarColor: user.avatarColor } });

    const patch = (fn) => queryClient.setQueryData(queryKey, (old) => (old ? fn(old) : old));

    const onListCreated = (list) => patch((old) => ({ ...old, lists: [...old.lists, list] }));

    const onListUpdated = (list) =>
      patch((old) => ({ ...old, lists: old.lists.map((l) => (l._id === list._id ? list : l)) }));

    const onListDeleted = ({ listId }) =>
      patch((old) => ({
        ...old,
        lists: old.lists.filter((l) => l._id !== listId),
        cards: old.cards.filter((c) => c.list !== listId),
      }));

    const onCardCreated = (card) => patch((old) => ({ ...old, cards: [...old.cards, card] }));

    const onCardUpdated = (card) =>
      patch((old) => ({ ...old, cards: old.cards.map((c) => (c._id === card._id ? card : c)) }));

    const onCardDeleted = ({ cardId }) => patch((old) => ({ ...old, cards: old.cards.filter((c) => c._id !== cardId) }));

    const onCardMoved = ({ cardId, destListId }) =>
      patch((old) => ({
        ...old,
        cards: old.cards.map((c) => (c._id === cardId ? { ...c, list: destListId } : c)),
      }));

    socket.on("list:created", onListCreated);
    socket.on("list:updated", onListUpdated);
    socket.on("list:deleted", onListDeleted);
    socket.on("card:created", onCardCreated);
    socket.on("card:updated", onCardUpdated);
    socket.on("card:deleted", onCardDeleted);
    socket.on("card:moved", onCardMoved);

    return () => {
      socket.emit("board:leave", { boardId });
      socket.off("list:created", onListCreated);
      socket.off("list:updated", onListUpdated);
      socket.off("list:deleted", onListDeleted);
      socket.off("card:created", onCardCreated);
      socket.off("card:updated", onCardUpdated);
      socket.off("card:deleted", onCardDeleted);
      socket.off("card:moved", onCardMoved);
    };
  }, [socket, boardId, user, queryClient]);

  return { ...query, connected };
}
