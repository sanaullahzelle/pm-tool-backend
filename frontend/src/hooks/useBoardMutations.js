import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";

export function useBoardMutations(boardId) {
  const queryClient = useQueryClient();
  const queryKey = ["board", boardId];

  const patch = (fn) => queryClient.setQueryData(queryKey, (old) => (old ? fn(old) : old));

  const createList = useMutation({
    mutationFn: (title) => api.createList({ boardId, title }),
  });

  const createCard = useMutation({
    mutationFn: ({ listId, title }) => api.createCard({ boardId, listId, title }),
  });

  const updateList = useMutation({
    mutationFn: ({ id, title }) => api.renameList(id, title),
  });

  const updateCard = useMutation({
    mutationFn: ({ cardId, updates }) => api.updateCard(cardId, updates),
  });

  const deleteCard = useMutation({
    mutationFn: (cardId) => api.deleteCard(cardId),
  });

  const deleteList = useMutation({
    mutationFn: (listId) => api.deleteList(listId),
  });

  const assignCard = useMutation({
    mutationFn: ({ cardId, userId }) => api.assignCard(cardId, userId),
  });

  /**
   * Drag-and-drop move. We optimistically patch the cache the instant the
   * drag ends so the UI feels instantaneous, then fire the REST call.
   * If it fails, we roll back to the previous snapshot.
   */
  const moveCard = useMutation({
    mutationFn: ({ cardId, sourceListId, destListId, destIndex }) =>
      api.moveCard(cardId, { sourceListId, destListId, destIndex }),
    onMutate: async ({ cardId, destListId }) => {
      const previous = queryClient.getQueryData(queryKey);
      patch((old) => ({
        ...old,
        cards: old.cards.map((c) => (c._id === cardId ? { ...c, list: destListId } : c)),
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return { createList, createCard, updateList, updateCard, deleteCard, deleteList, assignCard, moveCard };
}
