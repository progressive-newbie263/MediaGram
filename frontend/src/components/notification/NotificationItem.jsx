import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/timeFormat";

const messages = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  REPLY: "replied to your comment",
  FOLLOW: "started following you",
  MENTION: "mentioned you",
};

const NotificationItem = ({ notification }) => {
  const { actor, type, post, read, createdAt } = notification;
  const text = messages[type] || "interacted with you";

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
        !read ? "bg-brand-500/5" : ""
      }`}
    >
      <Avatar src={actor?.avatar} alt={actor?.username} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <Link to={`/profile/${actor?.username}`} className="font-semibold hover:underline">
            {actor?.displayName || actor?.username}
          </Link>{" "}
          <span className="text-white/70">{text}</span>
        </p>
        {post?.content && (
          <p className="text-white/40 text-xs mt-1 truncate">{post.content}</p>
        )}
        <p className="text-white/30 text-xs mt-1">{timeAgo(createdAt)}</p>
      </div>
      {!read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
    </div>
  );

  if (post?.id) {
    return <Link to={`/post/${post.id}`}>{content}</Link>;
  }
  if (type === "FOLLOW") {
    return <Link to={`/profile/${actor?.username}`}>{content}</Link>;
  }
  return content;
};

export default NotificationItem;
