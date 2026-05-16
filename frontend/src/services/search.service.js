import api from "./api";

export const searchService = {
  search: (q, type = "all") => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`),
  getTrending: () => api.get("/search/trending"),
};
