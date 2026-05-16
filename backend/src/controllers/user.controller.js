const prisma = require("../config/db");
const { formatUser, uploadToCloudinary, getPaginationParams } = require("../utils/helpers");

// ─── Get User Profile ─────────────────────────────────────────────
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let isFollowing = false;
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: { ...userWithoutPassword, isFollowing } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, username } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) {
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      });
      if (existing) return res.status(409).json({ error: "Username taken" });
      updateData.username = username.toLowerCase().trim();
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({ message: "Profile updated", user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── Upload Avatar ────────────────────────────────────────────────
const updateAvatar = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });

    const { url } = await uploadToCloudinary(image, "mediagram/avatars");

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: url },
    });

    res.json({ message: "Avatar updated", avatar: url, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── Upload Cover Image ───────────────────────────────────────────
const updateCoverImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });

    const { url } = await uploadToCloudinary(image, "mediagram/covers");

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverImage: url },
    });

    res.json({ message: "Cover updated", coverImage: url, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── Get User Posts ───────────────────────────────────────────────
const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { skip, limit, page } = getPaginationParams(req.query);
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true, username: true, displayName: true, avatar: true, isVerified: true,
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
      }),
      prisma.post.count({ where: { userId: user.id } }),
    ]);

    const formattedPosts = posts.map((p) => ({
      ...p,
      isLiked: currentUserId ? p.likes?.length > 0 : false,
      likes: undefined,
    }));

    res.json({ posts: formattedPosts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─── Get Followers ────────────────────────────────────────────────
const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { skip, limit } = getPaginationParams(req.query);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const follows = await prisma.follow.findMany({
      where: { followingId: user.id },
      skip,
      take: limit,
      include: {
        follower: {
          select: { id: true, username: true, displayName: true, avatar: true, bio: true, isVerified: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users: follows.map((f) => f.follower) });
  } catch (err) {
    next(err);
  }
};

// ─── Get Following ────────────────────────────────────────────────
const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { skip, limit } = getPaginationParams(req.query);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      skip,
      take: limit,
      include: {
        following: {
          select: { id: true, username: true, displayName: true, avatar: true, bio: true, isVerified: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users: follows.map((f) => f.following) });
  } catch (err) {
    next(err);
  }
};

// ─── Get Suggested Users ──────────────────────────────────────────
const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const limit = 5;

    // Get IDs user is already following
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(currentUserId);

    const users = await prisma.user.findMany({
      where: { id: { notIn: followingIds } },
      take: limit,
      select: {
        id: true, username: true, displayName: true, avatar: true, bio: true, isVerified: true,
        _count: { select: { followers: true } },
      },
      orderBy: { followers: { _count: "desc" } },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  getUserPosts,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
};
