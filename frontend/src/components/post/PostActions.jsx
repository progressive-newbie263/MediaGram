import { Link } from "react-router-dom";
import { IconHeart, IconComment } from "../common/Icons";
import { formatNumber } from "../../utils/timeFormat";

const PostActions = ({ post, onLike, onComment }) => (
  <div className="flex items-center gap-6 pt-3 border-t border-white/5">
    <button
      onClick={() => onLike?.(post.id)}
      className={`flex items-center gap-2 text-sm transition-colors ${
        post.isLiked ? "text-pink-500" : "text-white/50 hover:text-pink-400"
      }`}
    >
      <IconHeart filled={post.isLiked} />
      <span>{formatNumber(post._count?.likes || 0)}</span>
    </button>
    <button
      onClick={onComment}
      className="flex items-center gap-2 text-sm text-white/50 hover:text-brand-400 transition-colors"
    >
      <IconComment />
      <span>{formatNumber(post._count?.comments || 0)}</span>
    </button>
    <Link
      to={`/post/${post.id}`}
      className="ml-auto text-xs text-white/40 hover:text-brand-400 transition-colors"
    >
      View post
    </Link>
  </div>
);

export default PostActions;
