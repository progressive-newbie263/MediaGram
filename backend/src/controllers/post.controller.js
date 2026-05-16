const prisma = require("../config/db");
const { uploadToCloudinary, getPaginationParams } = require("../utils/helpers");
const { getIO } = require("../config/socket");

const POST_SELECT = (currentUserId) => ({
  user: {
    select: {
      id: true, username: true, displayName: true, avatar: true, isVerified: true,
    },
  },
  _count: { select: { likes: true, comments: true } },
  likes: currentUserId
    ? { where: { userId: currentUserId }, select: { id: true } }
    : false,
  comments: {
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, avatar: true, displayName: true } },
    },
  },
});

const formatPost = (post, currentUserId) => ({
  ...post,
  isLiked: currentUserId ? (post.likes?.length > 0) : false,
  likes: undefined,
});

// ─── Create Post ──────────────────────────────────────────────────
const createPost = async (req, res, next) => {
  try {
    const { content, images } = req.body;
    const userId = req.user.id;

    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({ error: "Post must have content or image" });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (images && images.length > 0) {
      const uploads = await Promise.all(
        images.slice(0, 4).map((img) => uploadToCloudinary(img, "mediagram/posts"))
      );
      imageUrls = uploads.map((u) => u.url);
    }

    const post = await prisma.post.create({
      data: { content, images: imageUrls, userId },
      include: POST_SELECT(userId),
    });

    res.status(201).json({ post: formatPost(post, userId) });
  } catch (err) {
    next(err);
  }
};

// ─── Get Feed ─────────────────────────────────────────────────────
const getFeed = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const currentUserId = req.user.id;

    // Get IDs of people user follows
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(currentUserId); // Include own posts

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: { in: followingIds } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: POST_SELECT(currentUserId),
      }),
      prisma.post.count({ where: { userId: { in: followingIds } } }),
    ]);

    res.json({
      posts: posts.map((p) => formatPost(p, currentUserId)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Explore Posts ────────────────────────────────────────────
const getExplorePosts = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const currentUserId = req.user?.id;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: POST_SELECT(currentUserId),
      }),
      prisma.post.count(),
    ]);

    res.json({
      posts: posts.map((p) => formatPost(p, currentUserId)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Post ──────────────────────────────────────────────
const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        ...POST_SELECT(currentUserId),
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, username: true, avatar: true, displayName: true } },
            replies: {
              include: {
                user: { select: { id: true, username: true, avatar: true, displayName: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ post: formatPost(post, currentUserId) });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Post ──────────────────────────────────────────────────
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.userId !== userId)
      return res.status(403).json({ error: "Not authorized" });

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getFeed, getExplorePosts, getPost, deletePost };
