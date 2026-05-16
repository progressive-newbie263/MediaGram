const prisma = require("../config/db");

const search = async (req, res, next) => {
  try {
    const { q, type = "all" } = req.query;
    const currentUserId = req.user?.id;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ error: "Query is required" });
    }

    const query = q.trim();
    const results = {};

    if (type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { displayName: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true, username: true, displayName: true, avatar: true,
          bio: true, isVerified: true,
          _count: { select: { followers: true } },
        },
      });
    }

    if (type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: { content: { contains: query, mode: "insensitive" } },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true, isVerified: true } },
          _count: { select: { likes: true, comments: true } },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
      });
      results.posts = posts.map((p) => ({
        ...p,
        isLiked: currentUserId ? p.likes?.length > 0 : false,
        likes: undefined,
      }));
    }

    res.json({ query, ...results });
  } catch (err) {
    next(err);
  }
};

// ─── Trending hashtags (basic implementation) ─────────────────────
const getTrending = async (req, res, next) => {
  try {
    // Get recent posts and extract hashtags
    const posts = await prisma.post.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });

    const hashtagMap = {};
    posts.forEach((p) => {
      if (!p.content) return;
      const matches = p.content.match(/#[\w\u00C0-\u024F]+/g) || [];
      matches.forEach((tag) => {
        const normalized = tag.toLowerCase();
        hashtagMap[normalized] = (hashtagMap[normalized] || 0) + 1;
      });
    });

    const trending = Object.entries(hashtagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ trending });
  } catch (err) {
    next(err);
  }
};

module.exports = { search, getTrending };
