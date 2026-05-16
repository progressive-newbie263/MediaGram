import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PostCard from "../components/post/PostCard";
import Avatar from "../components/common/Avatar";
import { PageLoader } from "../components/common/LoadingSpinner";
import { postService } from "../services/post.service";
import useAuthStore from "../store/authStore";
import { timeAgo } from "../utils/timeFormat";
import toast from "react-hot-toast";

const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        postService.getPost(postId),
        postService.getComments(postId),
      ]);
      setPost(postRes.data.post);
      setComments(commentsRes.data.comments || []);
    } catch {
      toast.error("Post not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await postService.createComment(postId, {
        content: commentText.trim(),
        parentId: replyTo?.id || undefined,
      });
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c
          )
        );
      } else {
        setComments((prev) => [res.data.comment, ...prev]);
      }
      setCommentText("");
      setReplyTo(null);
    } catch {
      toast.error("Failed to post comment");
    }
  };

  if (loading) return <PageLoader />;
  if (!post) {
    return (
      <div className="p-8 text-center">
        <Link to="/" className="text-brand-400">← Back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostCard post={post} />

      <div className="card p-4 mt-4">
        <h3 className="font-semibold mb-4">Comments</h3>
        <form onSubmit={submitComment} className="flex gap-3 mb-6">
          <Avatar src={user?.avatar} alt={user?.username} size="sm" />
          <div className="flex-1">
            {replyTo && (
              <p className="text-xs text-brand-400 mb-1">
                Replying to @{replyTo.user?.username}{" "}
                <button type="button" onClick={() => setReplyTo(null)} className="text-white/40">
                  cancel
                </button>
              </p>
            )}
            <input
              className="input-field"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary self-end">Post</button>
        </form>

        {comments.map((c) => (
          <CommentThread key={c.id} comment={c} onReply={setReplyTo} currentUserId={user?.id} />
        ))}
      </div>
    </div>
  );
};

const CommentThread = ({ comment, onReply, currentUserId }) => (
  <div className="mb-4">
    <div className="flex gap-3">
      <Link to={`/profile/${comment.user?.username}`}>
        <Avatar src={comment.user?.avatar} alt={comment.user?.username} size="sm" />
      </Link>
      <div className="flex-1 bg-surface-800 rounded-xl px-3 py-2">
        <Link to={`/profile/${comment.user?.username}`} className="font-semibold text-sm hover:underline">
          {comment.user?.displayName || comment.user?.username}
        </Link>
        <p className="text-sm text-white/90 mt-0.5">{comment.content}</p>
        <div className="flex gap-3 mt-1 text-xs text-white/40">
          <span>{timeAgo(comment.createdAt)}</span>
          <button type="button" onClick={() => onReply(comment)} className="hover:text-brand-400">
            Reply
          </button>
        </div>
      </div>
    </div>
    {comment.replies?.map((r) => (
      <div key={r.id} className="ml-10 mt-2 flex gap-3">
        <Avatar src={r.user?.avatar} alt={r.user?.username} size="xs" />
        <div className="flex-1 bg-surface-850 rounded-xl px-3 py-2">
          <span className="font-semibold text-sm">{r.user?.displayName}</span>
          <p className="text-sm text-white/90">{r.content}</p>
        </div>
      </div>
    ))}
  </div>
);

export default PostDetailPage;
