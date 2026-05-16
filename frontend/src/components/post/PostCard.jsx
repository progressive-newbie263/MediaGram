import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Avatar from "../common/Avatar";
import PostActions from "./PostActions";
import { IconVerified, IconMore } from "../common/Icons";
import { timeAgo } from "../../utils/timeFormat";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";

const PostImages = ({ images }) => {
  if (!images?.length) return null;
  const gridClass = `grid gap-1 rounded-xl overflow-hidden image-grid-${Math.min(images.length, 4)}`;
  return (
    <div className={gridClass}>
      {images.slice(0, 4).map((img, i) => (
        <img key={i} src={img} alt="" className="post-img aspect-video" loading="lazy" />
      ))}
    </div>
  );
};

const PostCard = ({ post, onCommentClick }) => {
  const { user: currentUser } = useAuthStore();
  const { toggleLike, deletePost } = usePostStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = currentUser?.id === post.user?.id;

  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[\w\u00C0-\u024F]+)/g);
    return parts.map((part, i) =>
      part.startsWith("#") ? (
        <Link key={i} to={`/explore?q=${encodeURIComponent(part)}`} className="text-brand-400 hover:underline">
          {part}
        </Link>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-4"
    >
      <header className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${post.user?.username}`}>
          <Avatar src={post.user?.avatar} alt={post.user?.username} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link to={`/profile/${post.user?.username}`} className="font-semibold hover:underline truncate">
              {post.user?.displayName || post.user?.username}
            </Link>
            {post.user?.isVerified && <IconVerified />}
            <span className="text-white/40 text-sm">· {timeAgo(post.createdAt)}</span>
          </div>
          <Link to={`/profile/${post.user?.username}`} className="text-white/40 text-sm hover:underline">
            @{post.user?.username}
          </Link>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-white/40 hover:text-white">
              <IconMore />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 glass rounded-xl py-1 min-w-[120px] shadow-xl">
                <button
                  onClick={() => { deletePost(post.id); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {post.content && (
        <p className="text-white/90 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap break-words">
          {renderContent(post.content)}
        </p>
      )}

      <PostImages images={post.images} />

      <PostActions
        post={post}
        onLike={toggleLike}
        onComment={() => (onCommentClick ? onCommentClick(post) : navigate(`/post/${post.id}`))}
      />
    </motion.article>
  );
};

export default PostCard;
