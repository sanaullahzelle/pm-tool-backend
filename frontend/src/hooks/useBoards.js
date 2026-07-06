import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";

export function useBoards() {
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["boards"], queryFn: api.fetchBoards });

  const createBoard = useMutation({
    mutationFn: api.createBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });

  return { ...query, createBoard };
}
