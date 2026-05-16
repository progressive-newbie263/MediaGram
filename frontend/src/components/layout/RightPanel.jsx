import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { userService } from "../../services/user.service";
import { searchService } from "../../services/search.service";
import Avatar from "../common/Avatar";
import { formatNumber } from "../../utils/timeFormat";
import LoadingSpinner from "../common/LoadingSpinner";

const RightPanel = () => {
  const [suggested, setSuggested] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, trendRes] = await Promise.all([
          userService.getSuggested(),
          searchService.getTrending(),
        ]);
        setSuggested(usersRes.data.users || []);
        setTrending(trendRes.data.trending || []);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <aside className="hidden xl:block w-[320px] h-screen sticky top-0 px-4 py-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Trending</h3>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : trending.length === 0 ? (
          <p className="text-white/40 text-sm">No hashtags yet. Post with #tags!</p>
        ) : (
          <ul className="space-y-3">
            {trending.map(({ tag, count }) => (
              <li key={tag}>
                <Link to={`/explore?q=${encodeURIComponent(tag)}`} className="block group">
                  <p className="text-white/40 text-xs">Trending</p>
                  <p className="font-semibold group-hover:text-brand-400 transition-colors">{tag}</p>
                  <p className="text-white/40 text-xs">{formatNumber(count)} posts</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-4">
        <h3 className="font-bold text-lg mb-3">Who to follow</h3>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <ul className="space-y-4">
            {suggested.map((u) => (
              <SuggestedUser key={u.id} user={u} />
            ))}
          </ul>
        )}
      </motion.div>

      <p className="text-white/30 text-xs text-center mt-6 px-2">
        © 2026 MediaGram · Built with React & Node.js
      </p>
    </aside>
  );
};

const SuggestedUser = ({ user }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await userService.toggleFollow(user.id);
      setFollowing(res.data.following);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-center gap-3">
      <Link to={`/profile/${user.username}`}>
        <Avatar src={user.avatar} alt={user.username} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.username}`} className="font-semibold text-sm hover:underline truncate block">
          {user.displayName}
        </Link>
        <p className="text-white/40 text-xs truncate">@{user.username}</p>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
          following ? "bg-white/10 text-white/70" : "bg-white text-surface-900 hover:bg-white/90"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
    </li>
  );
};

export default RightPanel;
