import { create } from "zustand";
import { postService } from "../services/post.service";
import toast from "react-hot-toast";

const usePostStore = create((set, get) => ({
  feedPosts: [],
  explorePosts: [],
  feedPage: 1,
  exploreHasMore: true,
  feedHasMore: true,
  feedLoading: false,

  // ── Feed ────────────────────────────────────────────────────
  fetchFeed: async (reset = false) => {
    if (reset) set({ feedPage: 1, feedPosts: [] });
    const page = reset ? 1 : get().feedPage;
    set({ feedLoading: true });
    try {
      const res = await postService.getFeed(page);
      const { posts, hasMore } = res.data;
      set((state) => ({
        feedPosts: reset ? posts : [...state.feedPosts, ...posts],
        feedPage: page + 1,
        feedHasMore: hasMore,
      }));
    } catch (err) {
      toast.error("Failed to load feed");
    } finally {
      set({ feedLoading: false });
    }
  },

  fetchExplore: async (reset = false) => {
    const page = reset ? 1 : Math.ceil(get().explorePosts.length / 10) + 1;
    try {
      const res = await postService.getExplore(page);
      const { posts, hasMore } = res.data;
      set((state) => ({
        explorePosts: reset ? posts : [...state.explorePosts, ...posts],
        exploreHasMore: hasMore,
      }));
    } catch (err) {
      toast.error("Failed to load explore");
    }
  },

  // ── Create Post ──────────────────────────────────────────────
  createPost: async (data) => {
    try {
      const res = await postService.createPost(data);
      const newPost = res.data.post;
      set((state) => ({ feedPosts: [newPost, ...state.feedPosts] }));
      toast.success("Post created!");
      return { success: true, post: newPost };
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create post";
      toast.error(msg);
      return { success: false };
    }
  },

  // ── Delete Post ──────────────────────────────────────────────
  deletePost: async (postId) => {
    try {
      await postService.deletePost(postId);
      set((state) => ({
        feedPosts: state.feedPosts.filter((p) => p.id !== postId),
        explorePosts: state.explorePosts.filter((p) => p.id !== postId),
      }));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  },

  // ── Toggle Like ──────────────────────────────────────────────
  toggleLike: async (postId) => {
    // Optimistic update
    const updatePosts = (posts) =>
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              _count: {
                ...p._count,
                likes: p.isLiked ? p._count.likes - 1 : p._count.likes + 1,
              },
            }
          : p
      );
    set((state) => ({
      feedPosts: updatePosts(state.feedPosts),
      explorePosts: updatePosts(state.explorePosts),
    }));
    try {
      await postService.toggleLike(postId);
    } catch {
      // Revert on error
      set((state) => ({
        feedPosts: updatePosts(state.feedPosts),
        explorePosts: updatePosts(state.explorePosts),
      }));
    }
  },

  // ── Prepend new post from socket ─────────────────────────────
  addPost: (post) => set((state) => ({ feedPosts: [post, ...state.feedPosts] })),
}));

export default usePostStore;
