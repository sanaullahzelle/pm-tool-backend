import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({ baseURL: `${API_BASE}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("pm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Auth ----
export const register = (data) => client.post("/auth/register", data).then((r) => r.data);
export const login = (data) => client.post("/auth/login", data).then((r) => r.data);
export const fetchMe = () => client.get("/auth/me").then((r) => r.data);
export const searchUsers = (q) => client.get(`/auth/users?q=${encodeURIComponent(q)}`).then((r) => r.data);

// ---- Boards ----
export const fetchBoards = () => client.get("/boards").then((r) => r.data);
export const createBoard = (data) => client.post("/boards", data).then((r) => r.data);
export const fetchBoard = (id) => client.get(`/boards/${id}`).then((r) => r.data);
export const fetchActivity = (id) => client.get(`/boards/${id}/activity`).then((r) => r.data);
export const addMember = (boardId, userId) => client.post(`/boards/${boardId}/members`, { userId }).then((r) => r.data);

// ---- Lists ----
export const createList = (data) => client.post("/lists", data).then((r) => r.data);
export const renameList = (id, title) => client.patch(`/lists/${id}`, { title }).then((r) => r.data);
export const reorderLists = (boardId, listOrder) =>
  client.patch("/lists/reorder/all", { boardId, listOrder }).then((r) => r.data);
export const deleteList = (id) => client.delete(`/lists/${id}`).then((r) => r.data);

// ---- Cards ----
export const createCard = (data) => client.post("/cards", data).then((r) => r.data);
export const updateCard = (id, data) => client.patch(`/cards/${id}`, data).then((r) => r.data);
export const moveCard = (id, data) => client.patch(`/cards/${id}/move`, data).then((r) => r.data);
export const assignCard = (id, userId) => client.post(`/cards/${id}/assign`, { userId }).then((r) => r.data);
export const deleteCard = (id) => client.delete(`/cards/${id}`).then((r) => r.data);

// ---- Comments ----
export const fetchComments = (cardId) => client.get(`/comments/card/${cardId}`).then((r) => r.data);
export const postComment = (data) => client.post("/comments", data).then((r) => r.data);

// ---- Analytics ----
export const fetchAnalytics = (boardId) => client.get(`/analytics/${boardId}`).then((r) => r.data);

export default client;
