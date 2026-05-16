import api from "./api";

export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put("/users/me/profile", data),
  updateAvatar: (image) => api.put("/users/me/avatar", { image }),
  updateCover: (image) => api.put("/users/me/cover", { image }),
  getUserPosts: (username, page = 1) => api.get(`/users/${username}/posts?page=${page}&limit=12`),
  getFollowers: (username) => api.get(`/users/${username}/followers`),
  getFollowing: (username) => api.get(`/users/${username}/following`),
  getSuggested: () => api.get("/users/suggested"),
  toggleFollow: (userId) => api.post(`/follows/${userId}`),
};
