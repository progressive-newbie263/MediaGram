import api from "./api";

export const postService = {
  createPost: (data) => api.post("/posts", data),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}&limit=10`),
  getExplore: (page = 1) => api.get(`/posts/explore?page=${page}&limit=10`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  toggleLike: (postId) => api.post(`/likes/${postId}`),
  getComments: (postId, page = 1) => api.get(`/comments/${postId}?page=${page}`),
  createComment: (postId, data) => api.post(`/comments/${postId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};
